//work 


export function buildPrompt(template, userInput) {
  return `
${template.systemPrompt}

Tone: ${template.tone}
Format: ${template.format}

User Content:
${userInput}

Generate output strictly following the format.
`;
}
