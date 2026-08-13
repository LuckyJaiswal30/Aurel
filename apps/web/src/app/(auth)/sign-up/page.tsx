import type { Metadata } from "next";
import Link from "next/link";
import { AuthPanel } from "@/features/auth/components/AuthPanel";
import { SignUpForm } from "@/features/auth/components/SignUpForm";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <AuthPanel
      title="Study from your own notes"
      lead="A tutor that answers from what you upload and shows you the page."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-ink underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthPanel>
  );
}
