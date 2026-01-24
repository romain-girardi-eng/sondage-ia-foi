import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions

    // Session Replay (optional)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Environment
    environment: process.env.NODE_ENV,

    // Filter out known non-critical errors
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      "canvas.contentDocument",
      "atomicFindClose",
      // Network errors
      "Network request failed",
      "Failed to fetch",
      "Load failed",
      // User-cancelled requests
      "AbortError",
      // Chrome specific
      "ResizeObserver loop",
    ],

    beforeSend(event) {
      // Don't send errors in development
      if (process.env.NODE_ENV === "development") {
        console.log("Sentry event (dev):", event);
        return null;
      }
      return event;
    },
  });
}
