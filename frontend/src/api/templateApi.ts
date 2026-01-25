import type { Template } from "../types/templates";

const BASE_URL = "http://localhost:5000/api/templates";

export async function getTemplates(): Promise<Template[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch templates");
  return res.json();
}

export async function createTemplate(template: Template): Promise<void> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(template)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message);
  }
}

export async function deleteTemplate(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE"
  });

  if (!res.ok) throw new Error("Failed to delete template");
}

export async function updateTemplate(
  id: string,
  updatedData: Partial<Template>
): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message);
  }
}