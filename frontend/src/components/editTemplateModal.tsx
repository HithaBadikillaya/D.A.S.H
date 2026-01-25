import { useState } from "react";
import type { Template } from "../types/templates";

interface Props {
  template: Template;
  onSave: (id: string, updatedData: Partial<Template>) => void;
  onClose: () => void;
}

export default function EditTemplateModal({ template, onSave, onClose }: Props) {
  // State for all editable fields
  const [name, setName] = useState(template.name);
  const [type, setType] = useState(template.type);
  const [tone, setTone] = useState(template.tone);
  const [sections, setSections] = useState(template.format.sections.join(", "));
  const [styleRules, setStyleRules] = useState(template.style_rules.join(", "));
  const [promptInstruction, setPromptInstruction] = useState(template.prompt_instruction);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    onSave(template.id, {
      name,
      type,
      tone,
      format: { sections: sections.split(",").map(s => s.trim()) },
      style_rules: styleRules.split(",").map(s => s.trim()),
      prompt_instruction: promptInstruction,
    });

    onClose();
  }

  const inputClass =
    "w-full bg-background border border-muted/40 rounded-lg p-3 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all";
  const labelClass = "block font-indie text-secondary text-lg mb-1";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="bg-background border border-secondary/30 w-full max-w-lg rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-muted/20">
          <h3 className="text-3xl font-amarna text-secondary">Modify Template</h3>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
            &gt; Template ID: {template.id}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className={labelClass}>Template Name</label>
            <input
              className={inputClass}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Template name"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className={labelClass}>Type</label>
            <input
              className={inputClass}
              value={type}
              onChange={e => setType(e.target.value)}
              placeholder="Type (e.g., MoM, Letter)"
              required
            />
          </div>

          {/* Tone */}
          <div>
            <label className={labelClass}>Tone</label>
            <input
              className={inputClass}
              value={tone}
              onChange={e => setTone(e.target.value)}
              placeholder="Tone (e.g., Formal, Friendly)"
              required
            />
          </div>

          {/* Sections */}
          <div>
            <label className={labelClass}>Sections</label>
            <input
              className={inputClass}
              value={sections}
              onChange={e => setSections(e.target.value)}
              placeholder="Sections (comma separated)"
              required
            />
          </div>

          {/* Style Rules */}
          <div>
            <label className={labelClass}>Style Rules</label>
            <input
              className={inputClass}
              value={styleRules}
              onChange={e => setStyleRules(e.target.value)}
              placeholder="Style Rules (comma separated)"
              required
            />
          </div>

          {/* Prompt Instruction */}
          <div>
            <label className={labelClass}>Prompt Instruction</label>
            <textarea
              className={inputClass + " resize-none h-24"}
              value={promptInstruction}
              onChange={e => setPromptInstruction(e.target.value)}
              placeholder="Instruction for AI prompt"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              [ CANCEL ]
            </button>
            <button
              type="submit"
              className="px-8 py-2 bg-secondary text-secondary-foreground font-bold rounded-lg hover:shadow-[0_0_15px_rgba(var(--secondary),0.3)] transition-all"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
