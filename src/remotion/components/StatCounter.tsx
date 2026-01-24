import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  startFrame: number;
  duration?: number;
  x?: number;
  y?: number;
}

export const StatCounter: React.FC<StatCounterProps> = ({
  value,
  suffix = "",
  prefix = "",
  label,
  startFrame,
  duration = 90,
  x = 960,
  y = 540,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + 45],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const exitProgress = interpolate(
    frame,
    [startFrame + duration - 20, startFrame + duration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const springProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const countProgress = interpolate(
    frame,
    [startFrame + 10, startFrame + 50],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const displayValue = Math.round(value * countProgress);
  const opacity = progress * (1 - exitProgress);
  const scale = 0.8 + springProgress * 0.2;
  const translateY = (1 - springProgress) * 40;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
        opacity,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 140,
          fontWeight: 200,
          fontFamily: "'SF Pro Display', system-ui, sans-serif",
          letterSpacing: "-0.03em",
          background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
        }}
      >
        {prefix}{displayValue}{suffix}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 400,
          color: "rgba(255,255,255,0.7)",
          marginTop: 16,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
};
