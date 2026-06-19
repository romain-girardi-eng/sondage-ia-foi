import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_ARCHETYPE_SLUGS, getArchetypeBySlug } from "@/lib/profil/archetypes";

export const alt = "Mon profil face à l'IA - Enquête CNEF 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams(): { slug: string }[] {
  return ALL_ARCHETYPE_SLUGS.map((slug) => ({ slug }));
}

const FONT_DIR = join(process.cwd(), "src/app/profil/_assets/fonts");
const newsreader600 = readFileSync(join(FONT_DIR, "NR-600.ttf"));
const newsreader500i = readFileSync(join(FONT_DIR, "NR-500i.ttf"));
const grotesk400 = readFileSync(join(FONT_DIR, "SG-400.ttf"));
const grotesk600 = readFileSync(join(FONT_DIR, "SG-600.ttf"));
const grotesk700 = readFileSync(join(FONT_DIR, "SG-700.ttf"));

const logoDataUri = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/cnef-logo.png"),
).toString("base64")}`;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const archetype = getArchetypeBySlug(slug);
  const title = archetype?.title ?? "Croyant face à l'IA";
  const motivation = archetype?.coreMotivation ?? "Découvrez votre profil face à l'IA";

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "54px",
          backgroundColor: "#0a0e1a",
          fontFamily: "Schibsted",
        }}
      >
        {/* Top accent border */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            display: "flex",
            backgroundImage: "linear-gradient(90deg,#e94f18,#c70519 50%,#b30167)",
          }}
        />
        {/* Warm glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "radial-gradient(820px 620px at 88% 115%, rgba(233,79,24,.30), rgba(179,1,103,.10) 45%, transparent 70%)",
          }}
        />
        {/* Cold veil */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "radial-gradient(700px 520px at 6% -10%, rgba(64,99,180,.20), transparent 62%)",
          }}
        />

        {/* Kicker */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", zIndex: 10 }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "9999px",
              display: "flex",
              backgroundColor: "#e2122a",
            }}
          />
          <div
            style={{
              fontFamily: "Schibsted",
              fontWeight: 600,
              fontSize: "21px",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "#9fb0cf",
            }}
          >
            {"Mon profil face à l'IA · Enquête CNEF 2026"}
          </div>
        </div>

        {/* Title block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            zIndex: 10,
            marginTop: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontFamily: "Newsreader",
              fontWeight: 600,
              fontSize: "82px",
              lineHeight: 1.02,
              letterSpacing: "-0.015em",
              color: "#f6f8fe",
            }}
          >
            <span>Je suis un·e&nbsp;</span>
            <span
              style={{
                fontStyle: "italic",
                backgroundImage: "linear-gradient(100deg,#ff7a3c,#e2122a 45%,#c0186f)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {title}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "26px",
              maxWidth: "920px",
              fontFamily: "Schibsted",
              fontWeight: 400,
              fontSize: "30px",
              lineHeight: 1.32,
              color: "#b9c5dc",
            }}
          >
            {motivation}.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <img src={logoDataUri} alt="CNEF" width={104} height={56} style={{ width: "104px", height: "56px", objectFit: "contain" }} />
            <div
              style={{
                display: "flex",
                fontFamily: "Schibsted",
                fontWeight: 400,
                fontSize: "22px",
                color: "#9fb0cf",
              }}
            >
              En partenariat avec le CNEF
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 18px",
                borderRadius: "9999px",
                border: "1px solid rgba(255,255,255,.16)",
                backgroundColor: "rgba(255,255,255,.05)",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "9999px",
                  display: "flex",
                  backgroundColor: "#37d399",
                }}
              />
              <div
                style={{
                  fontFamily: "Schibsted",
                  fontWeight: 600,
                  fontSize: "20px",
                  color: "#dbe4f3",
                }}
              >
                100% anonyme · 5 min
              </div>
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Schibsted",
                fontWeight: 700,
                fontSize: "24px",
                color: "#f6f8fe",
              }}
            >
              ia-foi
              <span style={{ color: "#e2122a" }}>.</span>
              fr
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Newsreader", data: newsreader600, weight: 600, style: "normal" },
        { name: "Newsreader", data: newsreader500i, weight: 500, style: "italic" },
        { name: "Schibsted", data: grotesk400, weight: 400, style: "normal" },
        { name: "Schibsted", data: grotesk600, weight: 600, style: "normal" },
        { name: "Schibsted", data: grotesk700, weight: 700, style: "normal" },
      ],
    },
  );
}
