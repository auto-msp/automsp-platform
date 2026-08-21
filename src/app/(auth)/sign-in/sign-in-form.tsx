"use client";

import { useActionState } from "react";
import { signIn, type AuthFormState } from "@/server/auth/actions";

const inputCls =
  "w-full border border-fog bg-surface px-4 py-3 text-sm text-ink placeholder:text-mute transition-colors focus:border-ink focus:outline-none";

export function SignInForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signIn, null);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="mb-2 block text-[13px] font-medium text-graphite">
          Work email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputCls} />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-[13px] font-medium text-graphite">
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
        <p className="border border-risk/30 bg-risk/5 px-4 py-3 text-sm text-risk" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center bg-ink text-[13px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
