"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  LogOut,
  Download,
  RefreshCw,
  Users,
  Calendar,
  FileJson,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Clock,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardData {
  participantCount: number;
  results: Array<{
    questionId: string;
    distribution: Record<string, number>;
    totalResponses: number;
  }>;
  lastUpdated: string;
  demo?: boolean;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [exportLoading, setExportLoading] = useState<"json" | "csv" | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/results/aggregated");
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if already authenticated (stored in sessionStorage)
    const storedAuth = sessionStorage.getItem("admin_authenticated");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, fetchDashboardData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);

    try {
      // Test authentication by making a request to the export endpoint
      const response = await fetch("/api/results/export?format=json", {
        headers: {
          Authorization: `Bearer ${password}`,
        },
      });

      if (response.ok || response.status === 404) {
        // 404 means authenticated but no data
        setIsAuthenticated(true);
        sessionStorage.setItem("admin_authenticated", "true");
        sessionStorage.setItem("admin_token", password);
      } else if (response.status === 401) {
        setAuthError("Mot de passe incorrect");
      } else {
        setAuthError("Erreur de connexion");
      }
    } catch {
      setAuthError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    sessionStorage.removeItem("admin_token");
    setPassword("");
  };

  const handleExport = async (format: "json" | "csv") => {
    setExportLoading(format);
    setExportSuccess(null);

    try {
      const token = sessionStorage.getItem("admin_token");
      const response = await fetch(`/api/results/export?format=${format}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `survey-export-${new Date().toISOString().split("T")[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setExportSuccess(`Export ${format.toUpperCase()} téléchargé avec succès`);
      } else if (response.status === 404) {
        setExportSuccess("Aucune donnée à exporter");
      } else {
        setExportSuccess("Erreur lors de l'export");
      }
    } catch {
      setExportSuccess("Erreur lors de l'export");
    } finally {
      setExportLoading(null);
      setTimeout(() => setExportSuccess(null), 3000);
    }
  };

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mx-auto mb-6">
              <Lock className="w-8 h-8 text-blue-400" />
            </div>

            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Administration
            </h1>
            <p className="text-white/60 text-center mb-8">
              Connectez-vous pour accéder au tableau de bord
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
                  Mot de passe administrateur
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <AnimatePresence mode="wait">
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {authError}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full py-3 rounded-xl font-medium transition-all",
                  "bg-blue-600 hover:bg-blue-500 text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Tableau de Bord Admin
            </h1>
            <p className="text-white/60 mt-1">
              Gestion et export des données du sondage
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              Actualiser
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </motion.header>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Participants"
            value={dashboardData?.participantCount || 0}
            color="blue"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Questions"
            value={dashboardData?.results?.length || 0}
            color="green"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Dernière MAJ"
            value={dashboardData?.lastUpdated ? new Date(dashboardData.lastUpdated).toLocaleTimeString("fr-FR") : "-"}
            color="purple"
          />
          <StatCard
            icon={<Eye className="w-5 h-5" />}
            label="Mode"
            value={dashboardData?.demo ? "Démo" : "Production"}
            color={dashboardData?.demo ? "yellow" : "green"}
          />
        </motion.div>

        {/* Export Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-400" />
            Exporter les données
          </h2>

          <p className="text-white/60 mb-6">
            Téléchargez les données du sondage au format JSON ou CSV.
            Seules les réponses avec consentement sont exportées.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleExport("json")}
              disabled={exportLoading !== null}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                "bg-blue-600 hover:bg-blue-500 text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {exportLoading === "json" ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <FileJson className="w-5 h-5" />
              )}
              Export JSON
            </button>

            <button
              onClick={() => handleExport("csv")}
              disabled={exportLoading !== null}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                "bg-green-600 hover:bg-green-500 text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {exportLoading === "csv" ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-5 h-5" />
              )}
              Export CSV
            </button>
          </div>

          <AnimatePresence>
            {exportSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 mt-4 text-green-400"
              >
                <CheckCircle className="w-5 h-5" />
                {exportSuccess}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Aperçu des résultats
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-white/40 animate-spin" />
            </div>
          ) : dashboardData?.results && dashboardData.results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/60 font-medium py-3 px-4">Question ID</th>
                    <th className="text-left text-white/60 font-medium py-3 px-4">Réponses</th>
                    <th className="text-left text-white/60 font-medium py-3 px-4">Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.results.slice(0, 10).map((result, index) => (
                    <tr
                      key={result.questionId}
                      className={cn(
                        "border-b border-white/5",
                        index % 2 === 0 ? "bg-white/[0.02]" : ""
                      )}
                    >
                      <td className="py-3 px-4 text-white font-mono text-sm">
                        {result.questionId}
                      </td>
                      <td className="py-3 px-4 text-white/80">
                        {result.totalResponses || Object.values(result.distribution).reduce((a, b) => a + b, 0)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(result.distribution)
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <span
                                key={key}
                                className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded"
                              >
                                {key}: {value}
                              </span>
                            ))}
                          {Object.keys(result.distribution).length > 3 && (
                            <span className="text-xs px-2 py-1 bg-white/10 text-white/60 rounded">
                              +{Object.keys(result.distribution).length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dashboardData.results.length > 10 && (
                <p className="text-white/40 text-sm mt-4 text-center">
                  Affichage de 10 sur {dashboardData.results.length} questions.
                  Exportez les données pour voir tous les résultats.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-white/40">
              <p>Aucune donnée disponible</p>
              <p className="text-sm mt-2">
                {dashboardData?.demo
                  ? "Mode démo activé - Configurez Supabase pour les données réelles"
                  : "Les résultats apparaîtront ici une fois les premières réponses reçues"}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: "blue" | "green" | "purple" | "yellow";
}) {
  const colorStyles = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    green: "bg-green-500/10 border-green-500/20 text-green-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
      <div className={cn("inline-flex p-2 rounded-lg mb-3", colorStyles[color])}>
        {icon}
      </div>
      <p className="text-white/60 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}
