import { Children, cloneElement, isValidElement, useId } from "react";
import { cn } from "@/lib/utils";

const CONTROLS = new Set(["input", "select", "textarea"]);

type ControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

/**
 * Label + control + hint + error as one unit. The visible <label> is tied to
 * the control via htmlFor/id, and the hint and error are linked with
 * aria-describedby (the error also sets aria-invalid), so assistive tech
 * announces them with the field. The first native input/select/textarea among
 * the children is the control; anything else (extra copy) is rendered as-is.
 */
export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const uid = useId();
  const hintId = hint ? `${uid}-hint` : undefined;
  const errorId = error ? `${uid}-error` : undefined;

  const nodes = Children.toArray(children);
  const controlIndex = nodes.findIndex(
    (n) => isValidElement(n) && typeof n.type === "string" && CONTROLS.has(n.type),
  );
  const control = controlIndex >= 0 ? (nodes[controlIndex] as React.ReactElement<ControlProps>) : null;
  const controlId = control?.props.id ?? uid;

  const content = nodes.map((node, i) => {
    if (i !== controlIndex || !control) return node;
    const describedBy =
      [control.props["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined;
    return cloneElement(control, {
      id: controlId,
      "aria-describedby": describedBy,
      "aria-invalid": error ? true : control.props["aria-invalid"],
    });
  });

  return (
    <div className={cn(className)}>
      <label htmlFor={controlId} className="label">
        {label}
      </label>
      {content}
      {hint ? (
        <p id={hintId} className="hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
