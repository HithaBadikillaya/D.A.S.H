import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesDir = path.join(__dirname, "../templates");

// Initialize Google Gen AI SDK (v1)
if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
}

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Use environment variable for model or default to gemini-2.5-pro
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-pro";

/**
 * Get all available templates
 */
export const getTemplates = async () => {
    try {
        const files = (await fs.promises.readdir(templatesDir)).filter((file) => file.endsWith(".md"));
        const templates = [];

        for (const file of files) {
            const fileContent = await fs.promises.readFile(path.join(templatesDir, file), "utf8");
            const { data } = matter(fileContent);

            if (data.id && data.name) {
                templates.push({
                    id: data.id,
                    name: data.name,
                    description: data.description,
                    fields: data.fields,
                });
            }
        }
        return templates;
    } catch (error) {
        console.error("Error loading templates:", error);
        return [];
    }
};

/**
 * Generate a letter based on template and user data
 */
export const generateLetter = async ({ templateId, customFields, tone }) => {
    try {
        // 1. Load the template
        const files = (await fs.promises.readdir(templatesDir)).filter((file) => file.endsWith(".md"));
        let templateData = null;
        let templateContent = "";

        for (const file of files) {
            const fileRaw = await fs.promises.readFile(path.join(templatesDir, file), "utf8");
            const { data, content } = matter(fileRaw);

            if (data.id === templateId) {
                templateData = data;
                templateContent = content;
                break;
            }
        }

        if (!templateData) {
            throw new Error(`Template not found: ${templateId}`);
        }

        // 2. Build the prompt
        let userPrompt = templateContent;
        const fields = customFields || {};

        Object.keys(fields).forEach(key => {
            const value = fields[key] !== undefined && fields[key] !== null ? String(fields[key]) : '';
            const regex = new RegExp(`{{${key}}}`, 'g');
            userPrompt = userPrompt.replace(regex, value);
        });

        const systemInstruction = templateData.systemInstruction || "You are a helpful assistant.";
        const finalPrompt = `
          User Requirement:
          ${userPrompt}
          
          Tone/Vibe: ${tone}
          
          Output ONLY the body of the letter. Do not include "Here is your letter" or similar conversational filler.
        `;

        // 3. Call Gemini using the new SDK pattern
        // client.models.generateContent({ model: '...', contents: [...] })
        const response = await genai.models.generateContent({
            model: MODEL_NAME,
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: systemInstruction },
                        { text: finalPrompt }
                    ]
                }
            ],
            config: {
                temperature: 0.7,
            }
        });

        // Parse response from new SDK structure
        // Usually response.text() helper exists, or we access candidates
        if (response && response.text) {
            return response.text();
        }

        // Fallback if .text() helper isn't available on the specific response object type
        // The new SDK often returns a simplified object or one with .text() method
        // Let's assume standard behavior or check candidates
        if (response.candidates && response.candidates.length > 0) {
            return response.candidates[0].content.parts[0].text;
        }

        throw new Error("No content generated");

    } catch (error) {
        console.error("Gemini Generation Error:", error);

        // Handle Quota/Rate Limit errors (429)
        if (error.status === 429 || (error.message && error.message.includes("429"))) {
            const quotaError = new Error("Quota exceeded. Please try again later.");
            quotaError.code = "QUOTA_EXCEEDED";
            throw quotaError;
        }

        throw new Error("Failed to generate letter");
    }
};
