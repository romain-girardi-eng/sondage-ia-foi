"use client";

import { useMemo } from "react";
import type { Answers } from "@/data";
import { calculateProfileSpectrum, type ProfileSpectrum } from "../scoring";

/**
 * Memoized profile spectrum calculation
 * Prevents expensive re-calculations on every render
 */
export function useMemoizedProfileSpectrum(answers: Answers): ProfileSpectrum {
  return useMemo(() => calculateProfileSpectrum(answers), [answers]);
}
