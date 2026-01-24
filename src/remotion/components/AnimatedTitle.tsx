import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface AnimatedTitleProps {
  text: string;
  appearFrame: number;
  disappearFrame: number;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
  text,
  appearFrame,
  disappearFrame,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Fade in
  const fadeIn = interpolate(
    frame,
    [appearFrame, appearFrame + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Scale animation
  const scale = interpolate(
    frame,
    [appearFrame, appearFrame + 45],
    [0.8, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Blur reveal
  const blur = interpolate(
    frame,
    [appearFrame, appearFrame + 40],
    [20, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Fade out
  const fadeOut = interpolate(
    frame,
    [disappearFrame, durationInFrames - 10],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = fadeIn * fadeOut;

  // Animated gradient position for text
  const gradientOffset = interpolate(
    frame,
    [appearFrame, appearFrame + 180],
    [0, 100],
    { extrapolateRight: "extend" }
  );

  // Subtle float animation
  const floatY = Math.sin((frame - appearFrame) * 0.03) * 5;

  // Halo pulse
  const haloPulse = 1 + Math.sin((frame - appearFrame) * 0.08) * 0.3;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) translateY(${floatY}px) scale(${scale})`,
        opacity,
        filter: `blur(${blur}px)`,
        pointerEvents: "none",
      }}
    >
      {/* Halo glow behind text */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 400 * haloPulse,
          height: 200 * haloPulse,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)`,
          filter: `blur(${40 * haloPulse}px)`,
        }}
      />

      {/* Main text with animated gradient */}
      <h1
        style={{
          position: "relative",
          fontSize: 120,
          fontWeight: 200,
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: "-0.02em",
          margin: 0,
          padding: "0 40px",
          background: `linear-gradient(
            90deg,
            #ffffff ${gradientOffset}%,
            #60a5fa ${gradientOffset + 30}%,
            #a855f7 ${gradientOffset + 60}%,
            #ffffff ${gradientOffset + 100}%
          )`,
          backgroundSize: "200% 100%",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 80px rgba(139, 92, 246, 0.5)",
        }}
      >
        {text}
      </h1>

      {/* Subtle underline glow */}
      <div
        style={{
          position: "absolute",
          bottom: -20,
          left: "50%",
          transform: "translateX(-50%)",
          width: 300,
          height: 2,
          background: `linear-gradient(90deg, transparent, rgba(139, 92, 246, ${0.5 * haloPulse}), transparent)`,
          filter: "blur(2px)",
        }}
      />
    </div>
  );
};
