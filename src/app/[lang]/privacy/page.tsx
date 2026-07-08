import { Shield, Lock, Eye, Trash2, Download, Mail, Scale, Fingerprint, Cookie, Server } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { getLocalizedPath } from "@/lib";

type SupportedLang = "fr" | "en";

const PRIVACY_METADATA = {
  fr: {
    title: "Politique de Confidentialité - Sondage IA & Foi",
    description: "Notre politique de confidentialité et de protection des données personnelles.",
  },
  en: {
    title: "Privacy Policy - IA & Faith Survey",
    description: "Our privacy policy and approach to protecting personal data.",
  },
} satisfies Record<SupportedLang, Metadata>;

function resolveLang(value?: string): SupportedLang {
  return value === "en" ? "en" : "fr";
}

export function getPrivacyMetadata(lang: SupportedLang): Metadata {
  return PRIVACY_METADATA[lang];
}

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return getPrivacyMetadata(resolveLang(lang));
}

export function PrivacyContent({ lang }: { lang: SupportedLang }) {
  // Content based on language
  const content = lang === "en" ? {
    title: "Privacy Policy",
    lastUpdate: "Last updated: July 8, 2026",
    controller: {
      title: "Data Controller",
      text: "This study is conducted in an academic context. The data controller is the principal researcher of the study.",
      contact: "Contact: contact@ia-foi.fr"
    },
    collected: {
      title: "Data Collected",
      subtitle: "Types of data and their nature",
      anonymous: {
        title: "Anonymous Data (non-personal)",
        items: [
          "Your questionnaire answers, submitted without any identifier that could directly identify you",
          "Date and time of participation",
          "Interface language used",
        ]
      },
      pseudonymous: {
        title: "Pseudonymized Data (personal data under GDPR)",
        description: "The following data is considered personal data under GDPR because it could theoretically be linked to you, even though none of it, on its own, can be used to contact or directly identify you:",
        items: [
          {
            name: "Your survey answers on religious beliefs and convictions",
            detail: "Special category data under GDPR Article 9. Processed only with your explicit, separate consent (Art. 9(2)(a)) for academic research purposes, with the safeguards required by Art. 89: pseudonymization via your anonymous ID, data minimization, and a time-limited retention period."
          },
          {
            name: "Keyed cryptographic hash of your email (HMAC-SHA256)",
            detail: "A one-way transformation computed with a secret key we control. Your email cannot be recovered from this hash. Used solely to prevent multiple participations."
          },
          {
            name: "Browser fingerprint",
            detail: "A technical identifier of your browser/device, generated only after you give consent and start the survey. Used solely to prevent multiple participations from the same device."
          },
          {
            name: "Keyed hash of your IP address (HMAC-SHA256)",
            detail: "We never store your IP address itself, only a one-way hash computed with a secret key. Used to enforce an anti-abuse limit (5 submissions per IP per 30 days)."
          },
          {
            name: "Random anonymous identifier",
            detail: "A randomly generated ID stored in your browser, linked to your responses so you can later access, export, or delete your data."
          }
        ]
      },
      notStoredInPlaintext: "We never store in plaintext:",
      notItems: [
        "Your IP address - only its keyed hash, described above",
        "Your email address - only its keyed hash; used in plaintext only transiently to send your PDF (see below). A small number of legacy records from an earlier version of the survey still hold an encrypted email; these are being phased out and remain covered by your right to erasure",
        "Your name or any direct identifier",
        "Precise geolocation data",
      ],
      pdfNote: "If you choose to receive your results by email, your email address is used only to send the PDF through our provider Resend and is never written to our database. It is held in memory for the duration of the request and discarded immediately after sending."
    },
    storage: {
      title: "Cookies & Local Storage",
      intro: "We use a minimal number of cookies and browser storage entries, none for advertising or third-party tracking:",
      cookieTitle: "Cookie",
      cookieItems: [
        { name: "survey_submitted", detail: "Functional cookie confirming you have completed the survey, used to prevent repeat submissions. Duration: 1 year." }
      ],
      localStorageTitle: "Local storage (stays on your device; only sent to us when you submit)",
      localStorageItems: [
        { name: "survey-session", detail: "Your session identifier, created once you give consent and start the survey." },
        { name: "survey-anonymous-id", detail: "Your anonymous ID (see above), created at the same time." },
        { name: "survey-fingerprint", detail: "Your cached browser fingerprint, created only after consent." },
      ]
    },
    processors: {
      title: "Processors",
      intro: "The following providers process data on our behalf, strictly to operate the survey:",
      items: [
        { name: "Supabase", role: "Database hosting - AWS eu-west-2 (London, United Kingdom), covered by the European Commission's UK adequacy decision" },
        { name: "Vercel", role: "Application hosting" },
        { name: "Resend", role: "Transactional email delivery (for the optional PDF results)" },
        { name: "Sentry", role: "Error monitoring, with session replay on a sample of sessions - fully masked (no text, no form contents, no media), so no survey content is ever visible to this processor" },
        { name: "Plausible", role: "Cookieless, privacy-friendly analytics, hosted in the EU" },
      ]
    },
    legal: {
      title: "Legal Basis (GDPR Articles 6 & 9)",
      intro: "We process your data based on the following legal grounds:",
      scopeLabel: "Scope:",
      items: [
        {
          basis: "Explicit consent for special category data (Art. 9(2)(a), with Art. 89 research safeguards)",
          scope: "Survey answers revealing your religious beliefs or convictions",
          detail: "You give separate, explicit consent to this specific processing by ticking the consent checkbox before starting the survey. Safeguards include pseudonymization (your anonymous ID), data minimization, and a defined retention period after which responses are irreversibly anonymized."
        },
        {
          basis: "Consent (Art. 6.1.a)",
          scope: "Other survey answers and the optional PDF sending",
          detail: "You give consent by clicking \"I accept and begin\". You can withdraw this consent at any time."
        },
        {
          basis: "Legitimate Interest (Art. 6.1.f)",
          scope: "Anti-fraud and anti-abuse measures (email hash, browser fingerprint, IP hash)",
          detail: "We have a legitimate interest in the scientific integrity of our study by preventing multiple participations. This interest is balanced against your rights through data minimization: only keyed hashes are stored, never your raw email or IP address."
        }
      ]
    },
    purpose: {
      title: "Purpose of Processing",
      items: [
        {
          purpose: "Academic research",
          detail: "Understanding the use of AI in Christian religious practices. Results published only in aggregate form."
        },
        {
          purpose: "Scientific integrity",
          detail: "Ensuring each person participates only once to maintain data validity."
        },
        {
          purpose: "User service",
          detail: "Sending your personalized results by email if you request it."
        }
      ]
    },
    retention: {
      title: "Data Retention",
      text: "Retention periods are set to the minimum necessary for each purpose:",
      details: [
        "Survey responses: kept for the duration of the research (about 3 years), then irreversibly anonymized",
        "Abandoned sessions (survey started but not submitted): 90 days",
        "Anti-abuse tracking (hashed IP, submission limits): 90 days",
        "Security audit log: 365 days, after which entries are anonymized - the identifying link to your anonymous ID is removed rather than the entry deleted, to preserve the integrity of the security audit trail",
        "Email hash (duplicate detection): tied to the retention of the response it protects, or deleted earlier upon request",
        "Email used to send your PDF: never stored - held in memory only for the duration of the request",
      ]
    },
    security: {
      title: "Data Security",
      items: [
        "Data encrypted in transit (HTTPS/TLS)",
        "Database hosted on secure infrastructure (Supabase, AWS eu-west-2 - London, United Kingdom)",
        "Access restricted to authorized researchers only",
        "Regular security audits"
      ]
    },
    transfers: {
      title: "International Transfers",
      text: "Your survey data is hosted in the United Kingdom (Supabase, AWS eu-west-2, London), covered by the European Commission's UK adequacy decision. Some of our other providers (Vercel, Resend, Sentry) may process data outside the EU/UK under appropriate safeguards (standard contractual clauses, or the EU-US Data Privacy Framework where applicable). Plausible processes analytics data within the EU. No data is sold or shared for commercial purposes."
    },
    rights: {
      title: "Your Rights (GDPR Articles 15-22)",
      intro: "You have the following rights regarding your personal data:",
      items: [
        { name: "Right of access (Art. 15)", desc: "Get a full export of every record linked to your anonymous ID, across all our tables, via the My Data page" },
        { name: "Right to rectification (Art. 16)", desc: "Correct inaccurate data" },
        { name: "Right to erasure (Art. 17)", desc: "Request deletion of your survey response, session, email hash, and anti-abuse tracking record. Security audit log entries referencing your anonymous ID are anonymized rather than deleted, to preserve the integrity of the security audit trail (a legitimate interest under Art. 17(3))" },
        { name: "Right to restriction (Art. 18)", desc: "Limit processing of your data" },
        { name: "Right to portability (Art. 20)", desc: "Export your data in a machine-readable format" },
        { name: "Right to withdraw consent", desc: "At any time, without affecting processing carried out before the withdrawal" }
      ],
      limitation: "Note: because the data is pseudonymized, we can only process your request if you provide your anonymous ID (shown at the end of the survey). Without it, we cannot locate your data. Keep this ID safe and don't share it - on its own, it grants access to your data.",
      button: "Manage my data"
    },
    contact: {
      title: "Contact & Complaints",
      text: "To exercise your rights or for any questions about data processing:",
      email: "Email: contact@ia-foi.fr",
      page: "Or use the",
      link: "My data",
      pageEnd: "page.",
      authority: "If you believe your rights are not being respected, you can file a complaint with your national data protection authority (CNIL in France, ICO in UK, etc.)."
    },
    back: "Back to survey"
  } : {
    title: "Politique de Confidentialité",
    lastUpdate: "Dernière mise à jour : 8 juillet 2026",
    controller: {
      title: "Responsable du traitement",
      text: "Cette étude est menée dans un cadre académique. Le responsable du traitement des données est le chercheur principal de l'étude.",
      contact: "Contact : contact@ia-foi.fr"
    },
    collected: {
      title: "Données collectées",
      subtitle: "Types de données et leur nature",
      anonymous: {
        title: "Données anonymes (non personnelles)",
        items: [
          "Vos réponses au questionnaire, soumises sans aucun identifiant permettant de vous identifier directement",
          "Date et heure de participation",
          "Langue de l'interface utilisée",
        ]
      },
      pseudonymous: {
        title: "Données pseudonymisées (données personnelles au sens du RGPD)",
        description: "Les données suivantes sont considérées comme des données personnelles au sens du RGPD car elles pourraient théoriquement être liées à vous, même si aucune d'entre elles ne permet à elle seule de vous contacter ou de vous identifier directement :",
        items: [
          {
            name: "Vos réponses relatives à vos convictions et croyances religieuses",
            detail: "Donnée sensible au sens de l'article 9 du RGPD. Traitée uniquement sur la base de votre consentement explicite et distinct (art. 9§2.a) à des fins de recherche académique, avec les garanties exigées par l'article 89 : pseudonymisation via votre identifiant anonyme, minimisation des données et durée de conservation limitée."
          },
          {
            name: "Empreinte cryptographique à clé de votre email (HMAC-SHA256)",
            detail: "Une transformation à sens unique calculée avec une clé secrète que nous contrôlons. Votre email ne peut pas être retrouvé à partir de cette empreinte. Utilisée uniquement pour empêcher les participations multiples."
          },
          {
            name: "Empreinte de navigateur (fingerprint)",
            detail: "Un identifiant technique de votre navigateur/appareil, généré uniquement après votre consentement et le démarrage du sondage. Utilisé uniquement pour empêcher les participations multiples depuis le même appareil."
          },
          {
            name: "Empreinte à clé de votre adresse IP (HMAC-SHA256)",
            detail: "Nous ne stockons jamais votre adresse IP elle-même, uniquement une empreinte à sens unique calculée avec une clé secrète. Utilisée pour appliquer une limite anti-abus (5 participations par IP et par 30 jours)."
          },
          {
            name: "Identifiant anonyme aléatoire",
            detail: "Un identifiant généré aléatoirement stocké dans votre navigateur, lié à vos réponses afin que vous puissiez ensuite accéder à vos données, les exporter ou les supprimer."
          }
        ]
      },
      notStoredInPlaintext: "Nous ne stockons jamais en clair :",
      notItems: [
        "Votre adresse IP - uniquement son empreinte à clé, décrite ci-dessus",
        "Votre adresse email - uniquement son empreinte à clé ; utilisée en clair uniquement de façon transitoire pour l'envoi de votre PDF (voir ci-dessous). Un petit nombre d'enregistrements hérités d'une version antérieure du sondage contiennent encore un email chiffré ; ils sont en cours de suppression et restent couverts par votre droit à l'effacement",
        "Votre nom ou tout identifiant direct",
        "Données de géolocalisation précises",
      ],
      pdfNote: "Si vous choisissez de recevoir vos résultats par email, votre adresse email est utilisée uniquement pour l'envoi du PDF via notre prestataire Resend et n'est jamais écrite dans notre base de données. Elle est conservée en mémoire le temps de la requête puis immédiatement supprimée après l'envoi."
    },
    storage: {
      title: "Cookies et stockage local",
      intro: "Nous utilisons un nombre minimal de cookies et d'entrées de stockage navigateur, aucun à des fins publicitaires ou de suivi tiers :",
      cookieTitle: "Cookie",
      cookieItems: [
        { name: "survey_submitted", detail: "Cookie fonctionnel confirmant que vous avez complété le sondage, utilisé pour empêcher les soumissions répétées. Durée : 1 an." }
      ],
      localStorageTitle: "Stockage local (reste sur votre appareil ; transmis uniquement lors de votre soumission)",
      localStorageItems: [
        { name: "survey-session", detail: "Votre identifiant de session, créé dès que vous donnez votre consentement et démarrez le sondage." },
        { name: "survey-anonymous-id", detail: "Votre identifiant anonyme (voir ci-dessus), créé au même moment." },
        { name: "survey-fingerprint", detail: "Votre empreinte de navigateur mise en cache, créée uniquement après votre consentement." },
      ]
    },
    processors: {
      title: "Sous-traitants",
      intro: "Les prestataires suivants traitent des données pour notre compte, strictement pour faire fonctionner le sondage :",
      items: [
        { name: "Supabase", role: "Hébergement de la base de données - AWS eu-west-2 (Londres, Royaume-Uni), couvert par la décision d'adéquation de la Commission européenne pour le Royaume-Uni" },
        { name: "Vercel", role: "Hébergement de l'application" },
        { name: "Resend", role: "Envoi d'emails transactionnels (pour les résultats PDF optionnels)" },
        { name: "Sentry", role: "Surveillance des erreurs, avec relecture de session (session replay) sur un échantillon de sessions - entièrement masquée (aucun texte, aucun contenu de formulaire, aucun média), de sorte qu'aucun contenu du sondage n'est jamais visible par ce prestataire" },
        { name: "Plausible", role: "Analytique respectueuse de la vie privée, sans cookies, hébergée dans l'UE" },
      ]
    },
    legal: {
      title: "Base légale (Articles 6 et 9 du RGPD)",
      intro: "Nous traitons vos données sur les fondements juridiques suivants :",
      scopeLabel: "Champ d'application :",
      items: [
        {
          basis: "Consentement explicite pour les données sensibles (art. 9§2.a, avec les garanties de recherche de l'art. 89)",
          scope: "Réponses au sondage relatives à vos convictions ou croyances religieuses",
          detail: "Vous donnez un consentement distinct et explicite à ce traitement spécifique en cochant la case de consentement avant de démarrer le sondage. Les garanties incluent la pseudonymisation (votre identifiant anonyme), la minimisation des données et une durée de conservation définie, après laquelle les réponses sont anonymisées de façon irréversible."
        },
        {
          basis: "Consentement (Art. 6.1.a)",
          scope: "Autres réponses au sondage et envoi optionnel du PDF",
          detail: "Vous donnez votre consentement en cliquant sur \"J'accepte et je commence\". Vous pouvez retirer ce consentement à tout moment."
        },
        {
          basis: "Intérêt légitime (Art. 6.1.f)",
          scope: "Mesures anti-fraude et anti-abus (empreinte email, empreinte navigateur, empreinte IP)",
          detail: "Nous avons un intérêt légitime à garantir l'intégrité scientifique de notre étude en empêchant les participations multiples. Cet intérêt est équilibré avec vos droits par la minimisation des données : seules des empreintes à clé sont stockées, jamais votre email ou votre adresse IP en clair."
        }
      ]
    },
    purpose: {
      title: "Finalités du traitement",
      items: [
        {
          purpose: "Recherche académique",
          detail: "Comprendre l'utilisation de l'IA dans les pratiques religieuses chrétiennes. Résultats publiés uniquement sous forme agrégée."
        },
        {
          purpose: "Intégrité scientifique",
          detail: "S'assurer que chaque personne ne participe qu'une seule fois pour maintenir la validité des données."
        },
        {
          purpose: "Service utilisateur",
          detail: "Envoi de vos résultats personnalisés par email si vous le demandez."
        }
      ]
    },
    retention: {
      title: "Durée de conservation",
      text: "Les durées de conservation sont limitées au strict nécessaire pour chaque finalité :",
      details: [
        "Réponses au sondage : conservées pendant la durée de la recherche (environ 3 ans), puis anonymisées de façon irréversible",
        "Sessions abandonnées (sondage démarré mais non soumis) : 90 jours",
        "Suivi anti-abus (IP hachée, limites de soumission) : 90 jours",
        "Journal d'audit de sécurité : 365 jours, après quoi les entrées sont anonymisées - le lien identifiant avec votre identifiant anonyme est retiré plutôt que l'entrée supprimée, afin de préserver l'intégrité de la piste d'audit de sécurité",
        "Empreinte email (détection de doublons) : liée à la durée de conservation de la réponse qu'elle protège, ou supprimée plus tôt sur demande",
        "Email utilisé pour l'envoi du PDF : jamais stocké - conservé en mémoire uniquement le temps de la requête",
      ]
    },
    security: {
      title: "Sécurité des données",
      items: [
        "Données chiffrées en transit (HTTPS/TLS)",
        "Base de données hébergée sur infrastructure sécurisée (Supabase, AWS eu-west-2 - Londres, Royaume-Uni)",
        "Accès restreint aux chercheurs autorisés uniquement",
        "Audits de sécurité réguliers"
      ]
    },
    transfers: {
      title: "Transferts internationaux",
      text: "Vos données de sondage sont hébergées au Royaume-Uni (Supabase, AWS eu-west-2, Londres), couvert par la décision d'adéquation de la Commission européenne pour le Royaume-Uni. Certains de nos autres prestataires (Vercel, Resend, Sentry) peuvent traiter des données en dehors de l'UE/Royaume-Uni dans le cadre de garanties appropriées (clauses contractuelles types, ou EU-US Data Privacy Framework le cas échéant). Plausible traite les données analytiques au sein de l'UE. Aucune donnée n'est vendue ou partagée à des fins commerciales."
    },
    rights: {
      title: "Vos droits (Articles 15-22 du RGPD)",
      intro: "Vous disposez des droits suivants concernant vos données personnelles :",
      items: [
        { name: "Droit d'accès (Art. 15)", desc: "Obtenir un export complet de tous les enregistrements liés à votre identifiant anonyme, dans l'ensemble de nos tables, via la page Mes données" },
        { name: "Droit de rectification (Art. 16)", desc: "Corriger des données inexactes" },
        { name: "Droit à l'effacement (Art. 17)", desc: "Demander la suppression de votre réponse au sondage, de votre session, de votre empreinte email et de votre enregistrement de suivi anti-abus. Les entrées du journal d'audit de sécurité faisant référence à votre identifiant anonyme sont anonymisées plutôt que supprimées, afin de préserver l'intégrité de la piste d'audit de sécurité (intérêt légitime au sens de l'art. 17§3)" },
        { name: "Droit à la limitation (Art. 18)", desc: "Limiter le traitement de vos données" },
        { name: "Droit à la portabilité (Art. 20)", desc: "Exporter vos données dans un format lisible par machine" },
        { name: "Droit de retrait du consentement", desc: "À tout moment, sans affecter le traitement antérieur au retrait" }
      ],
      limitation: "Note : en raison de la nature pseudonymisée des données, nous ne pouvons traiter votre demande que si vous fournissez votre identifiant anonyme (affiché à la fin du sondage). Sans cet identifiant, nous ne pouvons pas localiser vos données. Conservez-le en lieu sûr et ne le partagez pas : il permet à lui seul d'accéder à vos données.",
      button: "Gérer mes données"
    },
    contact: {
      title: "Contact & Réclamations",
      text: "Pour exercer vos droits ou pour toute question concernant le traitement des données :",
      email: "Email : contact@ia-foi.fr",
      page: "Ou utilisez la page",
      link: "Mes données",
      pageEnd: ".",
      authority: "Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) : www.cnil.fr"
    },
    back: "Retour au sondage"
  };
  const myDataLink = getLocalizedPath(lang, "/mes-donnees");
  const backLink = getLocalizedPath(lang);

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {content.title}
          </h1>
          <p className="text-muted-foreground">
            {content.lastUpdate}
          </p>
        </header>

        <div className="space-y-8 text-foreground/80">
          {/* Data Controller */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-blue-500" />
              {content.controller.title}
            </h2>
            <p>{content.controller.text}</p>
            <p className="mt-2 text-sm text-muted-foreground">{content.controller.contact}</p>
          </section>

          {/* Data Collected */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-emerald-500" />
              {content.collected.title}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">{content.collected.subtitle}</p>

            {/* Anonymous Data */}
            <div className="mb-6">
              <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {content.collected.anonymous.title}
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                {content.collected.anonymous.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Pseudonymous Data */}
            <div className="mb-6 p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-amber-500" />
                {content.collected.pseudonymous.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {content.collected.pseudonymous.description}
              </p>
              <ul className="space-y-3">
                {content.collected.pseudonymous.items.map((item, i) => (
                  <li key={i} className="text-sm">
                    <strong className="text-foreground">{item.name}</strong>
                    <p className="text-muted-foreground mt-1">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Never stored in plaintext */}
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <p className="text-foreground font-medium">
                {content.collected.notStoredInPlaintext}
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-foreground text-sm">
                {content.collected.notItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* PDF Note */}
            <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <p className="text-foreground text-sm">
                <Mail className="w-4 h-4 inline mr-2" />
                {content.collected.pdfNote}
              </p>
            </div>
          </section>

          {/* Cookies & Local Storage */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
              <Cookie className="w-5 h-5 text-amber-500" />
              {content.storage.title}
            </h2>
            <p className="mb-4 text-sm">{content.storage.intro}</p>
            <div className="mb-4">
              <h3 className="font-medium text-foreground mb-2 text-sm">{content.storage.cookieTitle}</h3>
              <ul className="space-y-2">
                {content.storage.cookieItems.map((item, i) => (
                  <li key={i} className="text-sm">
                    <strong className="text-foreground font-mono">{item.name}</strong>
                    <p className="text-muted-foreground mt-1">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2 text-sm">{content.storage.localStorageTitle}</h3>
              <ul className="space-y-2">
                {content.storage.localStorageItems.map((item, i) => (
                  <li key={i} className="text-sm">
                    <strong className="text-foreground font-mono">{item.name}</strong>
                    <p className="text-muted-foreground mt-1">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Processors */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-blue-500" />
              {content.processors.title}
            </h2>
            <p className="mb-4 text-sm">{content.processors.intro}</p>
            <ul className="space-y-3">
              {content.processors.items.map((item, i) => (
                <li key={i} className="text-sm">
                  <strong className="text-foreground">{item.name}</strong>
                  <p className="text-muted-foreground mt-1">{item.role}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Legal Basis */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-purple-500" />
              {content.legal.title}
            </h2>
            <p className="mb-4">{content.legal.intro}</p>
            <div className="space-y-4">
              {content.legal.items.map((item, i) => (
                <div key={i} className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <span className="text-foreground font-medium">{i + 1}.</span>
                    <div>
                      <p className="font-medium text-foreground">{item.basis}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">{content.legal.scopeLabel}</span> {item.scope}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Purpose */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {content.purpose.title}
            </h2>
            <div className="space-y-3">
              {content.purpose.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <div>
                    <p className="font-medium text-foreground">{item.purpose}</p>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Retention */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {content.retention.title}
            </h2>
            <p className="mb-4">{content.retention.text}</p>
            <ul className="space-y-2 text-sm">
              {content.retention.details.map((detail, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                  {detail}
                </li>
              ))}
            </ul>
          </section>

          {/* Security */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-emerald-500" />
              {content.security.title}
            </h2>
            <ul className="space-y-2">
              {content.security.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-emerald-500">&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* International Transfers */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {content.transfers.title}
            </h2>
            <p className="text-sm">{content.transfers.text}</p>
          </section>

          {/* Rights */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
              <Download className="w-5 h-5 text-purple-500" />
              {content.rights.title}
            </h2>
            <p className="mb-4">{content.rights.intro}</p>
            <ul className="space-y-3">
              {content.rights.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span><strong>{item.name}</strong>: {item.desc}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <p className="text-sm text-foreground">
                {content.rights.limitation}
              </p>
            </div>
            <div className="mt-6">
              <Link
                href={myDataLink}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all"
              >
                <Trash2 className="w-4 h-4" />
                {content.rights.button}
              </Link>
            </div>
          </section>

          {/* Contact */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-amber-500" />
              {content.contact.title}
            </h2>
            <p className="mb-2">{content.contact.text}</p>
            <p className="text-sm font-medium text-foreground mb-2">{content.contact.email}</p>
            <p className="text-sm">
              {content.contact.page}{" "}
              <Link href={myDataLink} className="text-foreground underline hover:no-underline">
                {content.contact.link}
              </Link>
              {content.contact.pageEnd}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {content.contact.authority}
            </p>
          </section>
        </div>

        <footer className="mt-12 text-center">
          <Link
            href={backLink}
            className="text-foreground underline hover:no-underline transition-colors"
          >
            &larr; {content.back}
          </Link>
        </footer>
      </div>
    </div>
  );
}

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params;
  return <PrivacyContent lang={resolveLang(lang)} />;
}
