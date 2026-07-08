"use client";

import { useState, useEffect, useRef } from "react";
import FingerprintJS, { Agent } from "@fingerprintjs/fingerprintjs";

const FINGERPRINT_STORAGE_KEY = "survey-fingerprint";

// Only the visitorId and its confidence score are needed downstream (duplicate
// detection). The raw FingerprintJS `components` payload is never cached to
// minimize what's persisted client-side (GDPR data minimization).
interface CachedFingerprint {
  visitorId: string;
  confidence: number;
}

interface UseFingerprintOptions {
  // Fingerprinting probes the device and must only run after the user has
  // given consent (CNIL/ePrivacy). The hook is always called (rules of
  // hooks) but stays inert until the caller flips this to true.
  enabled: boolean;
}

interface UseFingerprintReturn {
  fingerprint: string | null;
  isLoading: boolean;
  error: string | null;
  confidence: number;
}

/**
 * Hook to generate and cache a browser fingerprint, gated on consent.
 * Uses FingerprintJS open source library.
 */
export function useFingerprint({ enabled }: UseFingerprintOptions): UseFingerprintReturn {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const agentRef = useRef<Agent | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    // Prevent double initialization in strict mode
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function initFingerprint() {
      setIsLoading(true);
      try {
        // Check for cached fingerprint first
        const cached = localStorage.getItem(FINGERPRINT_STORAGE_KEY);
        if (cached) {
          try {
            const parsed: CachedFingerprint = JSON.parse(cached);
            if (parsed.visitorId) {
              setFingerprint(parsed.visitorId);
              setConfidence(parsed.confidence || 0.5);
              setIsLoading(false);
              return;
            }
          } catch {
            // Invalid cache, regenerate
            localStorage.removeItem(FINGERPRINT_STORAGE_KEY);
          }
        }

        // Initialize FingerprintJS agent
        const agent = await FingerprintJS.load();
        agentRef.current = agent;

        // Get the visitor identifier
        const result = await agent.get();

        const cacheData: CachedFingerprint = {
          visitorId: result.visitorId,
          confidence: result.confidence.score,
        };

        // Cache only the visitorId + confidence (never the raw components)
        localStorage.setItem(FINGERPRINT_STORAGE_KEY, JSON.stringify(cacheData));

        setFingerprint(result.visitorId);
        setConfidence(result.confidence.score);
        setIsLoading(false);
      } catch (err) {
        console.error("Fingerprint generation failed:", err);
        setError("Failed to generate browser fingerprint");
        setIsLoading(false);

        // Fallback: generate a random ID if fingerprinting fails
        const fallbackId = `fallback-${crypto.randomUUID()}`;
        setFingerprint(fallbackId);
        setConfidence(0);
      }
    }

    initFingerprint();
  }, [enabled]);

  return {
    fingerprint,
    isLoading,
    error,
    confidence,
  };
}

/**
 * Get fingerprint synchronously from cache (for form submission)
 * Returns null if not cached
 */
export function getCachedFingerprint(): string | null {
  if (typeof window === "undefined") return null;

  const cached = localStorage.getItem(FINGERPRINT_STORAGE_KEY);
  if (!cached) return null;

  try {
    const parsed: CachedFingerprint = JSON.parse(cached);
    return parsed.visitorId || null;
  } catch {
    return null;
  }
}
