"use client";

import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
  showGrid?: boolean;
  showOrbs?: boolean;
  variant?: "default" | "subtle" | "vibrant";
}

export function AnimatedBackground({
  children,
  className,
  showGrid = true,
  showOrbs = true,
  variant = "default",
}: AnimatedBackgroundProps) {
  const orbColors = {
    default: {
      orb1: "from-blue-500/20 to-blue-600/10",
      orb2: "from-violet-500/15 to-purple-600/5",
      orb3: "from-cyan-500/10 to-teal-500/5",
    },
    subtle: {
      orb1: "from-blue-500/10 to-blue-600/5",
      orb2: "from-violet-500/8 to-purple-600/3",
      orb3: "from-cyan-500/5 to-teal-500/3",
    },
    vibrant: {
      orb1: "from-blue-500/30 to-blue-600/15",
      orb2: "from-violet-500/25 to-purple-600/10",
      orb3: "from-cyan-500/20 to-teal-500/10",
    },
  };

  const colors = orbColors[variant];

  return (
    <div className={cn("relative min-h-screen overflow-hidden", className)}>
      {/* Dot grid pattern */}
      {showGrid && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(148, 163, 184, 0.4) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      )}

      {/* Animated gradient orbs */}
      {showOrbs && (
        <>
          {/* Top-left orb */}
          <div
            className={cn(
              "pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[100px]",
              "animate-float-slow bg-gradient-to-br",
              colors.orb1
            )}
          />

          {/* Top-right orb */}
          <div
            className={cn(
              "pointer-events-none absolute -top-20 -right-40 h-[400px] w-[400px] rounded-full blur-[120px]",
              "animate-float-medium bg-gradient-to-bl",
              colors.orb2
            )}
          />

          {/* Bottom-center orb */}
          <div
            className={cn(
              "pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full blur-[150px]",
              "animate-float-fast bg-gradient-to-t",
              colors.orb3
            )}
          />
        </>
      )}

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// Simpler version for use inside cards
export function GlowEffect({
  className,
  color = "blue",
}: {
  className?: string;
  color?: "blue" | "purple" | "emerald" | "amber";
}) {
  const colors = {
    blue: "from-blue-500/20 via-blue-400/10 to-transparent",
    purple: "from-purple-500/20 via-purple-400/10 to-transparent",
    emerald: "from-emerald-500/20 via-emerald-400/10 to-transparent",
    amber: "from-amber-500/20 via-amber-400/10 to-transparent",
  };

  return (
    <div
      className={cn(
        "pointer-events-none absolute -inset-px rounded-[inherit] bg-gradient-to-b opacity-0 transition-opacity duration-500 group-hover:opacity-100",
        colors[color],
        className
      )}
    />
  );
}
