"use client";

import { useRef, useEffect, useState } from "react";

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
