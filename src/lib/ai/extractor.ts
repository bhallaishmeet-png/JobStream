const TECH_SKILLS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Python", "Go", "Golang", "Java", "C++", "Rust",
  "Node.js", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Kafka", "Elasticsearch", "Docker", "Kubernetes",
  "AWS", "GCP", "Azure", "Terraform", "CI/CD", "Linux", "Git", "GraphQL", "REST", "gRPC", "FastAPI",
  "Spring Boot", "PyTorch", "TensorFlow", "Machine Learning", "AI", "LLMs", "NLP", "Computer Vision",
  "Tailwind CSS", "CSS3", "HTML5", "Redux", "Electron", "Microservices", "Distributed Systems"
];

export function extractSkills(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();
  for (const skill of TECH_SKILLS) {
    const regex = new RegExp(`\\b${skill.replace("+", "\\+")}\\b`, "i");
    if (regex.test(text)) {
      found.add(skill === "Golang" ? "Go" : skill);
    }
  }
  return Array.from(found);
}

export function extractExperienceLevel(title: string, desc: string): "FRESHER" | "0-1" | "1-2" | "2-3" | "3-5" | "5-10" | "10+" {
  const combined = `${title} ${desc}`.toLowerCase();
  if (combined.includes("intern") || combined.includes("fresher") || combined.includes("graduate") || combined.includes("entry level")) {
    return "FRESHER";
  }
  if (combined.includes("0-1") || combined.includes("0 to 1") || combined.includes("1 year")) {
    return "0-1";
  }
  if (combined.includes("1-2") || combined.includes("1 to 2") || combined.includes("2 years")) {
    return "1-2";
  }
  if (combined.includes("2-3") || combined.includes("2 to 3") || combined.includes("3 years")) {
    return "2-3";
  }
  if (combined.includes("senior") || combined.includes("sr.") || combined.includes("3-5") || combined.includes("4 years") || combined.includes("5 years")) {
    return "3-5";
  }
  if (combined.includes("staff") || combined.includes("lead") || combined.includes("principal") || combined.includes("5-10") || combined.includes("8 years")) {
    return "5-10";
  }
  if (combined.includes("director") || combined.includes("vp") || combined.includes("10+")) {
    return "10+";
  }
  return "1-2";
}

export function generateAISummary(title: string, company: string, skills: string[], desc: string): string {
  const topSkills = skills.slice(0, 3).join(", ");
  return `This role at ${company} focuses on ${title.toLowerCase()}, leveraging ${topSkills || "modern technologies"}. High-impact opportunity in a fast-paced environment with modern engineering practices.`;
}
