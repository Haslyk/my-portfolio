import {
  BrainCircuit,
  Cloud,
  Code2,
  Database,
  GitBranch,
  Server,
  Smartphone,
} from "lucide-react";

export interface SkillCategory {
  id: "frontend" | "backend" | "mobile" | "ai" | "database" | "workflow";
  title: { en: string; tr: string };
  icon: typeof Code2;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    id: "frontend",
    title: { en: "Frontend", tr: "Frontend" },
    icon: Code2,
    skills: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "Angular", "Vue.js"],
  },
  {
    id: "backend",
    title: { en: "Backend", tr: "Backend" },
    icon: Server,
    skills: ["Node.js", "PHP", "Python", "Java", "REST API", "Laravel", "Django"],
  },
  {
    id: "mobile",
    title: { en: "Mobile", tr: "Mobil" },
    icon: Smartphone,
    skills: ["React Native", "Flutter"],
  },
  {
    id: "ai",
    title: { en: "AI & Computer Vision", tr: "AI & Bilgisayarlı Görü" },
    icon: BrainCircuit,
    skills: ["TensorFlow", "PyTorch", "OpenCV", "YOLO"],
  },
  {
    id: "database",
    title: { en: "Database & Cloud", tr: "Veritabanı & Bulut" },
    icon: Database,
    skills: ["MongoDB", "MySQL", "Docker", "AWS", "CI/CD"],
  },
  {
    id: "workflow",
    title: { en: "Tools & Workflow", tr: "Araçlar & Akış" },
    icon: GitBranch,
    skills: ["Git", "GitHub", "Jira", "Postman", "Agile", "Scrum"],
  },
];
