import { interpolate, useCurrentFrame, spring, useVideoConfig, Easing } from "remotion";

interface MockDashboardProps {
  startFrame: number;
  duration?: number;
}

/**
 * Cinematic Results Reveal - Stripe/Linear/Apple style
 *
 * NO cursor simulation - that looks amateur
 * Instead: floating 3D cards that reveal naturally with depth and parallax
 *
 * Principles:
 * - Transform & opacity only (GPU accelerated)
 * - Custom bezier curves
 * - Subtle depth with shadows and blur
 * - Elements "breathe" slightly
 * - Under 500ms per animation
 */
export const MockDashboard: React.FC<MockDashboardProps> = ({
  startFrame,
  duration = 190,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - startFrame; // local frame

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 1: Container emerges from depth (0-50 frames) - SLOWER
  // ═══════════════════════════════════════════════════════════════════

  const containerSpring = spring({
    frame: f,
    fps,
    config: { damping: 200 },
    durationInFrames: 50,
  });

  const containerOpacity = interpolate(f, [0, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const containerScale = interpolate(containerSpring, [0, 1], [0.92, 1]);
  const containerY = interpolate(containerSpring, [0, 1], [40, 0]);
  const containerBlur = interpolate(f, [0, 40], [8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 2: Profile card reveals with 3D depth (30-90 frames) - SLOWER
  // ═══════════════════════════════════════════════════════════════════

  const profileDelay = 30;
  const profileSpring = spring({
    frame: Math.max(0, f - profileDelay),
    fps,
    config: { damping: 200 },
    durationInFrames: 55,
  });

  const profileOpacity = interpolate(f, [profileDelay, profileDelay + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const profileScale = interpolate(profileSpring, [0, 1], [0.85, 1]);
  const profileY = interpolate(profileSpring, [0, 1], [30, 0]);
  const profileRotateX = interpolate(profileSpring, [0, 1], [8, 0]);

  // Emoji pop animation - delayed more
  const emojiDelay = 60;
  const emojiSpring = spring({
    frame: Math.max(0, f - emojiDelay),
    fps,
    config: { damping: 15, stiffness: 150 }, // Slightly softer bounce
    durationInFrames: 35,
  });

  // Profile name reveal - slower
  const nameProgress = interpolate(f, [70, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 3: Score bars fill sequentially (80-150 frames) - MUCH SLOWER
  // ═══════════════════════════════════════════════════════════════════

  const score1Spring = spring({
    frame: Math.max(0, f - 85),
    fps,
    config: { damping: 200 },
    durationInFrames: 45,
  });

  const score2Spring = spring({
    frame: Math.max(0, f - 100),
    fps,
    config: { damping: 200 },
    durationInFrames: 45,
  });

  const score3Spring = spring({
    frame: Math.max(0, f - 115),
    fps,
    config: { damping: 200 },
    durationInFrames: 45,
  });

  // Score label fade ins - more spaced out
  const score1LabelOpacity = interpolate(f, [80, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const score2LabelOpacity = interpolate(f, [95, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const score3LabelOpacity = interpolate(f, [110, 125], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 4: Bottom cards cascade in (140-180 frames) - SLOWER
  // ═══════════════════════════════════════════════════════════════════

  const card1Spring = spring({
    frame: Math.max(0, f - 140),
    fps,
    config: { damping: 200 },
    durationInFrames: 35,
  });

  const card2Spring = spring({
    frame: Math.max(0, f - 150),
    fps,
    config: { damping: 200 },
    durationInFrames: 35,
  });

  const card3Spring = spring({
    frame: Math.max(0, f - 160),
    fps,
    config: { damping: 200 },
    durationInFrames: 35,
  });

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 5: Fade out (last 30 frames) - SLOWER FADE
  // ═══════════════════════════════════════════════════════════════════

  const fadeOut = interpolate(f, [duration - 30, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // ═══════════════════════════════════════════════════════════════════
  // Breathing disabled - was causing micro-trembling
  // ═══════════════════════════════════════════════════════════════════

  const breathe = 0;
  const breatheSlow = 0;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `
          translate(-50%, -50%)
          translateY(${containerY}px)
          scale(${containerScale + breathe})
        `,
        opacity: containerOpacity * fadeOut,
        filter: `blur(${containerBlur}px)`,
        width: 880,
        perspective: 1200,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Main floating card */}
      <div
        style={{
          background: "linear-gradient(165deg, rgba(15, 23, 42, 0.97) 0%, rgba(30, 41, 59, 0.95) 100%)",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: `
            0 60px 120px -20px rgba(0,0,0,0.6),
            0 30px 60px -20px rgba(0,0,0,0.4),
            0 0 0 1px rgba(255,255,255,0.03),
            inset 0 1px 0 rgba(255,255,255,0.04)
          `,
          overflow: "hidden",
          fontFamily: "'SF Pro Display', -apple-system, system-ui, sans-serif",
        }}
      >
        {/* Header section */}
        <div
          style={{
            padding: "36px 40px 28px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            Analyse complète
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            Vos Résultats
          </div>
        </div>

        {/* Content grid */}
        <div style={{ display: "flex", padding: "32px 40px 40px" }}>

          {/* ══════════════ LEFT: Profile Card ══════════════ */}
          <div
            style={{
              width: 260,
              marginRight: 36,
              opacity: profileOpacity,
              transform: `
                translateY(${profileY}px)
                scale(${profileScale})
                rotateX(${profileRotateX}deg)
              `,
              transformOrigin: "center top",
            }}
          >
            <div
              style={{
                background: "linear-gradient(145deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)",
                borderRadius: 20,
                padding: "32px 28px",
                border: "1px solid rgba(99, 102, 241, 0.15)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Subtle glow at top */}
              <div
                style={{
                  position: "absolute",
                  top: -50,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 200,
                  height: 100,
                  background: "radial-gradient(ellipse, rgba(139, 92, 246, 0.2) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              {/* Profile content */}
              <div style={{ position: "relative", textAlign: "center" }}>
                {/* Emoji with pop animation */}
                <div
                  style={{
                    fontSize: 72,
                    marginBottom: 20,
                    transform: `scale(${emojiSpring})`,
                    filter: `drop-shadow(0 8px 24px rgba(139, 92, 246, 0.3))`,
                  }}
                >
                  🔬
                </div>

                {/* Profile name with reveal */}
                <div
                  style={{
                    overflow: "hidden",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 600,
                      background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      letterSpacing: "-0.01em",
                      opacity: nameProgress,
                      transform: `translateY(${(1 - nameProgress) * 15}px)`,
                    }}
                  >
                    Explorateur Curieux
                  </div>
                </div>

                {/* Subtitle */}
                <div
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.6,
                    opacity: interpolate(f, [90, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  }}
                >
                  Ouvert à l'innovation
                  <br />
                  tout en préservant vos valeurs
                </div>

                {/* Badge */}
                <div
                  style={{
                    marginTop: 24,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 18px",
                    background: "rgba(34, 197, 94, 0.1)",
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                    borderRadius: 100,
                    fontSize: 13,
                    color: "rgba(34, 197, 94, 0.9)",
                    fontWeight: 500,
                    opacity: interpolate(f, [115, 135], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                    transform: `scale(${interpolate(f, [115, 135], [0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Profil identifié
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════ RIGHT: Scores ══════════════ */}
          <div style={{ flex: 1, paddingTop: 8 }}>

            {/* Score 1: Religiosité */}
            <div style={{ marginBottom: 28, opacity: score1LabelOpacity }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 12,
                }}
              >
                <span style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                }}>
                  Religiosité
                </span>
                <span style={{
                  color: "#60a5fa",
                  fontSize: 15,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {(3.8 * score1Spring).toFixed(1)}/5
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${76 * score1Spring}%`,
                    height: "100%",
                    borderRadius: 3,
                    background: "linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)",
                    boxShadow: score1Spring > 0.3 ? "0 0 20px rgba(59, 130, 246, 0.4)" : "none",
                  }}
                />
              </div>
            </div>

            {/* Score 2: Adoption IA */}
            <div style={{ marginBottom: 28, opacity: score2LabelOpacity }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 12,
                }}
              >
                <span style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                }}>
                  Adoption IA
                </span>
                <span style={{
                  color: "#34d399",
                  fontSize: 15,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {(4.2 * score2Spring).toFixed(1)}/5
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${84 * score2Spring}%`,
                    height: "100%",
                    borderRadius: 3,
                    background: "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
                    boxShadow: score2Spring > 0.3 ? "0 0 20px rgba(16, 185, 129, 0.4)" : "none",
                  }}
                />
              </div>
            </div>

            {/* Score 3: Ouverture */}
            <div style={{ marginBottom: 32, opacity: score3LabelOpacity }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 12,
                }}
              >
                <span style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                }}>
                  Ouverture au changement
                </span>
                <span style={{
                  color: "#f472b6",
                  fontSize: 15,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {(4.5 * score3Spring).toFixed(1)}/5
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${90 * score3Spring}%`,
                    height: "100%",
                    borderRadius: 3,
                    background: "linear-gradient(90deg, #ec4899 0%, #f472b6 100%)",
                    boxShadow: score3Spring > 0.3 ? "0 0 20px rgba(236, 72, 153, 0.4)" : "none",
                  }}
                />
              </div>
            </div>

            {/* Bottom info cards - cascade animation */}
            <div style={{ display: "flex", gap: 14 }}>
              {[
                { label: "Pratique", value: "Régulière", spring: card1Spring },
                { label: "Ouverture", value: "Élevée", spring: card2Spring },
                { label: "Confiance", value: "Modérée", spring: card3Spring },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    padding: "18px 20px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    opacity: card.spring,
                    transform: `
                      translateY(${(1 - card.spring) * 20}px)
                      scale(${0.95 + card.spring * 0.05})
                    `,
                  }}
                >
                  <div style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 6,
                  }}>
                    {card.label}
                  </div>
                  <div style={{
                    fontSize: 18,
                    color: "white",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                  }}>
                    {card.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
