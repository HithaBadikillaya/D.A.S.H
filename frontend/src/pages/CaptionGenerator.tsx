import { useState } from "react";
import { generateCaption } from "../services/captionApi";

export default function CaptionGenerator() {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone] = useState("casual");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError("Please enter some content");
      return;
    }

    setLoading(true);
    setError("");
    setCaption("");

    try {
      const result = await generateCaption({
        platform,
        tone,
        content,
      });

      setCaption(result);
    } catch (err) {
      setError("Failed to generate caption");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl space-y-8">

        {/* Header Section */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl md:text-5xl font-amarna font-bold text-foreground tracking-tight">
            Caption Generator
          </h2>
        </div>

        {/* Main Interface Card */}
        <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-2xl ring-1 ring-white/5">
          <div className="bg-background/40 rounded-[1.3rem] p-6 md:p-10 space-y-8 border border-white/5">

            {/* Input Area - 'Hero' Input */}
            <div className="space-y-4">
              <label className="text-sm font-bold tracking-widest text-muted-foreground uppercase ml-1">
                Describe your content
              </label>
              <textarea
                className="w-full min-h-[160px] p-6 text-lg bg-input/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground/50 resize-y"
                placeholder="Paste your rough thoughts here... e.g. 'Photo of me hiking in the alps, sunset, feeling grateful'"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                aria-label="Caption prompt"
              />
            </div>

            {/* Controls Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold tracking-widest text-muted-foreground uppercase ml-1">
                  Platform
                </label>
                <div className="relative group">
                  <select
                    className="w-full appearance-none p-4 pl-5 bg-input/50 border border-border rounded-xl text-foreground font-medium focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer hover:bg-input/70"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    aria-label="Select Platform"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="twitter">X (Twitter)</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="youtube">YouTube</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    ▼
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold tracking-widest text-muted-foreground uppercase ml-1">
                  Vibe
                </label>
                <div className="relative group">
                  <select
                    className="w-full appearance-none p-4 pl-5 bg-input/50 border border-border rounded-xl text-foreground font-medium focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer hover:bg-input/70"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    aria-label="Select Tone"
                  >
                    <option value="casual">Casual</option>
                    <option value="formal">Professional</option>
                    <option value="promotional">Hype & Sales</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {/* Action Area */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-5 bg-primary text-primary-foreground text-xl font-bold rounded-xl hover:brightness-110 hover:shadow-[0_0_30px_rgba(var(--primary),0.3)] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin" />
                    Crafting Magic...
                  </>
                ) : (
                  "Generate Caption"
                )}
              </button>
              {error && <p className="text-destructive mt-3 text-center font-medium animate-pulse">{error}</p>}
            </div>

          </div>
        </div>

        {/* Results Area - Appears below card */}
        {caption && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Your Caption</h3>
                  <p className="text-sm text-muted-foreground">Ready to post</p>
                </div>
                <CopyButton text={caption} />
              </div>

              <textarea
                className="w-full min-h-[120px] bg-transparent resize-none outline-none text-lg text-foreground/90 font-sans leading-relaxed"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                aria-label="Generated Caption"
                readOnly
              />
            </div>
          </div>
        )}
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
      className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm hover:opacity-80 transition min-w-[4rem]"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

