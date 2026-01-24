import { Shield, Lock, Eye, Trash2, Download, Mail } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Politique de Confidentialité - Sondage IA & Foi",
  description: "Notre politique de confidentialité et de protection des données personnelles.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-white/60">
            Dernière mise à jour : 24 janvier 2026
          </p>
        </header>

        <div className="space-y-8 text-white/80">
          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-blue-400" />
              Responsable du traitement
            </h2>
            <p>
              Cette étude est menée dans un cadre académique. Le responsable du traitement
              des données est le chercheur principal de l&apos;étude.
            </p>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-emerald-400" />
              Données collectées
            </h2>
            <p className="mb-4">Nous collectons uniquement :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Vos réponses au questionnaire (anonymisées)</li>
              <li>La date et l&apos;heure de participation</li>
              <li>La langue de l&apos;interface utilisée</li>
              <li>Un identifiant anonyme généré aléatoirement</li>
            </ul>
            <div className="mt-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <p className="text-emerald-400 font-medium">
                Nous ne collectons PAS :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-emerald-300/80">
                <li>Votre nom ou adresse email</li>
                <li>Votre adresse IP</li>
                <li>Aucune donnée permettant de vous identifier</li>
              </ul>
            </div>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              Finalité du traitement
            </h2>
            <p>
              Les données sont collectées exclusivement à des fins de recherche académique
              sur l&apos;utilisation de l&apos;intelligence artificielle dans les pratiques
              religieuses chrétiennes. Les résultats seront publiés sous forme agrégée
              et anonymisée.
            </p>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              Base légale
            </h2>
            <p>
              Le traitement est fondé sur votre consentement explicite (Article 6.1.a du RGPD),
              que vous donnez en cliquant sur &quot;J&apos;accepte et je commence&quot;.
            </p>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              Durée de conservation
            </h2>
            <p>
              Les données sont conservées pendant une durée maximale de 3 ans après la fin
              de l&apos;étude, conformément aux standards de recherche académique.
              Après cette période, les données sont définitivement supprimées.
            </p>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Download className="w-5 h-5 text-purple-400" />
              Vos droits
            </h2>
            <p className="mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">•</span>
                <span><strong>Droit d&apos;accès</strong> : obtenir une copie de vos données</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">•</span>
                <span><strong>Droit de rectification</strong> : corriger vos données</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">•</span>
                <span><strong>Droit à l&apos;effacement</strong> : supprimer vos données</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">•</span>
                <span><strong>Droit à la portabilité</strong> : exporter vos données</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">•</span>
                <span><strong>Droit de retrait du consentement</strong> : à tout moment</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/mes-donnees"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Gérer mes données
              </Link>
            </div>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-amber-400" />
              Contact
            </h2>
            <p>
              Pour exercer vos droits ou pour toute question concernant le traitement
              de vos données, vous pouvez accéder à la page{" "}
              <Link href="/mes-donnees" className="text-blue-400 hover:underline">
                Mes données
              </Link>{" "}
              ou contacter la CNIL si vous estimez que vos droits ne sont pas respectés.
            </p>
          </section>
        </div>

        <footer className="mt-12 text-center">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Retour au sondage
          </Link>
        </footer>
      </div>
    </div>
  );
}
