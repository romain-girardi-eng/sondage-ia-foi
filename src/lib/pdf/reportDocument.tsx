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
import type { DimensionKey, ProfileSpectrum, UsageGap } from '@/lib/scoring/types';
import { translations as uiStrings } from '@/lib/i18n/translations';

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
    /** null when the dimension could not be measured */
    religiosityScore: number | null;
    iaComfortScore: number | null;
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
    insights: 'Lectures de vos scores',
    tensions: 'Tensions observées',
    tensionIntro: 'Deux dimensions lues ensemble, sans jugement de valeur',
    growthAreas: 'Pistes de réflexion, si vous le souhaitez',
    growthIntro: 'Écarts observés entre deux dimensions, décrits sans recommandation',
    heuristicAttribution:
      'Attribution heuristique, non validée : le profil ci-dessous est une lecture indicative de vos réponses, pas un diagnostic.',
    noProfileTitle: 'Profil non attribuable : trop peu de dimensions mesurées',
    noProfileDescription:
      'Au moins quatre dimensions doivent être mesurées pour rapprocher vos réponses d\'un profil. Vos scores bruts par dimension sont indiqués page suivante.',
    measuredDimensions: 'Dimensions mesurées :',
    closeProfiles: 'Deux profils proches',
    closeProfilesDescription:
      'Vos réponses se situent à distance comparable de ces deux profils. Aucun des deux ne l\'emporte.',
    notMeasured: 'Non mesuré (trop peu de réponses)',
    comparisonNotIncluded:
      'Comparaison avec les autres participants non incluse dans ce rapport : elle est calculée en ligne, sur les réponses collectées à la date de consultation.',
    usageGap: 'Écart d\'usage',
    usageGapNote:
      'Comparaison entre l\'usage de l\'IA que vous déclarez en général et celui que vous déclarez dans le domaine spirituel ou ministériel.',
    usageGapNoUse: 'Aucun usage de l\'IA déclaré',
    usageGapGeneralOnly: 'Usage général déclaré, aucun usage spirituel déclaré',
    usageGapBoth: 'Usage déclaré dans les deux domaines',
    usageGapUnknown: 'Écart non calculable : la question sur l\'usage général est sans réponse',
    socialDesirability: 'Réserve de lecture',
    socialDesirabilityNote:
      'Vos réponses aux cinq énoncés vrai/faux suggèrent une tendance à répondre de façon socialement attendue ; votre profil est calculé sans correction, à lire avec cette réserve.',
    thankYou: 'Merci pour votre participation à cette grande enquête sur l\'IA et la foi.',
    dataProtection: 'Vos données sont protégées conformément au RGPD. Ce rapport est personnel et confidentiel.',
    footer: 'Sondage IA & Foi - Grande Enquête 2026',
    page: 'Page',
    of: 'sur',
    colon: ' :',
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
    insights: 'Readings of your scores',
    tensions: 'Observed tensions',
    tensionIntro: 'Two dimensions read together, with no value judgement',
    growthAreas: 'Points to reflect on, if you wish',
    growthIntro: 'Gaps observed between two dimensions, described without recommendation',
    heuristicAttribution:
      'Heuristic attribution, not validated: the profile below is an indicative reading of your answers, not a diagnosis.',
    noProfileTitle: 'No profile can be attributed: too few dimensions measured',
    noProfileDescription:
      'At least four dimensions must be measured before your answers can be matched to a profile. Your raw dimension scores are listed on the next page.',
    measuredDimensions: 'Dimensions measured:',
    closeProfiles: 'Two close profiles',
    closeProfilesDescription:
      'Your answers sit at a comparable distance from these two profiles. Neither one wins.',
    notMeasured: 'Not measured (too few answers)',
    comparisonNotIncluded:
      'Comparison with other participants is not included in this report: it is computed online, on the answers collected at the time of viewing.',
    usageGap: 'Usage gap',
    usageGapNote:
      'Comparison between the AI use you report in general and the use you report in the spiritual or ministry domain.',
    usageGapNoUse: 'No AI use reported',
    usageGapGeneralOnly: 'General use reported, no spiritual use reported',
    usageGapBoth: 'Use reported in both domains',
    usageGapUnknown: 'Gap cannot be computed: the general-use question was left unanswered',
    socialDesirability: 'Reading reservation',
    socialDesirabilityNote:
      'Your answers to the five true/false statements suggest a tendency to answer in a socially expected way; your profile is computed without correction and should be read with that reservation in mind.',
    thankYou: 'Thank you for participating in this major survey on AI and faith.',
    dataProtection: 'Your data is protected in accordance with GDPR. This report is personal and confidential.',
    footer: 'AI & Faith Survey - Major Survey 2026',
    page: 'Page',
    of: 'of',
    colon: ':',
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

const dimensionColors: Record<DimensionKey, string> = {
  religiosity: '#6366f1',
  aiOpenness: '#10b981',
  sacredBoundary: '#f59e0b',
  ethicalConcern: '#ef4444',
  psychologicalPerception: '#8b5cf6',
  communityContext: '#3b82f6',
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
  disclaimerBox: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    padding: 10,
    marginBottom: 12,
  },
  disclaimerText: {
    fontSize: 9,
    color: colors.text,
    lineHeight: 1.4,
  },
  notMeasuredText: {
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 8,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 1.4,
  },
  usageGapBox: {
    backgroundColor: colors.background,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  usageGapValue: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 4,
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
  /** null when fewer items than the dimension minimum were answered */
  value: number | null;
  color: string;
  lowDesc: string;
  highDesc: string;
  notMeasuredLabel: string;
}

const DimensionBar: React.FC<DimensionBarProps> = ({
  label,
  value,
  color,
  lowDesc,
  highDesc,
  notMeasuredLabel,
}) => (
  <View style={styles.dimensionRow}>
    <Text style={styles.dimensionLabel}>{label}</Text>
    {value === null ? (
      <Text style={styles.notMeasuredText}>{notMeasuredLabel}</Text>
    ) : (
      <>
        <View style={styles.dimensionBarContainer}>
          <View style={[styles.dimensionBar, { width: `${(value / 5) * 100}%`, backgroundColor: color }]}>
            <Text style={styles.dimensionValue}>{value.toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.dimensionScaleRow}>
          <Text style={styles.dimensionScaleText}>{lowDesc}</Text>
          <Text style={styles.dimensionScaleText}>{highDesc}</Text>
        </View>
      </>
    )}
  </View>
);

interface ReportDocumentProps {
  data: ReportData;
  spectrum: ProfileSpectrum;
}

const USAGE_GAP_LABEL_KEYS: Record<UsageGap, 'usageGapNoUse' | 'usageGapGeneralOnly' | 'usageGapBoth' | 'usageGapUnknown'> = {
  no_use: 'usageGapNoUse',
  uses_general_not_spiritual: 'usageGapGeneralOnly',
  uses_both: 'usageGapBoth',
  none: 'usageGapUnknown',
};

/** Raw match score, rounded only for display (docs/SCORING_V2_SPEC.md §1.5). */
function formatMatch(language: ReportData['language'], score: number): string {
  const rounded = Math.round(score);
  return language === 'fr' ? `correspondance ${rounded} / 100` : `match ${rounded} / 100`;
}

/** Resolve a scoring i18n key (growth areas, tensions) to its displayed text. */
function uiString(
  language: ReportData['language'],
  group: 'growthAreas' | 'tensions',
  key: string,
): string {
  const entries = uiStrings[language][group] as Record<string, string>;
  return entries[key] ?? key;
}

export const ReportDocument: React.FC<ReportDocumentProps> = ({ data, spectrum }) => {
  const t = translations[data.language];
  const primary = spectrum.primary;
  const primaryDef = primary ? PROFILE_DEFINITIONS[primary.profile] : null;
  const subDef = spectrum.subProfile
    ? SUB_PROFILE_DEFINITIONS[spectrum.subProfile.subProfile]
    : null;
  const interpretation = spectrum.interpretation;
  const runnerUp = spectrum.allMatches[1] ?? null;
  const isCloseCall = primary !== null && spectrum.profileConfidence === 'low';

  const dateStr = new Date(data.completedAt).toLocaleDateString(
    data.language === 'fr' ? 'fr-FR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const dimensionKeys: DimensionKey[] = [
    'religiosity', 'aiOpenness', 'sacredBoundary', 'ethicalConcern',
    'psychologicalPerception', 'communityContext', 'futureOrientation'
  ];

  const measuredDimensions = dimensionKeys.filter(
    (key) => spectrum.dimensions[key].value !== null
  ).length;

  return (
    <Document>
      {/* PAGE 1: Profile Overview */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
          <Text style={styles.headerMeta}>
            {t.generatedAt}{t.colon} {dateStr} | {t.anonymousId}{t.colon} {data.anonymousId.slice(0, 8)}...
          </Text>
        </View>

        <View style={styles.content}>
          {/* Section: Your Profile */}
          <View style={styles.sectionTitleWithBg}>
            <Text style={styles.sectionTitleText}>{t.yourProfile}</Text>
          </View>

          {/* Attribution caveat, above the profile name */}
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>{t.heuristicAttribution}</Text>
          </View>

          {primary && primaryDef ? (
            <>
              <View style={styles.profileCard}>
                <View style={styles.profileHeader}>
                  <Text style={styles.profileTitle}>{primaryDef.title}</Text>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchBadgeText}>
                      {formatMatch(data.language, primary.matchScore)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.profileDescription}>{primaryDef.shortDescription}</Text>
                <Text style={styles.profileMotivation}>« {primaryDef.coreMotivation} »</Text>
              </View>

              {/* Low confidence: the runner-up is shown beside the primary, not below it */}
              {isCloseCall && runnerUp && (
                <View style={styles.profileCard}>
                  <View style={styles.profileHeader}>
                    <Text style={styles.profileTitle}>
                      {PROFILE_DEFINITIONS[runnerUp.profile].title}
                    </Text>
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchBadgeText}>
                        {formatMatch(data.language, runnerUp.matchScore)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.profileDescription}>{t.closeProfilesDescription}</Text>
                </View>
              )}

              {/* Sub-profile */}
              {subDef && (
                <View style={styles.subProfileBox}>
                  <Text style={styles.subProfileTitle}>{t.subProfile}{t.colon} {subDef.title}</Text>
                  <Text style={styles.subProfileDescription}>{subDef.description}</Text>
                </View>
              )}

              {/* Secondary tendency */}
              {!isCloseCall && spectrum.secondary && spectrum.secondary.matchScore >= 15 && (
                <Text style={styles.secondaryText}>
                  {t.secondaryTendency}{t.colon} {PROFILE_DEFINITIONS[spectrum.secondary.profile].title} ({formatMatch(data.language, spectrum.secondary.matchScore)})
                </Text>
              )}

              {interpretation && (
                <>
                  {/* Interpretation */}
                  <View style={styles.sectionTitleWithBg}>
                    <Text style={styles.sectionTitleText}>{t.interpretation}</Text>
                  </View>
                  <View style={styles.interpretationBox}>
                    <Text style={styles.interpretationText}>{interpretation.narrative}</Text>
                  </View>

                  {/* Strengths */}
                  <View style={styles.strengthsSection}>
                    <Text style={styles.strengthsTitle}>{t.strengths}</Text>
                    {interpretation.strengths.slice(0, 3).map((strength, i) => (
                      <View key={i} style={styles.bulletPoint}>
                        <View style={styles.bullet} />
                        <Text style={styles.bulletText}>{strength}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Unique aspects */}
                  {interpretation.uniqueAspects.length > 0 && (
                    <View style={styles.strengthsSection}>
                      <Text style={styles.uniqueTitle}>{t.uniqueAspects}</Text>
                      {interpretation.uniqueAspects.slice(0, 2).map((aspect, i) => (
                        <View key={i} style={styles.bulletPoint}>
                          <View style={styles.bullet} />
                          <Text style={styles.bulletText}>{aspect}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </>
          ) : (
            <View style={styles.profileCard}>
              <Text style={styles.profileTitle}>{t.noProfileTitle}</Text>
              <Text style={styles.profileDescription}>{t.noProfileDescription}</Text>
              <Text style={styles.profileDescription}>
                {t.measuredDimensions} {measuredDimensions} / 7
              </Text>
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
          <Text style={{ fontSize: 9, color: colors.textMuted, marginBottom: 8 }}>
            {t.dimensionsIntro}
          </Text>
          {/* The empirical rank lives online only: no norms are fetched here. */}
          <Text style={styles.noteText}>{t.comparisonNotIncluded}</Text>

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
                notMeasuredLabel={t.notMeasured}
              />
            );
          })}

          {/* Usage gap (replaces the former spiritual resistance index) */}
          <View style={[styles.sectionTitleWithBg, { marginTop: 16 }]}>
            <Text style={styles.sectionTitleText}>{t.usageGap}</Text>
          </View>
          <View style={styles.usageGapBox}>
            <Text style={styles.usageGapValue}>{t[USAGE_GAP_LABEL_KEYS[spectrum.usageGap]]}</Text>
            <Text style={styles.noteText}>{t.usageGapNote}</Text>
          </View>

          {/* Social desirability: a reservation, never a score */}
          {spectrum.socialDesirability.flag && (
            <>
              <View style={styles.sectionTitleWithBg}>
                <Text style={styles.sectionTitleText}>{t.socialDesirability}</Text>
              </View>
              <Text style={styles.noteText}>{t.socialDesirabilityNote}</Text>
            </>
          )}

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
                const dim1Label = DIMENSION_LABELS[tension.dimension1];
                const dim2Label = DIMENSION_LABELS[tension.dimension2];
                return (
                  <View key={i} style={styles.tensionCard}>
                    <Text style={styles.tensionHeader}>
                      {data.language === 'fr' ? dim1Label.label : dim1Label.labelEn} /{' '}
                      {data.language === 'fr' ? dim2Label.label : dim2Label.labelEn}
                    </Text>
                    <Text style={styles.tensionDescription}>
                      {uiString(data.language, 'tensions', tension.description)}
                    </Text>
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
                  <Text style={styles.growthTitle}>
                    {uiString(data.language, 'growthAreas', area.area)}
                  </Text>
                  <Text style={styles.growthDetail}>
                    {uiString(data.language, 'growthAreas', area.actionableStep)}
                  </Text>
                </View>
              ))}
            </>
          )}

          {/* Blind spots */}
          {interpretation && interpretation.blindSpots.length > 0 && (
            <>
              <View style={[styles.sectionTitleWithBg, { marginTop: 12 }]}>
                <Text style={styles.sectionTitleText}>{t.blindSpots}</Text>
              </View>
              {interpretation.blindSpots.map((spot, i) => (
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
