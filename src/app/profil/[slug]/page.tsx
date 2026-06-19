import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import localFont from "next/font/local";
import {
  ALL_ARCHETYPE_SLUGS,
  getArchetypeBySlug,
} from "@/lib/profil/archetypes";
import { getProfileShareURL } from "@/lib/profil/share";

// Only the 8 known archetype slugs are valid; anything else 404s.
export const dynamicParams = false;

const newsreader = localFont({
  src: [
    { path: "../_assets/fonts/NR-500.ttf", weight: "500", style: "normal" },
    { path: "../_assets/fonts/NR-500i.ttf", weight: "500", style: "italic" },
    { path: "../_assets/fonts/NR-600.ttf", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--font-newsreader",
});

const grotesk = localFont({
  src: [
    { path: "../_assets/fonts/SG-600.ttf", weight: "600", style: "normal" },
    { path: "../_assets/fonts/SG-700.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-grotesk",
});

export function generateStaticParams(): { slug: string }[] {
  return ALL_ARCHETYPE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const archetype = getArchetypeBySlug(slug);
  if (!archetype) {
    return { title: { absolute: "Profil introuvable | IA & Foi" } };
  }

  const title = `Je suis un·e ${archetype.title} | IA & Foi x CNEF`;
  const description = `${archetype.coreMotivation}. Et vous, quel est votre profil face à l'IA ? Découvrez-le en 5 minutes, gratuitement et anonymement.`;
  const url = getProfileShareURL(slug);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/profil/${slug}` },
    robots: "index, follow",
    openGraph: {
      type: "article",
      locale: "fr_FR",
      title,
      description,
      url,
      siteName: "IA & Foi",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const archetype = getArchetypeBySlug(slug);
  if (!archetype) {
    notFound();
  }

  return (
    <main
      className={`${newsreader.variable} ${grotesk.variable} relative min-h-[100dvh] w-full overflow-hidden bg-[#0a0e1a] text-[#f6f8fe]`}
    >
      {/* Top accent border */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-20 h-1.5 bg-[linear-gradient(90deg,#e94f18,#c70519_50%,#b30167)]"
      />

      {/* Warm + cold glows (matching the share card) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(820px_620px_at_88%_115%,rgba(233,79,24,.30),rgba(179,1,103,.10)_45%,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(700px_520px_at_6%_-10%,rgba(64,99,180,.20),transparent_62%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-3xl flex-col px-6 py-14 md:px-10 md:py-20">
        {/* Kicker */}
        <p className="font-[family-name:var(--font-grotesk)] text-xs font-semibold uppercase tracking-[0.26em] text-[#9fb0cf]">
          {"Mon profil face à l'IA · Enquête CNEF 2026"}
        </p>

        {/* Title */}
        <h1 className="mt-6 font-[family-name:var(--font-newsreader)] text-[2.75rem] font-[560] leading-[1.04] tracking-[-0.015em] text-[#f6f8fe] md:text-[4.25rem]">
          Je suis un·e{" "}
          <span className="bg-[linear-gradient(100deg,#ff7a3c,#e2122a_45%,#c0186f)] bg-clip-text italic text-transparent">
            {archetype.title}
          </span>
        </h1>

        {/* Core motivation */}
        <p className="mt-6 max-w-2xl font-[family-name:var(--font-newsreader)] text-xl leading-relaxed text-[#b9c5dc] md:text-2xl">
          {archetype.coreMotivation}.
        </p>

        {/* Full description */}
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-[#b9c5dc] md:text-lg">
          {archetype.fullDescription}
        </p>

        {/* Motivation + fear */}
        <dl className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] p-5">
            <dt className="font-[family-name:var(--font-grotesk)] text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#37d399]">
              Ce qui vous anime
            </dt>
            <dd className="mt-2 text-[#e7edf9]">{archetype.coreMotivation}</dd>
          </div>
          <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] p-5">
            <dt className="font-[family-name:var(--font-grotesk)] text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#ff9a6b]">
              Votre vigilance
            </dt>
            <dd className="mt-2 text-[#e7edf9]">{archetype.primaryFear}</dd>
          </div>
        </dl>

        {/* CTA */}
        <div className="mt-12 rounded-3xl border border-white/[0.12] bg-white/[0.04] p-7 md:p-9">
          <h2 className="font-[family-name:var(--font-newsreader)] text-2xl font-[560] text-[#f6f8fe] md:text-3xl">
            Et vous, quel est votre profil ?
          </h2>
          <p className="mt-2 text-[#b9c5dc]">
            Découvrez-le en 5 minutes, gratuitement et 100% anonymement.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/cnef"
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(100deg,#ff7a3c,#e2122a_45%,#c0186f)] px-7 py-3.5 font-[family-name:var(--font-grotesk)] text-base font-semibold text-white shadow-lg shadow-[#e2122a]/20 transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a3c]"
            >
              Découvrir mon profil
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 font-[family-name:var(--font-grotesk)] text-base font-medium text-[#e7edf9] transition-colors hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Version grand public
            </Link>
          </div>
        </div>

        {/* Footer: CNEF partnership + reassurance */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-12">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- transparent logo on dark bg, static asset */}
            <img
              src="/cnef-logo.png"
              alt="Logo du CNEF"
              width={56}
              height={31}
              className="h-8 w-auto"
            />
            <span className="font-[family-name:var(--font-grotesk)] text-sm text-[#9fb0cf]">
              En partenariat avec le CNEF
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.05] px-3.5 py-1.5 font-[family-name:var(--font-grotesk)] text-xs font-medium text-[#b9c5dc]">
              <span className="h-2 w-2 rounded-full bg-[#37d399]" />
              100% anonyme · 5 min
            </span>
            <span className="font-[family-name:var(--font-grotesk)] text-sm font-semibold text-[#f6f8fe]">
              ia-foi<span className="text-[#e2122a]">.</span>fr
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
