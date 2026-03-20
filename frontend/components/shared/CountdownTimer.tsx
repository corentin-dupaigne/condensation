"use client";

import { useState, useEffect } from "react";

export function CountdownTimer({
  targetDate,
}: {
  targetDate: Date;
}) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-1 font-headline tabular-nums">
      <TimeUnit value={timeLeft.hours} />
      <span className="text-on-surface-variant">:</span>
      <TimeUnit value={timeLeft.minutes} />
      <span className="text-on-surface-variant">:</span>
      <TimeUnit value={timeLeft.seconds} />
    </div>
  );
}

function TimeUnit({ value }: { value: number }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded bg-surface-container-highest text-lg font-bold text-on-surface">
      {String(value).padStart(2, "0")}
    </span>
  );
}

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
