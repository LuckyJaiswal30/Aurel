"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CopyButtonProps = {
  text: string;
  label: string;
  className: string;
};

export function CopyButton({ text, label, className }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch {
      setIsCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copyText}
      aria-label={isCopied ? "Copied" : label}
      title={isCopied ? "Copied" : "Copy"}
      className={className}
    >
      {isCopied ? (
        <Check aria-hidden="true" className="size-4" />
      ) : (
        <Copy aria-hidden="true" className="size-4" />
      )}
    </button>
  );
}
