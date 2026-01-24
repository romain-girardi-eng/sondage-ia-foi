import { useMemo } from "react";
import { Particle } from "./Particle";

interface ParticleFieldProps {
  count?: number;
  convergenceFrame?: number;
  disperseFrame?: number;
}

// Seeded random for consistent particle positions across renders
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 60,
  convergenceFrame = 60,
  disperseFrame = 240,
}) => {
  const particles = useMemo(() => {
    const colors = [
      "#3b82f6", // Blue
      "#a855f7", // Purple
      "#06b6d4", // Cyan
      "#8b5cf6", // Violet
      "#60a5fa", // Light blue
      "#c084fc", // Light purple
    ];

    return Array.from({ length: count }, (_, i) => {
      const seed = i * 12345;
      return {
        id: i,
        initialX: seededRandom(seed) * 1920,
        initialY: seededRandom(seed + 1) * 1080,
        size: 4 + seededRandom(seed + 2) * 12,
        color: colors[Math.floor(seededRandom(seed + 3) * colors.length)],
        delay: seededRandom(seed + 4) * 45, // Staggered fade-in over 1.5s
      };
    });
  }, [count]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
      }}
    >
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          id={particle.id}
          initialX={particle.initialX}
          initialY={particle.initialY}
          size={particle.size}
          color={particle.color}
          delay={particle.delay}
          convergenceFrame={convergenceFrame}
          disperseFrame={disperseFrame}
        />
      ))}
    </div>
  );
};
