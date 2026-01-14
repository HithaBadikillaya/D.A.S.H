export const buildPrompt = ({ platform, tone, content }) => {
  const lengthInstruction = platform.toLowerCase() === 'linkedin'
    ? '- Long-form, professional, and storytelling style'
    : '- Platform appropriate length';

  return `
You are an expert social media copywriter.

Generate a ${tone} caption for ${platform}.

Rules:
${lengthInstruction}
- STRICTLY NO EMOJIS (unless explicitly requested)
- Clear and engaging
- No hashtags unless platform supports it
- Output ONLY the caption text

User content:
"${content}"
`;
};
