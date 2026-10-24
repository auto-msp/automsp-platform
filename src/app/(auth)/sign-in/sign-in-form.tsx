"use client";

import { useActionState } from "react";
import { signIn, type AuthFormState } from "@/server/auth/actions";

const inputCls =
  "field";

export function SignInForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signIn, null);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="label block">
          Work email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputCls} />
      </div>
      <div>
        <label htmlFor="password" className="label block">
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
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
