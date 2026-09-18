import { articles, industries, solutions } from "@/lib/content";
import { canonicalUrl } from "@/lib/seo";
import { site } from "@/lib/site";

// Content is fixed at build time — no request-time data is read, so the file is
// served as a static asset instead of being rendered per request.
export const dynamic = "force-static";

/**
 * llms.txt — the emerging convention for making a site legible to AI answer
 * engines. Short, factual, citation-friendly: who we are, what we do, and where
 * the authoritative pages live.
 *
 * Solution, industry and resource entries are generated from the same content
 * model the pages use, so a URL cannot be published on the site and go missing
 * here. This is a discovery layer, not a ranking mechanism, and it contains
 * nothing that is not already public on the site itself.
 */
export function GET(): Response {
  // Solutions and industries carry `summary`; articles carry `description`.
  // Taking the text via an accessor keeps this working for both shapes.
  const list = <T extends { title: string; slug: string }>(
    items: T[],
    base: string,
    describe: (item: T) => string,
  ) =>
    items
      .map((i) => `- [${i.title}](${canonicalUrl(`${base}/${i.slug}`)}): ${describe(i)}`)
      .join("\n");

  const body = `# ${site.name}

> ${site.name} is a managed AI systems partner for mid-market companies. It designs, deploys, and operates AI infrastructure, workflow automations, and production-ready agents across clients' existing business systems.

AutoMSP closes the gap between AI prototypes and production systems. One accountable team covers strategy, secure infrastructure, automation engineering, agent deployment, and ongoing operations — with human approval controls on sensitive actions, monitoring, evaluation, and cloud or private-environment deployment options.

## Services

- [AI infrastructure](${canonicalUrl("/ai-infrastructure")}): managed model access, enterprise RAG and vector search, API integrations, access controls, logging, evaluation
- [Workflow automation](${canonicalUrl("/capabilities#workflow-automation")}): document processing, reporting, reconciliation, CRM workflows, approval and exception routing
- [AI agents](${canonicalUrl("/ai-agents")}): task-focused agents with defined tools, permissions, and escalation rules
- [Managed AI operations](${canonicalUrl("/managed-ai-operations")}): monitoring, optimization, incident response, model and prompt evaluation
- [AEO services](${canonicalUrl("/aeo-services")}): making a company citable by AI answer engines
- [Voice AI](${canonicalUrl("/capabilities#voice-ai")}): voice intake, qualification, and scheduling

## Solution patterns

${list(solutions, "/solutions", (s) => s.summary)}

## Industries

${list(industries, "/industries", (i) => i.summary)}

## Guides

${list(articles, "/resources", (a) => a.description)}

## How AutoMSP differs from an AI consultancy

A consultancy delivers recommendations or a prototype. AutoMSP remains responsible for deployment, integration, monitoring, maintenance, and continuous optimization after launch.

## Engagement model

- [AI Opportunity Audit](${canonicalUrl("/book-audit")}): free discovery session, three prioritized opportunities, implementation path
- AI Automation Pilot: one production workflow with integrations, testing, documentation, approval controls
- Managed AI Infrastructure: ongoing managed capability with automations, agents, RAG, monitoring, engineering support
- AI Department as a Service: dedicated cross-functional AI delivery team

## Key pages

- [Home](${canonicalUrl("/")}): positioning, solutions overview, pricing summary, FAQ
- [Capabilities](${canonicalUrl("/capabilities")}): detailed service descriptions
- [Approach](${canonicalUrl("/approach")}): delivery process from discovery to operation
- [How it works](${canonicalUrl("/how-it-works")}): the nightly agent cycle
- [Results](${canonicalUrl("/results")}): how outcomes are measured, with calculation methods
- [Security](${canonicalUrl("/security")}): controls, data handling, deployment options
- [Pricing](${canonicalUrl("/pricing")}): engagement models
- [About](${canonicalUrl("/about")}): company background
- [Contact](${canonicalUrl("/contact")}): talk to the team
- [Terms of service](${canonicalUrl("/terms")}) and [privacy policy](${canonicalUrl("/privacy")})

## Contact

- Website: ${site.url}
- Email: ${site.email}
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
