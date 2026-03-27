"use client";

import { useState, useEffect } from "react";

export function CountdownTimer({
  targetDate,
}: {
  targetDate: Date;
}) {
  const [timeLeft, setTimeLeft] = useState(() => ({ hours: 0, minutes: 0, seconds: 0 }));

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(targetDate));
    const timeout = setTimeout(tick, 0);
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
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
