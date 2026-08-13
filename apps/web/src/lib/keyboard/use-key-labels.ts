"use client";

import { useSyncExternalStore } from "react";
import { isApplePlatform, modifierKey } from "./shortcuts";

function subscribe() {
  return () => {};
}

function readIsApple() {
  return isApplePlatform(navigator.userAgent);
}

export function useKeyLabels(keys: string[]) {
  const isApple = useSyncExternalStore(subscribe, readIsApple, () => false);
  return keys.map((key) =>
    key === modifierKey ? (isApple ? "⌘" : "Ctrl") : key,
  );
}
