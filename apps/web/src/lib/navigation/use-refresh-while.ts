"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const refreshMilliseconds = 4000;
let activeCount = 0;
let timer: ReturnType<typeof setInterval> | null = null;

export function useRefreshWhile(isActive: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!isActive) return;
    activeCount += 1;
    timer ??= setInterval(() => router.refresh(), refreshMilliseconds);
    return () => {
      activeCount -= 1;
      if (activeCount === 0 && timer) {
        clearInterval(timer);
        timer = null;
      }
    };
  }, [isActive, router]);
}
