"use client";

import { useEffect, useRef } from "react";

export function useStickToBottom<Element extends HTMLElement>(
  dependency: string,
) {
  const ref = useRef<Element>(null);
  useEffect(() => {
    const element = ref.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [dependency]);
  return ref;
}
