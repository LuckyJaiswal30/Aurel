"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { AurelMark } from "@/components/ui/aurel-mark";

type HomeGreetingProps = {
  displayName: string;
};

const greetingSchema = z.object({ text: z.string().min(1).max(200) });

let sharedRequest: Promise<string> | null = null;

function fetchGreetingOnce() {
  sharedRequest ??= fetchGreeting().finally(() => {
    sharedRequest = null;
  });
  return sharedRequest;
}

async function fetchGreeting() {
  const now = new Date();
  const response = await fetch("/api/greeting", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hour: now.getHours(), weekday: now.getDay() }),
  });
  return greetingSchema.parse(await response.json()).text;
}

export function HomeGreeting({ displayName }: HomeGreetingProps) {
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    let isShowing = true;
    fetchGreetingOnce()
      .catch(() => `What are we studying today, ${displayName}?`)
      .then((text) => {
        if (isShowing) setGreeting(text);
      });
    return () => {
      isShowing = false;
    };
  }, [displayName]);

  return (
    <h1
      data-fades-on-ask
      className="flex min-h-[2lh] items-center justify-center gap-3 text-center font-serif text-2xl text-balance text-text md:min-h-[1lh] md:text-3xl"
    >
      <AurelMark className="size-8 shrink-0" isThinking={greeting === null} />
      {greeting ? (
        <span key={greeting} className="animate-rise-in">
          {greeting}
        </span>
      ) : (
        <span className="sr-only">Loading your greeting</span>
      )}
    </h1>
  );
}
