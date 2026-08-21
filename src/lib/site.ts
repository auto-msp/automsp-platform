export const site = {
  name: "AutoMSP",
  descriptor: "AI Automation Services",
  domain: "automsp.us",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://automsp.us",
  email: "hello@automsp.us",
  tagline: "Build an AI operating layer without building an AI department.",
  description:
    "AutoMSP designs, builds, integrates, and operates secure AI automation systems that work with your business, your data, and your people.",
} as const;

export const marketingNav = [
  { label: "Capabilities", href: "/capabilities" },
  { label: "Solutions", href: "/solutions" },
  { label: "Industries", href: "/industries" },
  { label: "Approach", href: "/approach" },
  { label: "Results", href: "/results" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
] as const;

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
