import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

dotenv.config();

console.log("--------------------------------------------------");
console.log(`[Whisper-INIT] Backend Connected to Docker Watcher`);

const DOCKER_IMAGE = (process.env.WHISPER_DOCKER_IMAGE && process.env.WHISPER_DOCKER_IMAGE !== "whisper-cpp:latest")
    ? process.env.WHISPER_DOCKER_IMAGE
    : "whisper-watcher:latest";

const DOCKER_CONTAINER_NAME = "whisper";

console.log(`[Whisper-INIT] Image: ${DOCKER_IMAGE}`);
console.log(`[Whisper-INIT] Volume: /uploads -> /media`);
console.log("--------------------------------------------------");

/**
 * Normalizes paths for mounting. 
 * Docker Desktop on Windows often gets confused by "C:/path" in the -v flag
 * because it interprets the second colon as a mode separator.
 * We use the "/d/path" format which is more robust.
 */
function toDockerHostPath(absPath) {
    let p = path.resolve(absPath).replace(/\\/g, "/");

    if (p.startsWith("/mnt/")) {
        return p.replace("/mnt/", "/");
    }

    if (p.match(/^[a-zA-Z]:\//)) {
        const drive = p[0].toLowerCase();
        const rest = p.substring(2);
        return `/${drive}${rest}`;
    }

    return p;
}

/**
 * Main flow for MoM: Chunks are saved to /uploads folder.
 * Instead of just polling (which fails when watcher doesn't see file events),
 * we now explicitly trigger the transcription script via docker exec or run.
 */
export async function transcribeChunks(chunkPaths, onProgress = () => { }) {
    console.log(`[Whisper-Backend] Processing ${chunkPaths.length} transcriptions (explicit-trigger).`);

    const total = chunkPaths.length;
    const transcripts = [];

    for (let i = 0; i < total; i++) {
        const chunkFile = chunkPaths[i];
        onProgress(`Transcribing Chunk ${i + 1}/${total}...`, Math.round((i / total) * 100));

        try {
            // We explicitly run the transcription to bypass inotify issues
            const text = await manualTranscribe(chunkFile);
            transcripts.push(text);
        } catch (err) {
            console.error(`[Whisper-Backend] Error on chunk ${i}:`, err.message);
            throw err;
        }
    }

    onProgress("Transcription complete!", 100);
    return transcripts.join("\n").trim();
}

/**
 * Testing/Manual trigger: Explicitly runs whisper-cli inside a new container.
 * This bypasses the potentially flawed run-whisper.sh and ensures model path is correct.
 */
export async function manualTranscribe(filePath) {
    const filename = path.basename(filePath);
    // Calculate path relative to UPLOAD_DIR (which is mounted to /media)
    const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
    const relativePath = path.relative(UPLOAD_DIR, filePath).replace(/\\/g, "/");
    const containerPath = `/media/${relativePath}`;

    const hostDir = toDockerHostPath(path.dirname(filePath));

    console.log(`[Whisper-Manual] Triggering transcription for: ${relativePath}`);

    return new Promise(async (resolve, reject) => {
        let isRunning = false;
        try {
            const checkProc = spawn("docker", ["inspect", "-f", "{{.State.Running}}", DOCKER_CONTAINER_NAME], { shell: false });
            let output = "";
            checkProc.stdout.on("data", (d) => output += d.toString());
            await new Promise((res) => checkProc.on("close", (code) => {
                if (code === 0 && output.trim() === "true") isRunning = true;
                res();
            }));
        } catch (e) {
            console.log(`[Whisper-Docker] Container ${DOCKER_CONTAINER_NAME} not found or error checking status.`);
        }

        let args;
        if (isRunning) {
            console.log(`[Whisper-Docker] Using existing container: ${DOCKER_CONTAINER_NAME}`);
            // docker exec -w /media whisper-backend /whisper.cpp/build/bin/whisper-cli ...
            args = [
                "exec",
                "-w", "/media",
                DOCKER_CONTAINER_NAME,
                "/whisper.cpp/build/bin/whisper-cli",
                "-m", "/whisper.cpp/models/ggml-base.en.bin",
                containerPath,
                "--output-json",
                "-of", containerPath
            ];
        } else {
            console.log(`[Whisper-Docker] Starting new temporary container (run --rm)`);
            args = [
                "run", "--rm",
                "--name", `${DOCKER_CONTAINER_NAME}-${Date.now()}`,
                "-v", `${hostDir}:/media`,
                "-w", "/media",
                DOCKER_IMAGE,
                "/whisper.cpp/build/bin/whisper-cli",
                "-m", "/whisper.cpp/models/ggml-base.en.bin",
                `/media/${filename}`,
                "--output-json",
                "-of", `/media/${filename}`
            ];
        }

        console.log(`[Whisper-Docker] Executing: docker ${args.join(" ")}`);

        const proc = spawn("docker", args, {
            stdio: ["ignore", "pipe", "pipe"],
            shell: false,
        });

        let stderrBuf = "";
        let stdoutBuf = "";

        proc.stdout.on("data", (data) => {
            const chunk = data.toString();
            stdoutBuf += chunk;
            process.stdout.write(chunk);
        });

        proc.stderr.on("data", (data) => {
            const chunk = data.toString();
            stderrBuf += chunk;
            process.stderr.write(chunk);
        });

        proc.on("error", (err) => {
            console.error(`[Whisper-Docker] Spawn error:`, err);
            reject(new Error(`Docker spawn error: ${err.message}`));
        });

        proc.on("close", async (code) => {
            if (code !== 0) {
                console.error(`[Whisper-Docker] Command exited with code ${code}`);
                return reject(new Error(`Whisper-Docker failed (code ${code}).\nSee logs above for details.`));
            }

            try {
                // The whisper-cli with -of /media/filename produces /media/filename.json
                const text = await parseWhisperJson(filePath);
                resolve(text);
            } catch (err) {
                reject(err);
            }
        });
    });
}

/**
 * Shared logic to read, parse, and clean up whisper.cpp JSON output.
 */
async function parseWhisperJson(filePath) {
    const jsonPath = `${filePath}.json`;
    if (!fs.existsSync(jsonPath)) {
        throw new Error(`Expected result file missing: ${jsonPath}`);
    }

    try {
        const rawContent = fs.readFileSync(jsonPath, "utf-8");
        const data = JSON.parse(rawContent);

        // Extract combined text from segments
        let text = "";
        if (data.transcription && Array.isArray(data.transcription)) {
            text = data.transcription.map(s => s.text).join(" ").trim();
        } else if (typeof data.text === 'string') {
            text = data.text.trim();
        } else {
            text = rawContent.trim();
        }

        // Cleanup the JSON result file
        try { fs.unlinkSync(jsonPath); } catch (_) { }

        return text;
    } catch (err) {
        throw new Error(`Failed to parse Whisper JSON output: ${err.message}`);
    }
}
