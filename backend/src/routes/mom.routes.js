import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { extractAndNormalizeAudio, splitAudioIntoChunks } from "../services/mediaProcessor.js";
import { transcribeChunks } from "../services/whisperService.js";
import { createJob, getJob, updateJob, enqueue } from "../services/jobManager.js";
import { generateMoM } from "../services/momService.js";
import {
    getAllTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
} from "../services/templateService.js";

const router = express.Router();

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
console.log(`[MoM-Config] Upload directory: ${UPLOAD_DIR}`);

if (!fs.existsSync(UPLOAD_DIR)) {
    console.log(`[MoM-Config] Creating upload directory: ${UPLOAD_DIR}`);
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} else {
    // Verify writability
    try {
        fs.accessSync(UPLOAD_DIR, fs.constants.W_OK);
    } catch (err) {
        console.error(`[MoM-Config] FATAL: Upload directory is not writable: ${UPLOAD_DIR}`);
    }
}

const CHUNK_MINUTES = parseInt(process.env.CHUNK_MINUTES, 10) || 7;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        "audio/mpeg",
        "audio/mp3",
        "audio/mp4",
        "audio/m4a",
        "audio/wav",
        "audio/webm",
        "audio/flac",
        "video/mp4",
        "video/webm",
        "video/mpeg",
        "video/quicktime",
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only audio/video files are allowed."), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 4 * 1024 * 1024 * 1024, // 4GB
    },
});

// POST /api/mom/upload-transcribe — async with job polling

router.post("/upload-transcribe", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { jobId } = createJob();
    const filePath = req.file.path;

    console.log(`[MoM] Job ${jobId} created for ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(1)} MB)`);

    // Enqueue processing — respects MAX_CONCURRENT_JOBS
    enqueue(jobId, () => processMediaJob(jobId, filePath));

    res.status(202).json({
        success: true,
        jobId,
        message: "Upload received. Processing started.",
    });
});

// GET /api/mom/jobs/:jobId — poll for status

router.get("/jobs/:jobId", (req, res) => {
    const job = getJob(req.params.jobId);
    if (!job) {
        return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.json({
        success: true,
        jobId: job.jobId,
        status: job.status,
        progress: job.progress,
        progressMessage: job.progressMessage,
        transcription: job.transcription,
        error: job.error,
    });
});

// Background Processing Pipeline

async function processMediaJob(jobId, originalFilePath) {
    // All temp files will go into a per-job directory for easy cleanup
    const jobDir = path.join(UPLOAD_DIR, `job_${jobId}`);
    fs.mkdirSync(jobDir, { recursive: true });

    try {
        // --- Step 1: Extract & Normalise Audio ---
        updateJob(jobId, {
            status: "processing",
            progress: 5,
            progressMessage: "Extracting & normalising audio…",
        });

        const normalisedWav = await extractAndNormalizeAudio(originalFilePath, jobDir);

        // Step 2: Chunk Audio 
        updateJob(jobId, { progress: 20, progressMessage: "Splitting audio into chunks…" });

        const chunkPaths = await splitAudioIntoChunks(normalisedWav, jobDir, CHUNK_MINUTES);
        console.log(`[MoM] Job ${jobId}: ${chunkPaths.length} chunk(s) created.`);

        //Step 3: Transcribe Chunks 
        const transcription = await transcribeChunks(chunkPaths, (msg, pct) => {
            // Map whisper progress (0-100) into the 30-95% range of overall progress
            const overallPct = 30 + Math.round(pct * 0.65);
            updateJob(jobId, { progress: overallPct, progressMessage: msg });
            console.log(`[MoM] Job ${jobId} progress: ${overallPct}% - ${msg}`);
        });

        updateJob(jobId, {
            status: "completed",
            progress: 100,
            progressMessage: "Transcription complete!",
            transcription,
        });

        console.log(`[MoM] Job ${jobId}: completed (${transcription.length} chars). Result: ${transcription.substring(0, 50)}...`);
    } catch (err) {
        console.error(`[MoM] Job ${jobId} FAILED:`, err.message);
        updateJob(jobId, {
            status: "failed",
            progress: 0,
            progressMessage: "Processing failed.",
            error: err.message,
        });
    } finally {
        // Cleanup: original upload + temp job directory 
        try {
            if (fs.existsSync(originalFilePath)) {
                await fs.promises.rm(originalFilePath, { force: true });
            }
        } catch (_) { /* best-effort */ }

        try {
            await fs.promises.rm(jobDir, { recursive: true, force: true });
        } catch (_) { /* best-effort */ }
    }
}

// POST /api/mom/generate — MoM from transcript (unchanged)

router.post("/generate", async (req, res) => {
    try {
        const { transcriptText, templateId, meetingTitle } = req.body;

        if (!transcriptText || !transcriptText.trim()) {
            return res.status(400).json({
                success: false,
                message: "transcriptText is required"
            });
        }

        const template = getTemplateById(templateId);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Template not found"
            });
        }

        const mom = await generateMoM(transcriptText, template, meetingTitle);

        res.json({
            success: true,
            mom: mom,
        });
    } catch (error) {
        console.error("MOM_GENERATION_ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate meeting minutes"
        });
    }
});

// Template CRUD

router.get("/templates", (req, res) => {
    try {
        const allTemplates = getAllTemplates();
        const momTemplates = allTemplates.filter(t =>
            t.category && t.category.trim().toLowerCase() === "mom"
        );

        console.log(`[MoM] Total templates: ${allTemplates.length}`);
        console.log(`[MoM] MoM templates: ${momTemplates.length}`);
        if (allTemplates.length > 0) {
            const categories = [...new Set(allTemplates.map(t => t.category))];
            console.log(`[MoM] Available categories: ${categories.join(", ")}`);
        }

        res.json(momTemplates);
    } catch (error) {
        console.error("[MoM] Error fetching templates:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/templates", (req, res) => {
    try {
        const templateData = {
            ...req.body,
            category: "mom",
        };
        const newTemplate = createTemplate(templateData);
        res.status(201).json(newTemplate);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.put("/templates/:id", (req, res) => {
    try {
        const updated = updateTemplate(req.params.id, {
            ...req.body,
            category: "mom",
        });
        res.json(updated);
    } catch (error) {
        res.status(error.message === "System templates cannot be modified" ? 403 : 404).json({
            success: false,
            message: error.message,
        });
    }
});

router.delete("/templates/:id", (req, res) => {
    try {
        deleteTemplate(req.params.id);
        res.json({ success: true, message: "Template deleted" });
    } catch (error) {
        res.status(error.message === "System templates cannot be deleted" ? 403 : 404).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
