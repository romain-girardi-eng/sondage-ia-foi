"use client";

import { useState } from "react";
import { Database, Download, Trash2, Search, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function MesDonneesPage() {
  const [anonymousId, setAnonymousId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [userData, setUserData] = useState<unknown[] | null>(null);

  const handleSearch = async () => {
    if (!anonymousId.trim()) {
      setResult({ type: "error", message: "Veuillez entrer votre identifiant anonyme." });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/user/data?anonymousId=${encodeURIComponent(anonymousId)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la recherche");
      }

      if (data.data.length === 0) {
        setResult({ type: "info", message: "Aucune donnée trouvée pour cet identifiant." });
        setUserData(null);
      } else {
        setUserData(data.data);
        setResult({ type: "success", message: `${data.data.length} réponse(s) trouvée(s).` });
      }
    } catch (error) {
      setResult({ type: "error", message: error instanceof Error ? error.message : "Erreur inconnue" });
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
    a.download = `mes-donnees-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!anonymousId.trim()) return;

    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer toutes vos données ? Cette action est irréversible."
    );

    if (!confirmed) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/user/data", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonymousId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      setResult({
        type: "success",
        message: `${data.deletedCount} réponse(s) supprimée(s) avec succès.`,
      });
      setUserData(null);
      setAnonymousId("");
    } catch (error) {
      setResult({ type: "error", message: error instanceof Error ? error.message : "Erreur inconnue" });
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
            Mes Données
          </h1>
          <p className="text-white/60">
            Gérez vos données personnelles conformément au RGPD
          </p>
        </header>

        <div className="space-y-8">
          {/* Search Section */}
          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              Retrouver vos données
            </h2>
            <p className="text-white/60 mb-6">
              Entrez l&apos;identifiant anonyme qui vous a été communiqué à la fin du sondage
              pour accéder à vos données ou les supprimer.
            </p>

            <div className="flex gap-3">
              <input
                type="text"
                value={anonymousId}
                onChange={(e) => setAnonymousId(e.target.value)}
                placeholder="Votre identifiant anonyme (UUID)"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Rechercher
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
                Vos données
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
                Actions
              </h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleExport}
                  className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exporter mes données
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer mes données
                </button>
              </div>
            </section>
          )}

          {/* Info */}
          <section className="bg-amber-500/10 rounded-2xl p-6 border border-amber-500/20">
            <h3 className="text-lg font-semibold text-amber-400 mb-2">
              Où trouver mon identifiant ?
            </h3>
            <p className="text-amber-200/80">
              Votre identifiant anonyme vous est communiqué à la fin du sondage.
              Si vous ne l&apos;avez pas noté, nous ne pouvons malheureusement pas vous
              le retrouver car nous n&apos;avons aucune information permettant de vous identifier.
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
