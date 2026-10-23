"use client";

import { useState, useActionState } from "react";
import type { NodeType, WorkflowNodeRecord } from "@/server/db/types";
import { saveDefinitionAction, type AutomationFormState } from "../../actions";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { Field } from "@/components/ui/field";

interface DraftStep {
  key: string;
  type: NodeType;
  config: Record<string, unknown>;
}

const ADDABLE: { type: NodeType; hint: string }[] = [
  { type: "condition", hint: "End the run early when a check fails" },
  { type: "template", hint: "Compose values from run input" },
  { type: "approval", hint: "Pause until a person decides" },
  { type: "log", hint: "Record a line in the run log" },
  { type: "http", hint: "Call an external endpoint" },
  { type: "ai", hint: "AI step — requires a configured provider" },
  { type: "output", hint: "Set the run result" },
];

function defaultConfig(type: NodeType): Record<string, unknown> {
  switch (type) {
    case "condition":
      return { field: "", operator: "exists", value: "" };
    case "template":
      return { values: {} };
    case "approval":
      return { action: "", rationale: "", riskLevel: "medium", payload: {} };
    case "log":
      return { message: "" };
    case "http":
      return { url: "", method: "GET" };
    case "ai":
      return { prompt: "" };
    case "output":
      return { values: {} };
    default:
      return {};
  }
}

const inputCls =
  "field";

export function Builder({
  automationId,
  initialNodes,
  credentials,
  agents,
  knowledgeSources,
}: {
  automationId: string;
  initialNodes: WorkflowNodeRecord[];
  credentials: { id: string; name: string; providerKey: string }[];
  agents: { id: string; name: string }[];
  knowledgeSources: { id: string; name: string }[];
}) {
  const [steps, setSteps] = useState<DraftStep[]>(
    initialNodes.map((n) => ({ key: n.key, type: n.type, config: { ...n.config } })),
  );
  const [addType, setAddType] = useState<NodeType>("condition");
  const bound = saveDefinitionAction.bind(null, automationId);
  const [state, formAction, pending] = useActionState<AutomationFormState | null, FormData>(
    bound,
    null,
  );

  function updateStep(index: number, patch: Partial<DraftStep>) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function updateConfig(index: number, patch: Record<string, unknown>) {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, config: { ...s.config, ...patch } } : s)),
    );
  }

  function move(index: number, dir: -1 | 1) {
    setSteps((prev) => {
      if (index + dir < 0 || index + dir >= prev.length === true) return prev;
      if (index === 0 || index + dir === 0) return prev; // trigger stays first
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(index + dir, 0, item);
      return next;
    });
  }

  function remove(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  function add() {
    setSteps((prev) => [
      ...prev,
      { key: `${addType}-${prev.length + 1}`, type: addType, config: defaultConfig(addType) },
    ]);
  }

  return (
    <form action={formAction} noValidate>
      <input type="hidden" name="definition" value={JSON.stringify(steps)} />

      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="card">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-fog px-4 py-2">
              <span className="tnum text-xs font-medium text-mute">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-xs font-medium text-slate">
                {step.type}
              </span>
              {step.type === "trigger" ? (
                <span className="text-[13px] text-mute">
                  {step.config.triggerType === "schedule"
                    ? "Scheduled trigger — runs fire on the interval below"
                    : "Manual trigger — runs start from the automation page"}
                </span>
              ) : (
                <input
                  aria-label="Step key"
                  value={step.key}
                  onChange={(e) => updateStep(i, { key: e.target.value })}
                  className="field min-w-0 flex-1 border-transparent bg-transparent px-2 py-1 hover:border-line sm:w-48 sm:flex-none"
                />
              )}
              <div className="ml-auto flex items-center gap-1">
                {i > 0 ? (
                  <>
                    <IconButton label="Move up" onClick={() => move(i, -1)} disabled={i <= 1}>
                      <ArrowUp aria-hidden strokeWidth={1.75} className="size-4" />
                    </IconButton>
                    <IconButton label="Move down" onClick={() => move(i, 1)} disabled={i === steps.length - 1}>
                      <ArrowDown aria-hidden strokeWidth={1.75} className="size-4" />
                    </IconButton>
                    <IconButton label="Remove step" onClick={() => remove(i)}>
                      <X aria-hidden strokeWidth={1.75} className="size-4" />
                    </IconButton>
                  </>
                ) : null}
              </div>
            </div>
              <div className="px-4 py-4">
              <StepConfig step={step} credentials={credentials} agents={agents} knowledgeSources={knowledgeSources} onChange={(patch) => updateConfig(i, patch)} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-line px-4 py-3">
        <select
          value={addType}
          onChange={(e) => setAddType(e.target.value as NodeType)}
          className={`${inputCls} w-auto max-w-full`}
          aria-label="Step type to add"
        >
          {ADDABLE.map((a) => (
            <option key={a.type} value={a.type}>
              {a.type} — {a.hint}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          className="btn btn-secondary btn-sm"
        >
          Add step
        </button>
      </div>

      {state?.errors?.length ? (
        <div className="form-alert mt-5" role="alert">
          <p className="text-sm font-medium text-risk">The definition needs fixes:</p>
          <ul className="mt-1.5 list-disc pl-5 text-sm text-risk">
            {state.errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {state?.error ? (
        <p className="form-alert mt-5" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="mt-6">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary"
        >
          {pending ? "Saving…" : "Save as new version"}
        </button>
      </div>
    </form>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="btn btn-secondary btn-sm btn-icon"
    >
      {children}
    </button>
  );
}


function StepField(props: React.ComponentProps<typeof Field>) {
  return <Field {...props} className="mb-4 last:mb-0" />;
}

function StepConfig({
  step,
  credentials,
  agents,
  knowledgeSources,
  onChange,
}: {
  step: DraftStep;
  credentials: { id: string; name: string; providerKey: string }[];
  agents: { id: string; name: string }[];
  knowledgeSources: { id: string; name: string }[];
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const c = step.config;

  switch (step.type) {
    case "trigger":
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StepField label="Trigger type">
            <select
              value={String(c.triggerType ?? "manual")}
              onChange={(e) => {
                const triggerType = e.target.value;
                onChange(
                  triggerType === "schedule"
                    ? { triggerType, every: 1, unit: "hours" }
                    : { triggerType, every: undefined, unit: undefined },
                );
              }}
              className={inputCls}
            >
              <option value="manual">manual — started by a person</option>
              <option value="schedule">schedule — runs on an interval</option>
            </select>
          </StepField>
          {c.triggerType === "schedule" ? (
            <>
              <StepField label="Every">
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={Number(c.every ?? 1)}
                  onChange={(e) => onChange({ every: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
                  className={inputCls}
                />
              </StepField>
              <StepField label="Unit">
                <select
                  value={String(c.unit ?? "hours")}
                  onChange={(e) => onChange({ unit: e.target.value })}
                  className={inputCls}
                >
                  <option value="minutes">minutes</option>
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                </select>
              </StepField>
            </>
          ) : null}
          {c.triggerType === "schedule" ? (
            <p className="text-xs text-mute sm:col-span-3">
              Scheduled runs only fire while the automation is <span className="text-ink">active</span> and
              this server process is running. A persistent production worker is part of the deployment
              slice.
            </p>
          ) : null}
        </div>
      );

    case "log":
      return (
        <StepField label="Message" hint='e.g. "Prepared digest for {{input.account}}".'>
          <input
            value={String(c.message ?? "")}
            onChange={(e) => onChange({ message: e.target.value })}
            className={inputCls}
          />
        </StepField>
      );

    case "template":
    case "output":
      return (
        <StepField
          label={step.type === "template" ? "Values to set (JSON object)" : "Run output (JSON object)"}
          hint='Strings may contain {{input.*}} placeholders. e.g. { "summary": "Processed {{input.invoiceId}}" }'
        >
          <textarea
            rows={3}
            spellCheck={false}
            defaultValue={JSON.stringify(c.values ?? {}, null, 2)}
            onBlur={(e) => onChange({ values: safeJson(e.target.value) })}
            className={`${inputCls} font-mono text-[13px]`}
          />
        </StepField>
      );

    case "condition":
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StepField label="Field" hint='Dot path over run input, e.g. "amount".'>
            <input
              value={String(c.field ?? "")}
              onChange={(e) => onChange({ field: e.target.value })}
              className={inputCls}
            />
          </StepField>
          <StepField label="Operator">
            <select
              value={String(c.operator ?? "exists")}
              onChange={(e) => onChange({ operator: e.target.value })}
              className={inputCls}
            >
              <option value="exists">exists</option>
              <option value="equals">equals</option>
              <option value="not_equals">not equals</option>
              <option value="contains">contains</option>
            </select>
          </StepField>
          <StepField label="Value" hint="Ignored for exists.">
            <input
              value={String(c.value ?? "")}
              onChange={(e) => onChange({ value: e.target.value })}
              className={inputCls}
            />
          </StepField>
        </div>
      );

    case "approval":
      return (
        <>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StepField label="Action a reviewer approves" hint='e.g. "Send digest to clients".'>
              <input
                value={String(c.action ?? "")}
                onChange={(e) => onChange({ action: e.target.value })}
                className={inputCls}
              />
            </StepField>
            <StepField label="Risk level">
              <select
                value={String(c.riskLevel ?? "medium")}
                onChange={(e) => onChange({ riskLevel: e.target.value })}
                className={inputCls}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </StepField>
          </div>
          <StepField label="Rationale shown to the reviewer">
            <input
              value={String(c.rationale ?? "")}
              onChange={(e) => onChange({ rationale: e.target.value })}
              className={inputCls}
            />
          </StepField>
          <StepField label="Payload for review (JSON object)" hint="Interpolated, shown with the approval.">
            <textarea
              rows={3}
              spellCheck={false}
              defaultValue={JSON.stringify(c.payload ?? {}, null, 2)}
              onBlur={(e) => onChange({ payload: safeJson(e.target.value) })}
              className={`${inputCls} font-mono text-[13px]`}
            />
          </StepField>
        </>
      );

    case "http":
      return (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_8rem]">
            <StepField label="Endpoint URL" hint="Called for real when the run executes. Leave empty to skip.">
              <input
                value={String(c.url ?? "")}
                onChange={(e) => onChange({ url: e.target.value })}
                placeholder="https://…"
                className={inputCls}
              />
            </StepField>
            <StepField label="Method">
              <select
                value={String(c.method ?? "GET")}
                onChange={(e) => onChange({ method: e.target.value })}
                className={inputCls}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </StepField>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_10rem_10rem]">
            <StepField
              label="Vault credential (optional)"
              hint="Injected into the request at run time. The secret never appears in the step config, logs, or output."
            >
              <select
                value={String(c.credentialId ?? "")}
                onChange={(e) => onChange({ credentialId: e.target.value || undefined })}
                className={inputCls}
              >
                <option value="">No credential</option>
                {credentials.map((cred) => (
                  <option key={cred.id} value={cred.id}>
                    {cred.name} ({cred.providerKey})
                  </option>
                ))}
              </select>
            </StepField>
            {c.credentialId ? (
              <>
                <StepField label="Header name">
                  <input
                    value={String(c.headerName ?? "Authorization")}
                    onChange={(e) => onChange({ headerName: e.target.value })}
                    placeholder="Authorization"
                    className={inputCls}
                  />
                </StepField>
                <StepField label="Scheme" hint='e.g. "Bearer"; empty = raw secret as the header value.'>
                  <input
                    value={String(c.scheme ?? "Bearer")}
                    onChange={(e) => onChange({ scheme: e.target.value })}
                    placeholder="Bearer"
                    className={inputCls}
                  />
                </StepField>
              </>
            ) : null}
          </div>
          {c.credentialId && !credentials.some((cred) => cred.id === c.credentialId) ? (
            <p className="text-xs text-warn">
              This step references a credential that no longer exists — runs will fail at this step.
            </p>
          ) : null}
        </>
      );

    case "ai":
      return (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr]">
            <StepField
              label="Agent (optional)"
              hint="Uses the agent's current model + instructions. Without one, the provider's default model runs this prompt bare."
            >
              <select
                value={String(c.agentId ?? "")}
                onChange={(e) => onChange({ agentId: e.target.value || undefined })}
                className={inputCls}
              >
                <option value="">No agent — bare prompt</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </StepField>
            <StepField
              label="Knowledge retrieval"
              hint="Top chunks are prepended as context; the run records which method served (semantic or lexical)."
            >
              <label className="flex h-9 items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={c.useKnowledge === true}
                  onChange={(e) =>
                    onChange(
                      e.target.checked
                        ? { useKnowledge: true, topK: Number(c.topK ?? 3) }
                        : { useKnowledge: undefined, knowledgeSourceId: undefined, topK: undefined },
                    )
                  }
                  className="h-4 w-4 accent-ink"
                />
                Retrieve context from knowledge
              </label>
            </StepField>
          </div>
          {c.useKnowledge === true ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_8rem]">
              <StepField label="Source (optional)" hint="Empty = search across all of this organization's knowledge.">
                <select
                  value={String(c.knowledgeSourceId ?? "")}
                  onChange={(e) => onChange({ knowledgeSourceId: e.target.value || undefined })}
                  className={inputCls}
                >
                  <option value="">All knowledge</option>
                  {knowledgeSources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>
              </StepField>
              <StepField label="Chunks (top K)">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={Number(c.topK ?? 3)}
                  onChange={(e) =>
                    onChange({ topK: Math.min(10, Math.max(1, Math.floor(Number(e.target.value) || 3))) })
                  }
                  className={inputCls}
                />
              </StepField>
            </div>
          ) : null}
          <StepField
            label="Prompt"
            hint="Supports {{input.*}} and {{vars.*}} placeholders. Without a configured AI provider the step records an explicit skip — no fabricated output."
          >
            <textarea
              rows={3}
              value={String(c.prompt ?? "")}
              onChange={(e) => onChange({ prompt: e.target.value })}
              className={inputCls}
            />
          </StepField>
          {c.agentId && !agents.some((a) => a.id === c.agentId) ? (
            <p className="text-xs text-warn">
              This step references an agent that no longer exists — runs will fail at this step.
            </p>
          ) : null}
          {c.knowledgeSourceId && !knowledgeSources.some((s) => s.id === c.knowledgeSourceId) ? (
            <p className="text-xs text-warn">
              This step references a knowledge source that no longer exists — retrieval returns nothing.
            </p>
          ) : null}
        </>
      );

    default:
      return null;
  }
}

function safeJson(text: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // keep previous value on parse failure
  }
  return {};
}
