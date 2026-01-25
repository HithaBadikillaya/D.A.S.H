router.post("/generate", async (req, res) => {
  const { templateId, content } = req.body;

  const template = getTemplateById(templateId);
  if (!template) {
    return res.status(404).json({ message: "Template not found" });
  }

  const prompt = buildPrompt(template, content);

  const aiOutput = await callAI(prompt);

  res.json({ output: aiOutput });
});
