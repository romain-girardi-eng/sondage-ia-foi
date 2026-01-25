"use client";

import { useRef, useEffect, useCallback } from "react";

const STORAGE_KEY = "survey-progress";
const SESSION_KEY = "survey-session";
const ANONYMOUS_KEY = "survey-anonymous-id";
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const DEBOUNCE_DELAY = 1000; // 1 second debounce for localStorage writes

interface SavedProgress {
  answers: Record<string, string | number | string[]>;
  currentIndex: number;
  timestamp: number;
  sessionId: string;
}

// Get or create session ID
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

// Get anonymous ID for GDPR
function getAnonymousId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(ANONYMOUS_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANONYMOUS_KEY, id);
  }
  return id;
}

// Load saved progress
function loadSavedProgress(): SavedProgress | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    const progress: SavedProgress = JSON.parse(saved);
    // Only return if progress is less than 24 hours old
    const hoursSinceLastSave = (Date.now() - progress.timestamp) / (1000 * 60 * 60);
    if (hoursSinceLastSave < 24 && Object.keys(progress.answers).length > 0) {
      return progress;
    }
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export interface UseSurveyPersistenceProps {
  answers: Record<string, string | number | string[]>;
  currentIndex: number;
  isActive: boolean; // Whether we're in the questions step
}

export interface UseSurveyPersistenceReturn {
  sessionId: string;
  anonymousId: string;
  savedProgress: SavedProgress | null;
  isSaving: boolean;
  clearProgress: () => void;
}

/**
 * Hook to handle survey persistence with debounced localStorage writes
 * Uses refs to avoid unnecessary re-renders
 */
export function useSurveyPersistence({
  answers,
  currentIndex,
  isActive,
}: UseSurveyPersistenceProps): UseSurveyPersistenceReturn {
  // Refs to avoid re-renders - these are used internally only
  const sessionIdRef = useRef<string>("");
  const anonymousIdRef = useRef<string>("");
  const savedProgressRef = useRef<SavedProgress | null>(null);
  const isSavingRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize IDs and load saved progress on mount
  useEffect(() => {
    sessionIdRef.current = getSessionId();
    anonymousIdRef.current = getAnonymousId();
    savedProgressRef.current = loadSavedProgress();
  }, []);

  // Debounced save function - doesn't trigger re-renders
  const saveProgressDebounced = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (Object.keys(answers).length === 0) return;

      isSavingRef.current = true;
      const progress: SavedProgress = {
        answers,
        currentIndex,
        timestamp: Date.now(),
        sessionId: sessionIdRef.current,
      };

      // Use requestIdleCallback for non-blocking write if available
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(() => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
          isSavingRef.current = false;
        });
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        isSavingRef.current = false;
      }
    }, DEBOUNCE_DELAY);
  }, [answers, currentIndex]);

  // Save on changes (debounced)
  useEffect(() => {
    if (!isActive || Object.keys(answers).length === 0) return;
    saveProgressDebounced();
  }, [answers, currentIndex, isActive, saveProgressDebounced]);

  // Periodic auto-save
  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        const progress: SavedProgress = {
          answers,
          currentIndex,
          timestamp: Date.now(),
          sessionId: sessionIdRef.current,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      }
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [answers, currentIndex, isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const clearProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    savedProgressRef.current = null;
  }, []);

  // Return stable accessor functions instead of ref values during render
  // These are memoized since refs don't change identity
  return {
    get sessionId() { return sessionIdRef.current; },
    get anonymousId() { return anonymousIdRef.current; },
    get savedProgress() { return savedProgressRef.current; },
    get isSaving() { return isSavingRef.current; },
    clearProgress,
  };
}

export type { SavedProgress };
