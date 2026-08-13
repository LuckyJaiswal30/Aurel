"use client";

import { useActionState } from "react";
import { BotCheck } from "@/components/ui/bot-check";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { TextField } from "@/components/ui/text-field";
import { idleFormState } from "@/lib/forms/form-state";
import { signUp } from "../auth-actions";

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUp, idleFormState);
  const consentError = state.fieldErrors?.consent?.[0];

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <TextField
        label="Your name"
        name="displayName"
        autoComplete="given-name"
        maxLength={80}
        defaultValue={state.values?.displayName}
        required
        error={state.fieldErrors?.displayName?.[0]}
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        maxLength={254}
        defaultValue={state.values?.email}
        required
        error={state.fieldErrors?.email?.[0]}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        maxLength={128}
        hint="At least 10 characters, with letters and numbers."
        required
        error={state.fieldErrors?.password?.[0]}
      />
      <div>
        <label className="flex items-start gap-3 text-sm text-text">
          <input
            name="consent"
            type="checkbox"
            required
            defaultChecked={state.values?.consent === "on"}
            aria-invalid={consentError ? true : undefined}
            className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
          />
          <span>
            Aurel may store my notes and chats to tutor me. I can see and delete
            them at any time.
          </span>
        </label>
        {consentError ? (
          <p className="mt-1 pl-7 text-sm text-danger">{consentError}</p>
        ) : null}
      </div>
      <p className="text-xs text-muted">
        Upload study material only. ID cards, bank papers and other personal
        documents are refused.
      </p>
      <BotCheck resetSignal={state} />
      <FormMessage message={state.fieldErrors ? undefined : state.message} />
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
