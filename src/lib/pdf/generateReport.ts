import { jsPDF } from "jspdf";

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
    title: "Rapport Personnel",
    subtitle: "IA & Vie Spirituelle - Étude 2026",
    generatedAt: "Généré le",
    anonymousId: "Identifiant anonyme",
    profileSummary: "Résumé de votre profil",
    religiosityScore: "Score de religiosité (CRS-5)",
    iaComfortScore: "Confort avec l'IA",
    theologicalOrientation: "Orientation théologique",
    yourAnswers: "Vos réponses",
    thankYou: "Merci pour votre participation à cette étude académique.",
    dataProtection: "Vos données sont protégées conformément au RGPD.",
    footer: "Sondage IA & Foi - Recherche Académique 2026",
  },
  en: {
    title: "Personal Report",
    subtitle: "AI & Spiritual Life - Study 2026",
    generatedAt: "Generated on",
    anonymousId: "Anonymous ID",
    profileSummary: "Your Profile Summary",
    religiosityScore: "Religiosity Score (CRS-5)",
    iaComfortScore: "AI Comfort Level",
    theologicalOrientation: "Theological Orientation",
    yourAnswers: "Your Answers",
    thankYou: "Thank you for participating in this academic study.",
    dataProtection: "Your data is protected in accordance with GDPR.",
    footer: "AI & Faith Survey - Academic Research 2026",
  },
};

export function generatePDFReport(data: ReportData): jsPDF {
  const t = translations[data.language];
  const doc = new jsPDF();

  // Colors
  const primaryColor: [number, number, number] = [59, 130, 246]; // Blue
  const textColor: [number, number, number] = [30, 41, 59]; // Slate-800
  const mutedColor: [number, number, number] = [100, 116, 139]; // Slate-500

  let yPos = 20;

  // Header background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 45, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(t.title, 20, yPos + 5);

  // Subtitle
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(t.subtitle, 20, yPos + 15);

  // Generated date
  doc.setFontSize(10);
  const dateStr = new Date(data.completedAt).toLocaleDateString(data.language === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`${t.generatedAt}: ${dateStr}`, 20, yPos + 25);

  yPos = 55;

  // Anonymous ID
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setFontSize(9);
  doc.text(`${t.anonymousId}: ${data.anonymousId}`, 20, yPos);

  yPos += 15;

  // Profile Summary Section
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(t.profileSummary, 20, yPos);

  yPos += 10;

  // Draw profile cards
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.roundedRect(20, yPos, 55, 30, 3, 3, "F");
  doc.roundedRect(80, yPos, 55, 30, 3, 3, "F");
  doc.roundedRect(140, yPos, 55, 30, 3, 3, "F");

  // Religiosity Score
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text(t.religiosityScore, 25, yPos + 8);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${data.profile.religiosityScore}/5`, 25, yPos + 22);

  // IA Comfort Score
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text(t.iaComfortScore, 85, yPos + 8);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(34, 197, 94); // Green
  doc.text(`${data.profile.iaComfortScore}/5`, 85, yPos + 22);

  // Theological Orientation
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text(t.theologicalOrientation, 145, yPos + 8);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(168, 85, 247); // Purple
  doc.text(data.profile.theologicalOrientation, 145, yPos + 22);

  yPos += 45;

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);

  yPos += 15;

  // Thank you message
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(t.thankYou, 20, yPos);

  yPos += 8;
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setFontSize(9);
  doc.text(t.dataProtection, 20, yPos);

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, pageHeight - 15, 210, 15, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(t.footer, 105, pageHeight - 5, { align: "center" });

  return doc;
}

export function downloadPDFReport(data: ReportData): void {
  const doc = generatePDFReport(data);
  const filename = `rapport-sondage-ia-${data.anonymousId.slice(0, 8)}.pdf`;
  doc.save(filename);
}
