"use client";

import { useEffect } from "react";
import { initWebVitals } from "@/lib/vitals";

export function WebVitalsReporter() {
  useEffect(() => {
    initWebVitals();
  }, []);

  return null;
}
