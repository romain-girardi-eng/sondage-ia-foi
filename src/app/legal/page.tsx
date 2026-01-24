import { Scale, Building, Globe, Server } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Mentions Légales - Sondage IA & Foi",
  description: "Mentions légales et informations sur l'éditeur du site.",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <Scale className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Mentions Légales
          </h1>
          <p className="text-white/60">
            Conformément à la loi n° 2004-575 du 21 juin 2004
          </p>
        </header>

        <div className="space-y-8 text-white/80">
          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-blue-400" />
              Éditeur du site
            </h2>
            <p>
              Ce site est édité dans le cadre d&apos;un projet de recherche académique.
            </p>
            <ul className="mt-4 space-y-2">
              <li><strong>Projet :</strong> Étude sur l&apos;IA dans les pratiques religieuses chrétiennes</li>
              <li><strong>Nature :</strong> Recherche académique non commerciale</li>
              <li><strong>Cadre :</strong> Université / Institution de recherche</li>
            </ul>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-emerald-400" />
              Hébergement
            </h2>
            <ul className="space-y-2">
              <li><strong>Hébergeur :</strong> Vercel Inc.</li>
              <li><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
              <li><strong>Site web :</strong> https://vercel.com</li>
            </ul>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-purple-400" />
              Propriété intellectuelle
            </h2>
            <p>
              L&apos;ensemble de ce site relève de la législation française et internationale
              sur le droit d&apos;auteur et la propriété intellectuelle. Tous les droits de
              reproduction sont réservés, y compris pour les documents téléchargeables
              et les représentations iconographiques et photographiques.
            </p>
            <p className="mt-4">
              Le code source de l&apos;application est disponible sous licence MIT.
            </p>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              Données personnelles
            </h2>
            <p>
              Pour toute information concernant la collecte et le traitement de vos
              données personnelles, veuillez consulter notre{" "}
              <Link href="/privacy" className="text-blue-400 hover:underline">
                Politique de Confidentialité
              </Link>.
            </p>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              Cookies
            </h2>
            <p>
              Ce site n&apos;utilise aucun cookie de traçage publicitaire. Seuls des cookies
              techniques essentiels au fonctionnement du site peuvent être utilisés
              (préférences de langue, session anonyme).
            </p>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              Limitation de responsabilité
            </h2>
            <p>
              Les informations contenues sur ce site sont aussi précises que possible.
              Toutefois, l&apos;éditeur ne peut garantir l&apos;exactitude, la complétude et
              l&apos;actualité des informations diffusées. L&apos;utilisateur reconnaît utiliser
              ces informations sous sa responsabilité exclusive.
            </p>
          </section>
        </div>

        <footer className="mt-12 text-center space-x-6">
          <Link
            href="/privacy"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Politique de confidentialité
          </Link>
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Retour au sondage
          </Link>
        </footer>
      </div>
    </div>
  );
}
