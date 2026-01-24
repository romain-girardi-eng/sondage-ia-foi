import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Performance Monitoring
    tracesSampleRate: 0.1,

    // Environment
    environment: process.env.NODE_ENV,

    beforeSend(event) {
      // Don't send errors in development
      if (process.env.NODE_ENV === "development") {
        console.log("Sentry server event (dev):", event);
        return null;
      }
      return event;
    },
  });
}
