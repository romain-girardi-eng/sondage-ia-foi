import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import {
  PROFILE_DEFINITIONS,
  SUB_PROFILE_DEFINITIONS,
  DIMENSION_LABELS,
} from '@/lib/scoring/constants';
import type { SevenDimensions, ProfileSpectrum } from '@/lib/scoring/types';

// Register Open Sans fonts (TTF format required by react-pdf)
// Using Open Sans as it has good Unicode/international support
Font.register({
  family: 'OpenSans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 },
  ],
});

export interface ReportData {
  language: 'fr' | 'en';
  anonymousId: string;
  completedAt: string;
  answers: Record<string, string | string[] | number | Record<string, number>>;
  profile: {
    religiosityScore: number;
    iaComfortScore: number;
    theologicalOrientation: string;
  };
}

const translations = {
  fr: {
    title: 'Votre Profil Spirituel & IA',
    subtitle: 'Rapport Personnalisé - Grande Enquête 2026',
    generatedAt: 'Généré le',
    anonymousId: 'Identifiant anonyme',
    yourProfile: 'Votre Profil',
    subProfile: 'Sous-profil',
    matchScore: 'Correspondance',
    secondaryTendency: 'Tendance secondaire',
    sevenDimensions: 'Vos 7 Dimensions',
    dimensionsIntro: 'Votre positionnement sur les axes clés de l\'étude',
    interpretation: 'Interprétation',
    uniqueAspects: 'Ce qui vous caractérise',
    blindSpots: 'Points d\'attention',
    strengths: 'Vos forces',
    insights: 'Insights Personnalisés',
    tensions: 'Points de Tension',
    tensionIntro: 'Ces tensions internes peuvent être sources de croissance',
    growthAreas: 'Pistes de Développement',
    growthIntro: 'Suggestions pour enrichir votre réflexion',
    currentState: 'Situation actuelle',
    potential: 'Potentiel',
    action: 'Action suggérée',
    thankYou: 'Merci pour votre participation à cette grande enquête sur l\'IA et la foi.',
    dataProtection: 'Vos données sont protégées conformément au RGPD. Ce rapport est personnel et confidentiel.',
    footer: 'Sondage IA & Foi - Grande Enquête 2026',
    page: 'Page',
    of: 'sur',
  },
  en: {
    title: 'Your Spiritual & AI Profile',
    subtitle: 'Personalized Report - Major Survey 2026',
    generatedAt: 'Generated on',
    anonymousId: 'Anonymous ID',
    yourProfile: 'Your Profile',
    subProfile: 'Sub-profile',
    matchScore: 'Match',
    secondaryTendency: 'Secondary tendency',
    sevenDimensions: 'Your 7 Dimensions',
    dimensionsIntro: 'Your positioning on the key study axes',
    interpretation: 'Interpretation',
    uniqueAspects: 'What characterizes you',
    blindSpots: 'Points of attention',
    strengths: 'Your strengths',
    insights: 'Personalized Insights',
    tensions: 'Tension Points',
    tensionIntro: 'These internal tensions can be sources of growth',
    growthAreas: 'Growth Areas',
    growthIntro: 'Suggestions to enrich your reflection',
    currentState: 'Current situation',
    potential: 'Potential',
    action: 'Suggested action',
    thankYou: 'Thank you for participating in this major survey on AI and faith.',
    dataProtection: 'Your data is protected in accordance with GDPR. This report is personal and confidential.',
    footer: 'AI & Faith Survey - Major Survey 2026',
    page: 'Page',
    of: 'of',
  },
};

// Color palette
const colors = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  secondary: '#8b5cf6',
  accent: '#22c55e',
  warning: '#f59e0b',
  text: '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  background: '#f8fafc',
  white: '#ffffff',
  border: '#e2e8f0',
};

const dimensionColors: Record<keyof SevenDimensions, string> = {
  religiosity: '#6366f1',
  aiOpenness: '#10b981',
  sacredBoundary: '#f59e0b',
  ethicalConcern: '#ef4444',
  psychologicalPerception: '#8b5cf6',
  communityInfluence: '#3b82f6',
  futureOrientation: '#ec4899',
};

// Styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'OpenSans',
    fontSize: 10,
    paddingTop: 0,
    paddingBottom: 50,
    paddingHorizontal: 0,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 25,
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  headerMeta: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.75)',
  },
  content: {
    paddingHorizontal: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitleWithBg: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitleText: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.primary,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.primary,
    flex: 1,
  },
  matchBadge: {
    backgroundColor: colors.accent,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  matchBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 600,
  },
  profileDescription: {
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  profileMotivation: {
    fontSize: 9,
    color: colors.textMuted,
        marginTop: 4,
  },
  subProfileBox: {
    backgroundColor: colors.background,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  subProfileTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.secondary,
    marginBottom: 4,
  },
  subProfileDescription: {
    fontSize: 9,
    color: colors.text,
    lineHeight: 1.4,
  },
  secondaryText: {
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 16,
  },
  interpretationBox: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: 12,
    marginBottom: 16,
  },
  interpretationText: {
    fontSize: 10,
    color: colors.text,
    lineHeight: 1.5,
  },
  strengthsSection: {
    marginBottom: 16,
  },
  strengthsTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.accent,
    marginBottom: 6,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 8,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginRight: 8,
    marginTop: 4,
  },
  bulletText: {
    fontSize: 9,
    color: colors.text,
    flex: 1,
  },
  uniqueTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.secondary,
    marginBottom: 6,
  },
  // Dimensions page
  dimensionRow: {
    marginBottom: 18,
  },
  dimensionLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 4,
  },
  dimensionBarContainer: {
    height: 10,
    backgroundColor: colors.background,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 3,
  },
  dimensionBar: {
    height: '100%',
    borderRadius: 5,
  },
  dimensionScaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dimensionScaleText: {
    fontSize: 7,
    color: colors.textLight,
    maxWidth: '45%',
  },
  dimensionValue: {
    position: 'absolute',
    right: 4,
    top: 1,
    fontSize: 7,
    fontWeight: 600,
    color: colors.white,
  },
  // Insights
  insightCard: {
    backgroundColor: colors.background,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  insightTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.primary,
    marginBottom: 4,
  },
  insightMessage: {
    fontSize: 9,
    color: colors.text,
    lineHeight: 1.4,
  },
  // Tensions & Growth
  tensionCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  tensionHeader: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.warning,
    marginBottom: 4,
  },
  tensionDescription: {
    fontSize: 9,
    color: colors.text,
    marginBottom: 4,
  },
  tensionSuggestion: {
    fontSize: 8,
    color: colors.textMuted,
      },
  growthCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  growthTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.accent,
    marginBottom: 4,
  },
  growthDetail: {
    fontSize: 9,
    color: colors.text,
    marginBottom: 2,
  },
  growthAction: {
    fontSize: 9,
    fontWeight: 500,
    color: colors.primary,
    marginTop: 4,
  },
  blindSpotCard: {
    backgroundColor: colors.background,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: colors.white,
  },
  // Thank you
  thankYouSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    marginTop: 20,
  },
  thankYouText: {
    fontSize: 10,
    color: colors.text,
    marginBottom: 6,
  },
  dataProtectionText: {
    fontSize: 8,
    color: colors.textMuted,
  },
  // Page header (for pages 2+)
  miniHeader: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  miniHeaderTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.white,
  },
});

// Components
interface FooterProps {
  pageNum: number;
  totalPages: number;
  t: typeof translations.fr;
}

const Footer: React.FC<FooterProps> = ({ pageNum, totalPages, t }) => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText}>{t.footer}</Text>
    <Text style={styles.footerText}>
      {t.page} {pageNum} {t.of} {totalPages}
    </Text>
  </View>
);

interface DimensionBarProps {
  label: string;
  value: number;
  color: string;
  lowDesc: string;
  highDesc: string;
}

const DimensionBar: React.FC<DimensionBarProps> = ({ label, value, color, lowDesc, highDesc }) => (
  <View style={styles.dimensionRow}>
    <Text style={styles.dimensionLabel}>{label}</Text>
    <View style={styles.dimensionBarContainer}>
      <View style={[styles.dimensionBar, { width: `${(value / 5) * 100}%`, backgroundColor: color }]}>
        <Text style={styles.dimensionValue}>{value.toFixed(1)}</Text>
      </View>
    </View>
    <View style={styles.dimensionScaleRow}>
      <Text style={styles.dimensionScaleText}>{lowDesc}</Text>
      <Text style={styles.dimensionScaleText}>{highDesc}</Text>
    </View>
  </View>
);

interface ReportDocumentProps {
  data: ReportData;
  spectrum: ProfileSpectrum;
}

export const ReportDocument: React.FC<ReportDocumentProps> = ({ data, spectrum }) => {
  const t = translations[data.language];
  const primaryDef = PROFILE_DEFINITIONS[spectrum.primary.profile];
  const subDef = SUB_PROFILE_DEFINITIONS[spectrum.subProfile.subProfile];

  const dateStr = new Date(data.completedAt).toLocaleDateString(
    data.language === 'fr' ? 'fr-FR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const dimensionKeys: (keyof SevenDimensions)[] = [
    'religiosity', 'aiOpenness', 'sacredBoundary', 'ethicalConcern',
    'psychologicalPerception', 'communityInfluence', 'futureOrientation'
  ];

  return (
    <Document>
      {/* PAGE 1: Profile Overview */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
          <Text style={styles.headerMeta}>
            {t.generatedAt}: {dateStr} | {t.anonymousId}: {data.anonymousId.slice(0, 8)}...
          </Text>
        </View>

        <View style={styles.content}>
          {/* Section: Your Profile */}
          <View style={styles.sectionTitleWithBg}>
            <Text style={styles.sectionTitleText}>{t.yourProfile}</Text>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileTitle}>{primaryDef.title}</Text>
              <View style={styles.matchBadge}>
                <Text style={styles.matchBadgeText}>{spectrum.primary.matchScore}%</Text>
              </View>
            </View>
            <Text style={styles.profileDescription}>{primaryDef.shortDescription}</Text>
            <Text style={styles.profileMotivation}>« {primaryDef.coreMotivation} »</Text>
          </View>

          {/* Sub-profile */}
          <View style={styles.subProfileBox}>
            <Text style={styles.subProfileTitle}>{t.subProfile}: {subDef.title}</Text>
            <Text style={styles.subProfileDescription}>{subDef.description}</Text>
          </View>

          {/* Secondary tendency */}
          {spectrum.secondary && spectrum.secondary.matchScore >= 15 && (
            <Text style={styles.secondaryText}>
              {t.secondaryTendency}: {PROFILE_DEFINITIONS[spectrum.secondary.profile].title} ({spectrum.secondary.matchScore}%)
            </Text>
          )}

          {/* Interpretation */}
          <View style={styles.sectionTitleWithBg}>
            <Text style={styles.sectionTitleText}>{t.interpretation}</Text>
          </View>
          <View style={styles.interpretationBox}>
            <Text style={styles.interpretationText}>{spectrum.interpretation.narrative}</Text>
          </View>

          {/* Strengths */}
          <View style={styles.strengthsSection}>
            <Text style={styles.strengthsTitle}>{t.strengths}</Text>
            {spectrum.interpretation.strengths.slice(0, 3).map((strength, i) => (
              <View key={i} style={styles.bulletPoint}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{strength}</Text>
              </View>
            ))}
          </View>

          {/* Unique aspects */}
          {spectrum.interpretation.uniqueAspects.length > 0 && (
            <View style={styles.strengthsSection}>
              <Text style={styles.uniqueTitle}>{t.uniqueAspects}</Text>
              {spectrum.interpretation.uniqueAspects.slice(0, 2).map((aspect, i) => (
                <View key={i} style={styles.bulletPoint}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{aspect}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <Footer pageNum={1} totalPages={3} t={t} />
      </Page>

      {/* PAGE 2: Seven Dimensions */}
      <Page size="A4" style={styles.page}>
        <View style={styles.miniHeader}>
          <Text style={styles.miniHeaderTitle}>{t.sevenDimensions}</Text>
        </View>

        <View style={styles.content}>
          <Text style={{ fontSize: 9, color: colors.textMuted, marginBottom: 16 }}>
            {t.dimensionsIntro}
          </Text>

          {dimensionKeys.map((dimKey) => {
            const dim = spectrum.dimensions[dimKey];
            const label = DIMENSION_LABELS[dimKey];
            const color = dimensionColors[dimKey];
            return (
              <DimensionBar
                key={dimKey}
                label={data.language === 'fr' ? label.label : label.labelEn}
                value={dim.value}
                color={color}
                lowDesc={label.lowDescription}
                highDesc={label.highDescription}
              />
            );
          })}

          {/* Insights */}
          {spectrum.insights.length > 0 && (
            <>
              <View style={[styles.sectionTitleWithBg, { marginTop: 16 }]}>
                <Text style={styles.sectionTitleText}>{t.insights}</Text>
              </View>
              {spectrum.insights.slice(0, 3).map((insight, i) => (
                <View key={i} style={styles.insightCard}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightMessage}>{insight.message}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        <Footer pageNum={2} totalPages={3} t={t} />
      </Page>

      {/* PAGE 3: Tensions & Growth */}
      <Page size="A4" style={styles.page}>
        <View style={styles.miniHeader}>
          <Text style={styles.miniHeaderTitle}>{t.tensions} & {t.growthAreas}</Text>
        </View>

        <View style={styles.content}>
          {/* Tensions */}
          {spectrum.tensions.length > 0 && (
            <>
              <View style={styles.sectionTitleWithBg}>
                <Text style={styles.sectionTitleText}>{t.tensions}</Text>
              </View>
              <Text style={{ fontSize: 8, color: colors.textMuted, marginBottom: 10 }}>
                {t.tensionIntro}
              </Text>
              {spectrum.tensions.map((tension, i) => {
                const dim1Label = DIMENSION_LABELS[tension.dimension1 as keyof SevenDimensions];
                const dim2Label = DIMENSION_LABELS[tension.dimension2 as keyof SevenDimensions];
                return (
                  <View key={i} style={styles.tensionCard}>
                    <Text style={styles.tensionHeader}>
                      {data.language === 'fr' ? dim1Label.label : dim1Label.labelEn} ↔{' '}
                      {data.language === 'fr' ? dim2Label.label : dim2Label.labelEn}
                    </Text>
                    <Text style={styles.tensionDescription}>{tension.description}</Text>
                    <Text style={styles.tensionSuggestion}>→ {tension.suggestion}</Text>
                  </View>
                );
              })}
            </>
          )}

          {/* Growth Areas */}
          {spectrum.growthAreas.length > 0 && (
            <>
              <View style={[styles.sectionTitleWithBg, { marginTop: 12 }]}>
                <Text style={styles.sectionTitleText}>{t.growthAreas}</Text>
              </View>
              <Text style={{ fontSize: 8, color: colors.textMuted, marginBottom: 10 }}>
                {t.growthIntro}
              </Text>
              {spectrum.growthAreas.map((area, i) => (
                <View key={i} style={styles.growthCard}>
                  <Text style={styles.growthTitle}>{area.area}</Text>
                  <Text style={styles.growthDetail}>{t.currentState}: {area.currentState}</Text>
                  <Text style={styles.growthDetail}>{t.potential}: {area.potentialGrowth}</Text>
                  <Text style={styles.growthAction}>→ {area.actionableStep}</Text>
                </View>
              ))}
            </>
          )}

          {/* Blind spots */}
          {spectrum.interpretation.blindSpots.length > 0 && (
            <>
              <View style={[styles.sectionTitleWithBg, { marginTop: 12 }]}>
                <Text style={styles.sectionTitleText}>{t.blindSpots}</Text>
              </View>
              {spectrum.interpretation.blindSpots.map((spot, i) => (
                <View key={i} style={styles.blindSpotCard}>
                  <View style={styles.bulletPoint}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>{spot}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Thank you */}
          <View style={styles.thankYouSection}>
            <Text style={styles.thankYouText}>{t.thankYou}</Text>
            <Text style={styles.dataProtectionText}>{t.dataProtection}</Text>
          </View>
        </View>

        <Footer pageNum={3} totalPages={3} t={t} />
      </Page>
    </Document>
  );
};
