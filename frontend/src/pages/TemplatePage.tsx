import TemplateList from "../components/templateList";
import CreateTemplateModal from "../components/createTemplateForm";
import { useTemplates } from "../hook/useTemplate";

export default function Templates() {
  const {
    templates,
    loading,
    error,
    addTemplate,
    removeTemplate,
    editTemplate,
    
  } = useTemplates();

  // Loading state styled with the Mono font and Primary color
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-mono text-primary animate-pulse text-lg">
          &gt; Loading_Templates...
        </p>
      </div>
    );
  }

  // Error state styled with Destructive/Secondary colors
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
        <div className="border border-destructive/50 p-6 rounded-lg">
          <p className="font-mono text-destructive mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-secondary font-indie text-xl underline hover:opacity-80 transition-opacity"
          >
            Try Refreshing?
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Note: We don't need a huge H1 here because TemplateList 
          already provides the large Amarna header. 
      */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex justify-end mb-12">
          <CreateTemplateModal onCreate={addTemplate} />
        </div>

        <TemplateList
          templates={templates}
          onDelete={removeTemplate}
          onEdit={editTemplate}
        />
      </div>
    </div>
  );
}