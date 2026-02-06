import { useState, useEffect } from "react";
import { generateLetter } from "../../services/letterApi";
import { useTemplates } from "../../hook/useTemplate";
import type { Template } from "../../services/captionApi";

export default function LetterGenerator() {
  const { templates, addTemplate, removeTemplate, editTemplate, loading: templatesLoading } = useTemplates();
  const [inputText, setInputText] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [tone, setTone] = useState("formal");
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [modalName, setModalName] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalStructure, setModalStructure] = useState("");

  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const letterTemplates = templates.filter(t => t.category === "letter");

  // Set default template once loaded
  useEffect(() => {
    if (letterTemplates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(letterTemplates[0].id);
    }
  }, [letterTemplates, selectedTemplateId]);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Please enter the letter details");
      return;
    }
    if (!selectedTemplateId) {
      setError("Please select a template");
      return;
    }

    setLoading(true);
    setError("");
    setLetter("");

    try {
      const result = await generateLetter({
        inputText,
        templateId: selectedTemplateId,
        tone,
      });

      setLetter(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate letter");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setModalName("");
    setModalContent("");
    setModalStructure("");
    setIsModalOpen(true);
  };

  const openEditModal = (t: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    if (t.type === "system") return;
    setEditingTemplate(t);
    setModalName(t.name);
    setModalContent(t.content);
    setModalStructure(t.structure || "");
    setIsModalOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!modalName.trim() || !modalContent.trim()) return;

    if (editingTemplate) {
      await editTemplate(editingTemplate.id, {
        name: modalName,
        content: modalContent,
        category: "letter",
        structure: modalStructure
      });
    } else {
      await addTemplate({
        name: modalName,
        content: modalContent,
        category: "letter",
        structure: modalStructure
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-10 relative overflow-y-auto">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none opacity-50" />

      <div className="relative z-10 w-full max-w-6xl space-y-10 mt-6 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <h2 className="text-4xl md:text-6xl font-amarna font-black text-foreground tracking-tighter decoration-primary decoration-4">
              LETTER DRAFTS
            </h2>
            <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase opacity-70">
              Generate professional letters with AI
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-foreground text-background font-black rounded-full hover:scale-105 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] text-sm tracking-tighter"
          >
            + NEW TEMPLATE
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar / Controls */}
          <div className="lg:col-span-4 space-y-8">
            {/* Tone Selection */}
            <div className="bg-card/40 backdrop-blur-xl border border-border rounded-3xl p-8 space-y-6 shadow-xl">
              <div className="space-y-4">
                <label className="text-xs font-black tracking-widest text-muted-foreground uppercase opacity-80">
                  Letter Tone
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { value: "formal", label: "Formal & Professional" },
                    { value: "semi-formal", label: "Semi-Formal" },
                    { value: "friendly", label: "Friendly & Warm" },
                    { value: "assertive", label: "Assertive & Direct" }
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all tracking-tighter text-left ${tone === t.value
                        ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                        : "bg-background/20 border-border text-foreground hover:border-primary/50"
                        }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Input Area */}
            <div className="bg-card/40 backdrop-blur-xl border border-border rounded-3xl p-8 space-y-4 shadow-xl">
              <label className="text-xs font-black tracking-widest text-muted-foreground uppercase opacity-80">
                Letter Details
              </label>
              <textarea
                className="w-full min-h-[200px] p-6 text-lg bg-background/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/30 resize-none font-medium leading-relaxed"
                placeholder="Describe what you need the letter for. Include recipient, purpose, key points to include..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || templatesLoading}
                className="w-full py-5 bg-primary text-primary-foreground text-xl font-black rounded-2xl hover:brightness-110 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-tighter"
              >
                {loading ? (
                  <span className="w-6 h-6 border-4 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  "DRAFT LETTER"
                )}
              </button>
              {error && <p className="text-destructive text-center text-xs font-bold uppercase mt-2">{error}</p>}
            </div>
          </div>

          {/* Template Gallery & Results */}
          <div className="lg:col-span-8 space-y-10">
            {/* Gallery Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-black tracking-widest text-foreground uppercase">
                  Select Template
                </label>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">
                  {letterTemplates.length} Templates Loaded
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {letterTemplates.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`relative group cursor-pointer aspect-[3/4] rounded-3xl border-2 transition-all overflow-hidden ${selectedTemplateId === t.id
                      ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(var(--primary),0.2)]"
                      : "border-border bg-card/40 hover:border-primary/50"
                      }`}
                  >
                    <div className="p-6 h-full flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div
                            className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${t.type === "system" ? "bg-secondary text-black" : "bg-primary/20 text-primary"
                              }`}
                          >
                            {t.type}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewTemplate(t);
                            }}
                            className="px-2 py-1 text-xs bg-background/50 rounded-lg hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
                          >
                            Preview
                          </button>
                        </div>
                        <h4 className="font-bold text-sm leading-tight text-foreground line-clamp-2">
                          {t.name.toUpperCase()}
                        </h4>
                      </div>

                      <div className="space-y-4">
                        <div className="h-20 opacity-30 select-none">
                          {t.structure ? (
                            <div className="flex flex-col gap-1">
                              {t.structure.split("→").map((_: string, i: number) => (
                                <div key={i} className="w-full h-2 bg-foreground/20 rounded-full" style={{ width: `${Math.max(40, 100 - i * 15)}%` }} />
                              ))}
                            </div>
                          ) : (
                            <>
                              <div className="w-full h-2 bg-foreground/20 rounded-full mb-2" />
                              <div className="w-5/6 h-2 bg-foreground/20 rounded-full mb-2" />
                              <div className="w-4/6 h-2 bg-foreground/20 rounded-full" />
                            </>
                          )}
                        </div>
                        {t.type === "user" && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => openEditModal(t, e)}
                              className="flex-1 py-1.5 bg-background/50 text-[10px] font-black rounded-lg hover:bg-background"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTemplate(t.id);
                              }}
                              className="px-2 py-1.5 bg-destructive/10 text-destructive text-[10px] font-black rounded-lg hover:bg-destructive/20"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedTemplateId === t.id && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full border-2 border-background flex items-center justify-center text-[8px] text-primary-foreground font-black">
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Results Section */}
            {letter && (
              <div className="animate-in fade-in slide-in-from-bottom-12 duration-700">
                <div className="bg-card border-2 border-primary/30 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden">
                  <div className="bg-background rounded-[2.3rem] p-10 space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-primary tracking-[0.3em] uppercase">All done!</span>
                        <h4 className="text-3xl font-black text-foreground tracking-tighter">Here's your letter</h4>
                      </div>
                      <CopyButton text={letter} />
                    </div>

                    <div className="relative group">
                      <textarea
                        className="w-full min-h-[300px] bg-muted/20 border border-border p-6 rounded-3xl outline-none text-lg text-foreground/90 font-medium leading-relaxed resize-none whitespace-pre-wrap"
                        value={letter}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl">
          <div className="bg-card border-4 border-border w-full max-w-2xl rounded-[3rem] shadow-3xl p-10 space-y-8 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase">
                  {editingTemplate ? "Edit Template" : "Create New Template"}
                </h3>
                <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
                  Define how you want your letter to be structured
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-2xl hover:scale-110 transition-transform p-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-8">
              {/* Field 1: Name */}
              <div className="space-y-3">
                <label className="text-sm font-black uppercase text-foreground tracking-widest">1. Name your template</label>
                <input
                  type="text"
                  className="w-full p-5 bg-background border-2 border-border rounded-2xl text-xl font-bold focus:border-primary transition-all"
                  placeholder="e.g. Leave Application Letter"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                />
              </div>

              {/* Field 2: Structure */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-black uppercase text-foreground tracking-widest">2. Letter Structure</label>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Pick a style or type your own</span>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    { label: "Formal Letter", structure: "Sender Info → Date → Recipient → Salutation → Body → Closing", content: "Write a formal letter based on: {{inputText}}\n\nMaintain professional tone and standard formatting." },
                    { label: "Application", structure: "Header → Subject → Body → Request → Closing", content: "Write a formal application letter for: {{inputText}}\n\nInclude proper salutation and professional closing." },
                    { label: "Complaint", structure: "Reference → Issue Description → Impact → Resolution Request → Deadline", content: "Write a professional complaint letter about: {{inputText}}\n\nBe assertive but professional." },
                    { label: "Recommendation", structure: "Introduction → Relationship → Qualities → Examples → Endorsement", content: "Write a recommendation letter for: {{inputText}}\n\nHighlight strengths with specific examples." }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setModalStructure(preset.structure);
                        if (!modalContent.trim()) {
                          setModalContent(preset.content);
                        }
                      }}
                      className="px-3 py-1.5 bg-muted/30 border border-border rounded-full text-[10px] font-bold hover:bg-primary/20 hover:border-primary transition-all"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  className="w-full p-4 bg-background border-2 border-border rounded-2xl text-lg font-bold focus:border-primary transition-all"
                  placeholder="Sender Info → Date → Body → Closing"
                  value={modalStructure}
                  onChange={(e) => setModalStructure(e.target.value)}
                />
              </div>

              {/* Field 3: AI Prompt */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-black uppercase text-foreground tracking-widest">3. AI Instructions</label>
                </div>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl mb-2">
                  <p className="text-[11px] text-primary leading-relaxed font-bold">
                    💡 The code <code className="bg-primary/10 px-1 rounded">{"{{inputText}}"}</code> is where the letter details you type in the workspace will appear.
                  </p>
                </div>
                <textarea
                  className="w-full min-h-[160px] p-6 bg-background border-2 border-border rounded-2xl text-base font-medium resize-none focus:border-primary transition-all leading-relaxed"
                  placeholder={`Example: Write a formal resignation letter regarding {{inputText}} with a professional and respectful tone.`}
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-5 bg-muted/20 border-2 border-border rounded-2xl font-black uppercase tracking-tighter hover:bg-muted/40 transition-all"
              >
                Discard
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!modalName.trim() || !modalContent.trim()}
                className="flex-[2] py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-30"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
          <div className="bg-card border border-border w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 space-y-8">
            <div className="flex justify-between items-center border-b border-border pb-6">
              <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">{previewTemplate.name}</h3>
              <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">
                {previewTemplate.type}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-muted-foreground tracking-widest uppercase opacity-70">Letter Structure</label>
              <div className="p-8 bg-muted/30 rounded-[2rem] border-2 border-dashed border-border/50 text-foreground font-bold text-lg text-center flex flex-col gap-4">
                {previewTemplate.structure.split("→").map((step: string, i: number) => (
                  <div key={i} className="py-2 bg-background/50 rounded-xl border border-border/20 shadow-sm">
                    {step.trim()}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setPreviewTemplate(null)}
              className="w-full py-4 bg-foreground text-background rounded-2xl font-black uppercase tracking-tighter hover:brightness-110 active:scale-[0.98] transition-all"
            >
              CLOSE PREVIEW
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`px-8 py-4 rounded-full font-black text-sm tracking-tighter transition-all shadow-lg flex items-center gap-2 ${copied ? "bg-green-500 text-white" : "bg-foreground text-background hover:scale-105"
        }`}
    >
      {copied ? "COPIED!" : "COPY"}
    </button>
  );
}
