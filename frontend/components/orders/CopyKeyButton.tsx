"use client";

import { useState } from "react";

export function CopyKeyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-highest p-4">
      <code className="flex-1 font-mono text-lg font-bold tracking-widest text-on-surface break-all">
        {value}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
