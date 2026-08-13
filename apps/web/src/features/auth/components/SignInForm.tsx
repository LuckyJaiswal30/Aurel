"use client";

import { useActionState } from "react";
import { BotCheck } from "@/components/ui/bot-check";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { TextField } from "@/components/ui/text-field";
import { idleFormState } from "@/lib/forms/form-state";
import { signIn } from "../auth-actions";

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(signIn, idleFormState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
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
        autoComplete="current-password"
        maxLength={128}
        required
        error={state.fieldErrors?.password?.[0]}
      />
      <BotCheck resetSignal={state} />
      <FormMessage message={state.fieldErrors ? undefined : state.message} />
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
