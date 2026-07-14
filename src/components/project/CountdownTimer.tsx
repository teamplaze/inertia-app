"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock } from "lucide-react";

function formatRemaining(totalSeconds: number): string {
  const totalHours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(totalHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

type Props = {
  endDate: string | Date;
  label?: string;
  onExpire?: () => void;
};

export function CountdownTimer({ endDate, label = "Closes in", onExpire }: Props) {
  const end = useMemo(
    () => (typeof endDate === "string" ? new Date(endDate) : endDate),
    [endDate]
  );

  // null until after mount — avoids server/client Date.now() mismatch
  const [remaining, setRemaining] = useState<number | null>(null);

  // Keep onExpire in a ref so the interval never holds a stale callback
  const onExpireRef = useRef(onExpire);
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  const hasExpired = useRef(false);

  useEffect(() => {
    hasExpired.current = false;

    const initial = Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000));
    setRemaining(initial);

    if (initial === 0) {
      hasExpired.current = true;
      onExpireRef.current?.();
      return;
    }

    const id = setInterval(() => {
      const secs = Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000));
      setRemaining(secs);
      if (secs === 0 && !hasExpired.current) {
        hasExpired.current = true;
        onExpireRef.current?.();
        clearInterval(id);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [end]);

  if (remaining === null || remaining <= 0) return null;

  return (
    <div
      className={[
        "flex flex-col items-center gap-[var(--spacing-1)]",
        "md:flex-row md:items-center md:justify-between",
        "rounded-[4px] px-[var(--spacing-3)] py-[var(--spacing-2)]",
      ].join(" ")}
      style={{
        background: 'color-mix(in srgb, var(--color-project-accent, var(--color-bg-teal)) 15%, transparent)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }}
    >
      {/* Mobile: centered Row 1 / Desktop: left side — icon + label + value, no mid-phrase wrap */}
      <div className="flex items-center gap-[var(--spacing-2)] flex-nowrap">
        <Clock
          className="w-4 h-4 shrink-0"
          style={{ color: 'var(--color-project-accent, var(--color-bg-teal))' }}
        />
        <span className="font-body font-normal text-[18px] text-white whitespace-nowrap">
          {label}
        </span>
        <span className="font-body font-semibold text-[18px] text-white whitespace-nowrap">
          {formatRemaining(remaining)}
        </span>
      </div>
      {/* Mobile: centered Row 2 / Desktop: right side */}
      <span className="font-body font-semibold text-[18px] text-white whitespace-nowrap">
        Don&apos;t miss out
      </span>
    </div>
  );
}
