import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesDir = path.join(__dirname, "../templates");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Get all available templates
 */
export const getTemplates = async () => {
    try {
        const files = fs.readdirSync(templatesDir).filter((file) => file.endsWith(".md"));
        const templates = [];

        for (const file of files) {
            const fileContent = fs.readFileSync(path.join(templatesDir, file), "utf8");
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
        const files = fs.readdirSync(templatesDir).filter((file) => file.endsWith(".md"));
        let templateData = null;
        let templateContent = "";

        for (const file of files) {
            const fileRaw = fs.readFileSync(path.join(templatesDir, file), "utf8");
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
        // Replace {{variables}} in the markdown body
        let userPrompt = templateContent;
        Object.keys(customFields).forEach(key => {
            // Simple global replacement
            const regex = new RegExp(`{{${key}}}`, 'g');
            userPrompt = userPrompt.replace(regex, customFields[key]);
        });

        const finalPrompt = `
      ${templateData.systemInstruction || ""}
      
      User Requirement:
      ${userPrompt}
      
      Tone/Vibe: ${tone}
      
      Output ONLY the body of the letter. Do not include "Here is your letter" or similar conversational filler.
    `;

        // 3. Call Gemini
        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("Gemini Generation Error:", error);
        throw new Error("Failed to generate letter");
    }
};
