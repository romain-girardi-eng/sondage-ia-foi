import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

interface TextRevealProps {
  text: string;
  startFrame: number;
  duration?: number;
  fontSize?: number;
  color?: string;
  gradient?: string;
  y?: number;
  style?: "fade" | "slide" | "scale" | "typewriter" | "split";
  weight?: number;
  maxWidth?: number;
  align?: "center" | "left" | "right";
  letterSpacing?: number;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  startFrame,
  duration = 60,
  fontSize = 72,
  color = "white",
  gradient,
  y = 540,
  style = "fade",
  weight = 300,
  maxWidth = 1400,
  align = "center",
  letterSpacing = -0.02,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const exitProgress = interpolate(
    frame,
    [startFrame + duration - 20, startFrame + duration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const springConfig = { damping: 15, stiffness: 80, mass: 0.8 };
  const springProgress = spring({
    frame: frame - startFrame,
    fps,
    config: springConfig,
  });

  let opacity = 1;
  let translateY = 0;
  let scale = 1;
  let blur = 0;
  let clipPath = "inset(0 0 0 0)";

  switch (style) {
    case "fade":
      opacity = progress * (1 - exitProgress);
      blur = (1 - progress) * 20 + exitProgress * 20;
      break;
    case "slide":
      opacity = progress * (1 - exitProgress);
      translateY = (1 - springProgress) * 80 + exitProgress * -50;
      blur = (1 - progress) * 10;
      break;
    case "scale":
      opacity = progress * (1 - exitProgress);
      scale = 0.7 + springProgress * 0.3 - exitProgress * 0.2;
      blur = (1 - progress) * 15;
      break;
    case "typewriter":
      const chars = Math.floor(text.length * progress);
      clipPath = `inset(0 ${100 - (chars / text.length) * 100}% 0 0)`;
      opacity = 1 - exitProgress;
      break;
    case "split":
      opacity = progress * (1 - exitProgress);
      translateY = (1 - springProgress) * 60;
      scale = 0.95 + springProgress * 0.05;
      break;
  }

  const textStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: y,
    transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
    fontSize,
    fontWeight: weight,
    fontFamily: "'SF Pro Display', 'Helvetica Neue', system-ui, sans-serif",
    letterSpacing: `${letterSpacing}em`,
    lineHeight: 1.15,
    textAlign: align,
    maxWidth,
    width: "90%",
    opacity,
    filter: blur > 0 ? `blur(${blur}px)` : undefined,
    clipPath: style === "typewriter" ? clipPath : undefined,
    color: gradient ? "transparent" : color,
    background: gradient || undefined,
    backgroundClip: gradient ? "text" : undefined,
    WebkitBackgroundClip: gradient ? "text" : undefined,
    WebkitTextFillColor: gradient ? "transparent" : undefined,
    textShadow: gradient ? undefined : `0 4px 30px rgba(0,0,0,0.3)`,
  };

  return <div style={textStyle}>{text}</div>;
};
