"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import type { Answers } from "@/data";
import { calculateProfileSpectrum, type ProfileSpectrum } from "./scoring";

/**
 * Hook to track if it's the first render (for animations)
 * Returns false on first render, true after mount
 * Use with motion: initial={hasAnimated ? false : initialValue}
 */
export function useHasAnimated() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      // Small delay to let initial animation complete
      const timer = setTimeout(() => setHasAnimated(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return hasAnimated;
}

/**
 * Memoized profile spectrum calculation
 * Prevents expensive re-calculations on every render
 */
export function useMemoizedProfileSpectrum(answers: Answers): ProfileSpectrum {
  return useMemo(() => calculateProfileSpectrum(answers), [answers]);
}
