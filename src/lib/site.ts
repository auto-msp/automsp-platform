export const site = {
  name: "AutoMSP",
  descriptor: "AI Automation Services",
  domain: "automsp.cloud",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://automsp.cloud",
  email: "hello@automsp.cloud",
  tagline: "An autonomous AI team that runs your business while you sleep.",
  /**
   * The site-wide fallback description, and the text used for the Organization
   * entity in structured data.
   *
   * Previously this described the nine-agent fleet ("marketing, outreach,
   * support, ads, finance, engineering on a nightly schedule"), which is the
   * /agents page's positioning and contradicts every other surface: the homepage
   * title, description, H1 and FAQ, the footer, the OG card and llms.txt all say
   * "managed AI systems partner for mid-market companies". Two competing
   * descriptions of the same Organization is the one thing an entity graph must
   * not contain — search and answer engines resolve the company to whichever
   * they read last. This now matches the rest of the site.
   *
   * Note this text is never rendered to users; it appears only in meta tags and
   * JSON-LD. Visible copy is unchanged.
   */
  description:
    "AutoMSP designs, deploys, and operates AI infrastructure, workflow automations, and production-ready agents for mid-market companies.",
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
  // Where a dedicated page exists for a service, the footer points at that page
  // rather than at a section anchor inside /capabilities. Anchor links fragment
  // the signal for a topic across two URLs and left the dedicated pages with no
  // inbound links at all; this is the site's main always-present link surface,
  // so it is what makes every service page reachable within one hop.
  services: [
    { label: "AI Infrastructure", href: "/ai-infrastructure" },
    { label: "Workflow Automation", href: "/capabilities#workflow-automation" },
    { label: "AI Agents", href: "/ai-agents" },
    { label: "Managed Operations", href: "/managed-ai-operations" },
    { label: "Voice AI", href: "/capabilities#voice-ai" },
    { label: "AEO Services", href: "/aeo-services" },
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
