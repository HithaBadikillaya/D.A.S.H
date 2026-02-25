const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export type Template = {
  id: string;
  name: string;
  category: string;
  structure: string;
  content: string;
  type: "system" | "user";
  createdAt: string;
  updatedAt: string;
};

export type CaptionRequest = {
  inputText: string;
  templateId: string;
  platform?: string;
  tone?: string;
  length?: "normal" | "longer";
  currentContent?: string;
};

export async function generateCaption(payload: CaptionRequest): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/captions/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Caption generation failed");
  }
  return data.caption;
}

export async function getTemplates(): Promise<Template[]> {
  const response = await fetch(`${API_BASE_URL}/api/captions/templates`);
  if (!response.ok) throw new Error("Failed to fetch templates");
  return response.json();
}

export async function createTemplate(template: Partial<Template>): Promise<Template> {
  const response = await fetch(`${API_BASE_URL}/api/captions/templates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(template),
  });
  if (!response.ok) throw new Error("Failed to create template");
  return response.json();
}

export async function updateTemplate(id: string, template: Partial<Template>): Promise<Template> {
  const response = await fetch(`${API_BASE_URL}/api/captions/templates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(template),
  });
  if (!response.ok) throw new Error("Failed to update template");
  return response.json();
}

export async function deleteTemplate(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/captions/templates/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete template");
}
