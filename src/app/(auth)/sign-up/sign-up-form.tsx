"use client";

import { useActionState } from "react";
import { signUp, type AuthFormState } from "@/server/auth/actions";

const inputCls =
  "field";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signUp, null);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="name" className="label block">
          Your name
        </label>
        <input id="name" name="name" autoComplete="name" required className={inputCls} />
        {state?.fieldErrors?.name?.[0] ? (
          <p className="field-error">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="email" className="label block">
          Work email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputCls} />
        {state?.fieldErrors?.email?.[0] ? (
          <p className="field-error">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="company" className="label block">
          Company
        </label>
        <input id="company" name="company" autoComplete="organization" required className={inputCls} />
        {state?.fieldErrors?.company?.[0] ? (
          <p className="field-error">{state.fieldErrors.company[0]}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="password" className="label block">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          className={inputCls}
          aria-describedby="password-hint"
        />
        <p id="password-hint" className="hint">
          At least 10 characters with letters and numbers.
        </p>
        {state?.fieldErrors?.password?.[0] ? (
          <p className="field-error">{state.fieldErrors.password[0]}</p>
        ) : null}
      </div>

      {state?.error ? (
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
