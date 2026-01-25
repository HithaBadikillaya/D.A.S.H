import type { Template } from "../types/templates";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EditTemplateModal from "./editTemplateModal";

interface Props {
  templates: Template[];
  onDelete: (id: string) => void;
  onEdit: (id: string, data: Partial<Template>) => void;
}

export default function TemplateList({ templates, onDelete, onEdit }: Props) {
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const navigate = useNavigate();

  const handleUseTemplate = (template: Template) => {
    navigate("/prompt-builder", { state: { template } });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <header className="mb-12 border-b border-muted/20 pb-8">
          <h2 className="text-5xl font-amarna font-bold text-primary mb-2">
            Template Management
          </h2>
          <p className="text-xl font-indie text-secondary">
             Configure your document generation blueprints
          </p>
        </header>

        {/* Template List */}
        <div className="flex flex-col gap-6">
          {templates.map((template) => {
            const isSystem = template.is_system_template ?? false;

            return (
              <div
                key={template.id}
                className={`group relative border transition-all duration-300 p-6 rounded-xl 
                  ${isSystem 
                    ? "bg-secondary/5 border-secondary/30" 
                    : "bg-background border-muted/30 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                  }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold tracking-tight text-foreground">
                        {template.name}
                      </h3>
                      {isSystem && (
                        <span className="text-[10px] uppercase tracking-widest bg-secondary text-black px-2 py-0.5 rounded font-mono font-bold">
                          System
                        </span>
                      )}
                    </div>
                    
                    <p className="font-mono text-sm text-muted-foreground uppercase tracking-tighter">
                      Type: <span className="text-primary">{template.type}</span> | 
                      Tone: <span className="text-primary">{template.tone}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Use
                    </button>

                    {!isSystem && (
                      <>
                        <button
                          onClick={() => setEditingTemplate(template)}
                          className="px-6 py-2 border border-muted-foreground/30 hover:bg-muted/10 font-mono text-sm rounded-lg transition-colors"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => onDelete(template.id)}
                          className="px-6 py-2 text-destructive hover:bg-destructive/10 font-mono text-sm rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-muted/20 rounded-2xl">
            <p className="font-indie text-2xl text-muted-foreground">No templates found...</p>
          </div>
        )}
      </div>

      {editingTemplate && (
        <EditTemplateModal
          template={editingTemplate}
          onSave={onEdit}
          onClose={() => setEditingTemplate(null)}
        />
      )}
    </div>
  );
}