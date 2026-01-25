export interface Template {
  id: string;
  name: string;
  type: string;
  tone: string;
  format: {
    sections: string[];
  };
  style_rules: string[];
  prompt_instruction: string;
  is_system_template?: boolean;
}
