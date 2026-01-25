import express from "express";

import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
} from "../services/templateService.js";
import { validateTemplate } from "../utils/validateTemplate.js";

const router = express.Router();

/* READ ALL */
router.get("/", (req, res) => {
  const templates = getAllTemplates();
  res.json(templates);
});

/* READ ONE */
router.get("/:id", (req, res) => {
  const template = getTemplateById(req.params.id);
  if (!template) {
    return res.status(404).json({ message: "Template not found" });
  }
  res.json(template);
});

/* CREATE */
router.post("/", (req, res) => {
  const template = req.body;

  const validation = validateTemplate(template);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  try {
    createTemplate(template);
    res.status(201).json({ message: "Template created", template });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* UPDATE */ //used to update the already existing template
router.put("/:id", (req, res) => {
  try {
    updateTemplate(req.params.id, req.body);
    res.json({ message: "Template updated" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

/* DELETE */
router.delete("/:id", (req, res) => {
  try {
    deleteTemplate(req.params.id);
    res.json({ message: "Template deleted" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

export default router;
