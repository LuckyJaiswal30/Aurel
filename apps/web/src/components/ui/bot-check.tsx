"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useEffect, useRef } from "react";

type BotCheckProps = {
  resetSignal: unknown;
};

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function BotCheck({ resetSignal }: BotCheckProps) {
  const widgetRef = useRef<TurnstileInstance | null>(null);

  useEffect(() => {
    widgetRef.current?.reset();
  }, [resetSignal]);

  return (
    <Turnstile
      ref={widgetRef}
      siteKey={siteKey}
      options={{ theme: "auto", size: "flexible", language: "auto" }}
      className="min-h-[65px] w-full"
    />
  );
}
