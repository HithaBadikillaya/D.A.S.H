const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export type LetterRequest = {
    inputText: string;
    templateId: string;
    tone?: string;
    length?: "normal" | "longer";
    currentContent?: string;
};

export async function generateLetter(payload: LetterRequest): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/letters/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
        throw new Error(data.message || "Letter generation failed");
    }
    return data.letter;
}
