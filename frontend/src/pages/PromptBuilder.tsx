import { useLocation, /*useNavigate*/} from "react-router-dom";
import { useState } from "react";

interface Template {
  id: string;
  name: string;
  type: string;
  tone: string;
  format: { sections: string[] };
  style_rules: string[];
  prompt_instruction: string;
  is_system_template?: boolean;
}

export default function PromptBuilder() {
  const location = useLocation();
  //const navigate = useNavigate();
  const { template } = location.state as { template: Template };
  const [userInput, setUserInput] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  function handleGeneratePrompt() {
    const prompt = buildPrompt(template, userInput);
    setGeneratedPrompt(prompt);
  }

  function buildPrompt(template: Template, userInput: string) {
    return `
${template.prompt_instruction}

Tone: ${template.tone}
Format: ${template.format.sections.join(", ")}

User Content:
${userInput}

Generate output strictly following the format.
`;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold">{template.name} Prompt Builder</h2>
      <p className="text-sm text-muted-foreground">
        {template.is_system_template ? "System Template" : "User Template"}
      </p>

      <textarea
        className="w-full p-4 border rounded-lg font-mono text-sm h-40"
        placeholder="Enter your content here..."
        value={userInput}
        onChange={e => setUserInput(e.target.value)}
      />

      <button
        className="px-6 py-2 bg-primary text-white rounded-lg"
        onClick={handleGeneratePrompt}
      >
        Generate Prompt
      </button>

      {generatedPrompt && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50 font-mono whitespace-pre-wrap">
          <h3 className="font-bold mb-2">Generated Prompt:</h3>
          <pre>{generatedPrompt}</pre>
        </div>
      )}
    </div>
  );
}
