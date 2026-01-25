import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useMemo } from "react";

interface ParticleProps {
  id: number;
  initialX: number;
  initialY: number;
  size: number;
  color: string;
  delay: number;
  convergenceFrame: number;
  disperseFrame: number;
  centerX?: number;
  centerY?: number;
}

export const Particle: React.FC<ParticleProps> = ({
  id,
  initialX,
  initialY,
  size,
  color,
  delay,
  convergenceFrame,
  disperseFrame,
  centerX = 960,
  centerY = 540,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Brownian motion parameters - unique per particle
  const brownianParams = useMemo(() => ({
    freqX1: 0.02 + (id % 10) * 0.003,
    freqX2: 0.035 + (id % 7) * 0.004,
    freqY1: 0.025 + (id % 8) * 0.003,
    freqY2: 0.04 + (id % 6) * 0.004,
    ampX: 15 + (id % 5) * 3,
    ampY: 12 + (id % 4) * 3,
    phaseX: (id * 0.7) % (Math.PI * 2),
    phaseY: (id * 1.1) % (Math.PI * 2),
  }), [id]);

  // Brownian-like movement
  const brownianX =
    Math.sin(frame * brownianParams.freqX1 + brownianParams.phaseX) * brownianParams.ampX +
    Math.sin(frame * brownianParams.freqX2 + brownianParams.phaseX * 2) * (brownianParams.ampX * 0.5);

  const brownianY =
    Math.cos(frame * brownianParams.freqY1 + brownianParams.phaseY) * brownianParams.ampY +
    Math.cos(frame * brownianParams.freqY2 + brownianParams.phaseY * 2) * (brownianParams.ampY * 0.5);

  // Fade in with delay
  const fadeInOpacity = interpolate(
    frame,
    [delay, delay + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Convergence towards center (frames 60-150)
  const convergenceProgress = interpolate(
    frame,
    [convergenceFrame, convergenceFrame + 90],
    [0, 0.7],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Dispersion back to original position (frames 240-290)
  const disperseProgress = interpolate(
    frame,
    [disperseFrame, disperseFrame + 50],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Calculate target position during convergence
  // Use deterministic values based on particle id instead of Math.random
  const targetOffset = useMemo(() => ({
    x: ((id * 17) % 200) - 100,
    y: ((id * 23) % 150) - 75,
  }), [id]);
  const targetX = centerX + targetOffset.x;
  const targetY = centerY + targetOffset.y;

  // Interpolate position
  const baseX = interpolate(
    convergenceProgress,
    [0, 0.7],
    [initialX, targetX],
    { extrapolateRight: "clamp" }
  );

  const baseY = interpolate(
    convergenceProgress,
    [0, 0.7],
    [initialY, targetY],
    { extrapolateRight: "clamp" }
  );

  // Apply dispersion (return towards initial position)
  const x = interpolate(
    disperseProgress,
    [0, 1],
    [baseX + brownianX, initialX + brownianX],
    { extrapolateRight: "clamp" }
  );

  const y = interpolate(
    disperseProgress,
    [0, 1],
    [baseY + brownianY, initialY + brownianY],
    { extrapolateRight: "clamp" }
  );

  // Fade out at the end for seamless loop
  const fadeOutOpacity = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = fadeInOpacity * fadeOutOpacity;

  // Pulse effect
  const pulseScale = 1 + Math.sin(frame * 0.08 + id * 0.5) * 0.15;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size * pulseScale,
        height: size * pulseScale,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: `blur(${size * 0.3}px)`,
        opacity: opacity * 0.8,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    />
  );
};
