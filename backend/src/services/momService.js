import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";
dotenv.config();

const MODEL = "meta-llama/Meta-Llama-3-8B-Instruct";
const hf = new InferenceClient(process.env.HF_API_KEY);

if (!process.env.HF_API_KEY) {
    console.warn("D.A.S.H Warning: HF_API_KEY is missing via process.env");
}

/**
 * Generates structured Minutes of Meeting using a multi-stage approach
 * Stage 1: Parallel extraction of key data points
 * Stage 2: Synthesis into final template
 */
export async function generateMoM(transcriptText, template, meetingTitle = null, length = "normal", currentContent = null) {
    try {
        console.log(`[MoM Service] Starting multi-stage generation for: ${meetingTitle || 'Untitled Meeting'} (Length: ${length}, Expand: ${!!currentContent})`);

        if (length === "longer" && currentContent) {
            // Specialized expansion stage if we already have content
            const expansionPrompt = `
[Task: Elongate and Expand Existing Meeting Minutes]
[Current MoM]:
${currentContent}

[Transcript for Reference]:
${transcriptText.substring(0, 10000)}

[Instruction]:
Take the Current MoM and significantly expand upon every section.
- Add more detail to the agenda points.
- Provide background reasoning for decisions made.
- Elaborate on the action items with more context.
- Ensure the tone remains professional.
- DO NOT summarize; ELABORATE.

[Direct Output Only]:`.trim();

            const expansionResponse = await hf.chatCompletion({
                model: MODEL,
                messages: [
                    {
                        role: "system",
                        content: "You are a professional secretary. Your task is to ELONGATE and EXPAND the existing meeting minutes using the transcript for extra detail. No meta-commentary."
                    },
                    {
                        role: "user",
                        content: expansionPrompt
                    }
                ],
                max_tokens: 4000,
                temperature: 0.5,
            });

            return expansionResponse.choices[0].message.content.trim();
        }

        const lengthInstruction = length === "longer"
            ? "Provide extensive detail, capturing nuances, background context for decisions, and comprehensive action item descriptions. Aim for a thorough and lengthy document."
            : "Keep it extremely brief, high-level, and very concise. Focus only on the most critical points. Do NOT provide unnecessary detail.";

        // Stage 1: Extraction (Logical breakdown)
        const extractionPrompt = `
[Task: Extract Meeting Intelligence]
[Transcript]:
${transcriptText.substring(0, 15000)}

[Requirements]:
Identify:
1. Core Agenda & Main Themes
2. Key Decisions Made
3. Action Items with specific Owners (if mentioned)
4. Unresolved Issues/Next Steps

[Format: Bullet points only. No conversational filler.]
${length === "longer" ? "[Special Instruction: Extract as much detail as possible for each point.]" : ""}
`.trim();

        const extractionResponse = await hf.chatCompletion({
            model: MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an expert analyst. Extract raw meeting data with high precision. No preamble."
                },
                {
                    role: "user",
                    content: extractionPrompt
                }
            ],
            max_tokens: length === "longer" ? 2000 : 1200,
            temperature: 0.3,
        });

        const rawIntelligence = extractionResponse.choices[0].message.content.trim();

        // Stage 2: Synthesis (Template Application)
        const structureStr = template.structure || "Standard Meeting Minutes";

        const synthesisPrompt = `
[Instruction: Synthesize professional Meeting Minutes following the Blueprint and Structure.]
[Structure: ${structureStr}]
[Meeting Title: ${meetingTitle || 'Untitled Meeting'}]

[Extracted Intelligence]:
${rawIntelligence}

[Template/Blueprint]:
${template.content}

[Rules]:
1. Use the Blueprint for formatting.
2. Fill placeholders using the Intelligence.
3. ${lengthInstruction}
4. Direct Output Only.`.trim();

        const synthesisResponse = await hf.chatCompletion({
            model: MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are a professional secretary. Format the meeting intelligence into the requested template. No meta-commentary."
                },
                {
                    role: "user",
                    content: synthesisPrompt
                }
            ],
            max_tokens: length === "longer" ? 3500 : 2000,
            temperature: 0.6,
        });

        const finalMoM = synthesisResponse.choices[0].message.content.trim();
        console.log(`[MoM Service] Generation complete (${finalMoM.length} chars).`);

        return finalMoM;
    } catch (err) {
        console.error("MOM_GENERATION_SERVICE_ERROR:", err.message);
        throw err;
    }
}
