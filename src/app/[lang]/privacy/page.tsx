import { Shield, Lock, Eye, Trash2, Download, Mail } from "lucide-react";
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
    lastUpdate: "Last updated: January 24, 2026",
    controller: {
      title: "Data Controller",
      text: "This study is conducted in an academic context. The data controller is the principal researcher of the study."
    },
    collected: {
      title: "Data Collected",
      intro: "We only collect:",
      items: [
        "Your questionnaire answers (anonymized)",
        "Date and time of participation",
        "Interface language used",
        "A randomly generated anonymous identifier"
      ],
      notCollected: "We do NOT collect:",
      notItems: [
        "Your name or email address",
        "Your IP address",
        "Any data that could identify you"
      ]
    },
    purpose: {
      title: "Purpose of Processing",
      text: "Data is collected exclusively for academic research on the use of artificial intelligence in Christian religious practices. Results will be published in aggregate and anonymized form."
    },
    legal: {
      title: "Legal Basis",
      text: "Processing is based on your explicit consent (Article 6.1.a of GDPR), which you give by clicking \"I accept and begin\"."
    },
    retention: {
      title: "Data Retention",
      text: "Data is kept for a maximum of 3 years after the study ends, in accordance with academic research standards. After this period, data is permanently deleted."
    },
    rights: {
      title: "Your Rights",
      intro: "Under GDPR, you have the following rights:",
      items: [
        { name: "Right of access", desc: "obtain a copy of your data" },
        { name: "Right to rectification", desc: "correct your data" },
        { name: "Right to erasure", desc: "delete your data" },
        { name: "Right to portability", desc: "export your data" },
        { name: "Right to withdraw consent", desc: "at any time" }
      ],
      button: "Manage my data"
    },
    contact: {
      title: "Contact",
      text: "To exercise your rights or for any questions about your data processing, you can access the",
      link: "My data",
      textEnd: "page or contact the relevant data protection authority if you believe your rights are not being respected."
    },
    back: "← Back to survey"
  } : {
    title: "Politique de Confidentialité",
    lastUpdate: "Dernière mise à jour : 24 janvier 2026",
    controller: {
      title: "Responsable du traitement",
      text: "Cette étude est menée dans un cadre académique. Le responsable du traitement des données est le chercheur principal de l'étude."
    },
    collected: {
      title: "Données collectées",
      intro: "Nous collectons uniquement :",
      items: [
        "Vos réponses au questionnaire (anonymisées)",
        "La date et l'heure de participation",
        "La langue de l'interface utilisée",
        "Un identifiant anonyme généré aléatoirement"
      ],
      notCollected: "Nous ne collectons PAS :",
      notItems: [
        "Votre nom ou adresse email",
        "Votre adresse IP",
        "Aucune donnée permettant de vous identifier"
      ]
    },
    purpose: {
      title: "Finalité du traitement",
      text: "Les données sont collectées exclusivement à des fins de recherche académique sur l'utilisation de l'intelligence artificielle dans les pratiques religieuses chrétiennes. Les résultats seront publiés sous forme agrégée et anonymisée."
    },
    legal: {
      title: "Base légale",
      text: "Le traitement est fondé sur votre consentement explicite (Article 6.1.a du RGPD), que vous donnez en cliquant sur \"J'accepte et je commence\"."
    },
    retention: {
      title: "Durée de conservation",
      text: "Les données sont conservées pendant une durée maximale de 3 ans après la fin de l'étude, conformément aux standards de recherche académique. Après cette période, les données sont définitivement supprimées."
    },
    rights: {
      title: "Vos droits",
      intro: "Conformément au RGPD, vous disposez des droits suivants :",
      items: [
        { name: "Droit d'accès", desc: "obtenir une copie de vos données" },
        { name: "Droit de rectification", desc: "corriger vos données" },
        { name: "Droit à l'effacement", desc: "supprimer vos données" },
        { name: "Droit à la portabilité", desc: "exporter vos données" },
        { name: "Droit de retrait du consentement", desc: "à tout moment" }
      ],
      button: "Gérer mes données"
    },
    contact: {
      title: "Contact",
      text: "Pour exercer vos droits ou pour toute question concernant le traitement de vos données, vous pouvez accéder à la page",
      link: "Mes données",
      textEnd: "ou contacter la CNIL si vous estimez que vos droits ne sont pas respectés."
    },
    back: "← Retour au sondage"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {content.title}
          </h1>
          <p className="text-white/60">
            {content.lastUpdate}
          </p>
        </header>

        <div className="space-y-8 text-white/80">
          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-blue-400" />
              {content.controller.title}
            </h2>
            <p>{content.controller.text}</p>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-emerald-400" />
              {content.collected.title}
            </h2>
            <p className="mb-4">{content.collected.intro}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              {content.collected.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <div className="mt-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <p className="text-emerald-400 font-medium">
                {content.collected.notCollected}
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-emerald-300/80">
                {content.collected.notItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              {content.purpose.title}
            </h2>
            <p>{content.purpose.text}</p>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              {content.legal.title}
            </h2>
            <p>{content.legal.text}</p>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              {content.retention.title}
            </h2>
            <p>{content.retention.text}</p>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Download className="w-5 h-5 text-purple-400" />
              {content.rights.title}
            </h2>
            <p className="mb-4">{content.rights.intro}</p>
            <ul className="space-y-3">
              {content.rights.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>{item.name}</strong> : {item.desc}</span>
                </li>
              ))}
            </ul>
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

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-amber-400" />
              {content.contact.title}
            </h2>
            <p>
              {content.contact.text}{" "}
              <Link href={`/${lang}/mes-donnees`} className="text-blue-400 hover:underline">
                {content.contact.link}
              </Link>{" "}
              {content.contact.textEnd}
            </p>
          </section>
        </div>

        <footer className="mt-12 text-center">
          <Link
            href={`/${lang}`}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            {content.back}
          </Link>
        </footer>
      </div>
    </div>
  );
}
