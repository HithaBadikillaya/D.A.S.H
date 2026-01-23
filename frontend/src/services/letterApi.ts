const API_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:5000/";

export const getTemplates = async () => {
    const response = await fetch(`${API_URL}/api/letters/templates`);
    if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.templates;
};

export const generateLetter = async (payload: {
    templateId: string;
    customFields: Record<string, string>;
    tone: string;
}) => {
    const response = await fetch(`${API_URL}/api/letters/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        let errorMessage = `Failed to generate letter: ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData.message) {
                errorMessage = errorData.message;
            }
        } catch (e) {
            // parsing failed, use default message
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.letter;
};
