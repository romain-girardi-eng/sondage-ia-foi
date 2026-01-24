import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from "web-vitals";

type VitalsReporter = (metric: Metric) => void;

const vitalsUrl = process.env.NEXT_PUBLIC_VITALS_URL;

/**
 * Report Web Vitals to an analytics endpoint
 */
function sendToAnalytics(metric: Metric) {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Web Vitals]", metric.name, metric.value.toFixed(2), metric.rating);
  }

  // Send to analytics endpoint if configured
  if (vitalsUrl) {
    const body = JSON.stringify({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: metric.navigationType,
      timestamp: Date.now(),
      url: window.location.href,
    });

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon(vitalsUrl, body);
    } else {
      fetch(vitalsUrl, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(console.error);
    }
  }

  // Send to Plausible if configured
  if (typeof window !== "undefined" && (window as unknown as { plausible?: (name: string, options: { props: Record<string, string | number> }) => void }).plausible) {
    (window as unknown as { plausible: (name: string, options: { props: Record<string, string | number> }) => void }).plausible("Web Vitals", {
      props: {
        metric: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
      },
    });
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals(reporter: VitalsReporter = sendToAnalytics) {
  // Cumulative Layout Shift
  onCLS(reporter);

  // First Contentful Paint
  onFCP(reporter);

  // Largest Contentful Paint
  onLCP(reporter);

  // Time to First Byte
  onTTFB(reporter);

  // Interaction to Next Paint
  onINP(reporter);
}

/**
 * Get performance grades based on thresholds
 */
export function getVitalGrade(metric: string, value: number): "good" | "needs-improvement" | "poor" {
  const thresholds: Record<string, { good: number; poor: number }> = {
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
  };

  const threshold = thresholds[metric];
  if (!threshold) return "good";

  if (value <= threshold.good) return "good";
  if (value >= threshold.poor) return "poor";
  return "needs-improvement";
}
