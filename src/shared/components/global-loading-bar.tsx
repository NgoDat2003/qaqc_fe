"use client";

import { useIsFetching } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/**
 * Slim 2px top-of-page progress bar driven by TanStack Query in-flight count.
 * Stays visible for 200ms after requests complete so the bar visually "finishes".
 *
 * Fix notes (code review 2026-05-18):
 * - animating derived from fetching directly (no setState in effect — avoids ESLint error)
 * - hideTimer hoisted to effect scope so cleanup cancels both outer + inner timers (no leak)
 */
export function GlobalLoadingBar() {
  const fetching = useIsFetching();
  const [visible, setVisible] = useState(false);

  // Derived — no extra state needed
  const animating = fetching > 0;

  useEffect(() => {
    if (fetching > 0) {
      setVisible(true);
    } else {
      // Hoist hideTimer so the effect cleanup can cancel it if fetching resumes
      let hideTimer: ReturnType<typeof setTimeout>;
      const t = setTimeout(() => {
        hideTimer = setTimeout(() => setVisible(false), 300);
      }, 200);
      return () => {
        clearTimeout(t);
        clearTimeout(hideTimer);
      };
    }
  }, [fetching]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] overflow-hidden pointer-events-none">
      <div
        className="h-full bg-primary"
        style={{
          width: animating ? "85%" : "100%",
          opacity: animating ? 1 : 0,
          transition: animating
            ? "width 0.8s cubic-bezier(0.4,0,0.2,1)"
            : "width 0.2s ease-out, opacity 0.3s ease-out",
        }}
      />
    </div>
  );
}
