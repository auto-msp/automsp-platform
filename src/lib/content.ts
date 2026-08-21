/** Marketing content model — structured so a CMS (Sanity/Contentful) can replace this file later. */

export type Solution = {
  slug: string;
  title: string;
  summary: string;
  problem: string;
  whatWeBuild: string[];
  exampleWorkflow: string[];
  outcomes: string[];
};

export const solutions: Solution[] = [
  {
    slug: "back-office-automation",
    title: "Back-Office Automation",
    summary: "Document processing, reconciliations, approvals, and internal requests — automated with human gates.",
    problem:
      "Back-office teams spend their days moving information between systems: reading documents, re-keying data, chasing approvals, reconciling records. The work is necessary, repeatable, and unforgiving of error.",
    whatWeBuild: [
      "Document intake and extraction pipelines with validation",
      "Record reconciliation across systems of record",
      "Approval routing with escalation paths",
      "Exception queues that surface what needs human judgment",
    ],
    exampleWorkflow: [
      "New invoice received by email",
      "Extract line items and vendor details",
      "Match against purchase orders",
      "Flag discrepancies for human review",
      "Post approved invoices to ERP",
      "Log full execution trail",
    ],
    outcomes: [
      "30–50% reduction in process cycle time, typical",
      "Exceptions handled by people; routine handled by systems",
      "Every action traceable end-to-end",
    ],
  },
  {
    slug: "customer-operations",
    title: "Customer Operations",
    summary: "Triage, drafting, knowledge-grounded responses, and voice agents for service teams.",
    problem:
      "Support volume grows with the business, but headcount rarely keeps pace. Quality varies by agent, context lives in five systems, and customers repeat themselves.",
    whatWeBuild: [
      "Inbound triage that classifies, routes, and prioritizes",
      "Response drafting grounded in your knowledge base, with review before send",
      "Voice agents for qualification, scheduling, and status calls",
      "Conversation summarization into your CRM or ticketing system",
    ],
    exampleWorkflow: [
      "Customer request arrives",
      "Classify intent and urgency",
      "Retrieve account and order context",
      "Draft response with citations to policy",
      "Agent reviews, edits, approves",
      "Send, update record, log outcome",
    ],
    outcomes: [
      "60–80% of routine touches handled without full agent effort, typical",
      "Consistent answers backed by your actual policies",
      "Every call and thread becomes structured data",
    ],
  },
  {
    slug: "revenue-operations",
    title: "Revenue Operations",
    summary: "Lead enrichment, qualification, personalized outreach drafts, and CRM hygiene — with approval before send.",
    problem:
      "Reps lose selling time to research and data entry. Leads go unworked because qualification is manual, and CRM data decays faster than anyone can maintain it.",
    whatWeBuild: [
      "Lead enrichment from approved data sources",
      "Intent analysis and qualification scoring",
      "Personalized outreach drafts with human approval",
      "Automated CRM updates and hygiene checks",
    ],
    exampleWorkflow: [
      "New lead arrives",
      "Enrich company and contact data",
      "Analyze intent against your ICP",
      "Generate personalized message draft",
      "Rep approves or edits",
      "Send, update CRM, log result",
    ],
    outcomes: [
      "Hours returned to every rep, every week",
      "No unreviewed message ever reaches a prospect",
      "A CRM that reflects reality",
    ],
  },
  {
    slug: "operational-knowledge",
    title: "Operational Knowledge Systems",
    summary: "Secure RAG over policies, manuals, and history so teams get cited answers, not guesses.",
    problem:
      "The answer exists — in a PDF, a wiki page, an old email, a former employee's head. Teams lose hours hunting, and decisions get made on whoever's memory is loudest.",
    whatWeBuild: [
      "Document ingestion with parsing, chunking, and indexing",
      "Tenant-aware retrieval with permissions preserved",
      "Answer interfaces that cite source documents",
      "Freshness tracking so stale knowledge gets flagged",
    ],
    exampleWorkflow: [
      "Employee asks a question",
      "Retrieve from indexed, permissioned sources",
      "Compose answer with citations",
      "Show confidence and sources",
      "Escalate to a human when confidence is low",
    ],
    outcomes: [
      "Answers in seconds, with sources you can verify",
      "Institutional knowledge survives turnover",
      "One knowledge layer that every agent and employee shares",
    ],
  },
];

export type Industry = {
  slug: string;
  title: string;
  summary: string;
  pains: string[];
  systems: string[];
  note: string;
};

export const industries: Industry[] = [
  {
    slug: "manufacturing",
    title: "Manufacturing",
    summary: "Quoting, order processing, quality documentation, and supplier coordination.",
    pains: ["Manual quote assembly from specs", "Order status across ERP and email", "Quality records scattered across systems"],
    systems: ["ERP", "MES", "Email", "SharePoint"],
    note: "We work with your plant systems as they are — no rip-and-replace.",
  },
  {
    slug: "logistics",
    title: "Logistics & Supply Chain",
    summary: "Track-and-trace communication, exception handling, and documentation.",
    pains: ["Customer 'where is my shipment' volume", "Exception triage across carriers", "Proof-of-delivery paperwork"],
    systems: ["TMS", "Carrier APIs", "Email", "Telematics"],
    note: "Automation absorbs routine status work so dispatchers handle true exceptions.",
  },
  {
    slug: "professional-services",
    title: "Professional Services",
    summary: "Proposal assembly, knowledge reuse, delivery workflows, and billing operations.",
    pains: ["Proposals rebuilt from scratch", "Prior work locked in old folders", "Time capture and billing hygiene"],
    systems: ["PSA", "Document stores", "Email", "Time tracking"],
    note: "Knowledge systems that make your firm's experience instantly reusable.",
  },
  {
    slug: "healthcare",
    title: "Healthcare Operations",
    summary: "Administrative workflows: scheduling, intake, referrals, and documentation support.",
    pains: ["Scheduling back-and-forth", "Referral intake processing", "Administrative documentation load"],
    systems: ["EHR-adjacent systems", "Scheduling", "Fax/document intake"],
    note: "We design for your compliance requirements from day one; scope agreed per engagement.",
  },
  {
    slug: "financial-services",
    title: "Financial Services",
    summary: "Document intelligence, client onboarding support, and reconciliations.",
    pains: ["KYC/onboarding document review", "Reconciliation across ledgers", "Client reporting assembly"],
    systems: ["Core platforms", "Document management", "Email"],
    note: "Audit trails and approval gates are non-negotiable — we build them in.",
  },
];

export function getSolution(slug: string) {
  return solutions.find((s) => s.slug === slug);
}

export function getIndustry(slug: string) {
  return industries.find((i) => i.slug === slug);
}
