"use client";

import { useSearchParams } from "next/navigation";

export function ExpiredLinkNotice() {
  const searchParams = useSearchParams();
  if (searchParams.get("link") !== "expired") return null;
  return (
    <p
      role="status"
      className="mb-4 rounded-control bg-hover px-3 py-2 text-sm text-text"
    >
      That link has expired or was already used. Sign in, or create your account
      again.
    </p>
  );
}
