import { useEffect, useRef } from "react";

const STORAGE_KEY = "admin_last_activity";
const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const CHECK_INTERVAL_MS = 60 * 1000; // 60 seconds
const THROTTLE_MS = 5 * 1000; // 5 seconds

export function useSessionTimeout(logout: () => void, active: boolean): void {
  const lastThrottle = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    // Check on mount — if last activity is older than 30 min, logout immediately
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const lastActivity = Number.parseInt(stored, 10);
      if (Date.now() - lastActivity > TIMEOUT_MS) {
        localStorage.removeItem(STORAGE_KEY);
        logout();
        return;
      }
    }

    // Record initial activity
    localStorage.setItem(STORAGE_KEY, String(Date.now()));

    // Throttled activity handler
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastThrottle.current >= THROTTLE_MS) {
        lastThrottle.current = now;
        localStorage.setItem(STORAGE_KEY, String(now));
      }
    };

    const events: string[] = ["mousemove", "click", "keypress", "scroll"];
    for (const e of events)
      window.addEventListener(e, handleActivity, { passive: true });

    // Periodic check
    const interval = setInterval(() => {
      const val = localStorage.getItem(STORAGE_KEY);
      if (!val || Date.now() - Number.parseInt(val, 10) > TIMEOUT_MS) {
        localStorage.removeItem(STORAGE_KEY);
        logout();
      }
    }, CHECK_INTERVAL_MS);

    // Clear session on page close / reload
    const handleUnload = () => {
      localStorage.removeItem(STORAGE_KEY);
      logout();
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      for (const e of events) window.removeEventListener(e, handleActivity);
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [active, logout]);
}
