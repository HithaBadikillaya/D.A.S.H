import React, { useState } from "react";

interface ResultsDisplayProps {
    generatedMoM: string;
    onExpand: () => void;
    isExpanding: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ generatedMoM, onExpand, isExpanding }) => {
    if (!generatedMoM) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-12 duration-700">
            <div className="bg-card border-2 border-primary/30 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden">
                <div className="bg-background rounded-[2.3rem] p-10 space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-primary tracking-[0.3em] uppercase">
                                All done!
                            </span>
                            <h4 className="text-3xl font-black text-foreground tracking-tighter">
                                Your Meeting Minutes
                            </h4>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={onExpand}
                                disabled={isExpanding}
                                className="px-8 py-4 rounded-full font-black text-sm tracking-tighter transition-all shadow-lg flex items-center gap-2 bg-primary/10 text-primary border-2 border-primary/20 hover:bg-primary/20 hover:scale-105 disabled:opacity-50 disabled:scale-100"
                            >
                                {isExpanding ? "EXPANDING..." : "EXPAND"}
                            </button>
                            <CopyButton text={generatedMoM} />
                        </div>
                    </div>

                    <div className="relative group">
                        <textarea
                            className="w-full min-h-[400px] bg-muted/20 border border-border p-6 rounded-3xl outline-none text-base text-foreground/90 font-medium leading-relaxed resize-none"
                            value={generatedMoM}
                            readOnly
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
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
};
