import { jsPDF } from "jspdf";
import { calculateProfileSpectrum } from "@/lib/scoring/profiles";
import {
  PROFILE_DEFINITIONS,
  SUB_PROFILE_DEFINITIONS,
  DIMENSION_LABELS,
} from "@/lib/scoring/constants";
import type { Answers } from "@/data";
import type { SevenDimensions } from "@/lib/scoring/types";

interface ReportData {
  language: "fr" | "en";
  anonymousId: string;
  completedAt: string;
  answers: Record<string, string | string[] | number>;
  profile: {
    religiosityScore: number;
    iaComfortScore: number;
    theologicalOrientation: string;
  };
}

const translations = {
  fr: {
    title: "Votre Profil Spirituel & IA",
    subtitle: "Rapport Personnalisé - Grande Enquête 2026",
    generatedAt: "Généré le",
    anonymousId: "Identifiant anonyme",
    yourProfile: "Votre Profil",
    subProfile: "Sous-profil",
    matchScore: "Score de correspondance",
    secondaryProfile: "Tendance secondaire",
    sevenDimensions: "Vos 7 Dimensions",
    dimensionsIntro: "Votre positionnement sur les axes clés de l'étude",
    interpretation: "Interprétation",
    uniqueAspects: "Ce qui vous caractérise",
    blindSpots: "Points d'attention",
    strengths: "Vos forces",
    insights: "Insights Personnalisés",
    tensions: "Points de Tension",
    tensionIntro: "Ces tensions internes peuvent être sources de croissance",
    suggestion: "Piste de réflexion",
    growthAreas: "Zones de Développement",
    growthIntro: "Pistes pour enrichir votre réflexion",
    currentState: "Situation actuelle",
    potential: "Potentiel de croissance",
    action: "Action suggérée",
    thankYou: "Merci pour votre participation à cette grande enquête sur l'IA et la foi.",
    dataProtection: "Vos données sont protégées conformément au RGPD. Ce rapport est personnel et confidentiel.",
    footer: "Sondage IA & Foi - Grande Enquête 2026",
    lowScore: "Faible",
    highScore: "Élevé",
    page: "Page",
    of: "sur",
  },
  en: {
    title: "Your Spiritual & AI Profile",
    subtitle: "Personalized Report - Major Survey 2026",
    generatedAt: "Generated on",
    anonymousId: "Anonymous ID",
    yourProfile: "Your Profile",
    subProfile: "Sub-profile",
    matchScore: "Match score",
    secondaryProfile: "Secondary tendency",
    sevenDimensions: "Your 7 Dimensions",
    dimensionsIntro: "Your positioning on the key study axes",
    interpretation: "Interpretation",
    uniqueAspects: "What characterizes you",
    blindSpots: "Points of attention",
    strengths: "Your strengths",
    insights: "Personalized Insights",
    tensions: "Tension Points",
    tensionIntro: "These internal tensions can be sources of growth",
    suggestion: "Suggestion",
    growthAreas: "Growth Areas",
    growthIntro: "Ways to enrich your reflection",
    currentState: "Current situation",
    potential: "Growth potential",
    action: "Suggested action",
    thankYou: "Thank you for participating in this major survey on AI and faith.",
    dataProtection: "Your data is protected in accordance with GDPR. This report is personal and confidential.",
    footer: "AI & Faith Survey - Major Survey 2026",
    lowScore: "Low",
    highScore: "High",
    page: "Page",
    of: "of",
  },
};

// Colors
const COLORS = {
  primary: [59, 130, 246] as [number, number, number],      // Blue
  secondary: [139, 92, 246] as [number, number, number],    // Purple
  accent: [34, 197, 94] as [number, number, number],        // Green
  warning: [245, 158, 11] as [number, number, number],      // Amber
  text: [30, 41, 59] as [number, number, number],           // Slate-800
  muted: [100, 116, 139] as [number, number, number],       // Slate-500
  light: [241, 245, 249] as [number, number, number],       // Slate-100
  white: [255, 255, 255] as [number, number, number],
};

const DIMENSION_COLORS: Record<keyof SevenDimensions, [number, number, number]> = {
  religiosity: [99, 102, 241],         // Indigo
  aiOpenness: [16, 185, 129],          // Emerald
  sacredBoundary: [245, 158, 11],      // Amber
  ethicalConcern: [239, 68, 68],       // Red
  psychologicalPerception: [139, 92, 246], // Violet
  communityInfluence: [59, 130, 246],  // Blue
  futureOrientation: [236, 72, 153],   // Pink
};

function addHeader(doc: jsPDF, t: typeof translations.fr, data: ReportData, yPos: number): number {
  // Header background gradient effect
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, 210, 50, "F");


  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(t.title, 20, yPos + 8);

  // Subtitle
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(t.subtitle, 20, yPos + 18);

  // Date and ID
  doc.setFontSize(9);
  const dateStr = new Date(data.completedAt).toLocaleDateString(
    data.language === "fr" ? "fr-FR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );
  doc.text(`${t.generatedAt}: ${dateStr}`, 20, yPos + 28);
  doc.text(`${t.anonymousId}: ${data.anonymousId.slice(0, 8)}...`, 20, yPos + 35);

  return 60;
}

function addFooter(doc: jsPDF, t: typeof translations.fr, pageNum: number, totalPages: number): void {
  const pageHeight = doc.internal.pageSize.height;

  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, pageHeight - 12, 210, 12, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(t.footer, 20, pageHeight - 4);
  doc.text(`${t.page} ${pageNum} ${t.of} ${totalPages}`, 190, pageHeight - 4, { align: "right" });
}

function drawDimensionBar(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  value: number,
  color: [number, number, number],
  label: string,
  lowDesc: string,
  highDesc: string,
  t: typeof translations.fr
): number {
  const barHeight = 8;
  const labelHeight = 12;

  // Label
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(label, x, y);

  // Background bar
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(x, y + 3, width, barHeight, 2, 2, "F");

  // Value bar
  const valueWidth = (value / 5) * width;
  doc.setFillColor(color[0], color[1], color[2]);
  doc.roundedRect(x, y + 3, valueWidth, barHeight, 2, 2, "F");

  // Score text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  if (valueWidth > 15) {
    doc.text(`${value.toFixed(1)}`, x + valueWidth - 8, y + 9);
  }

  // Low/High labels
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text(lowDesc.substring(0, 35), x, y + 17);
  doc.text(highDesc.substring(0, 35), x + width, y + 17, { align: "right" });

  return y + labelHeight + barHeight + 8;
}

function addSectionTitle(doc: jsPDF, title: string, y: number, emoji?: string): number {
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(15, y - 5, 180, 12, 3, 3, "F");

  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(emoji ? `${emoji} ${title}` : title, 20, y + 3);

  return y + 15;
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = doc.getTextWidth(testLine);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export function generatePDFReport(data: ReportData): jsPDF {
  const t = translations[data.language];
  const doc = new jsPDF();

  // Calculate full profile spectrum
  const spectrum = calculateProfileSpectrum(data.answers as Answers);
  const primaryDef = PROFILE_DEFINITIONS[spectrum.primary.profile];
  const subDef = SUB_PROFILE_DEFINITIONS[spectrum.subProfile.subProfile];

  let currentPage = 1;
  const totalPages = 3;

  // ==========================================
  // PAGE 1: Profile Overview
  // ==========================================

  let yPos = addHeader(doc, t, data, 15);

  // Primary Profile Section
  yPos = addSectionTitle(doc, t.yourProfile, yPos, primaryDef.emoji);

  // Profile card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, yPos, 170, 45, 5, 5, "FD");

  // Profile title
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(primaryDef.title, 25, yPos + 10);

  // Match score badge
  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.roundedRect(150, yPos + 3, 35, 12, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`${spectrum.primary.matchScore}%`, 167, yPos + 11, { align: "center" });

  // Short description
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const descLines = wrapText(doc, primaryDef.shortDescription, 160);
  descLines.forEach((line, i) => {
    doc.text(line, 25, yPos + 18 + i * 4);
  });

  // Core motivation
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  const motivationLines = wrapText(doc, `"${primaryDef.coreMotivation}"`, 160);
  motivationLines.forEach((line, i) => {
    doc.text(line, 25, yPos + 32 + i * 4);
  });

  yPos += 55;

  // Sub-profile
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(20, yPos, 170, 30, 3, 3, "F");

  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`${subDef.emoji} ${t.subProfile}: ${subDef.title}`, 25, yPos + 8);

  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const subDescLines = wrapText(doc, subDef.description, 160);
  subDescLines.slice(0, 2).forEach((line, i) => {
    doc.text(line, 25, yPos + 15 + i * 4);
  });

  yPos += 38;

  // Secondary profile if significant
  if (spectrum.secondary && spectrum.secondary.matchScore >= 15) {
    const secondaryDef = PROFILE_DEFINITIONS[spectrum.secondary.profile];
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.setFontSize(9);
    doc.text(`${t.secondaryProfile}: ${secondaryDef.emoji} ${secondaryDef.title} (${spectrum.secondary.matchScore}%)`, 20, yPos);
    yPos += 10;
  }

  // Interpretation
  yPos = addSectionTitle(doc, t.interpretation, yPos, "📖");

  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const narrativeLines = wrapText(doc, spectrum.interpretation.narrative, 170);
  narrativeLines.slice(0, 6).forEach((line, i) => {
    doc.text(line, 20, yPos + i * 5);
  });

  yPos += Math.min(narrativeLines.length, 6) * 5 + 10;

  // Strengths
  if (yPos < 240) {
    doc.setTextColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`💪 ${t.strengths}:`, 20, yPos);
    yPos += 6;

    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.setFont("helvetica", "normal");
    spectrum.interpretation.strengths.slice(0, 3).forEach((strength, i) => {
      doc.text(`• ${strength.substring(0, 80)}`, 25, yPos + i * 5);
    });
    yPos += spectrum.interpretation.strengths.slice(0, 3).length * 5 + 8;
  }

  // Unique aspects
  if (yPos < 255) {
    doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`✨ ${t.uniqueAspects}:`, 20, yPos);
    yPos += 6;

    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.setFont("helvetica", "normal");
    spectrum.interpretation.uniqueAspects.slice(0, 2).forEach((aspect, i) => {
      doc.text(`• ${aspect.substring(0, 80)}`, 25, yPos + i * 5);
    });
  }

  addFooter(doc, t, currentPage, totalPages);

  // ==========================================
  // PAGE 2: Seven Dimensions
  // ==========================================

  doc.addPage();
  currentPage = 2;

  // Mini header
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, 210, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(t.sevenDimensions, 20, 13);

  yPos = 30;

  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(t.dimensionsIntro, 20, yPos);
  yPos += 12;

  // Draw all 7 dimensions
  const dimensionKeys: (keyof SevenDimensions)[] = [
    'religiosity', 'aiOpenness', 'sacredBoundary', 'ethicalConcern',
    'psychologicalPerception', 'communityInfluence', 'futureOrientation'
  ];

  for (const dimKey of dimensionKeys) {
    const dim = spectrum.dimensions[dimKey];
    const label = DIMENSION_LABELS[dimKey];
    const color = DIMENSION_COLORS[dimKey];

    yPos = drawDimensionBar(
      doc, 20, yPos, 170, dim.value, color,
      data.language === 'fr' ? label.label : label.labelEn,
      label.lowDescription,
      label.highDescription,
      t
    );
  }

  yPos += 5;

  // Insights section
  yPos = addSectionTitle(doc, t.insights, yPos, "💡");

  spectrum.insights.forEach((insight, index) => {
    if (yPos > 250) return;

    doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
    doc.roundedRect(20, yPos, 170, 22, 3, 3, "F");

    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`${insight.icon} ${insight.title}`, 25, yPos + 7);

    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const insightLines = wrapText(doc, insight.message, 160);
    insightLines.slice(0, 2).forEach((line, i) => {
      doc.text(line, 25, yPos + 13 + i * 4);
    });

    yPos += 26;
  });

  addFooter(doc, t, currentPage, totalPages);

  // ==========================================
  // PAGE 3: Tensions & Growth
  // ==========================================

  doc.addPage();
  currentPage = 3;

  // Mini header
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, 210, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(t.tensions + " & " + t.growthAreas, 20, 13);

  yPos = 30;

  // Tensions
  if (spectrum.tensions.length > 0) {
    yPos = addSectionTitle(doc, t.tensions, yPos, "⚡");

    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(t.tensionIntro, 20, yPos);
    yPos += 8;

    spectrum.tensions.forEach((tension) => {
      doc.setFillColor(255, 253, 245);
      doc.setDrawColor(COLORS.warning[0], COLORS.warning[1], COLORS.warning[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(20, yPos, 170, 28, 3, 3, "FD");

      doc.setTextColor(COLORS.warning[0], COLORS.warning[1], COLORS.warning[2]);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      const dim1Label = DIMENSION_LABELS[tension.dimension1 as keyof SevenDimensions];
      const dim2Label = DIMENSION_LABELS[tension.dimension2 as keyof SevenDimensions];
      doc.text(`${data.language === 'fr' ? dim1Label.label : dim1Label.labelEn} ↔ ${data.language === 'fr' ? dim2Label.label : dim2Label.labelEn}`, 25, yPos + 7);

      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(tension.description.substring(0, 90), 25, yPos + 14);

      doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
      doc.setFont("helvetica", "italic");
      doc.text(`${t.suggestion}: ${tension.suggestion.substring(0, 80)}`, 25, yPos + 22);

      yPos += 32;
    });

    yPos += 5;
  }

  // Growth Areas
  if (spectrum.growthAreas.length > 0) {
    yPos = addSectionTitle(doc, t.growthAreas, yPos, "🌱");

    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(t.growthIntro, 20, yPos);
    yPos += 8;

    spectrum.growthAreas.forEach((area) => {
      if (yPos > 240) return;

      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(20, yPos, 170, 38, 3, 3, "FD");

      doc.setTextColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`🎯 ${area.area}`, 25, yPos + 8);

      doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`${t.currentState}: ${area.currentState.substring(0, 70)}`, 25, yPos + 16);
      doc.text(`${t.potential}: ${area.potentialGrowth.substring(0, 70)}`, 25, yPos + 23);

      doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      doc.setFont("helvetica", "bold");
      doc.text(`→ ${area.actionableStep.substring(0, 75)}`, 25, yPos + 32);

      yPos += 42;
    });
  }

  // Blind spots
  if (yPos < 230 && spectrum.interpretation.blindSpots.length > 0) {
    yPos += 5;
    yPos = addSectionTitle(doc, t.blindSpots, yPos, "👁️");

    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    spectrum.interpretation.blindSpots.forEach((blindSpot, i) => {
      if (yPos > 250) return;
      doc.text(`• ${blindSpot.substring(0, 90)}`, 25, yPos + i * 6);
    });
    yPos += spectrum.interpretation.blindSpots.length * 6 + 10;
  }

  // Thank you message
  if (yPos < 260) {
    doc.setDrawColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(t.thankYou, 20, yPos);
    yPos += 6;

    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.setFontSize(8);
    doc.text(t.dataProtection, 20, yPos);
  }

  addFooter(doc, t, currentPage, totalPages);

  return doc;
}

export function downloadPDFReport(data: ReportData): void {
  const doc = generatePDFReport(data);
  const filename = data.language === "fr"
    ? `rapport-ia-foi-${data.anonymousId.slice(0, 8)}.pdf`
    : `ai-faith-report-${data.anonymousId.slice(0, 8)}.pdf`;
  doc.save(filename);
}
