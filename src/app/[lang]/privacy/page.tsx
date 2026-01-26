import { Shield, Lock, Eye, Trash2, Download, Mail, Scale, Fingerprint } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Politique de Confidentialité - Sondage IA & Foi",
  description: "Notre politique de confidentialité et de protection des données personnelles.",
};

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params;

  // Content based on language
  const content = lang === "en" ? {
    title: "Privacy Policy",
    lastUpdate: "Last updated: January 26, 2026",
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
          "Your questionnaire answers (no link to your identity)",
          "Date and time of participation",
          "Interface language used",
        ]
      },
      pseudonymous: {
        title: "Pseudonymized Data (personal data under GDPR)",
        description: "The following data is considered personal data under GDPR because it could theoretically be linked to you, even though we cannot use it to contact or directly identify you:",
        items: [
          {
            name: "Cryptographic hash of your email",
            detail: "A one-way mathematical transformation of your email. We cannot retrieve your email from this hash, but someone with your email could verify it matches. Used solely to prevent multiple participations."
          },
          {
            name: "Browser fingerprint",
            detail: "A technical identifier of your browser/device. Used solely to prevent multiple participations from the same device."
          },
          {
            name: "Random anonymous identifier",
            detail: "A randomly generated ID stored in your browser, linked to your responses for data management purposes."
          }
        ]
      },
      notCollected: "We do NOT collect or store:",
      notItems: [
        "Your actual email address (only its irreversible hash)",
        "Your IP address",
        "Your name or any direct identifier",
        "Geolocation data",
        "Cookies for tracking or advertising purposes"
      ],
      pdfNote: "If you choose to receive your results by email, your email address is used only for immediate sending of the PDF and is not stored in any database. It is processed in memory only and discarded immediately after sending."
    },
    legal: {
      title: "Legal Basis (GDPR Article 6)",
      intro: "We process your data based on the following legal grounds:",
      items: [
        {
          basis: "Consent (Art. 6.1.a)",
          scope: "Survey responses and optional PDF sending",
          detail: "You give explicit consent by clicking \"I accept and begin\". You can withdraw this consent at any time."
        },
        {
          basis: "Legitimate Interest (Art. 6.1.f)",
          scope: "Anti-fraud measures (email hash, browser fingerprint)",
          detail: "We have a legitimate interest in ensuring the scientific integrity of our study by preventing multiple participations. This interest is balanced against your rights through data minimization (only hashes stored, not actual data)."
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
      text: "Data is kept for a maximum of 3 years after the study ends, in accordance with academic research standards. After this period, all data is permanently and irreversibly deleted.",
      details: [
        "Survey responses: 3 years",
        "Email hashes: 3 years (or until you request deletion)",
        "Browser fingerprints: 3 years",
        "Email for PDF: Not stored (immediate processing only)"
      ]
    },
    rights: {
      title: "Your Rights (GDPR Articles 15-22)",
      intro: "You have the following rights regarding your personal data:",
      items: [
        { name: "Right of access (Art. 15)", desc: "Obtain a copy of your data using your anonymous ID" },
        { name: "Right to rectification (Art. 16)", desc: "Correct inaccurate data" },
        { name: "Right to erasure (Art. 17)", desc: "Request deletion of your data" },
        { name: "Right to restriction (Art. 18)", desc: "Limit processing of your data" },
        { name: "Right to portability (Art. 20)", desc: "Export your data in a standard format" },
        { name: "Right to withdraw consent", desc: "At any time, without affecting prior processing" }
      ],
      limitation: "Note: Due to the pseudonymized nature of the data, we can only process requests if you provide your anonymous ID (shown at the end of the survey). Without this ID, we cannot locate your data.",
      button: "Manage my data"
    },
    security: {
      title: "Data Security",
      items: [
        "Data encrypted in transit (HTTPS/TLS)",
        "Database hosted on secure infrastructure (Supabase, EU region)",
        "Access restricted to authorized researchers only",
        "Regular security audits"
      ]
    },
    transfers: {
      title: "International Transfers",
      text: "Your data is stored on servers located in the European Union (AWS eu-west-2). Our hosting provider (Vercel, Supabase) may process data in accordance with EU-US Data Privacy Framework where applicable. No data is sold or shared with third parties."
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
    lastUpdate: "Dernière mise à jour : 26 janvier 2026",
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
          "Vos réponses au questionnaire (sans lien avec votre identité)",
          "Date et heure de participation",
          "Langue de l'interface utilisée",
        ]
      },
      pseudonymous: {
        title: "Données pseudonymisées (données personnelles au sens du RGPD)",
        description: "Les données suivantes sont considérées comme des données personnelles au sens du RGPD car elles pourraient théoriquement être liées à vous, même si nous ne pouvons pas les utiliser pour vous contacter ou vous identifier directement :",
        items: [
          {
            name: "Empreinte cryptographique de votre email",
            detail: "Une transformation mathématique irréversible de votre email. Nous ne pouvons pas retrouver votre email à partir de cette empreinte, mais quelqu'un possédant votre email pourrait vérifier la correspondance. Utilisée uniquement pour empêcher les participations multiples."
          },
          {
            name: "Empreinte de navigateur",
            detail: "Un identifiant technique de votre navigateur/appareil. Utilisé uniquement pour empêcher les participations multiples depuis le même appareil."
          },
          {
            name: "Identifiant anonyme aléatoire",
            detail: "Un identifiant généré aléatoirement stocké dans votre navigateur, lié à vos réponses pour la gestion des données."
          }
        ]
      },
      notCollected: "Nous ne collectons PAS et ne stockons PAS :",
      notItems: [
        "Votre adresse email réelle (uniquement son empreinte irréversible)",
        "Votre adresse IP",
        "Votre nom ou tout identifiant direct",
        "Données de géolocalisation",
        "Cookies de suivi ou publicitaires"
      ],
      pdfNote: "Si vous choisissez de recevoir vos résultats par email, votre adresse email est utilisée uniquement pour l'envoi immédiat du PDF et n'est stockée dans aucune base de données. Elle est traitée en mémoire uniquement et supprimée immédiatement après l'envoi."
    },
    legal: {
      title: "Base légale (Article 6 du RGPD)",
      intro: "Nous traitons vos données sur les fondements juridiques suivants :",
      items: [
        {
          basis: "Consentement (Art. 6.1.a)",
          scope: "Réponses au sondage et envoi optionnel du PDF",
          detail: "Vous donnez votre consentement explicite en cliquant sur \"J'accepte et je commence\". Vous pouvez retirer ce consentement à tout moment."
        },
        {
          basis: "Intérêt légitime (Art. 6.1.f)",
          scope: "Mesures anti-fraude (empreinte email, empreinte navigateur)",
          detail: "Nous avons un intérêt légitime à garantir l'intégrité scientifique de notre étude en empêchant les participations multiples. Cet intérêt est équilibré avec vos droits par la minimisation des données (seules les empreintes sont stockées, pas les données réelles)."
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
      text: "Les données sont conservées pendant une durée maximale de 3 ans après la fin de l'étude, conformément aux standards de recherche académique. Après cette période, toutes les données sont définitivement et irréversiblement supprimées.",
      details: [
        "Réponses au sondage : 3 ans",
        "Empreintes email : 3 ans (ou jusqu'à votre demande de suppression)",
        "Empreintes navigateur : 3 ans",
        "Email pour PDF : Non stocké (traitement immédiat uniquement)"
      ]
    },
    rights: {
      title: "Vos droits (Articles 15-22 du RGPD)",
      intro: "Vous disposez des droits suivants concernant vos données personnelles :",
      items: [
        { name: "Droit d'accès (Art. 15)", desc: "Obtenir une copie de vos données grâce à votre identifiant anonyme" },
        { name: "Droit de rectification (Art. 16)", desc: "Corriger des données inexactes" },
        { name: "Droit à l'effacement (Art. 17)", desc: "Demander la suppression de vos données" },
        { name: "Droit à la limitation (Art. 18)", desc: "Limiter le traitement de vos données" },
        { name: "Droit à la portabilité (Art. 20)", desc: "Exporter vos données dans un format standard" },
        { name: "Droit de retrait du consentement", desc: "À tout moment, sans affecter le traitement antérieur" }
      ],
      limitation: "Note : En raison de la nature pseudonymisée des données, nous ne pouvons traiter les demandes que si vous fournissez votre identifiant anonyme (affiché à la fin du sondage). Sans cet identifiant, nous ne pouvons pas localiser vos données.",
      button: "Gérer mes données"
    },
    security: {
      title: "Sécurité des données",
      items: [
        "Données chiffrées en transit (HTTPS/TLS)",
        "Base de données hébergée sur infrastructure sécurisée (Supabase, région UE)",
        "Accès restreint aux chercheurs autorisés uniquement",
        "Audits de sécurité réguliers"
      ]
    },
    transfers: {
      title: "Transferts internationaux",
      text: "Vos données sont stockées sur des serveurs situés dans l'Union européenne (AWS eu-west-2). Nos fournisseurs d'hébergement (Vercel, Supabase) peuvent traiter des données conformément au EU-US Data Privacy Framework le cas échéant. Aucune donnée n'est vendue ou partagée avec des tiers."
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

            {/* Not Collected */}
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                {content.collected.notCollected}
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-emerald-700/80 dark:text-emerald-300/80 text-sm">
                {content.collected.notItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* PDF Note */}
            <div className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <p className="text-blue-600 dark:text-blue-400 text-sm">
                <Mail className="w-4 h-4 inline mr-2" />
                {content.collected.pdfNote}
              </p>
            </div>
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
                    <span className="text-purple-500 font-medium">{i + 1}.</span>
                    <div>
                      <p className="font-medium text-foreground">{item.basis}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium">Scope:</span> {item.scope}
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
                  <span className="text-blue-500 mt-1">•</span>
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
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
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
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>{item.name}</strong>: {item.desc}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {content.rights.limitation}
              </p>
            </div>
            <div className="mt-6">
              <Link
                href={`/${lang}/mes-donnees`}
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
            <p className="text-sm font-medium text-blue-500 mb-2">{content.contact.email}</p>
            <p className="text-sm">
              {content.contact.page}{" "}
              <Link href={`/${lang}/mes-donnees`} className="text-blue-500 hover:underline">
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
            href={`/${lang}`}
            className="text-blue-500 hover:text-blue-400 transition-colors"
          >
            &larr; {content.back}
          </Link>
        </footer>
      </div>
    </div>
  );
}
