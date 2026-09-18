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

export type Article = {
  slug: string;
  /** Short editorial label shown in the resources index and on the article. */
  type: "Guide" | "Playbook";
  title: string;
  /** Doubles as the meta description — keep it a genuine summary. */
  description: string;
  readTime: string;
  sections: { heading: string; body: string[] }[];
};

/**
 * Long-form resource articles. These live here rather than inside the route
 * module so the sitemap and the resources index are generated from the same
 * list — a new article cannot be published but left out of the sitemap.
 */
export const articles: Article[] = [
  {
    slug: "ai-opportunity-guide",
    type: "Guide",
    title: "How to Identify AI Opportunities Worth Building",
    description:
      "A practical framework for scoring automation candidates on impact, frequency, feasibility, and strategic fit.",
    readTime: "12 min read",
    sections: [
      {
        heading: "Start with the work, not the technology",
        body: [
          "The worst way to find AI opportunities is to ask 'where can we use AI?' The right question is: where does skilled human time disappear into repetitive, rules-adjacent work? List the processes that consume the most hours, break most often, or block growth. That list — not a model catalog — is your opportunity inventory.",
          "Good candidates share three traits: high volume (they happen daily or weekly), structured context (the inputs exist in systems, documents, or defined formats), and tolerable error profiles (a draft can be wrong if a human approves it; a financial posting cannot).",
        ],
      },
      {
        heading: "Score on four dimensions",
        body: [
          "Score each candidate on Business Impact (hours, cost, revenue touched), Frequency (how often it runs), Feasibility (data availability, integration reality, edge-case density), and Strategic Fit (does it compound toward a capability you want?). We multiply rather than add: a zero in any dimension disqualifies the candidate this quarter.",
          "The exact weights should reflect your business. A 2% process improvement at a 50,000-order company beats a 40% improvement at a 200-order company.",
        ],
      },
      {
        heading: "Pick three. Not thirty.",
        body: [
          "The failure mode of AI programs is a long roadmap of half-built things. Choose the top three opportunities, design them properly, and ship one before expanding. Momentum and internal trust come from operational systems, not slide progress.",
          "This is exactly what the AutoMSP AI Opportunity Audit produces: three scored, scoped opportunities with an implementation path for the first.",
        ],
      },
    ],
  },
  {
    slug: "human-in-the-loop",
    type: "Playbook",
    title: "Human-in-the-Loop: Designing Approval Gates That Work",
    description:
      "Where to place approval gates, how to route exceptions, and how to keep people in control without creating bottlenecks.",
    readTime: "9 min read",
    sections: [
      {
        heading: "Approvals belong on consequential, irreversible actions",
        body: [
          "An approval gate costs a human waking minute. Spend those minutes where a mistake is expensive or irreversible: external communications, financial movements, permission changes, deletions. Summaries, classifications, and drafts rarely need gates; sends, posts, and payments always do.",
          "Design the gate with full context: the reviewer should see what triggered the action, the inputs, the proposed output, and the risk level — approving blind is rubber-stamping, not control.",
        ],
      },
      {
        heading: "Route exceptions explicitly, never implicitly",
        body: [
          "Low confidence, missing data, contradictory inputs, novel cases — these must escalate by design. The anti-pattern is a workflow that 'does its best' when uncertain and buries the result in a log nobody reads.",
          "Define the exception queue, its owner, its SLA, and what the system does while waiting (pause, not guess). Then every decision — approve, reject, request changes — gets logged with reviewer identity and timestamp.",
        ],
      },
      {
        heading: "Calibrate over time",
        body: [
          "As evaluation data accumulates, some gated actions earn auto-approval within defined bounds — and some auto-approved actions earn gates back when drift appears. Human-in-the-loop is a dial you tune with evidence, not a switch you set once.",
        ],
      },
    ],
  },
  {
    slug: "measuring-ai-roi",
    type: "Guide",
    title: "Measuring AI Automation ROI Without Fooling Yourself",
    description:
      "Calculation methods for hours saved, cost avoided, and cycle-time reduction — with the caveats that keep numbers honest.",
    readTime: "10 min read",
    sections: [
      {
        heading: "Anchor every metric to a measured baseline",
        body: [
          "Before automating, measure current handling time, volume, error rate, and rework. Without a baseline, 'hours saved' is astrology. Instrument the process for four weeks if you can; accept ranges, not point estimates.",
          "Then label every reported number: Actual (measured from execution logs), Estimated (extrapolated from measured samples), or Projected (modeled from assumptions). Blend them and nobody will — or should — trust the report.",
        ],
      },
      {
        heading: "Hours saved ≠ value created",
        body: [
          "An hour saved only matters if it converts to throughput, quality, or cost. Report the conversion: did ticket capacity rise without hiring? Did close rates improve? Did overtime fall? Hours saved is the input; business movement is the outcome.",
        ],
      },
      {
        heading: "Count the costs honestly",
        body: [
          "Include integration maintenance, monitoring time, model spend, and the human minutes spent on approvals and exception handling. A workflow that saves ten hours and consumes two hours of review is still an 8-hour win — but only if you count the two.",
        ],
      },
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}
