import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ParticleField } from "../components/ParticleField";
import { GlowingOrb } from "../components/GlowingOrb";
import { AnimatedTitle } from "../components/AnimatedTitle";

export const LandingVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Background gradient animation
  const gradientProgress = interpolate(
    frame,
    [0, 60, durationInFrames],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Subtle background pulse
  const bgPulse = 1 + Math.sin(frame * 0.02) * 0.1;

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(
            ellipse at 50% 50%,
            rgba(59, 130, 246, ${0.08 * gradientProgress * bgPulse}) 0%,
            rgba(139, 92, 246, ${0.05 * gradientProgress * bgPulse}) 30%,
            #0b1120 70%
          ),
          linear-gradient(
            180deg,
            #0b1120 0%,
            #0f172a 50%,
            #0b1120 100%
          )
        `,
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Animated ambient glow in center */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 600 * bgPulse,
          height: 400 * bgPulse,
          borderRadius: "50%",
          background: `radial-gradient(
            ellipse,
            rgba(139, 92, 246, ${0.15 * gradientProgress}) 0%,
            rgba(59, 130, 246, ${0.08 * gradientProgress}) 40%,
            transparent 70%
          )`,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* Secondary ambient glow - top left */}
      <div
        style={{
          position: "absolute",
          left: "10%",
          top: "15%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(
            circle,
            rgba(6, 182, 212, ${0.1 * gradientProgress}) 0%,
            transparent 60%
          )`,
          filter: "blur(60px)",
          transform: `translate(${Math.sin(frame * 0.01) * 30}px, ${Math.cos(frame * 0.015) * 20}px)`,
          pointerEvents: "none",
        }}
      />

      {/* Secondary ambient glow - bottom right */}
      <div
        style={{
          position: "absolute",
          right: "10%",
          bottom: "15%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: `radial-gradient(
            circle,
            rgba(168, 85, 247, ${0.12 * gradientProgress}) 0%,
            transparent 60%
          )`,
          filter: "blur(50px)",
          transform: `translate(${Math.cos(frame * 0.012) * 25}px, ${Math.sin(frame * 0.018) * 25}px)`,
          pointerEvents: "none",
        }}
      />

      {/* Particle Field */}
      <ParticleField
        count={65}
        convergenceFrame={60}
        disperseFrame={240}
      />

      {/* Glowing Orbs - appear during convergence phase */}
      <GlowingOrb
        color="#3b82f6"
        secondaryColor="#60a5fa"
        size={80}
        initialX={300}
        initialY={200}
        orbitRadius={180}
        orbitSpeed={0.012}
        orbitOffset={0}
        appearFrame={75}
        disappearFrame={240}
      />

      <GlowingOrb
        color="#a855f7"
        secondaryColor="#c084fc"
        size={65}
        initialX={1600}
        initialY={300}
        orbitRadius={160}
        orbitSpeed={0.015}
        orbitOffset={Math.PI * 0.66}
        appearFrame={90}
        disappearFrame={240}
      />

      <GlowingOrb
        color="#06b6d4"
        secondaryColor="#22d3ee"
        size={55}
        initialX={960}
        initialY={850}
        orbitRadius={140}
        orbitSpeed={0.018}
        orbitOffset={Math.PI * 1.33}
        appearFrame={105}
        disappearFrame={240}
      />

      {/* Animated Title - "IA & Foi" */}
      <AnimatedTitle
        text="IA & Foi"
        appearFrame={150}
        disappearFrame={240}
      />

      {/* Subtle vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(
            ellipse at 50% 50%,
            transparent 40%,
            rgba(11, 17, 32, 0.4) 100%
          )`,
          pointerEvents: "none",
        }}
      />

      {/* Noise texture overlay for organic feel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
