"use client";

import { Player } from "@remotion/player";
import { LandingVideo } from "@/remotion/compositions/LandingVideo";
import { useEffect, useState, useSyncExternalStore } from "react";

interface LandingVideoBackgroundProps {
  className?: string;
}

// Hook to safely detect client-side rendering
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// Hook to detect reduced motion preference
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial sync with media query
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

export function LandingVideoBackground({ className = "" }: LandingVideoBackgroundProps) {
  const isClient = useIsClient();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Small delay to ensure smooth loading
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Don't render on server or if user prefers reduced motion
  if (!isClient) {
    return (
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 ${className}`}
        aria-hidden="true"
      />
    );
  }

  // Show static fallback for reduced motion
  if (prefersReducedMotion) {
    return (
      <div
        className={`absolute inset-0 -z-10 ${className}`}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[#0b1120]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-purple-900/20 blur-[80px]" />
        <div className="absolute left-[10%] top-[15%] w-[400px] h-[400px] rounded-full bg-cyan-900/10 blur-[60px]" />
        <div className="absolute right-[10%] bottom-[15%] w-[350px] h-[350px] rounded-full bg-purple-900/12 blur-[50px]" />
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden="true"
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: "opacity 0.5s ease-in-out",
      }}
    >
      <Player
        component={LandingVideo}
        durationInFrames={300}
        fps={30}
        compositionWidth={1920}
        compositionHeight={1080}
        loop
        autoPlay
        controls={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        inputProps={{}}
      />
      {/* Gradient overlays for content readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
    </div>
  );
}

export default LandingVideoBackground;
