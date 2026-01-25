import { useEffect, useState } from "react";
import type { Template } from "../types/templates";
import { getTemplates, createTemplate, deleteTemplate } from "../api/templateApi";
import { updateTemplate } from "../api/templateApi";

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTemplates() {
    try {
      setLoading(true);
      const data = await getTemplates();
      setTemplates(data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function addTemplate(template: Template) {
    await createTemplate(template);
    await loadTemplates();
  }

  async function removeTemplate(id: string) {
    await deleteTemplate(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  }

  async function editTemplate(id: string, updatedData: Partial<Template>){
    await updateTemplate(id, updatedData);
    await loadTemplates();
  }
  useEffect(() => {
    loadTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    addTemplate,
    removeTemplate,
    editTemplate
  };
}
