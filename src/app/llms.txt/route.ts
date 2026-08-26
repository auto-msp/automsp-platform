import { site } from "@/lib/site";

/**
 * llms.txt — the emerging standard for making a site legible to AI answer
 * engines. Short, factual, citation-friendly: who we are, what we do, and
 * where the authoritative pages live.
 */
export function GET(): Response {
  const body = `# ${site.name}

> ${site.name} is a managed AI systems partner for mid-market companies. It designs, deploys, and operates AI infrastructure, workflow automations, and production-ready agents across clients' existing business systems.

AutoMSP closes the gap between AI prototypes and production systems. One accountable team covers strategy, secure infrastructure, automation engineering, agent deployment, and ongoing operations — with human approval controls on sensitive actions, monitoring, evaluation, and cloud or private-environment deployment options.

## What AutoMSP does

- AI opportunity and architecture: workflow assessment, use-case prioritization, feasibility, data-readiness review, ROI roadmap
- AI infrastructure: managed model access, enterprise RAG and vector search, API integrations, access controls, logging, evaluation
- Workflow automation: document processing, reporting, reconciliation, CRM workflows, approval and exception routing
- AI agents: customer support, internal knowledge assistants, revenue operations, research, voice intake — with defined tools, permissions, and escalation rules
- Managed AI operations: performance monitoring, optimization, incident response, model and prompt evaluation

## How AutoMSP differs from an AI consultancy

A consultancy delivers recommendations or a prototype. AutoMSP remains responsible for deployment, integration, monitoring, maintenance, and continuous optimization after launch.

## Engagement model

- Free AI Opportunity Audit: discovery session, three prioritized opportunities, implementation path
- AI Automation Pilot: one production workflow with integrations, testing, documentation, approval controls
- Managed AI Infrastructure: ongoing managed capability with automations, agents, RAG, monitoring, engineering support
- AI Department as a Service: dedicated cross-functional AI delivery team

## Key pages

- [Home](${site.url}): positioning, solutions overview, pricing summary, FAQ
- [Capabilities](${site.url}/capabilities): detailed service descriptions
- [Solutions](${site.url}/solutions): use-case solution pages
- [Industries](${site.url}/industries): industry-specific AI automation
- [Approach](${site.url}/approach): delivery process from discovery to operation
- [Results](${site.url}/results): client outcomes and case studies
- [Security](${site.url}/security): controls, data handling, deployment options
- [Pricing](${site.url}/pricing): engagement models
- [About](${site.url}/about): company background
- [Book an audit](${site.url}/book-audit): free AI opportunity audit

## Contact

- Website: ${site.url}
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
