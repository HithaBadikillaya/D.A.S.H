import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

dotenv.config();

console.log("--------------------------------------------------");
console.log(`[Whisper-INIT] Docker Service Hooked!`);
console.log(`[Whisper-INIT] Image: ${process.env.WHISPER_DOCKER_IMAGE || "whisper-cpp:latest"}`);
console.log(`[Whisper-INIT] Time: ${new Date().toISOString()}`);
console.log("--------------------------------------------------");

const WHISPER_THREADS = parseInt(process.env.WHISPER_THREADS, 10) || 4;
const DOCKER_IMAGE = process.env.WHISPER_DOCKER_IMAGE || "whisper-cpp:latest";

/**
 * Normalizes paths for mounting. 
 * Docker Desktop on Windows handles both D:/ and /mnt/d/ 
 * depending on whether Node is in Windows or WSL.
 */
function toDockerHostPath(absPath) {
    let p = absPath.replace(/\\/g, "/");
    // Ensure it's absolute for Docker
    return path.resolve(p);
}

export async function transcribeChunks(chunkPaths, onProgress = () => { }) {
    console.log(`[Whisper-Docker] Received ${chunkPaths.length} chunks for transcription.`);

    const total = chunkPaths.length;
    const transcripts = [];

    for (let i = 0; i < total; i++) {
        const chunkFile = chunkPaths[i];
        onProgress(`Transcribing Chunk ${i + 1}/${total}...`, Math.round((i / total) * 100));

        const text = await transcribeSingleChunk(chunkFile);
        transcripts.push(text);
    }

    onProgress("Transcription complete!", 100);
    return transcripts.join("\n").trim();
}

/**
 * Runs whisper-cli inside a Docker container.
 * Mounts the directory containing the wav file to /audio.
 */
function transcribeSingleChunk(wavPath) {
    return new Promise((resolve, reject) => {
        const hostDir = toDockerHostPath(path.dirname(wavPath));
        const filename = path.basename(wavPath);

        // docker run --rm -v "C:/host/path:/audio" whisper-cpp:latest -m /whisper.cpp/models/ggml-base.en.bin -f /audio/file.wav ...
        const args = [
            "run", "--rm",
            "-v", `${hostDir}:/audio`,
            DOCKER_IMAGE,
            "-m", "/whisper.cpp/models/ggml-base.en.bin",
            "-f", `/audio/${filename}`,
            "-nt",
            "-otxt",
            "--threads", String(WHISPER_THREADS),
            "--language", "en",
        ];

        console.log(`[Whisper-Docker] Executing: docker ${args.join(" ")}`);

        const proc = spawn("docker", args, {
            stdio: ["ignore", "pipe", "pipe"],
            shell: false,
        });

        let stderrBuf = "";
        proc.stderr.on("data", (data) => { stderrBuf += data.toString(); });

        proc.on("error", (err) => {
            console.error(`[Whisper-Docker] Spawn error:`, err);
            reject(new Error(`Docker spawn error: ${err.message}`));
        });

        proc.on("close", (code) => {
            if (code !== 0) {
                console.error(`[Whisper-Docker] Container exited with code ${code}`);
                return reject(new Error(`Whisper-Docker failed (code ${code}). stderr: ${stderrBuf.slice(-300)}`));
            }

            // Output .txt created by whisper-cli in the same folder
            const txtPath = `${wavPath}.txt`;

            // Wait slightly for filesystem sync if needed (Docker mounts can be laggy)
            // But usually, by the time the process closes, it's there.
            if (!fs.existsSync(txtPath)) {
                return reject(new Error(`Expected output file missing on host: ${txtPath}`));
            }

            try {
                const content = fs.readFileSync(txtPath, "utf-8");
                try { fs.unlinkSync(txtPath); } catch (_) { }
                resolve(content.trim());
            } catch (err) {
                reject(new Error(`Read error from host: ${err.message}`));
            }
        });
    });
}
