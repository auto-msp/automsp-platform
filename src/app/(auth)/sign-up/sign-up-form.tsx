"use client";

import { useActionState } from "react";
import { signUp, type AuthFormState } from "@/server/auth/actions";

const inputCls =
  "w-full border border-fog bg-surface px-4 py-3 text-sm text-ink placeholder:text-mute transition-colors focus:border-ink focus:outline-none";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signUp, null);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="name" className="mb-2 block text-[13px] font-medium text-graphite">
          Your name
        </label>
        <input id="name" name="name" autoComplete="name" required className={inputCls} />
        {state?.fieldErrors?.name?.[0] ? (
          <p className="mt-1.5 text-xs text-risk">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="email" className="mb-2 block text-[13px] font-medium text-graphite">
          Work email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputCls} />
        {state?.fieldErrors?.email?.[0] ? (
          <p className="mt-1.5 text-xs text-risk">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="company" className="mb-2 block text-[13px] font-medium text-graphite">
          Company
        </label>
        <input id="company" name="company" autoComplete="organization" required className={inputCls} />
        {state?.fieldErrors?.company?.[0] ? (
          <p className="mt-1.5 text-xs text-risk">{state.fieldErrors.company[0]}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-[13px] font-medium text-graphite">
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
        <p id="password-hint" className="mt-1.5 text-xs text-mute">
          At least 10 characters with letters and numbers.
        </p>
        {state?.fieldErrors?.password?.[0] ? (
          <p className="mt-1.5 text-xs text-risk">{state.fieldErrors.password[0]}</p>
        ) : null}
      </div>

      {state?.error ? (
        <p className="border border-risk/30 bg-risk/5 px-4 py-3 text-sm text-risk" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center bg-ink text-[13px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
