import type { Template } from "../types/templates";
import EditTemplateModal from "./editTemplateModal";
import { useState } from "react";

interface Props {
  template: Template;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: Partial<Template>) => void;
}

export default function TemplateCard({ template, onDelete, onEdit }: Props) {
    const [isEditing, setIsEditing] = useState(false);
  return (
    <div style={{ border: "1px solid #ccc", padding: "12px", marginBottom: "10px" }}>
      <h3>{template.name}</h3>
      <p>Type: {template.type}</p>
      <p>Tone: {template.tone}</p>

      <button onClick={() => setIsEditing(true)}>Edit</button>
      <button onClick={() => onDelete(template.id)}>Delete</button>

      {isEditing && (
        <EditTemplateModal
          template={template}
          onSave={onEdit}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}

