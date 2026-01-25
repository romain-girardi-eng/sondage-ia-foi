import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

interface KineticTextProps {
  text: string;
  startFrame: number;
  duration?: number;
  fontSize?: number;
  y?: number;
  gradient?: string;
  color?: string;
  weight?: number;
  letterSpacing?: number;
  style?: "words" | "chars" | "lines" | "glitch" | "wave";
  stagger?: number;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  startFrame,
  duration = 90,
  fontSize = 72,
  y = 540,
  gradient,
  color = "white",
  weight = 400,
  letterSpacing = -0.02,
  style = "chars",
  stagger = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elements = style === "words" ? text.split(" ") : style === "lines" ? [text] : text.split("");

  // Global fade out
  const fadeOut = interpolate(
    frame,
    [startFrame + duration - 25, startFrame + duration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: y,
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: style === "words" ? 20 : 0,
        opacity: fadeOut,
        fontSize,
        fontWeight: weight,
        fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif",
        letterSpacing: `${letterSpacing}em`,
      }}
    >
      {elements.map((char, i) => {
        const charStart = startFrame + i * stagger;

        const springValue = spring({
          frame: frame - charStart,
          fps,
          config: { damping: 15, stiffness: 120, mass: 0.5 },
        });

        const progress = interpolate(
          frame,
          [charStart, charStart + 20],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        let transform = "";
        let opacity = progress;
        let filter = "";

        switch (style) {
          case "chars":
            transform = `translateY(${(1 - springValue) * 60}px) rotateX(${(1 - springValue) * 90}deg)`;
            filter = `blur(${(1 - progress) * 8}px)`;
            break;
          case "words":
            transform = `translateY(${(1 - springValue) * 40}px) scale(${0.8 + springValue * 0.2})`;
            filter = `blur(${(1 - progress) * 5}px)`;
            break;
          case "glitch":
            const glitchOffset = Math.sin(frame * 0.5 + i) * (1 - progress) * 10;
            transform = `translate(${glitchOffset}px, ${(1 - springValue) * 30}px)`;
            // Use deterministic noise based on frame and index instead of Math.random
            opacity = progress * (0.7 + (Math.sin(frame * 0.3 + i * 7) * 0.5 + 0.5) * 0.3);
            break;
          case "wave":
            const waveY = Math.sin((frame - charStart) * 0.1 + i * 0.3) * 8 * progress;
            transform = `translateY(${(1 - springValue) * 50 + waveY}px)`;
            break;
          default:
            transform = `translateY(${(1 - springValue) * 40}px)`;
        }

        const charStyle: React.CSSProperties = {
          display: "inline-block",
          transform,
          opacity,
          filter,
          color: gradient ? "transparent" : color,
          background: gradient || undefined,
          backgroundClip: gradient ? "text" : undefined,
          WebkitBackgroundClip: gradient ? "text" : undefined,
          WebkitTextFillColor: gradient ? "transparent" : undefined,
          textShadow: !gradient ? `0 4px 30px rgba(0,0,0,0.4), 0 0 60px rgba(99, 102, 241, 0.3)` : undefined,
          minWidth: char === " " ? "0.3em" : undefined,
        };

        return (
          <span key={i} style={charStyle}>
            {char === " " ? "\u00A0" : char}
          </span>
        );
      })}
    </div>
  );
};
