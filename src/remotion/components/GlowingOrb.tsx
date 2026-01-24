import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface GlowingOrbProps {
  color: string;
  secondaryColor?: string;
  size: number;
  initialX: number;
  initialY: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  orbitOffset?: number;
  appearFrame: number;
  disappearFrame: number;
  centerX?: number;
  centerY?: number;
}

export const GlowingOrb: React.FC<GlowingOrbProps> = ({
  color,
  secondaryColor,
  size,
  initialX,
  initialY,
  orbitRadius = 150,
  orbitSpeed = 0.015,
  orbitOffset = 0,
  appearFrame,
  disappearFrame,
  centerX = 960,
  centerY = 540,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Fade in
  const fadeIn = interpolate(
    frame,
    [appearFrame, appearFrame + 45],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Scale up animation
  const scaleIn = interpolate(
    frame,
    [appearFrame, appearFrame + 60],
    [0.3, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Move from initial position to orbit position
  const moveToOrbit = interpolate(
    frame,
    [appearFrame, appearFrame + 90],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Calculate orbit position
  const orbitAngle = (frame - appearFrame) * orbitSpeed + orbitOffset;
  const orbitX = centerX + Math.cos(orbitAngle) * orbitRadius;
  const orbitY = centerY + Math.sin(orbitAngle) * orbitRadius * 0.6; // Elliptical orbit

  // Interpolate from initial position to orbit
  const x = interpolate(moveToOrbit, [0, 1], [initialX, orbitX]);
  const y = interpolate(moveToOrbit, [0, 1], [initialY, orbitY]);

  // Disperse back towards initial
  const disperseProgress = interpolate(
    frame,
    [disappearFrame, disappearFrame + 50],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const finalX = interpolate(disperseProgress, [0, 1], [x, initialX]);
  const finalY = interpolate(disperseProgress, [0, 1], [y, initialY]);

  // Fade out
  const fadeOut = interpolate(
    frame,
    [disappearFrame, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = fadeIn * fadeOut;
  const scale = scaleIn * (1 - disperseProgress * 0.5);

  // Pulsing glow
  const pulseIntensity = 1 + Math.sin(frame * 0.1 + orbitOffset) * 0.2;

  const gradientColor = secondaryColor || color;

  return (
    <div
      style={{
        position: "absolute",
        left: finalX,
        top: finalY,
        width: size * scale,
        height: size * scale,
        transform: "translate(-50%, -50%)",
        opacity,
        pointerEvents: "none",
      }}
    >
      {/* Outer glow */}
      <div
        style={{
          position: "absolute",
          inset: -size * 0.5,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          filter: `blur(${size * 0.4 * pulseIntensity}px)`,
        }}
      />
      {/* Inner orb */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `radial-gradient(circle at 30% 30%, ${gradientColor} 0%, ${color} 50%, ${color}80 100%)`,
          boxShadow: `
            0 0 ${30 * pulseIntensity}px ${color}80,
            0 0 ${60 * pulseIntensity}px ${color}40,
            inset 0 0 ${20}px ${gradientColor}40
          `,
        }}
      />
      {/* Highlight */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "20%",
          width: "30%",
          height: "30%",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)`,
          filter: "blur(4px)",
        }}
      />
    </div>
  );
};
