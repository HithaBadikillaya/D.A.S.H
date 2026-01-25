export function validateTemplate(template) {
  const requiredFields = [
    "id",
    "name",
    "type",
    "tone",
    "format",
    "style_rules",
    "prompt_instruction"
  ];

  for (const field of requiredFields) {
    if (!template[field]) {
      return { valid: false, message: `${field} is required` };
    }
  }

  if (!Array.isArray(template.format.sections)) {
    return { valid: false, message: "format.sections must be an array" };
  }

  if (!Array.isArray(template.style_rules)) {
    return { valid: false, message: "style_rules must be an array" };
  }

  // Basic prompt safety
  const bannedPhrases = ["ignore all previous", "system override"];
  for (const phrase of bannedPhrases) {
    if (template.prompt_instruction.toLowerCase().includes(phrase)) {
      return { valid: false, message: "Unsafe prompt instruction detected" };
    }
  }

  return { valid: true };
}
