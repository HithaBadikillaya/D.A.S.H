const API_URL = "http://localhost:5000/api/letters";

export const getTemplates = async () => {
    const response = await fetch(`${API_URL}/templates`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.templates;
};

export const generateLetter = async (payload: {
    templateId: string;
    customFields: Record<string, string>;
    tone: string;
}) => {
    const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.letter;
};
