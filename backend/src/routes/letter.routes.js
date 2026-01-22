import express from "express";
import { generateLetter, getTemplates } from "../services/gemini.service.js";

const router = express.Router();

// GET /api/letters/templates
router.get("/templates", async (req, res) => {
    try {
        const templates = await getTemplates();
        res.json({
            success: true,
            templates,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load templates",
        });
    }
});

// POST /api/letters/generate
router.post("/generate", async (req, res) => {
    try {
        const { templateId, customFields, tone } = req.body;

        if (!templateId || !customFields) {
            return res.status(400).json({
                success: false,
                message: "Missing templateId or customFields",
            });
        }

        const letter = await generateLetter({ templateId, customFields, tone });

        res.json({
            success: true,
            letter,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || "Generation failed",
        });
    }
});

export default router;
