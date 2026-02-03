"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Database, Download, Trash2, Search, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useCSRF } from "@/hooks/useCSRF";
import { getLocalizedPath } from "@/lib";

const content = {
  en: {
    title: "My Data",
    subtitle: "Manage your personal data in accordance with GDPR",
    search: {
      title: "Find your data",
      description: "Enter the anonymous ID that was given to you at the end of the survey to access or delete your data.",
      placeholder: "Your anonymous identifier (UUID)",
      button: "Search",
    },
    results: {
      title: "Your data",
      found: (count: number) => `${count} response(s) found.`,
      notFound: "No data found for this identifier.",
      error: "An error occurred while searching.",
    },
    actions: {
      title: "Actions",
      export: "Export my data",
      delete: "Delete my data",
      deleteConfirm: "Are you sure you want to delete all your data? This action is irreversible.",
      deleted: (count: number) => `${count} response(s) successfully deleted.`,
    },
    info: {
      title: "Where to find my identifier?",
      text: "Your anonymous identifier is given to you at the end of the survey. If you didn't note it down, we unfortunately cannot retrieve it for you as we have no information to identify you.",
    },
    errors: {
      required: "Please enter your anonymous identifier.",
      searchError: "Error while searching",
      deleteError: "Error while deleting",
      unknown: "Unknown error",
    },
    footer: {
      privacy: "Privacy Policy",
      back: "Back to survey",
    },
  },
  fr: {
    title: "Mes Données",
    subtitle: "Gérez vos données personnelles conformément au RGPD",
    search: {
      title: "Retrouver vos données",
      description: "Entrez l'identifiant anonyme qui vous a été communiqué à la fin du sondage pour accéder à vos données ou les supprimer.",
      placeholder: "Votre identifiant anonyme (UUID)",
      button: "Rechercher",
    },
    results: {
      title: "Vos données",
      found: (count: number) => `${count} réponse(s) trouvée(s).`,
      notFound: "Aucune donnée trouvée pour cet identifiant.",
      error: "Une erreur est survenue lors de la recherche.",
    },
    actions: {
      title: "Actions",
      export: "Exporter mes données",
      delete: "Supprimer mes données",
      deleteConfirm: "Êtes-vous sûr de vouloir supprimer toutes vos données ? Cette action est irréversible.",
      deleted: (count: number) => `${count} réponse(s) supprimée(s) avec succès.`,
    },
    info: {
      title: "Où trouver mon identifiant ?",
      text: "Votre identifiant anonyme vous est communiqué à la fin du sondage. Si vous ne l'avez pas noté, nous ne pouvons malheureusement pas vous le retrouver car nous n'avons aucune information permettant de vous identifier.",
    },
    errors: {
      required: "Veuillez entrer votre identifiant anonyme.",
      searchError: "Erreur lors de la recherche",
      deleteError: "Erreur lors de la suppression",
      unknown: "Erreur inconnue",
    },
    footer: {
      privacy: "Politique de confidentialité",
      back: "Retour au sondage",
    },
  },
};

export default function MesDonneesPage() {
  const params = useParams();
  const lang = (params.lang as string) === "en" ? "en" : "fr";
  const t = content[lang];
  const { fetchWithCSRF } = useCSRF();
  const privacyLink = getLocalizedPath(lang, "/privacy");
  const homeLink = getLocalizedPath(lang);

  const [anonymousId, setAnonymousId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [userData, setUserData] = useState<unknown[] | null>(null);

  const handleSearch = async () => {
    if (!anonymousId.trim()) {
      setResult({ type: "error", message: t.errors.required });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/user/data?anonymousId=${encodeURIComponent(anonymousId)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.errors.searchError);
      }

      if (data.data.length === 0) {
        setResult({ type: "info", message: t.results.notFound });
        setUserData(null);
      } else {
        setUserData(data.data);
        setResult({ type: "success", message: t.results.found(data.data.length) });
      }
    } catch (error) {
      setResult({ type: "error", message: error instanceof Error ? error.message : t.errors.unknown });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!userData) return;

    const dataStr = JSON.stringify(userData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lang === "en" ? "my-data" : "mes-donnees"}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!anonymousId.trim()) return;

    const confirmed = window.confirm(t.actions.deleteConfirm);

    if (!confirmed) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetchWithCSRF("/api/user/data", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonymousId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.errors.deleteError);
      }

      setResult({
        type: "success",
        message: t.actions.deleted(data.deletedCount),
      });
      setUserData(null);
      setAnonymousId("");
    } catch (error) {
      setResult({ type: "error", message: error instanceof Error ? error.message : t.errors.unknown });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Database className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {t.title}
          </h1>
          <p className="text-white/60">
            {t.subtitle}
          </p>
        </header>

        <div className="space-y-8">
          {/* Search Section */}
          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              {t.search.title}
            </h2>
            <p className="text-white/60 mb-6">
              {t.search.description}
            </p>

            <div className="flex gap-3">
              <input
                type="text"
                value={anonymousId}
                onChange={(e) => setAnonymousId(e.target.value)}
                placeholder={t.search.placeholder}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {t.search.button}
              </button>
            </div>

            {result && (
              <div
                className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
                  result.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : result.type === "error"
                    ? "bg-red-500/10 border border-red-500/20 text-red-400"
                    : "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                }`}
              >
                {result.type === "success" ? (
                  <CheckCircle className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                )}
                <span>{result.message}</span>
              </div>
            )}
          </section>

          {/* Data Display */}
          {userData && userData.length > 0 && (
            <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">
                {t.results.title}
              </h2>
              <div className="bg-slate-900/50 rounded-xl p-4 max-h-64 overflow-auto">
                <pre className="text-sm text-white/70 whitespace-pre-wrap">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </div>
            </section>
          )}

          {/* Actions */}
          {userData && userData.length > 0 && (
            <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">
                {t.actions.title}
              </h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleExport}
                  className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t.actions.export}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t.actions.delete}
                </button>
              </div>
            </section>
          )}

          {/* Info */}
          <section className="bg-amber-500/10 rounded-2xl p-6 border border-amber-500/20">
            <h3 className="text-lg font-semibold text-amber-400 mb-2">
              {t.info.title}
            </h3>
            <p className="text-amber-200/80">
              {t.info.text}
            </p>
          </section>
        </div>

        <footer className="mt-12 text-center space-x-6">
            <Link
              href={privacyLink}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            {t.footer.privacy}
          </Link>
            <Link
              href={homeLink}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            {t.footer.back}
          </Link>
        </footer>
      </div>
    </div>
  );
}
