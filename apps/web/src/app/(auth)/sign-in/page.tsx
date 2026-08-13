import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthPanel } from "@/features/auth/components/AuthPanel";
import { ExpiredLinkNotice } from "@/features/auth/components/ExpiredLinkNotice";
import { SignInForm } from "@/features/auth/components/SignInForm";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthPanel
      title="Welcome back"
      lead="Your subjects and notes are where you left them."
      footer={
        <>
          New to Aurel?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-ink underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <Suspense>
        <ExpiredLinkNotice />
      </Suspense>
      <SignInForm />
    </AuthPanel>
  );
}
