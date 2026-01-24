import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Easing,
  spring,
} from "remotion";
import { KineticText } from "../components/KineticText";
import { GeometricShapes } from "../components/GeometricShapes";
import { LightEffects, GlowButton } from "../components/LightEffects";
import { MockDashboard } from "../components/MockDashboard";

/**
 * SOTA Landing Video - 28 seconds (840 frames @ 30fps)
 *
 * Techniques used:
 * - Spring physics with damping: 200 for smooth motion
 * - Blur-to-sharp focus transitions
 * - Staggered reveals with proper choreography
 * - 5 second hold on value proposition
 * - 5 second hold on final CTA
 * - Premounting for smooth loading
 */

const BigNumber: React.FC<{
  value: number;
  suffix: string;
  label: string;
  sublabel?: string;
  startFrame: number;
  y?: number;
}> = ({ value, suffix, label, sublabel, startFrame, y = 480 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth spring entrance
  const entranceSpring = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 200 },
    durationInFrames: 45,
  });

  const opacity = interpolate(frame, [startFrame, startFrame + 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Counter animation - slower, more dramatic
  const countProgress = interpolate(
    frame,
    [startFrame + 10, startFrame + 70],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  const displayValue = Math.round(value * countProgress);
  const scale = interpolate(entranceSpring, [0, 1], [0.85, 1]);
  const blur = interpolate(frame, [startFrame, startFrame + 40], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(entranceSpring, [0, 1], [50, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: y,
        transform: `translate(-50%, -50%) scale(${scale}) translateY(${translateY}px)`,
        opacity,
        filter: `blur(${blur}px)`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 200,
          fontWeight: 100,
          fontFamily: "'SF Pro Display', system-ui, sans-serif",
          letterSpacing: "-0.04em",
          lineHeight: 0.85,
          background: "linear-gradient(135deg, #ffffff 0%, #a5b4fc 30%, #c4b5fd 60%, #f0abfc 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 0 80px rgba(139, 92, 246, 0.4))",
        }}
      >
        {displayValue}{suffix}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 500,
          color: "rgba(255,255,255,0.9)",
          marginTop: 28,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          opacity: interpolate(frame, [startFrame + 25, startFrame + 50], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {label}
      </div>
      {sublabel && (
        <div
          style={{
            fontSize: 20,
            fontWeight: 300,
            color: "rgba(255,255,255,0.5)",
            marginTop: 14,
            letterSpacing: "0.02em",
            opacity: interpolate(frame, [startFrame + 40, startFrame + 65], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
};

const FeatureBadge: React.FC<{
  icon: string;
  text: string;
  startFrame: number;
  x: number;
  y: number;
  delay?: number;
}> = ({ icon, text, startFrame, x, y, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSpring = spring({
    frame: frame - startFrame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 35,
  });

  const opacity = interpolate(
    frame,
    [startFrame + delay, startFrame + delay + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = interpolate(badgeSpring, [0, 1], [0.8, 1]);
  const translateY = interpolate(badgeSpring, [0, 1], [20, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale}) translateY(${translateY}px)`,
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 28px",
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        borderRadius: 50,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: "rgba(255,255,255,0.85)",
          letterSpacing: "0.01em",
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const LandingVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // ═══════════════════════════════════════════════════════════════════════════
  // GLOBAL CAMERA - DISABLED to prevent trembling
  // ═══════════════════════════════════════════════════════════════════════════

  const cameraScale = 1; // Fixed scale, no movement
  const cameraX = 0;
  const cameraY = 0;

  // Background hue shift - slower, more subtle
  const bgHue = interpolate(frame, [0, durationInFrames], [228, 265]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SCENE BLUR TRANSITIONS - each scene has focus/blur states
  // ═══════════════════════════════════════════════════════════════════════════

  // Scene boundaries - NO OVERLAP on last 2 sequences
  const scene1End = 170;
  const scene2Start = 160;
  const scene2End = 310;
  const scene3Start = 300;
  const scene3End = 540;
  const scene4Start = 540;
  const scene4End = 690; // Extended: 5 seconds (150 frames) to read "5 minutes" message
  const scene5Start = 690; // Starts exactly when scene 4 ends

  // Global fade in/out
  const globalFadeIn = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const globalFadeOut = interpolate(
    frame,
    [durationInFrames - 25, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) }
  );

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse 130% 90% at 50% 130%, hsl(${bgHue}, 65%, 7%) 0%, transparent 55%),
          radial-gradient(ellipse 110% 70% at 50% -25%, hsl(${bgHue + 25}, 55%, 10%) 0%, transparent 45%),
          linear-gradient(180deg, #020617 0%, #0c0a1a 50%, #030712 100%)
        `,
        fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Camera wrapper for parallax */}
      <div
        style={{
          position: "absolute",
          inset: -20,
          transform: `scale(${cameraScale}) translate(${cameraX}px, ${cameraY}px)`,
          opacity: globalFadeIn * globalFadeOut,
        }}
      >
        {/* Background layers */}
        <LightEffects />
        <GeometricShapes variant="circles" />
        <GeometricShapes variant="dots" />

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SCENE 1: Hook Question (0-170) - 5.7 seconds                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Sequence from={0} durationInFrames={175} premountFor={30}>
          <SceneWrapper
            frame={frame}
            sceneStart={0}
            sceneEnd={scene1End}
            fadeInDuration={35}
            fadeOutDuration={25}
          >
            <KineticText
              text="Et si l'IA"
              startFrame={25}
              duration={140}
              fontSize={56}
              y={400}
              style="chars"
              stagger={4}
              weight={300}
              color="rgba(255,255,255,0.85)"
            />
            <KineticText
              text="transformait votre"
              startFrame={50}
              duration={115}
              fontSize={70}
              y={485}
              style="chars"
              stagger={3}
              weight={500}
              color="white"
            />
            <KineticText
              text="vie spirituelle ?"
              startFrame={80}
              duration={85}
              fontSize={80}
              y={580}
              style="chars"
              stagger={3}
              weight={600}
              gradient="linear-gradient(135deg, #ffffff 0%, #a5b4fc 40%, #c4b5fd 70%, #f0abfc 100%)"
            />

            {/* Decorative line */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 680,
                transform: "translateX(-50%)",
                width: interpolate(frame, [100, 140], [0, 220], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.out(Easing.cubic),
                }),
                height: 2,
                background: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)",
                opacity: interpolate(frame, [100, 130], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            />
          </SceneWrapper>
        </Sequence>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SCENE 2: Statistic (160-310) - 5 seconds                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Sequence from={scene2Start} durationInFrames={155} premountFor={30}>
          <SceneWrapper
            frame={frame}
            sceneStart={scene2Start}
            sceneEnd={scene2End}
            fadeInDuration={40}
            fadeOutDuration={30}
          >
            <BigNumber
              value={73}
              suffix="%"
              label="des croyants s'interrogent"
              sublabel="sur le rôle de l'IA dans leur foi"
              startFrame={15}
              y={500}
            />
          </SceneWrapper>
        </Sequence>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SCENE 3: Dashboard Demo (300-540) - 8 seconds                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Sequence from={scene3Start} durationInFrames={240} premountFor={30}>
          <SceneWrapper
            frame={frame}
            sceneStart={scene3Start}
            sceneEnd={scene3End}
            fadeInDuration={35}
            fadeOutDuration={30}
          >
            <KineticText
              text="Découvrez votre profil"
              startFrame={15}
              duration={100}
              fontSize={46}
              y={95}
              style="words"
              stagger={5}
              weight={500}
              color="white"
            />
            <MockDashboard startFrame={40} duration={190} />
          </SceneWrapper>
        </Sequence>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SCENE 4: Value Proposition (540-690) - 5 seconds - NO OVERLAP       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Sequence from={scene4Start} durationInFrames={150} premountFor={30}>
          <SceneWrapper
            frame={frame}
            sceneStart={scene4Start}
            sceneEnd={scene4End}
            fadeInDuration={35}
            fadeOutDuration={30}
          >
            <KineticText
              text="5 minutes"
              startFrame={15}
              duration={135}
              fontSize={130}
              y={420}
              style="words"
              weight={200}
              gradient="linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)"
            />
            <KineticText
              text="pour révéler votre profil unique"
              startFrame={35}
              duration={115}
              fontSize={36}
              y={530}
              style="chars"
              stagger={2}
              weight={400}
              color="rgba(255,255,255,0.85)"
            />
          </SceneWrapper>
        </Sequence>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SCENE 5: CTA (690-840) - 5 seconds with FULL HOLD - NO OVERLAP     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <Sequence from={scene5Start} durationInFrames={150} premountFor={30}>
          <SceneWrapper
            frame={frame}
            sceneStart={scene5Start}
            sceneEnd={durationInFrames}
            fadeInDuration={35}
            fadeOutDuration={0} // No fade out - hard cut to black at end
          >
            <KineticText
              text="Participez à l'étude"
              startFrame={10}
              duration={145}
              fontSize={56}
              y={380}
              style="words"
              stagger={6}
              weight={500}
              color="white"
            />

            <GlowButton text="Commencer →" startFrame={25} y={510} />

            {/* Feature badges - staggered */}
            <FeatureBadge
              icon="🔬"
              text="Étude scientifique"
              startFrame={40}
              x={700}
              y={630}
              delay={0}
            />
            <FeatureBadge
              icon="🔒"
              text="100% anonyme"
              startFrame={40}
              x={960}
              y={630}
              delay={12}
            />
            <FeatureBadge
              icon="⏱️"
              text="5 minutes"
              startFrame={40}
              x={1220}
              y={630}
              delay={24}
            />

            {/* Subtle pulsing CTA reminder at the end */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: 60,
                transform: "translateX(-50%)",
                fontSize: 14,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.05em",
                opacity: interpolate(
                  frame - scene5Start,
                  [80, 100],
                  [0, 0.6 + Math.sin((frame - scene5Start) * 0.08) * 0.2],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                ),
              }}
            >
              Scannez le QR code ou visitez le lien
            </div>
          </SceneWrapper>
        </Sequence>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* GLOBAL OVERLAYS                                                         */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}

      {/* Cinematic vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(2,6,23,0.75) 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* Film grain overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          pointerEvents: "none",
        }}
      />

      {/* Fade from black at start */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#020617",
          opacity: interpolate(frame, [0, 35], [1, 0], {
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }),
          pointerEvents: "none",
        }}
      />

      {/* Fade to black at end */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#020617",
          opacity: interpolate(
            frame,
            [durationInFrames - 25, durationInFrames],
            [0, 1],
            { extrapolateLeft: "clamp", easing: Easing.in(Easing.cubic) }
          ),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Scene Wrapper - handles blur focus transitions between scenes
 */
const SceneWrapper: React.FC<{
  children: React.ReactNode;
  frame: number;
  sceneStart: number;
  sceneEnd: number;
  fadeInDuration: number;
  fadeOutDuration: number;
}> = ({ children, frame, sceneStart, sceneEnd, fadeInDuration, fadeOutDuration }) => {
  // Fade in
  const fadeIn = interpolate(
    frame,
    [sceneStart, sceneStart + fadeInDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // Fade out (only if fadeOutDuration > 0)
  const fadeOut = fadeOutDuration > 0
    ? interpolate(
        frame,
        [sceneEnd - fadeOutDuration, sceneEnd],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) }
      )
    : 1;

  // Blur transitions
  const blurIn = interpolate(
    frame,
    [sceneStart, sceneStart + fadeInDuration * 0.8],
    [6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const blurOut = fadeOutDuration > 0
    ? interpolate(
        frame,
        [sceneEnd - fadeOutDuration, sceneEnd],
        [0, 4],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;

  const blur = Math.max(blurIn, blurOut);

  // Scale for depth
  const scaleIn = interpolate(
    frame,
    [sceneStart, sceneStart + fadeInDuration],
    [0.98, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  return (
    <AbsoluteFill
      style={{
        opacity: fadeIn * fadeOut,
        filter: `blur(${blur}px)`,
        transform: `scale(${scaleIn})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
