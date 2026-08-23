export const site = {
  name: "AutoMSP",
  descriptor: "AI Automation Services",
  domain: "automsp.cloud",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://automsp.cloud",
  email: "hello@automsp.cloud",
  tagline: "An autonomous AI team that runs your business while you sleep.",
  description:
    "AutoMSP gives you a team of specialized AI agents that run marketing, outreach, support, ads, finance, and engineering on a nightly schedule — with human approval gates on every consequential action.",
} as const;

export interface NavChild {
  label: string;
  href: string;
  description: string;
}

export interface NavItem {
  label: string;
  /** fallback link for the top-level label itself (used when there are no children) */
  href: string;
  children?: NavChild[];
}

export const marketingNav: NavItem[] = [
  {
    label: "Platform",
    href: "/agents",
    children: [
      {
        label: "Agent Team",
        href: "/agents",
        description: "Nine specialist agents working as one org chart",
      },
      {
        label: "How It Works",
        href: "/how-it-works",
        description: "The nightly cycle that executes while you sleep",
      },
      {
        label: "Security",
        href: "/security",
        description: "Credential vault, approval gates, audit trails",
      },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
    children: [
      {
        label: "Solutions",
        href: "/solutions",
        description: "Back office, revenue ops, customer operations",
      },
      {
        label: "Industries",
        href: "/industries",
        description: "Playbooks tuned to your sector's realities",
      },
      {
        label: "Results",
        href: "/results",
        description: "Measured outcomes, reported with their basis",
      },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Resources",
    href: "/resources",
    children: [
      {
        label: "Resources",
        href: "/resources",
        description: "Guides on AI opportunity, ROI, and guardrails",
      },
      {
        label: "Approach",
        href: "/approach",
        description: "How we design, deploy, and operate systems",
      },
      {
        label: "Contact",
        href: "/contact",
        description: "Talk to the team behind the platform",
      },
    ],
  },
];

export const footerNav = {
  services: [
    { label: "AI Infrastructure", href: "/capabilities#infrastructure" },
    { label: "Workflow Automation", href: "/capabilities#workflow-automation" },
    { label: "AI Agents", href: "/capabilities#agents" },
    { label: "Managed Operations", href: "/capabilities#managed-operations" },
    { label: "Voice AI", href: "/capabilities#voice-ai" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Approach", href: "/approach" },
    { label: "Results", href: "/results" },
    { label: "Contact", href: "/contact" },
  ],
  resources: [
    { label: "Resources", href: "/resources" },
    { label: "AI Opportunity Audit", href: "/book-audit" },
    { label: "Security", href: "/security" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Security", href: "/security" },
  ],
} as const;
