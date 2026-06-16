// Usage:
// <CountdownTimer endDate={tier.sale_end_at} onExpire={() => refetchTier()} />

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { BRAND } from "@/lib/colors";

function formatRemaining(totalSeconds: number): string {
  const totalHours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  if (totalHours >= 24) {
    const days = Math.floor(totalHours / 24);
    const hh = String(totalHours % 24).padStart(2, "0");
    return `${days}d ${hh}:${mm}:${ss}`;
  }

  return `${String(totalHours).padStart(2, "0")}:${mm}:${ss}`;
}

type Props = {
  endDate: string | Date;
  onExpire?: () => void;
};

export function CountdownTimer({ endDate, onExpire }: Props) {
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
      className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.35)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
      }}
    >
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 flex-shrink-0" style={{ color: BRAND.copper }} />
        <span className="text-white/70">
          Closes in{" "}
          <span className="font-bold text-white">{formatRemaining(remaining)}</span>
        </span>
      </div>
      <span className="font-bold text-white text-xs">Don&apos;t miss out</span>
    </div>
  );
}
