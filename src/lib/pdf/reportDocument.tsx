import React from 'react';
import {
  Circle,
  Document,
  Font,
  Image,
  Line,
  Link,
  Page,
  Polygon,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View,
} from '@react-pdf/renderer';
import {
  DIMENSION_LABELS,
  PROFILE_DEFINITIONS,
  SUB_PROFILE_DEFINITIONS,
} from '@/lib/scoring/constants';
import type { DimensionKey, ProfileSpectrum, UsageGap } from '@/lib/scoring/types';
import { translations as uiStrings } from '@/lib/i18n/translations';

// Fonts and logos ship with the app (next.config.ts traces them into the route).
const ROOT = process.cwd();
const FONTS = `${ROOT}/src/lib/pdf/assets/fonts`;

Font.register({
  family: 'Inter',
  fonts: [
    { src: `${FONTS}/Inter-400.ttf`, fontWeight: 400 },
    { src: `${FONTS}/Inter-500.ttf`, fontWeight: 500 },
    { src: `${FONTS}/Inter-600.ttf`, fontWeight: 600 },
    { src: `${FONTS}/Inter-700.ttf`, fontWeight: 700 },
  ],
});
Font.register({
  family: 'SourceSerif',
  fonts: [
    { src: `${FONTS}/SourceSerif4-600.ttf`, fontWeight: 600 },
    { src: `${FONTS}/SourceSerif4-400i.ttf`, fontWeight: 400, fontStyle: 'italic' },
  ],
});
// The default hyphenation is English: it cuts French words in the wrong places.
Font.registerHyphenationCallback((word) => [word]);

export type ReportVariant = 'general' | 'cnef';

export interface ReportData {
  language: 'fr' | 'en';
  /** Entry point of the respondent: "cnef" carries the CNEF branding. */
  variant?: ReportVariant;
  anonymousId: string;
  completedAt: string;
  answers: Record<string, unknown>;
}

const AUTHOR = 'Romain Girardi';
const SITE = 'https://ia-foi.fr';
const TECH_FOI_URL = 'https://www.lecnef.org/page/4147098-tech-foi';

const INK = '#1C1A1B';
const BODY = '#3A3638';
const MUTED = '#6F696C';
const LINE = '#E6E2E0';

const THEMES = {
  cnef: {
    accent: '#C92128',
    bright: '#F14623',
    second: '#B01573',
    deep: '#9E1E5A',
    tint: '#FEF3EF',
    band: '#FBD9CC',
    logo: `${ROOT}/public/cnef-logo.png`,
    logoWidth: 62,
    logoHeight: 66,
    path: '/cnef',
  },
  general: {
    accent: '#2563EB',
    bright: '#60A5FA',
    second: '#7C3AED',
    deep: '#1E3A8A',
    tint: '#F1F5FF',
    band: '#D3E2FF',
    logo: `${ROOT}/public/logo.png`,
    logoWidth: 54,
    logoHeight: 54,
    path: '',
  },
} as const;

const COPY = {
  fr: {
    documentTitle: 'Votre rapport personnel',
    overline: 'Rapport personnel',
    generalBrand: 'IA & Foi',
    yourProfile: 'Votre profil',
    closeProfiles: 'Deux profils proches',
    closeProfilesNote: 'Vos réponses se situent à distance comparable de ces deux profils. Aucun des deux ne l\'emporte.',
    inBrief: 'Ce profil, en bref :',
    match: (score: number) => `correspondance ${score} / 100`,
    matchNote: 'La correspondance mesure la proximité de vos scores avec les plages du profil. Ce n\'est pas un degré de certitude.',
    heuristic: 'Attribution heuristique, non validée : ce profil est une lecture indicative de vos réponses, pas un diagnostic.',
    noProfileTitle: 'Profil non attribuable',
    noProfileNote: (n: number) => `Il faut au moins quatre dimensions mesurées pour rapprocher vos réponses d'un profil. ${n} sur 7 l'ont été. Vos scores sont détaillés plus loin.`,
    usageGap: 'Écart d\'usage',
    outOf: '/ 5',
    notMeasured: 'Non mesuré',
    generatedOn: 'Rapport établi le',
    identifier: 'Identifiant anonyme',
    pageOf: (page: number, total: number) => `Page ${page} sur ${total}`,
    signature: `Enquête conçue et analysée par ${AUTHOR}`,
    runningTitle: 'Rapport personnel',
    readingTitle: 'Ce que vos réponses dessinent',
    subProfile: 'Sous-profil',
    standsOut: 'Ce qui ressort',
    distinguishes: 'Ce qui distingue vos réponses',
    dimensionsTitle: 'Vos sept dimensions',
    dimensionsIntro: (name: string | null) => name
      ? `Chaque point situe votre score sur une échelle de 1 à 5. La bande colorée montre la plage retenue pour le profil « ${name} » : elle a été fixée par jugement, pas calculée sur des données.`
      : 'Chaque point situe votre score sur une échelle de 1 à 5.',
    legendScore: 'Votre score',
    legendBand: 'Plage du profil',
    comparison: 'Ce rapport ne vous compare pas aux autres participants : ce rang se calcule en ligne, à partir de 30 participants, sur les réponses collectées à ce moment-là.',
    usageGapNote: 'Comparaison entre l\'usage de l\'IA que vous déclarez en général et celui que vous déclarez dans le domaine spirituel ou ministériel.',
    usageGapLabels: {
      no_use: 'Aucun usage de l\'IA déclaré',
      uses_general_not_spiritual: 'Usage général déclaré, aucun usage spirituel déclaré',
      uses_both: 'Usage déclaré dans les deux domaines',
      none: 'Écart non calculable : la question sur l\'usage général est restée sans réponse',
    } satisfies Record<UsageGap, string>,
    insights: 'Lectures de vos scores',
    tensions: 'Tensions observées',
    tensionsIntro: 'Deux dimensions lues ensemble, sans jugement de valeur.',
    growth: 'Pistes de réflexion, si vous le souhaitez',
    growthIntro: 'Écarts observés entre deux dimensions, décrits sans recommandation.',
    attention: 'Points d\'attention',
    desirability: 'Réserve de lecture',
    desirabilityNote: 'Vos réponses aux cinq énoncés vrai/faux suggèrent une tendance à répondre de façon socialement attendue. Votre profil est calculé sans correction : lisez-le avec cette réserve en tête.',
    howToReadTitle: 'Comment lire ce rapport',
    yourData: 'Vos données',
    dataNote: 'Vos réponses sont pseudonymisées et ce rapport est personnel. Votre identifiant vous permet de consulter, d\'exporter ou de supprimer vos réponses à tout moment :',
    cnefNote: 'Le CNEF reçoit uniquement des résultats agrégés et anonymes.',
    techFoiBefore: 'Le mouvement ',
    techFoiAfter: ' publiera les conclusions de cette enquête début 2027.',
    methodology: 'Méthode complète :',
    thanks: 'Merci pour votre participation.',
  },
  en: {
    documentTitle: 'Your personal report',
    overline: 'Personal report',
    generalBrand: 'AI & Faith',
    yourProfile: 'Your profile',
    closeProfiles: 'Two close profiles',
    closeProfilesNote: 'Your answers sit at a comparable distance from these two profiles. Neither one wins.',
    inBrief: 'This profile, in brief:',
    match: (score: number) => `match ${score} / 100`,
    matchNote: 'The match measures how close your scores are to the profile\'s ranges. It is not a degree of certainty.',
    heuristic: 'Heuristic attribution, not validated: this profile is an indicative reading of your answers, not a diagnosis.',
    noProfileTitle: 'No profile can be attributed',
    noProfileNote: (n: number) => `At least four measured dimensions are needed to match your answers to a profile. ${n} of 7 were measured. Your scores are detailed further on.`,
    usageGap: 'Usage gap',
    outOf: '/ 5',
    notMeasured: 'Not measured',
    generatedOn: 'Report issued on',
    identifier: 'Anonymous ID',
    pageOf: (page: number, total: number) => `Page ${page} of ${total}`,
    signature: `Survey designed and analysed by ${AUTHOR}`,
    runningTitle: 'Personal report',
    readingTitle: 'What your answers outline',
    subProfile: 'Sub-profile',
    standsOut: 'What stands out',
    distinguishes: 'What sets your answers apart',
    dimensionsTitle: 'Your seven dimensions',
    dimensionsIntro: (name: string | null) => name
      ? `Each dot places your score on a scale from 1 to 5. The coloured band shows the range set for the "${name}" profile: it was set by judgement, not computed from data.`
      : 'Each dot places your score on a scale from 1 to 5.',
    legendScore: 'Your score',
    legendBand: 'Profile range',
    comparison: 'This report does not compare you with other participants: that rank is computed online, from 30 participants onwards, on the answers collected at that moment.',
    usageGapNote: 'Comparison between the AI use you report in general and the use you report in the spiritual or ministry domain.',
    usageGapLabels: {
      no_use: 'No AI use reported',
      uses_general_not_spiritual: 'General use reported, no spiritual use reported',
      uses_both: 'Use reported in both domains',
      none: 'Gap cannot be computed: the general-use question was left unanswered',
    } satisfies Record<UsageGap, string>,
    insights: 'Readings of your scores',
    tensions: 'Observed tensions',
    tensionsIntro: 'Two dimensions read together, with no value judgement.',
    growth: 'Points to reflect on, if you wish',
    growthIntro: 'Gaps observed between two dimensions, described without recommendation.',
    attention: 'Points of attention',
    desirability: 'Reading reservation',
    desirabilityNote: 'Your answers to the five true/false statements suggest a tendency to answer in a socially expected way. Your profile is computed without correction: read it with that reservation in mind.',
    howToReadTitle: 'How to read this report',
    yourData: 'Your data',
    dataNote: 'Your answers are pseudonymised and this report is personal. Your ID lets you view, export or delete your answers at any time:',
    cnefNote: 'The CNEF only receives aggregated, anonymous results.',
    techFoiBefore: 'The ',
    techFoiAfter: ' movement will publish the conclusions of this survey in early 2027.',
    methodology: 'Full method:',
    thanks: 'Thank you for taking part.',
  },
};

/** Fallbacks of the scoring module: true, but nothing a reader can use. */
const NOT_INFORMATIVE = new Set([
  'Aucune combinaison de dimensions ne se détache nettement',
  'Aucun écart notable entre les dimensions',
]);
const informative = (items: string[]) => items.filter((item) => !NOT_INFORMATIVE.has(item));

const DIMENSION_KEYS: DimensionKey[] = [
  'religiosity', 'aiOpenness', 'sacredBoundary', 'ethicalConcern',
  'psychologicalPerception', 'communityContext', 'futureOrientation',
];

/** French spacing rules, applied to every string, including those of the scoring module. */
function frenchSpacing(text: string): string {
  return text
    .replace(/ ([;?!])/g, ' $1')
    .replace(/ :/g, ' :')
    .replace(/« /g, '« ')
    .replace(/ »/g, ' »');
}

const styles = StyleSheet.create({
  page: { fontFamily: 'Inter', fontSize: 9.5, color: BODY, paddingTop: 76, paddingBottom: 66, paddingHorizontal: 50 },
  coverPage: { fontFamily: 'Inter', fontSize: 9.5, color: BODY, paddingTop: 50, paddingBottom: 40, paddingHorizontal: 50 },
  overline: { fontSize: 8, fontWeight: 600, letterSpacing: 1.4, textTransform: 'uppercase' },
  surveyTitle: { fontFamily: 'SourceSerif', fontWeight: 600, fontSize: 17, lineHeight: 1.25, color: INK, marginTop: 6 },
  profileName: { fontFamily: 'SourceSerif', fontWeight: 600, color: INK, lineHeight: 1.1 },
  motivation: { fontFamily: 'SourceSerif', fontStyle: 'italic', fontWeight: 400, fontSize: 13, lineHeight: 1.4, color: BODY },
  sectionTitle: { fontFamily: 'SourceSerif', fontWeight: 600, fontSize: 21, lineHeight: 1.2, color: INK, marginBottom: 14 },
  subTitle: { fontWeight: 600, fontSize: 10.5, color: INK, marginBottom: 5 },
  lead: { fontSize: 10.5, lineHeight: 1.65, color: BODY },
  small: { fontSize: 8, lineHeight: 1.45, color: MUTED },
  statValue: { fontFamily: 'SourceSerif', fontWeight: 600, fontSize: 30, lineHeight: 1, color: INK },
  statUnit: { fontSize: 9, color: MUTED },
  statLabel: { fontSize: 8.5, fontWeight: 500, color: BODY },
  card: { paddingVertical: 9, paddingLeft: 11, paddingRight: 8, borderLeftWidth: 2, marginBottom: 8 },
  cardTitle: { fontWeight: 600, fontSize: 9.5, color: INK, marginBottom: 2 },
  bullet: { flexDirection: 'row', marginBottom: 4 },
  bulletDot: { width: 3.5, height: 3.5, borderRadius: 2, marginTop: 5, marginRight: 7 },
  bulletText: { flex: 1 },
  // On a wrapper, not on the Page: an inherited lineHeight makes react-pdf drop the dynamic page number.
  flow: { fontSize: 9.5, lineHeight: 1.5 },
  footerRule: { position: 'absolute', left: 50, right: 50, bottom: 40, height: 0.5, backgroundColor: LINE },
  footerText: { position: 'absolute', bottom: 26, fontFamily: 'Inter', fontWeight: 400, fontSize: 7, color: MUTED },
  header: { position: 'absolute', top: 26, left: 50, right: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 7, borderBottomWidth: 0.5, borderBottomColor: LINE },
  headerBrand: { flexDirection: 'row', alignItems: 'center' },
  headerLogo: { height: 18, marginRight: 7, objectFit: 'contain' },
  headerText: { fontSize: 7.5, color: MUTED },
  dimensionRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: LINE },
  dimensionText: { width: 182, paddingRight: 12 },
  dimensionName: { fontWeight: 600, fontSize: 9.5, color: INK },
  dimensionValue: { width: 38, textAlign: 'right', fontWeight: 700, fontSize: 12, color: INK, lineHeight: 1.3 },
  axisEnds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2, paddingHorizontal: 2 },
  axisEnd: { fontSize: 6.8, lineHeight: 1.25, color: MUTED, maxWidth: 110 },
  link: { color: INK, textDecoration: 'underline' },
});

const AXIS_WIDTH = 245;
const AXIS_PAD = 8;
const axisX = (value: number) => AXIS_PAD + ((value - 1) / 4) * (AXIS_WIDTH - 2 * AXIS_PAD);

function DimensionAxis({ value, range, accent, band }: {
  value: number | null;
  range: readonly [number, number] | null;
  accent: string;
  band: string;
}) {
  return (
    <Svg width={AXIS_WIDTH} height={22}>
      {range && (
        <Rect x={axisX(range[0])} y={5} width={axisX(range[1]) - axisX(range[0])} height={12} rx={3} ry={3} fill={band} />
      )}
      <Line x1={axisX(1)} y1={11} x2={axisX(5)} y2={11} stroke="#BDB7B4" strokeWidth={0.75} />
      {[1, 2, 3, 4, 5].map((tick) => (
        <Line key={tick} x1={axisX(tick)} y1={8.5} x2={axisX(tick)} y2={13.5} stroke="#BDB7B4" strokeWidth={0.75} />
      ))}
      {value !== null && <Circle cx={axisX(value)} cy={11} r={5.5} fill={accent} stroke="#FFFFFF" strokeWidth={1.8} />}
    </Svg>
  );
}

export function ReportDocument({ data, spectrum }: { data: ReportData; spectrum: ProfileSpectrum }) {
  const lang = data.language;
  const isCnef = data.variant === 'cnef';
  const theme = THEMES[isCnef ? 'cnef' : 'general'];
  const c = COPY[lang];
  const ui = uiStrings[lang];
  const tx = (text: string) => (lang === 'fr' ? frenchSpacing(text) : text);

  const surveyTitle = isCnef ? ui.cnef.title : ui.intro.title;
  const primary = spectrum.primary;
  const primaryDef = primary ? PROFILE_DEFINITIONS[primary.profile] : null;
  const runnerUp = spectrum.allMatches[1] ?? null;
  const isCloseCall = primary !== null && runnerUp !== null && spectrum.profileConfidence === 'low';
  const subDef = spectrum.subProfile ? SUB_PROFILE_DEFINITIONS[spectrum.subProfile.subProfile] : null;
  const interpretation = spectrum.interpretation;
  const narrative = interpretation ? interpretation.narrative.replace(subDef?.description ?? '', '').trim() : '';
  const uniqueAspects = informative(interpretation?.uniqueAspects ?? []);
  const blindSpots = informative(interpretation?.blindSpots ?? []);
  const measured = DIMENSION_KEYS.filter((key) => spectrum.dimensions[key].value !== null).length;

  const number = (value: number) => (lang === 'fr' ? value.toFixed(1).replace('.', ',') : value.toFixed(1));
  const date = new Date(data.completedAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const dateText = lang === 'fr' ? date.replace(/^1 /, '1er ') : date;
  const dimensionName = (key: DimensionKey) => (lang === 'fr' ? DIMENSION_LABELS[key].label : DIMENSION_LABELS[key].labelEn);

  const inBrief = (description: string) => tx(`${c.inBrief} ${description.charAt(0).toLowerCase()}${description.slice(1)}`);

  const statTile = (key: DimensionKey) => {
    const value = spectrum.dimensions[key].value;
    return (
      <View style={{ flex: 1, paddingRight: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 5 }}>
          {value === null ? (
            <Text style={[styles.statLabel, { color: MUTED }]}>{c.notMeasured}</Text>
          ) : (
            <>
              <Text style={styles.statValue}>{number(value)}</Text>
              <Text style={[styles.statUnit, { marginLeft: 3, marginBottom: 2 }]}>{c.outOf}</Text>
            </>
          )}
        </View>
        <Text style={styles.statLabel}>{dimensionName(key)}</Text>
      </View>
    );
  };

  const bullets = (items: string[]) => items.map((item, i) => (
    <View key={i} style={styles.bullet}>
      <View style={[styles.bulletDot, { backgroundColor: theme.accent }]} />
      <Text style={styles.bulletText}>{tx(item)}</Text>
    </View>
  ));

  const footer = (
    <>
      <View style={styles.footerRule} fixed />
      <Text style={[styles.footerText, { left: 50 }]} fixed>{c.signature}</Text>
      <Text style={[styles.footerText, { left: 300, right: 50, textAlign: 'right' }]} fixed render={({ pageNumber, totalPages }) => c.pageOf(pageNumber, totalPages)} />
    </>
  );

  const sharedChrome = (
    <>
      <View style={styles.header} fixed>
        <View style={styles.headerBrand}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
          <Image src={theme.logo} style={[styles.headerLogo, { width: (18 * theme.logoWidth) / theme.logoHeight }]} />
          <Text style={styles.headerText}>{tx(surveyTitle)}</Text>
        </View>
        <Text style={styles.headerText}>{c.runningTitle}</Text>
      </View>
      {footer}
    </>
  );

  return (
    <Document title={`${c.documentTitle} · ${surveyTitle}`} author={AUTHOR} subject={surveyTitle} creator={AUTHOR} producer={AUTHOR} language={lang}>
      {/* Cover */}
      <Page size="A4" style={styles.coverPage}>
        <Svg width={300} height={300} style={{ position: 'absolute', top: 0, right: 0 }}>
          <Polygon points="118,0 300,0 300,138 132,156" fill={theme.bright} fillOpacity={0.92} />
          <Polygon points="196,0 300,0 300,62 206,54" fill={theme.second} fillOpacity={0.9} />
          <Polygon points="166,58 262,48 276,214 182,226" fill={theme.accent} fillOpacity={0.82} />
          <Polygon points="238,112 300,104 300,180 246,188" fill={theme.deep} fillOpacity={0.82} />
        </Svg>

        <View style={styles.flow}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
        <Image src={theme.logo} style={{ width: theme.logoWidth, height: theme.logoHeight, marginBottom: 8 }} />
        <Text style={{ fontSize: 8.5, fontWeight: 500, color: INK }}>
          {isCnef ? tx(ui.cnef.partnership) : c.generalBrand}
        </Text>

        <View style={{ marginTop: 112, width: 400 }}>
          <Text style={[styles.overline, { color: theme.accent }]}>{c.overline}</Text>
          <Text style={styles.surveyTitle}>{tx(surveyTitle)}</Text>
        </View>

        <View style={{ marginTop: 60 }}>
          <Text style={[styles.overline, { color: MUTED, marginBottom: 10 }]}>
            {isCloseCall ? c.closeProfiles : c.yourProfile}
          </Text>
          {primary && primaryDef ? (
            isCloseCall && runnerUp ? (
              <>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  {[primary, runnerUp].map((match) => (
                    <View key={match.profile} style={{ flex: 1, paddingRight: 18 }}>
                      <Text style={[styles.profileName, { fontSize: 29, marginBottom: 8 }]}>{tx(PROFILE_DEFINITIONS[match.profile].title)}</Text>
                      <Text style={{ fontSize: 9.5, color: BODY, marginBottom: 4 }}>{inBrief(PROFILE_DEFINITIONS[match.profile].shortDescription)}</Text>
                      <Text style={styles.small}>{c.match(Math.round(match.matchScore))}</Text>
                    </View>
                  ))}
                </View>
                <Text style={{ fontSize: 9.5 }}>{tx(c.closeProfilesNote)}</Text>
              </>
            ) : (
              <>
                <Text style={[styles.profileName, { fontSize: 44, marginBottom: 12 }]}>{tx(primaryDef.title)}</Text>
                <Text style={[styles.motivation, { marginBottom: 8 }]}>{tx(primaryDef.coreMotivation)}</Text>
                <Text style={{ fontSize: 9.5, marginBottom: 4 }}>{inBrief(primaryDef.shortDescription)}</Text>
                <Text style={styles.small}>{c.match(Math.round(primary.matchScore))}</Text>
              </>
            )
          ) : (
            <>
              <Text style={[styles.profileName, { fontSize: 36, marginBottom: 12 }]}>{c.noProfileTitle}</Text>
              <Text style={{ fontSize: 10 }}>{tx(c.noProfileNote(measured))}</Text>
            </>
          )}
        </View>

        <View style={{ flexDirection: 'row', marginTop: 44, paddingTop: 18, borderTopWidth: 0.75, borderTopColor: INK }}>
          {statTile('religiosity')}
          {statTile('aiOpenness')}
          <View style={{ flex: 1.3 }}>
            <Text style={{ fontFamily: 'SourceSerif', fontWeight: 600, fontSize: 12.5, lineHeight: 1.25, color: INK, marginBottom: 5, minHeight: 30 }}>
              {tx(c.usageGapLabels[spectrum.usageGap])}
            </Text>
            <Text style={styles.statLabel}>{tx(c.usageGap)}</Text>
          </View>
        </View>

        </View>

        <View style={[styles.flow, { position: 'absolute', left: 50, right: 50, bottom: 62 }]}>
          <View style={{ backgroundColor: theme.tint, paddingVertical: 8, paddingHorizontal: 11, borderRadius: 3, marginBottom: 12 }}>
            <Text style={{ fontSize: 8.5, color: INK }}>{tx(c.heuristic)}</Text>
          </View>
          <Text style={styles.small}>{tx(`${c.generatedOn} ${dateText}`)}</Text>
          <Text style={styles.small}>{tx(`${c.identifier} : ${data.anonymousId}`)}</Text>
        </View>
        {footer}
      </Page>

      <Page size="A4" style={styles.page}>
        {sharedChrome}

        <View style={styles.flow}>
        {/* Reading of the answers */}
        {interpretation && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionTitle}>{tx(c.readingTitle)}</Text>
            <Text style={[styles.lead, { marginBottom: 14 }]}>{tx(narrative)}</Text>
            {subDef && (
              <View style={{ backgroundColor: theme.tint, padding: 12, borderRadius: 3, marginBottom: 14 }} wrap={false}>
                <Text style={[styles.overline, { color: theme.accent, marginBottom: 4 }]}>{c.subProfile}</Text>
                <Text style={{ fontFamily: 'SourceSerif', fontWeight: 600, fontSize: 14, lineHeight: 1.3, color: INK, marginBottom: 4 }}>{tx(subDef.title)}</Text>
                <Text>{tx(subDef.description)}</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, paddingRight: 14 }} wrap={false}>
                <Text style={styles.subTitle}>{c.standsOut}</Text>
                {bullets(interpretation.strengths.slice(0, 3))}
              </View>
              {uniqueAspects.length > 0 && (
                <View style={{ flex: 1, paddingLeft: 14 }} wrap={false}>
                  <Text style={styles.subTitle}>{c.distinguishes}</Text>
                  {bullets(uniqueAspects.slice(0, 3))}
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ marginTop: 6 }}>
          <View style={{ marginBottom: 14 }} wrap={false}>
            <Text style={styles.subTitle}>{tx(c.usageGap)}</Text>
            <Text style={{ fontWeight: 500, color: INK, marginBottom: 2 }}>{tx(c.usageGapLabels[spectrum.usageGap])}</Text>
            <Text style={styles.small}>{tx(c.usageGapNote)}</Text>
          </View>

          {spectrum.socialDesirability.flag && (
            <View style={{ marginBottom: 14 }} wrap={false}>
              <Text style={styles.subTitle}>{c.desirability}</Text>
              <Text>{tx(c.desirabilityNote)}</Text>
            </View>
          )}

          {spectrum.insights.length > 0 && (
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.subTitle} minPresenceAhead={40}>{c.insights}</Text>
              {spectrum.insights.slice(0, 4).map((insight, i) => (
                <View key={i} style={[styles.card, { borderLeftColor: theme.accent }]} wrap={false}>
                  <Text style={styles.cardTitle}>{tx(insight.title)}</Text>
                  <Text>{tx(insight.message)}</Text>
                </View>
              ))}
            </View>
          )}

        </View>

        {/* Seven dimensions: position on the scale against the profile's range */}
        <View break>
          <Text style={styles.sectionTitle}>{c.dimensionsTitle}</Text>
          <Text style={{ marginBottom: 8 }}>{tx(c.dimensionsIntro(primaryDef ? primaryDef.title : null))}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, height: 12 }}>
            <View style={{ position: 'absolute', left: 182, width: AXIS_WIDTH, height: 12 }}>
              {[1, 2, 3, 4, 5].map((tick) => (
                <Text key={tick} style={[styles.small, { position: 'absolute', left: axisX(tick) - 3, width: 6, textAlign: 'center' }]}>{tick}</Text>
              ))}
            </View>
            <Svg width={12} height={10}><Circle cx={6} cy={5} r={4} fill={theme.accent} /></Svg>
            <Text style={[styles.small, { marginLeft: 3, marginRight: 12 }]}>{c.legendScore}</Text>
            {primaryDef && (
              <>
                <Svg width={18} height={10}><Rect x={1} y={1} width={16} height={8} rx={2} ry={2} fill={theme.band} /></Svg>
                <Text style={[styles.small, { marginLeft: 3 }]}>{c.legendBand}</Text>
              </>
            )}
          </View>
          {DIMENSION_KEYS.map((key) => {
            const label = DIMENSION_LABELS[key];
            const value = spectrum.dimensions[key].value;
            return (
              <View key={key} style={styles.dimensionRow} wrap={false}>
                <View style={styles.dimensionText}>
                  <Text style={styles.dimensionName}>{dimensionName(key)}</Text>
                  {lang === 'fr' && <Text style={styles.small}>{tx(label.description)}</Text>}
                </View>
                <View style={{ width: AXIS_WIDTH }}>
                  <DimensionAxis value={value} range={primaryDef ? primaryDef.idealDimensions[key] : null} accent={theme.accent} band={theme.band} />
                  {lang === 'fr' && (
                    <View style={styles.axisEnds}>
                      <Text style={styles.axisEnd}>{tx(label.lowDescription)}</Text>
                      <Text style={[styles.axisEnd, { textAlign: 'right' }]}>{tx(label.highDescription)}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.dimensionValue, value === null ? { fontSize: 7.5, fontWeight: 500, color: MUTED } : {}]}>
                  {value === null ? c.notMeasured : number(value)}
                </Text>
              </View>
            );
          })}
          <Text style={[styles.small, { marginTop: 8 }]}>{tx(c.comparison)}</Text>
        </View>

        {/* Going further */}
        <View style={{ marginTop: 18 }}>
          {spectrum.tensions.length > 0 && (
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.subTitle} minPresenceAhead={40}>{c.tensions}</Text>
              <Text style={[styles.small, { marginBottom: 6 }]}>{tx(c.tensionsIntro)}</Text>
              {spectrum.tensions.map((tension, i) => (
                <View key={i} style={[styles.card, { borderLeftColor: theme.second }]} wrap={false}>
                  <Text style={styles.cardTitle}>{tx(`${dimensionName(tension.dimension1)} / ${dimensionName(tension.dimension2)}`)}</Text>
                  <Text>{tx((ui.tensions as Record<string, string>)[tension.description] ?? tension.description)}</Text>
                </View>
              ))}
            </View>
          )}

          {spectrum.growthAreas.length > 0 && (
            <View style={{ marginBottom: 6 }}>
              <Text style={styles.subTitle} minPresenceAhead={40}>{c.growth}</Text>
              <Text style={[styles.small, { marginBottom: 6 }]}>{tx(c.growthIntro)}</Text>
              {spectrum.growthAreas.map((area, i) => (
                <View key={i} style={[styles.card, { borderLeftColor: theme.deep }]} wrap={false}>
                  <Text style={styles.cardTitle}>{tx((ui.growthAreas as Record<string, string>)[area.area] ?? area.area)}</Text>
                  <Text>{tx((ui.growthAreas as Record<string, string>)[area.actionableStep] ?? area.actionableStep)}</Text>
                </View>
              ))}
            </View>
          )}

          {blindSpots.length > 0 && (
            <View style={{ marginBottom: 14 }} wrap={false}>
              <Text style={styles.subTitle}>{c.attention}</Text>
              {bullets(blindSpots)}
            </View>
          )}
        </View>

        {/* How to read this report */}
        <View wrap={false} style={{ marginTop: 16 }}>
          <Text style={[styles.sectionTitle, { fontSize: 17 }]}>{c.howToReadTitle}</Text>
          {bullets([
            ui.scientificDisclaimer.exploratoryNote,
            ui.scientificDisclaimer.scaleNote,
            ui.scientificDisclaimer.profileNote,
            c.matchNote,
            ui.scientificDisclaimer.footerNote,
          ])}
          <View style={{ backgroundColor: theme.tint, padding: 12, borderRadius: 3, marginTop: 10 }}>
            <Text style={styles.subTitle}>{c.yourData}</Text>
            <Text style={{ marginBottom: 3 }}>{tx(c.dataNote)}</Text>
            <Link src={`${SITE}/mes-donnees`} style={[styles.link, { marginBottom: 3 }]}>ia-foi.fr/mes-donnees</Link>
            <Text style={{ fontWeight: 600, color: INK, marginBottom: 6 }}>{data.anonymousId}</Text>
            {isCnef && (
              <Text style={{ marginBottom: 3 }}>
                {tx(c.cnefNote)} {c.techFoiBefore}
                <Link src={TECH_FOI_URL} style={styles.link}>Tech & Foi</Link>
                {c.techFoiAfter}
              </Text>
            )}
            <Text>
              {tx(c.methodology)} <Link src={`${SITE}/methodology`} style={styles.link}>ia-foi.fr/methodology</Link>
            </Text>
          </View>
          <Text style={{ fontFamily: 'SourceSerif', fontStyle: 'italic', fontWeight: 400, fontSize: 12, color: INK, marginTop: 14 }}>{c.thanks}</Text>
        </View>
        </View>
      </Page>
    </Document>
  );
}
