"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { initialFormState, type FormAction } from "@/lib/form-state";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <div className="field-error">{errors[0]}</div>;
}

export function AuthForm({
  action,
  mode
}: {
  action: FormAction;
  mode: "sign-in" | "sign-up";
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const [timezone, setTimezone] = useState("UTC");

  useEffect(() => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (detectedTimezone) {
      setTimezone(detectedTimezone);
    }
  }, []);

  const isSignUp = mode === "sign-up";

  return (
    <form action={formAction} className="card stack">
      {state.status === "error" ? (
        <div className="form-banner error">{state.message ?? "Please fix the highlighted fields."}</div>
      ) : null}

      {isSignUp ? (
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" placeholder="Optional" type="text" />
          <FieldError errors={state.fieldErrors?.name} />
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="email">Email</label>
        <input autoComplete="email" id="email" name="email" required type="email" />
        <FieldError errors={state.fieldErrors?.email} />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          autoComplete={isSignUp ? "new-password" : "current-password"}
          id="password"
          name="password"
          required
          type="password"
        />
        <FieldError errors={state.fieldErrors?.password} />
      </div>

      {isSignUp ? (
        <>
          <div className="field">
            <label htmlFor="signupCode">Signup Code</label>
            <input
              autoComplete="off"
              id="signupCode"
              name="signupCode"
              required
              type="password"
            />
            <div className="hint">A valid signup code is required to create an account.</div>
            <FieldError errors={state.fieldErrors?.signupCode} />
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              autoComplete="new-password"
              id="confirmPassword"
              name="confirmPassword"
              required
              type="password"
            />
            <FieldError errors={state.fieldErrors?.confirmPassword} />
          </div>

          <div className="field">
            <label htmlFor="timezone">Timezone</label>
            <input id="timezone" name="timezone" onChange={(event) => setTimezone(event.target.value)} type="text" value={timezone} />
            <div className="hint">We use this for date defaults and the daily reminder time.</div>
            <FieldError errors={state.fieldErrors?.timezone} />
          </div>
        </>
      ) : null}

      <div className="button-row">
        <button className="button" disabled={pending} type="submit">
          {pending ? "Saving..." : isSignUp ? "Create Account" : "Sign In"}
        </button>
      </div>

      <div className="auth-footer">
        {isSignUp ? (
          <>
            Already have an account? <Link href="/sign-in">Sign in</Link>
          </>
        ) : (
          <>
            Need an account? <Link href="/sign-up">Create one</Link>
          </>
        )}
      </div>
    </form>
  );
}
