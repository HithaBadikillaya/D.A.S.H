import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";
dotenv.config();

/**
 * AI Service Configuration
 * Model: meta-llama/Meta-Llama-3-8B-Instruct
 * Why: Modern, high-performance instruction-tuned model compatible with the HF Inference Router.
 */
const MODEL = "meta-llama/Meta-Llama-3-8B-Instruct";
const hf = new InferenceClient(process.env.HF_API_KEY);

if (!process.env.HF_API_KEY) {
  console.warn("D.A.S.H Warning: HF_API_KEY is missing via process.env");
}

/**
 * Generates a concise social media caption using the chatCompletion API.
 * Uses only model, messages, max_tokens, and temperature as requested.
 */
export async function generateCaption(prompt, length = "normal", currentContent = null) {
  try {
    let systemContent = "You are a professional content writer. ";
    let userPrompt = prompt;

    if (length === "longer") {
      if (currentContent) {
        systemContent += "Your task is to ELONGATE and EXPAND the provided text. Keep the same core message and tone, but add significantly more detail, background context, and elaboration. Do NOT replace it entirely; build upon it.";
        userPrompt = `Current Content to expand:\n"""\n${currentContent}\n"""\n\nOriginal Requirements/Context:\n${prompt}\n\nPlease provide a much more detailed and elongated version of the content above.`;
      } else {
        systemContent += "Provide more detail, elaborate on the points, and increase the word count significantly. Be descriptive and thorough.";
      }
    } else {
      systemContent += "Be extremely brief, direct, and concise. Provide a high-level summary only. Minimal word count.";
    }

    systemContent += " Generate only requested content. No preamble, no meta-commentary.";

    const response = await hf.chatCompletion({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: systemContent
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: length === "longer" ? 2000 : 500,
      temperature: 0.7,
    });

    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error("Invalid response from Hugging Face Inference Router");
    }

    return response.choices[0].message.content.trim();
  } catch (err) {
    if (err.httpResponse && err.httpResponse.body) {
      console.error("HF Router Detail:", JSON.stringify(err.httpResponse.body));
    }
    console.error("CAPTION_GENERATION_SERVICE_ERROR:", err.message);
    throw err;
  }
}
