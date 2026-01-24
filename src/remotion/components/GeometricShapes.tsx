import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface GeometricShapesProps {
  variant?: "circles" | "lines" | "grid" | "dots";
}

export const GeometricShapes: React.FC<GeometricShapesProps> = ({ variant = "circles" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 30, durationInFrames - 30, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  if (variant === "circles") {
    return (
      <div style={{ position: "absolute", inset: 0, opacity: globalOpacity * 0.6 }}>
        {/* Large rotating circle */}
        <svg
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) rotate(${frame * 0.3}deg)`,
            width: 800,
            height: 800,
          }}
        >
          <circle
            cx="400"
            cy="400"
            r="350"
            fill="none"
            stroke="url(#circleGradient)"
            strokeWidth="1"
            strokeDasharray="20 10"
            opacity={0.4}
          />
          <circle
            cx="400"
            cy="400"
            r="280"
            fill="none"
            stroke="url(#circleGradient)"
            strokeWidth="0.5"
            opacity={0.3}
          />
          <defs>
            <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Orbiting dots */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (frame * 0.5 + i * 60) * (Math.PI / 180);
          const radius = 320 + i * 20;
          const x = 960 + Math.cos(angle) * radius;
          const y = 540 + Math.sin(angle) * radius * 0.6;
          const size = 4 + i * 2;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: size,
                height: size,
                borderRadius: "50%",
                background: i % 2 === 0 ? "#6366f1" : "#a855f7",
                boxShadow: `0 0 ${size * 4}px ${i % 2 === 0 ? "#6366f1" : "#a855f7"}`,
                transform: "translate(-50%, -50%)",
              }}
            />
          );
        })}
      </div>
    );
  }

  if (variant === "lines") {
    return (
      <div style={{ position: "absolute", inset: 0, opacity: globalOpacity * 0.4 }}>
        {/* Horizontal accent lines */}
        {[0, 1, 2].map((i) => {
          const lineProgress = interpolate(
            frame,
            [20 + i * 15, 50 + i * 15],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const yPos = 400 + i * 140;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "10%",
                top: yPos,
                width: `${lineProgress * 30}%`,
                height: 1,
                background: `linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.6), transparent)`,
                transform: `translateX(${i % 2 === 0 ? 0 : 60}%)`,
              }}
            />
          );
        })}

        {/* Vertical accent lines */}
        {[0, 1].map((i) => {
          const lineProgress = interpolate(
            frame,
            [30 + i * 20, 70 + i * 20],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          return (
            <div
              key={`v${i}`}
              style={{
                position: "absolute",
                left: i === 0 ? "15%" : "85%",
                top: "20%",
                width: 1,
                height: `${lineProgress * 60}%`,
                background: `linear-gradient(180deg, transparent, rgba(168, 85, 247, 0.4), transparent)`,
              }}
            />
          );
        })}
      </div>
    );
  }

  if (variant === "dots") {
    const dots = [];
    for (let i = 0; i < 50; i++) {
      const seed = i * 9876;
      const x = ((seed * 1234) % 1920);
      const y = ((seed * 5678) % 1080);
      const delay = (i % 20) * 3;
      const size = 2 + (i % 3);

      const dotOpacity = interpolate(
        frame,
        [delay, delay + 30],
        [0, 0.6],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

      const pulse = 1 + Math.sin(frame * 0.05 + i) * 0.3;

      dots.push(
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: size * pulse,
            height: size * pulse,
            borderRadius: "50%",
            background: i % 3 === 0 ? "#6366f1" : i % 3 === 1 ? "#a855f7" : "#06b6d4",
            opacity: dotOpacity * globalOpacity,
            boxShadow: `0 0 ${size * 3}px currentColor`,
          }}
        />
      );
    }
    return <div style={{ position: "absolute", inset: 0 }}>{dots}</div>;
  }

  return null;
};
