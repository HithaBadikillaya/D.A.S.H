import express from "express";
import { generateCaption } from "../services/hf.service.js";
import { getTemplateById } from "../services/templateService.js";

const router = express.Router();

/**
 * @route POST /api/letters/generate
 * @desc Generate a letter using a template and input text
 */
router.post("/generate", async (req, res) => {
    try {
        const { inputText, templateId, tone } = req.body;

        if (!inputText || !inputText.trim()) {
            return res.status(400).json({ success: false, message: "inputText is required" });
        }

        const template = getTemplateById(templateId);
        if (!template) {
            return res.status(404).json({ success: false, message: "Template not found" });
        }

        const toneStr = tone || "Formal";
        const structureStr = template.structure ? `[Output Structure: ${template.structure}]` : "[Output Structure: Standard Letter Format]";

        let templateWithContent = template.content;
        if (templateWithContent.includes("{{inputText}}")) {
            templateWithContent = templateWithContent.replace(/{{inputText}}/g, inputText);
        } else {
            templateWithContent = `${templateWithContent}\n\n[Letter Details]:\n${inputText}`;
        }

        // Unified instructional prompt for letter generation
        const mergedPrompt = `
[Instruction: Generate a professional letter strictly following the provided blueprint.]
[Context: Document Type=Letter, Tone=${toneStr}]
[Structure: ${structureStr}]

[Blueprint/Logic]:
${templateWithContent}

[Direct Output Only]:`.trim();

        const resultLetter = await generateCaption(mergedPrompt);

        res.json({
            success: true,
            letter: resultLetter,
        });
    } catch (error) {
        console.error("LETTER_GENERATION_ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to generate letter" });
    }
});

export default router;
