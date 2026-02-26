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
 * In the Docker Compose environment, the backend container and whisper container
 * share a volume. The backend writes the file, and the whisper watcher 
 * (running in its own container) processes it. We just poll for the result.
 */
export async function transcribeChunks(chunkPaths, onProgress = () => { }) {
    console.log(`[Whisper-Backend] Processing ${chunkPaths.length} transcriptions (Volume-Polling).`);

    const total = chunkPaths.length;
    const transcripts = [];

    for (let i = 0; i < total; i++) {
        const chunkFile = chunkPaths[i];
        onProgress(`Transcribing Chunk ${i + 1}/${total}...`, Math.round((i / total) * 100));

        try {
            const text = await pollForResult(chunkFile);
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
 * Polls the filesystem for the expected .json output from Whisper.
 */
async function pollForResult(filePath, timeoutMs = 300000) { // 5 min timeout
    const jsonPath = `${filePath}.json`;
    const start = Date.now();

    console.log(`[Whisper-Poll] Waiting for: ${path.basename(jsonPath)}`);

    while (Date.now() - start < timeoutMs) {
        if (fs.existsSync(jsonPath)) {
            console.log(`[Whisper-Poll] Found result after ${Math.round((Date.now() - start) / 1000)}s`);
            return await parseWhisperJson(filePath);
        }
        await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2s
    }

    throw new Error(`Transcription timed out for ${path.basename(filePath)} after 5 minutes.`);
}

/**
 * Legacy/Testing: In Compose mode, we just use polling.
 */
export async function manualTranscribe(filePath) {
    return pollForResult(filePath);
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
