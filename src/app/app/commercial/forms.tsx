"use client";

import { useActionState } from "react";
import {
  createClientAction,
  createOpportunityAction,
  createProjectAction,
  type ActionState,
} from "./actions";

const FIELD =
  "field w-full";
const LABEL = "mb-1 block text-xs font-medium text-slate";

export function NewOpportunityForm() {
  const [state, formAction, pending] = useActionState<ActionState | null, FormData>(
    createOpportunityAction,
    null,
  );
  return (
    <form action={formAction} className="border border-fog bg-surface p-4">
      <h3 className="text-sm font-semibold text-ink">Add an opportunity</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="opp-company">Company</label>
          <input id="opp-company" name="company" required className={FIELD} placeholder="Acme Manufacturing" />
        </div>
        <div>
          <label className={LABEL} htmlFor="opp-contact">Contact name</label>
          <input id="opp-contact" name="contactName" className={FIELD} placeholder="Jane Doe" />
        </div>
        <div>
          <label className={LABEL} htmlFor="opp-email">Contact email</label>
          <input id="opp-email" name="contactEmail" type="email" className={FIELD} placeholder="jane@acme.com" />
        </div>
        <div>
          <label className={LABEL} htmlFor="opp-source">Source</label>
          <input id="opp-source" name="source" className={FIELD} placeholder="referral / audit-funnel / outbound" />
        </div>
        <div>
          <label className={LABEL} htmlFor="opp-value">Est. value (USD)</label>
          <input id="opp-value" name="estimatedValue" inputMode="decimal" className={FIELD} placeholder="25000" />
        </div>
        <div>
          <label className={LABEL} htmlFor="opp-prob">Probability (%)</label>
          <input id="opp-prob" name="probability" inputMode="numeric" className={FIELD} placeholder="40" />
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL} htmlFor="opp-next">Next action</label>
          <input id="opp-next" name="nextAction" className={FIELD} placeholder="Book discovery call" />
        </div>
      </div>
      {state?.error ? <p className="mt-2 text-[13px] text-risk">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary mt-3"
      >
        {pending ? "Adding…" : "Add opportunity"}
      </button>
    </form>
  );
}

export function NewClientForm() {
  const [state, formAction, pending] = useActionState<ActionState | null, FormData>(
    createClientAction,
    null,
  );
  return (
    <form action={formAction} className="border border-fog bg-surface p-4">
      <h3 className="text-sm font-semibold text-ink">Add a client</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label className={LABEL} htmlFor="cl-name">Name</label>
          <input id="cl-name" name="name" required className={FIELD} placeholder="Acme Manufacturing" />
        </div>
        <div>
          <label className={LABEL} htmlFor="cl-industry">Industry</label>
          <input id="cl-industry" name="industry" className={FIELD} placeholder="Manufacturing" />
        </div>
        <div>
          <label className={LABEL} htmlFor="cl-size">Size</label>
          <input id="cl-size" name="size" className={FIELD} placeholder="200–1,000 employees" />
        </div>
      </div>
      {state?.error ? <p className="mt-2 text-[13px] text-risk">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary mt-3"
      >
        {pending ? "Adding…" : "Add client"}
      </button>
    </form>
  );
}

export function NewProjectForm({ clients }: { clients: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState<ActionState | null, FormData>(
    createProjectAction,
    null,
  );
  return (
    <form action={formAction} className="border border-fog bg-surface p-4">
      <h3 className="text-sm font-semibold text-ink">Add a project</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label className={LABEL} htmlFor="pj-name">Name</label>
          <input id="pj-name" name="name" required className={FIELD} placeholder="Invoice automation" />
        </div>
        <div>
          <label className={LABEL} htmlFor="pj-client">Client</label>
          <select id="pj-client" name="clientId" className={FIELD}>
            <option value="">— none —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="pj-stage">Stage</label>
          <select id="pj-stage" name="stage" className={FIELD} defaultValue="lead">
            <option value="lead">Lead</option>
            <option value="discovery">Discovery</option>
            <option value="audit">Audit</option>
            <option value="proposal">Proposal</option>
            <option value="approved">Approved</option>
            <option value="design">Design</option>
            <option value="build">Build</option>
            <option value="deployment">Deployment</option>
            <option value="managed_operations">Managed operations</option>
          </select>
        </div>
      </div>
      {state?.error ? <p className="mt-2 text-[13px] text-risk">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary mt-3"
      >
        {pending ? "Adding…" : "Add project"}
      </button>
    </form>
  );
}
