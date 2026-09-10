export interface AIProvider {
  name: string;
  isAvailable(): boolean;
  extractSkills(text: string): Promise<string[]>;
  summarize(jobTitle: string, company: string, description: string): Promise<string>;
}

export class HeuristicAIProvider implements AIProvider {
  name = "Native Heuristic NLP Engine";

  isAvailable(): boolean {
    return true;
  }

  async extractSkills(text: string): Promise<string[]> {
    const { extractSkills } = await import("./extractor");
    return extractSkills(text);
  }

  async summarize(jobTitle: string, company: string, description: string): Promise<string> {
    const { generateAISummary, extractSkills } = await import("./extractor");
    const skills = extractSkills(description);
    return generateAISummary(jobTitle, company, skills, description);
  }
}

// Extensible LLM Provider implementation (e.g. Gemini / OpenAI)
export class LLMProvider implements AIProvider {
  name = "Cloud LLM (Gemini/OpenAI)";
  private apiKey?: string;

  constructor() {
    this.apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  async extractSkills(text: string): Promise<string[]> {
    // If API key is set, would call LLM; falls back cleanly to Heuristic
    const fallback = new HeuristicAIProvider();
    return fallback.extractSkills(text);
  }

  async summarize(jobTitle: string, company: string, description: string): Promise<string> {
    const fallback = new HeuristicAIProvider();
    return fallback.summarize(jobTitle, company, description);
  }
}

export const activeAIProvider: AIProvider = new HeuristicAIProvider();
