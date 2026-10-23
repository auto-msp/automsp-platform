"use client";

import { useActionState } from "react";
import { signIn, type AuthFormState } from "@/server/auth/actions";
import { Notice } from "@/components/ui/notice";

const inputCls =
  "field w-full";

export function SignInForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signIn, null);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="field-label">
          Work email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputCls} />
      </div>
      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputCls}
        />
      </div>

      {state?.error ? (
        <Notice tone="risk" alert>
          {state.error}
        </Notice>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full justify-center"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
