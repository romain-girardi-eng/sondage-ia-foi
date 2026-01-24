import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const LightEffects: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 40, durationInFrames - 30, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );


  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: globalOpacity }}>
      {/* Central glow pulse */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 600 + Math.sin(frame * 0.03) * 100,
          height: 400 + Math.sin(frame * 0.03) * 60,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Lens flare */}
      <div
        style={{
          position: "absolute",
          left: "30%",
          top: "25%",
          width: 300,
          height: 300,
          background: `radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(99, 102, 241, 0.05) 30%, transparent 60%)`,
          filter: "blur(20px)",
          transform: `translate(${Math.sin(frame * 0.02) * 30}px, ${Math.cos(frame * 0.015) * 20}px)`,
        }}
      />


      {/* Floating light orbs */}
      {[0, 1, 2].map((i) => {
        const baseX = [25, 75, 50][i];
        const baseY = [30, 70, 50][i];
        const speed = 0.008 + i * 0.003;
        const size = 150 + i * 50;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${baseX + Math.sin(frame * speed) * 5}%`,
              top: `${baseY + Math.cos(frame * speed * 1.2) * 5}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${i === 0 ? "99, 102, 241" : i === 1 ? "168, 85, 247" : "6, 182, 212"}, 0.12) 0%, transparent 60%)`,
              filter: "blur(40px)",
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}

      {/* Subtle noise texture for cinematic feel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.015,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export const GlowButton: React.FC<{
  text: string;
  startFrame: number;
  y?: number;
}> = ({ text, startFrame, y = 580 }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const pulse = 1 + Math.sin((frame - startFrame) * 0.12) * 0.02;
  const glowIntensity = 0.4 + Math.sin((frame - startFrame) * 0.1) * 0.2;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: y,
        transform: `translate(-50%, -50%) scale(${progress * pulse})`,
        opacity: progress,
      }}
    >
      {/* Glow behind button */}
      <div
        style={{
          position: "absolute",
          inset: -20,
          background: `radial-gradient(ellipse, rgba(99, 102, 241, ${glowIntensity}) 0%, transparent 70%)`,
          filter: "blur(20px)",
          borderRadius: 30,
        }}
      />
      {/* Button */}
      <div
        style={{
          position: "relative",
          padding: "22px 70px",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
          borderRadius: 18,
          fontSize: 26,
          fontWeight: 600,
          fontFamily: "'SF Pro Display', system-ui, sans-serif",
          color: "white",
          letterSpacing: "0.02em",
          boxShadow: `
            0 4px 15px rgba(99, 102, 241, 0.4),
            0 8px 30px rgba(139, 92, 246, 0.3),
            inset 0 1px 0 rgba(255,255,255,0.2)
          `,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {text}
      </div>
    </div>
  );
};
