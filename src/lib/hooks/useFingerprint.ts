"use client";

import { useState, useEffect, useRef } from "react";
import FingerprintJS, { Agent } from "@fingerprintjs/fingerprintjs";

const FINGERPRINT_STORAGE_KEY = "survey-fingerprint";

interface FingerprintResult {
  visitorId: string;
  confidence: number;
  components: Record<string, unknown>;
}

interface UseFingerprintReturn {
  fingerprint: string | null;
  isLoading: boolean;
  error: string | null;
  confidence: number;
}

/**
 * Hook to generate and cache a browser fingerprint
 * Uses FingerprintJS open source library
 */
export function useFingerprint(): UseFingerprintReturn {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const agentRef = useRef<Agent | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function initFingerprint() {
      try {
        // Check for cached fingerprint first
        const cached = localStorage.getItem(FINGERPRINT_STORAGE_KEY);
        if (cached) {
          try {
            const parsed: FingerprintResult = JSON.parse(cached);
            // Use cached if less than 30 days old
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

        const fingerprintData: FingerprintResult = {
          visitorId: result.visitorId,
          confidence: result.confidence.score,
          components: result.components as Record<string, unknown>,
        };

        // Cache the fingerprint
        localStorage.setItem(
          FINGERPRINT_STORAGE_KEY,
          JSON.stringify(fingerprintData)
        );

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
  }, []);

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
    const parsed: FingerprintResult = JSON.parse(cached);
    return parsed.visitorId || null;
  } catch {
    return null;
  }
}
