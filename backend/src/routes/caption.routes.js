import express from "express";
import { generateCaption } from "../services/hf.service.js";
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../services/templateService.js";

const router = express.Router();

/**
 * @route POST /api/captions/generate
 * @desc Generate a caption using a template and input text
 */
router.post("/generate", async (req, res) => {
  try {
    const { inputText, templateId, platform, tone, length, currentContent } = req.body;

    if (!inputText || !inputText.trim()) {
      return res.status(400).json({ success: false, message: "inputText is required" });
    }

    const template = getTemplateById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    const contextStr = `[Platform: ${platform || "General"}] [Tone: ${tone || "Professional"}]`;
    const structureStr = template.structure ? `[Output Structure: ${template.structure}]` : "[Output Structure: Standard]";

    let templateWithContent = template.content;
    if (templateWithContent.includes("{{inputText}}")) {
      templateWithContent = templateWithContent.replace(/{{inputText}}/g, inputText);
    } else {
      templateWithContent = `${templateWithContent}\n\n[Subject Content]:\n${inputText}`;
    }

    // Unified instructional prompt for one-shot chat generation
    const mergedPrompt = `
[Instruction: Generate content strictly following the provided blueprint.]
[Context: Platform=${platform || "General"}, Tone=${tone || "Professional"}]
[Structure: ${structureStr}]

[Blueprint/Logic]:
${templateWithContent}

[Direct Output Only]:`.trim();

    const resultCaption = await generateCaption(mergedPrompt, length, currentContent);

    res.json({
      success: true,
      caption: resultCaption,
    });
  } catch (error) {
    console.error("CAPTION_GENERATION_ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to generate caption" });
  }
});

/**
 * @route GET /api/captions/templates
 * @desc Get all templates
 */
router.get("/templates", (req, res) => {
  try {
    const templates = getAllTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route POST /api/captions/templates
 * @desc Create a new user template
 */
router.post("/templates", (req, res) => {
  try {
    const newTemplate = createTemplate(req.body);
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @route PUT /api/captions/templates/:id
 * @desc Update a user template
 */
router.put("/templates/:id", (req, res) => {
  try {
    const updated = updateTemplate(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(error.message === "System templates cannot be modified" ? 403 : 404).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route DELETE /api/captions/templates/:id
 * @desc Delete a user template
 */
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
