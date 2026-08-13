import type { Metadata } from "next";
import Link from "next/link";
import { AuthPanel } from "@/features/auth/components/AuthPanel";

export const metadata: Metadata = { title: "Check your email" };

export default function CheckEmailPage() {
  return (
    <AuthPanel title="Check your email">
      <p className="text-lg text-text">
        We sent you a link to confirm your address. Open it on this device to
        finish creating your account.
      </p>
      <Link
        href="/sign-in"
        className="mt-4 inline-block font-medium text-ink underline-offset-4 hover:underline"
      >
        Back to sign in
      </Link>
    </AuthPanel>
  );
}
