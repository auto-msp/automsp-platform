import { z } from "zod";

export const auditRequestSchema = z.object({
  company: z.string().trim().min(2, "Company name is required").max(200),
  name: z.string().trim().min(2, "Your name is required").max(200),
  email: z.string().trim().email("A valid work email is required").max(254),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  role: z.string().trim().min(1, "Select your role"),
  companySize: z.string().trim().min(1, "Select company size"),
  industry: z.string().trim().min(1, "Select your industry"),
  currentSystems: z.string().trim().max(2000).optional().or(z.literal("")),
  bottlenecks: z.string().trim().min(10, "Describe your biggest operational bottleneck").max(2000),
  aiUsage: z.string().trim().min(1, "Select your current AI usage"),
  processVolume: z.string().trim().max(200).optional().or(z.literal("")),
  outcomes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type AuditRequestInput = z.infer<typeof auditRequestSchema>;

export const companySizes = [
  "1–50 employees",
  "50–200 employees",
  "200–1,000 employees",
  "1,000–2,000 employees",
  "2,000+ employees",
] as const;

export const roles = [
  "CEO / Founder",
  "COO",
  "CIO / CTO",
  "VP of Operations",
  "Operations Manager",
  "Finance",
  "Other",
] as const;

export const industries = [
  "Manufacturing",
  "Logistics & Supply Chain",
  "Professional Services",
  "Healthcare",
  "Financial Services",
  "Retail & E-commerce",
  "Construction & Real Estate",
  "Other",
] as const;

export const aiUsageLevels = [
  "No AI in production",
  "Experiments / pilots only",
  "AI in limited production",
  "AI across multiple processes",
] as const;
