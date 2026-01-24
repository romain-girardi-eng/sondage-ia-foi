import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
} from "remotion";

interface SurveyResultsVideoProps {
  title: string;
  subtitle: string;
  religiosityScore: number;
  aiAdoptionScore: number;
  profileName: string;
  profileEmoji: string;
}

export const SurveyResultsVideo: React.FC<SurveyResultsVideoProps> = ({
  title,
  subtitle,
  religiosityScore,
  aiAdoptionScore,
  profileName,
  profileEmoji,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Intro animation
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Profile reveal
  const profileOpacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const emojiScale = spring({
    frame: frame - 60,
    fps,
    config: { damping: 8, stiffness: 80 },
  });

  // Scores animation
  const scoresOpacity = interpolate(frame, [120, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const religiosityProgress = interpolate(
    frame,
    [150, 210],
    [0, religiosityScore / 5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const aiProgress = interpolate(
    frame,
    [180, 240],
    [0, aiAdoptionScore / 5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Outro
  const outroOpacity = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        opacity: outroOpacity,
      }}
    >
      {/* Animated background orbs */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
          filter: "blur(60px)",
          transform: `translate(${Math.sin(frame / 30) * 20}px, ${Math.cos(frame / 25) * 20}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
          filter: "blur(80px)",
          transform: `translate(${Math.cos(frame / 35) * 30}px, ${Math.sin(frame / 30) * 30}px)`,
        }}
      />

      {/* Title Section */}
      <Sequence from={0} durationInFrames={durationInFrames}>
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 200,
              color: "white",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 32,
              color: "rgba(255, 255, 255, 0.7)",
              marginTop: 16,
              fontWeight: 300,
            }}
          >
            {subtitle}
          </p>
        </div>
      </Sequence>

      {/* Profile Section */}
      <Sequence from={60} durationInFrames={durationInFrames - 60}>
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: profileOpacity,
          }}
        >
          <div
            style={{
              fontSize: 120,
              transform: `scale(${Math.max(0, emojiScale)})`,
              marginBottom: 24,
            }}
          >
            {profileEmoji}
          </div>
          <h2
            style={{
              fontSize: 56,
              fontWeight: 600,
              background: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
            }}
          >
            {profileName}
          </h2>
        </div>
      </Sequence>

      {/* Scores Section */}
      <Sequence from={120} durationInFrames={durationInFrames - 120}>
        <div
          style={{
            position: "absolute",
            bottom: 120,
            left: 100,
            right: 100,
            opacity: scoresOpacity,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              gap: 60,
            }}
          >
            {/* Religiosity Score */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 24 }}>
                  Religiosité (CRS-5)
                </span>
                <span style={{ color: "#60a5fa", fontSize: 24, fontWeight: 600 }}>
                  {(religiosityProgress * 5).toFixed(1)}/5
                </span>
              </div>
              <div
                style={{
                  height: 16,
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${religiosityProgress * 100}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                    borderRadius: 8,
                    boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
                  }}
                />
              </div>
            </div>

            {/* AI Adoption Score */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 24 }}>
                  Adoption IA
                </span>
                <span style={{ color: "#34d399", fontSize: 24, fontWeight: 600 }}>
                  {(aiProgress * 5).toFixed(1)}/5
                </span>
              </div>
              <div
                style={{
                  height: 16,
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${aiProgress * 100}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #10b981, #34d399)",
                    borderRadius: 8,
                    boxShadow: "0 0 20px rgba(16, 185, 129, 0.5)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Sequence>

      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 60,
          color: "rgba(255, 255, 255, 0.3)",
          fontSize: 18,
        }}
      >
        sondage-ia-foi.vercel.app
      </div>
    </AbsoluteFill>
  );
};
