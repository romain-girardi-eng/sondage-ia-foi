"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface GlowingEffectProps {
  spread?: number;
  glow?: boolean;
  disabled?: boolean;
  proximity?: number;
  inactiveZone?: number;
  borderWidth?: number;
  className?: string;
}

export function GlowingEffect({
  spread = 40,
  glow = true,
  disabled = false,
  proximity = 64,
  inactiveZone = 0.01,
  borderWidth = 2,
  className,
}: GlowingEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current || disabled) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if mouse is within proximity
      const isNear =
        e.clientX >= rect.left - proximity &&
        e.clientX <= rect.right + proximity &&
        e.clientY >= rect.top - proximity &&
        e.clientY <= rect.bottom + proximity;

      if (isNear) {
        setPosition({ x, y });
        setOpacity(1);
        setIsHovered(true);
      } else {
        setOpacity(0);
        setIsHovered(false);
      }
    },
    [disabled, proximity]
  );

  const handleMouseLeave = useCallback(() => {
    setOpacity(0);
    setIsHovered(false);
  }, []);

  useEffect(() => {
    if (disabled) return;

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove, disabled]);

  if (disabled) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden",
        className
      )}
    >
      {/* Gradient glow that follows cursor */}
      <div
        className="absolute transition-opacity duration-300"
        style={{
          opacity,
          left: position.x - spread,
          top: position.y - spread,
          width: spread * 2,
          height: spread * 2,
          background: `radial-gradient(circle,
            rgba(139, 92, 246, 0.4) 0%,
            rgba(59, 130, 246, 0.3) 25%,
            rgba(16, 185, 129, 0.2) 50%,
            transparent 70%
          )`,
          filter: "blur(10px)",
          transform: "translate(0, 0)",
        }}
      />

      {/* Border glow */}
      <div
        className="absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          boxShadow: `
            inset 0 0 0 ${borderWidth}px rgba(139, 92, 246, 0.3),
            0 0 20px rgba(139, 92, 246, 0.2),
            0 0 40px rgba(59, 130, 246, 0.1)
          `,
        }}
      />
    </div>
  );
}
