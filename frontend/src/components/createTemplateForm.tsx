import { useState } from "react";
import type { Template } from "../types/templates";

interface Props {
  onCreate: (template: Template) => void;
}

export default function CreateTemplateModal({ onCreate }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("MoM");
  const [tone, setTone] = useState("");
  const [sections, setSections] = useState("");
  const [styleRules, setStyleRules] = useState("");
  const [promptInstruction, setPromptInstruction] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const template: Template = {
      id: name.toLowerCase().replace(/\s+/g, "_"),
      name,
      type,
      tone,
      format: {
        sections: sections.split(",").map((s) => s.trim()),
      },
      style_rules: styleRules.split(",").map((r) => r.trim()),
      prompt_instruction: promptInstruction,
      is_system_template: false,
    };

    onCreate(template);
    setIsOpen(false);

    // reset form
    setName("");
    setType("MoM");
    setTone("");
    setSections("");
    setStyleRules("");
    setPromptInstruction("");
  }

  const inputClass = "w-full bg-background border border-muted/40 rounded-lg p-3 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50";
  const labelClass = "block font-indie text-secondary text-lg mb-1";

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:scale-105 transition-transform"
      >
        <span className="text-xl">+</span>
        <span>Create New Template</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-background border border-primary/30 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-secondary/10 p-6 border-b border-muted/20 flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-amarna text-primary">New Blueprint</h3>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-1">
                  &gt; Initializing_Template_Sequence
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-primary font-mono"
              >
                [ESC]
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Template Name</label>
                  <input
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Weekly Sync"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Document Type</label>
                  <select 
                    className={inputClass} 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="MoM">Meeting Minutes</option>
                    <option value="Caption">Social Caption</option>
                    <option value="Letter">Official Letter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Tone & Voice</label>
                <input
                  className={inputClass}
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="formal, witty, concise..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Structure (Sections)</label>
                  <input
                    className={inputClass}
                    value={sections}
                    onChange={(e) => setSections(e.target.value)}
                    placeholder="Intro, Discussion, Actions"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Style Rules</label>
                  <input
                    className={inputClass}
                    value={styleRules}
                    onChange={(e) => setStyleRules(e.target.value)}
                    placeholder="No bullet points, use active voice"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>AI Prompt Instructions</label>
                <textarea
                  className={`${inputClass} min-h-[120px] resize-none`}
                  value={promptInstruction}
                  onChange={(e) => setPromptInstruction(e.target.value)}
                  placeholder="Tell the AI how to behave..."
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 font-mono text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-10 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:shadow-[0_0_15px_rgba(var(--primary),0.4)] transition-all"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}