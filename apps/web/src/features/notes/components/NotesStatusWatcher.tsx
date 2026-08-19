"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type NotesStatusWatcherProps = {
  isWatching: boolean;
};

export function NotesStatusWatcher({ isWatching }: NotesStatusWatcherProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isWatching) return;
    const timer = window.setInterval(() => router.refresh(), 3000);
    return () => window.clearInterval(timer);
  }, [isWatching, router]);

  return null;
}
