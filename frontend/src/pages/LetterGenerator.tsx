import { useState, useEffect } from "react";
import { getTemplates, generateLetter } from "../services/letterApi";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

interface TemplateField {
    name: string;
    label: string;
    type: "text" | "textarea";
    placeholder: string;
}

interface Template {
    id: string;
    name: string;
    description: string;
    fields: TemplateField[];
}

export default function LetterGenerator() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [customFields, setCustomFields] = useState<Record<string, string>>({});
    const [tone, setTone] = useState("Professional");
    const [generatedLetter, setGeneratedLetter] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Load templates on mount
    useEffect(() => {
        getTemplates().then((data) => {
            setTemplates(data);
            if (data.length > 0) setSelectedTemplate(data[0].id);
        }).catch(() => setError("Failed to load templates"));
    }, []);

    const handleFieldChange = (name: string, value: string) => {
        setCustomFields((prev) => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError("");
        setGeneratedLetter("");
        try {
            const letter = await generateLetter({
                templateId: selectedTemplate,
                customFields,
                tone,
            });
            setGeneratedLetter(letter);
        } catch (err: any) {
            console.error("Generation failed:", err);
            // Frontend generic error usually masks the real message unless we passed it through
            // But let's check if the error object has the message we want
            if (err.message && err.message.includes("Usage limit")) {
                 setError("Quota exceeded. Please wait a moment before trying again.");
            } else {
                 setError("Failed to generate letter. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = () => {
        if (!generatedLetter) return;
        const doc = new jsPDF();
        
        // Simple text wrapping
        const splitText = doc.splitTextToSize(generatedLetter, 180);
        doc.text(splitText, 15, 20);
        doc.save("letter.pdf");
    };

    const handleExportDOCX = () => {
        if (!generatedLetter) return;

        const doc = new Document({
            sections: [{
                properties: {},
                children: generatedLetter.split("\n").map(line => 
                    new Paragraph({
                        children: [new TextRun(line)],
                        spacing: { after: 200 } // Add some spacing between paragraphs
                    })
                )
            }]
        });

            Packer.toBlob(doc).then(blob => {
                saveAs(blob, "letter.docx");
            }).catch(err => {
                console.error("DOCX Export Error:", err);
                alert("Failed to export DOCX file.");
            });
    };

    const activeTemplate = templates.find(t => t.id === selectedTemplate);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center p-6 relative overflow-hidden">
             {/* Background Effects */}
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                {/* Left Panel: Controls */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-amarna font-bold text-foreground">Letter Generator</h2>
                        <p className="text-muted-foreground mt-2">Craft professional correspondence in seconds.</p>
                    </div>

                    <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
                        
                        {/* Template Selector */}
                        <div className="space-y-3">
                            <label htmlFor="template-select" className="text-sm font-bold tracking-widest text-muted-foreground uppercase ml-1">Type of Letter</label>
                            <div className="relative group">
                                <select 
                                    id="template-select"
                                    className="w-full p-4 pr-12 bg-input/50 border border-border rounded-xl text-foreground font-medium focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none hover:bg-input/70 transition-colors"
                                    value={selectedTemplate}
                                    onChange={(e) => {
                                        setSelectedTemplate(e.target.value);
                                        setCustomFields({}); // Reset fields on template change
                                    }}
                                >
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                            </div>
                            {activeTemplate && <p className="text-sm text-foreground/60 px-1">{activeTemplate.description}</p>}
                        </div>

                        {/* Dynamic Fields */}
                        {activeTemplate && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                                {activeTemplate.fields.map((field) => (
                                    <div key={field.name} className="space-y-2">
                                        <label className="text-sm font-medium text-foreground ml-1">{field.label}</label>
                                        {field.type === "textarea" ? (
                                            <textarea
                                                className="w-full p-3 bg-input/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                                                placeholder={field.placeholder}
                                                value={customFields[field.name] || ""}
                                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                className="w-full p-3 bg-input/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/50"
                                                placeholder={field.placeholder}
                                                value={customFields[field.name] || ""}
                                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Tone Selector */}
                        <div className="space-y-3">
                            <label htmlFor="tone-select" className="text-sm font-bold tracking-widest text-muted-foreground uppercase ml-1">Tone</label>
                            <div className="relative group">
                            <select 
                                id="tone-select"
                                className="w-full p-4 pr-12 bg-input/50 border border-border rounded-xl text-foreground font-medium focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none hover:bg-input/70 transition-colors"
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                            >
                                <option value="Professional">Professional & Formal</option>
                                <option value="Persuasive">Persuasive & Strong</option>
                                <option value="Empathetic">Empathetic & Warm</option>
                                <option value="Urgent">Urgent & Direct</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={loading || !selectedTemplate}
                            className="w-full py-4 bg-primary text-primary-foreground text-xl font-bold rounded-xl hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? "Writing..." : "Generate Letter"}
                        </button>
                        {error && <p className="text-destructive text-center font-medium">{error}</p>}
                    </div>
                </div>

                {/* Right Panel: Result */}
                <div className="flex flex-col h-full">
                     <div className="flex-1 bg-white text-gray-900 rounded-lg shadow-2xl p-8 md:p-12 relative font-serif text-lg leading-relaxed overflow-y-auto min-h-[600px] border border-gray-200">
                        {/* Paper Effect */}
                         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                        
                        {generatedLetter ? (
                            <textarea
                                className="w-full h-full bg-transparent resize-none outline-none"
                                value={generatedLetter}
                                onChange={(e) => setGeneratedLetter(e.target.value)}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 italic">
                                Your generated letter will appear here...
                            </div>
                        )}
                    </div>
                    
                    {generatedLetter && (
                        <div className="mt-4 flex flex-wrap justify-end gap-3">
                             <button type="button" onClick={handleExportPDF} className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-bold transition flex items-center gap-2">
                                <span>PDF</span>
                             </button>
                             <button type="button" onClick={handleExportDOCX} className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-bold transition flex items-center gap-2">
                                <span>DOCX</span>
                             </button>
                             <CopyButton text={generatedLetter} />
                        </div>
                    )}
                </div>
            </div>
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
        className="px-6 py-3 bg-secondary text-secondary-foreground font-bold rounded-xl hover:opacity-80 transition shadow-lg"
      >
        {copied ? "Copied to Clipboard!" : "Copy Text"}
      </button>
    );
  }
