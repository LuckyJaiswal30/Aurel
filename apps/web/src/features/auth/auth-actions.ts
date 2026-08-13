"use server";

import { redirect } from "next/navigation";
import {
  readFormText,
  readFormValues,
  toFieldErrorState,
  type FormState,
} from "@/lib/forms/form-state";
import { publicEnv } from "@/lib/public-env";
import { createServerSupabase } from "@/lib/supabase/server-client";
import { signInSchema, signUpSchema } from "./auth-schemas";

const botCheckFailedMessage =
  "We couldn't confirm you're a person. Wait for the check below to finish, then try again.";

function readBotCheckToken(formData: FormData) {
  const token = readFormText(formData, "cf-turnstile-response");
  return token && token.length <= 2048 ? token : null;
}

function isBotCheckFailure(error: { code?: string }) {
  return error.code === "captcha_failed";
}

const unreachableMessage =
  "We couldn't reach the sign-in service. Try again in a moment.";

function isServiceUnreachable(error: { status?: number }) {
  return (
    error.status === undefined || error.status === 0 || error.status >= 500
  );
}

export async function signIn(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signInSchema.safeParse({
    email: readFormText(formData, "email"),
    password: readFormText(formData, "password"),
  });
  const values = readFormValues(formData, ["email"]);
  if (!parsed.success) return toFieldErrorState(parsed.error, values);
  const captchaToken = readBotCheckToken(formData);
  if (!captchaToken)
    return { status: "error", message: botCheckFailedMessage, values };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    ...parsed.data,
    options: { captchaToken },
  });
  if (error) {
    if (isBotCheckFailure(error))
      return { status: "error", message: botCheckFailedMessage, values };
    if (isServiceUnreachable(error))
      return { status: "error", message: unreachableMessage, values };
    if (error.code === "email_not_confirmed") {
      return {
        status: "error",
        message: "Confirm your email first. Check your inbox for the link.",
        values,
      };
    }
    if (error.status === 429) {
      return {
        status: "error",
        message: "Too many attempts. Wait a few minutes, then try again.",
        values,
      };
    }
    return {
      status: "error",
      message: "That email and password don't match an account.",
      values,
    };
  }
  redirect("/");
}

export async function signUp(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    displayName: readFormText(formData, "displayName"),
    email: readFormText(formData, "email"),
    password: readFormText(formData, "password"),
    consent: readFormText(formData, "consent"),
  });
  const values = readFormValues(formData, ["displayName", "email", "consent"]);
  if (!parsed.success) return toFieldErrorState(parsed.error, values);
  const captchaToken = readBotCheckToken(formData);
  if (!captchaToken)
    return { status: "error", message: botCheckFailedMessage, values };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${publicEnv.siteUrl}/auth/callback`,
      data: { display_name: parsed.data.displayName },
      captchaToken,
    },
  });
  if (error) {
    if (isBotCheckFailure(error))
      return { status: "error", message: botCheckFailedMessage, values };
    if (isServiceUnreachable(error))
      return { status: "error", message: unreachableMessage, values };
    if (error.code === "weak_password") {
      return {
        status: "error",
        fieldErrors: { password: ["Choose a stronger password."] },
        values,
      };
    }
    if (error.status === 429) {
      return {
        status: "error",
        message: "Too many attempts. Wait a few minutes, then try again.",
        values,
      };
    }
    return {
      status: "error",
      message: "We couldn't create the account. Try again in a moment.",
      values,
    };
  }
  redirect(data.session ? "/" : "/check-email");
}
