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
  TrendingDown,
  Clock,
  Eye,
  Filter,
  Trash2,
  X,
  Globe,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  ChevronRight,
  ExternalLink,
  Search,
  ChevronDown,
  Settings,
  Bell,
  Shield,
  Percent,
  Timer,
  UserCheck,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";

// Types
interface AdminStats {
  overview: {
    totalResponses: number;
    completedResponses: number;
    partialResponses: number;
    completionRate: number;
    avgCompletionTime: number;
    todayResponses: number;
    weekResponses: number;
    monthResponses: number;
  };
  demographics: {
    byLanguage: Record<string, number>;
    byRole: Record<string, number>;
    byDenomination: Record<string, number>;
    byAge: Record<string, number>;
  };
  profiles: Record<string, number>;
  scores: {
    avgReligiosity: number;
    avgAIAdoption: number;
    avgResistance: number;
    religiosityDistribution: Record<string, number>;
    aiAdoptionDistribution: Record<string, number>;
  };
  timeline: Array<{ date: string; count: number }>;
  recentResponses: Array<{
    id: string;
    createdAt: string;
    language: string;
    completed: boolean;
    profile: string;
    religiosityScore: string;
    aiScore: string;
  }>;
  conversionFunnel: {
    started: number;
    section1Complete: number;
    section2Complete: number;
    section3Complete: number;
    completed: number;
  };
  demo?: boolean;
}

interface ExportFilters {
  dateFrom: string;
  dateTo: string;
  language: "" | "fr" | "en";
}

// Color palette
const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];

const PROFILE_COLORS: Record<string, string> = {
  gardien_tradition: "#ef4444",
  prudent_eclaire: "#f59e0b",
  innovateur_ancre: "#84cc16",
  equilibriste: "#10b981",
  pragmatique_moderne: "#06b6d4",
  pionnier_spirituel: "#3b82f6",
  progressiste_critique: "#8b5cf6",
  explorateur: "#ec4899",
};

const PROFILE_LABELS: Record<string, string> = {
  gardien_tradition: "Gardien de la Tradition",
  prudent_eclaire: "Prudent Éclairé",
  innovateur_ancre: "Innovateur Ancré",
  equilibriste: "Équilibriste",
  pragmatique_moderne: "Pragmatique Moderne",
  pionnier_spirituel: "Pionnier Spirituel",
  progressiste_critique: "Progressiste Critique",
  explorateur: "Explorateur",
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "responses" | "analytics" | "export">("overview");
  const [exportLoading, setExportLoading] = useState<"json" | "csv" | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ExportFilters>({
    dateFrom: "",
    dateTo: "",
    language: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("admin_token");
      const response = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedAuth = sessionStorage.getItem("admin_authenticated");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      // Auto-refresh every 5 minutes
      const interval = setInterval(fetchStats, 300000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchStats]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${password}` },
      });

      if (response.ok) {
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
    setStats(null);
  };

  const handleExport = async (format: "json" | "csv") => {
    setExportLoading(format);
    setExportSuccess(null);

    try {
      const token = sessionStorage.getItem("admin_token");
      const params = new URLSearchParams({ format });

      if (filters.dateFrom) {
        params.append("dateFrom", new Date(filters.dateFrom).toISOString());
      }
      if (filters.dateTo) {
        params.append("dateTo", new Date(filters.dateTo).toISOString());
      }
      if (filters.language) {
        params.append("language", filters.language);
      }

      const response = await fetch(`/api/results/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
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
        setExportSuccess(`Export ${format.toUpperCase()} downloaded successfully`);
      } else if (response.status === 404) {
        setExportSuccess("No data to export");
      } else {
        setExportSuccess("Export failed");
      }
    } catch {
      setExportSuccess("Export failed");
    } finally {
      setExportLoading(null);
      setTimeout(() => setExportSuccess(null), 3000);
    }
  };

  // Login Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md"
        >
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-xs text-white/50">Sondage IA & Foi</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {authError}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full py-3.5 rounded-xl font-medium transition-all",
                  "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500",
                  "text-white shadow-lg shadow-blue-500/25",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="text-xs text-white/30 text-center mt-6">
              Protected area. Authorized access only.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white/[0.02] border-r border-white/5 p-4 hidden lg:block">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white">Dashboard</h1>
            <p className="text-xs text-white/50">Sondage IA & Foi</p>
          </div>
        </div>

        <nav className="space-y-1">
          {[
            { id: "overview", icon: Activity, label: "Overview" },
            { id: "responses", icon: Users, label: "Responses" },
            { id: "analytics", icon: PieChart, label: "Analytics" },
            { id: "export", icon: Download, label: "Export" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeTab === item.id
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu */}
              <button className="lg:hidden p-2 hover:bg-white/5 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </button>

              <div>
                <h2 className="text-lg font-semibold text-white capitalize">{activeTab}</h2>
                <p className="text-sm text-white/50">
                  {stats?.demo ? "Demo Mode" : "Live Data"} • Last updated:{" "}
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchStats}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm transition-all"
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button className="relative p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                <Bell className="w-4 h-4 text-white" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
              </button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="flex gap-2 mt-4 lg:hidden overflow-x-auto pb-2">
            {[
              { id: "overview", icon: Activity, label: "Overview" },
              { id: "responses", icon: Users, label: "Responses" },
              { id: "analytics", icon: PieChart, label: "Analytics" },
              { id: "export", icon: Download, label: "Export" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                  activeTab === item.id
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 text-white/60 hover:text-white"
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && stats && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={<Users className="w-5 h-5" />}
                    label="Total Responses"
                    value={stats.overview.totalResponses.toLocaleString()}
                    trend={{ value: stats.overview.todayResponses, label: "today" }}
                    color="blue"
                  />
                  <StatCard
                    icon={<UserCheck className="w-5 h-5" />}
                    label="Completed"
                    value={stats.overview.completedResponses.toLocaleString()}
                    trend={{ value: stats.overview.completionRate, label: "rate", suffix: "%" }}
                    color="green"
                  />
                  <StatCard
                    icon={<Timer className="w-5 h-5" />}
                    label="Avg. Time"
                    value={`${stats.overview.avgCompletionTime}m`}
                    subtext="to complete"
                    color="purple"
                  />
                  <StatCard
                    icon={<Zap className="w-5 h-5" />}
                    label="This Week"
                    value={stats.overview.weekResponses.toLocaleString()}
                    trend={{ value: Math.round(stats.overview.weekResponses / 7), label: "/day" }}
                    color="amber"
                  />
                </div>

                {/* Charts Row */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Timeline Chart */}
                  <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-white">Response Timeline</h3>
                      <span className="text-xs text-white/50">Last 30 days</span>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.timeline}>
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                          <XAxis
                            dataKey="date"
                            stroke="#ffffff30"
                            fontSize={11}
                            tickFormatter={(v) => new Date(v).getDate().toString()}
                          />
                          <YAxis stroke="#ffffff30" fontSize={11} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "8px",
                            }}
                            labelFormatter={(v) => new Date(v).toLocaleDateString()}
                          />
                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorCount)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Language Distribution */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-6">By Language</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={Object.entries(stats.demographics.byLanguage).map(([name, value]) => ({
                              name: name === "fr" ? "French" : name === "en" ? "English" : name,
                              value,
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {Object.keys(stats.demographics.byLanguage).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span className="text-white/70 text-xs">{value}</span>}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                      {Object.entries(stats.demographics.byLanguage).map(([lang, count], i) => (
                        <div key={lang} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                            />
                            <span className="text-sm text-white/70">
                              {lang === "fr" ? "French" : lang === "en" ? "English" : lang}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-white">{count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Profile Distribution */}
                {Object.keys(stats.profiles).length > 0 && (
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-6">Spiritual-AI Profiles</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(stats.profiles).map(([id, value]) => ({
                            name: PROFILE_LABELS[id] || id,
                            value,
                            fill: PROFILE_COLORS[id] || "#3b82f6",
                          }))}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                          <XAxis type="number" stroke="#ffffff30" fontSize={11} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            stroke="#ffffff30"
                            fontSize={11}
                            width={140}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {Object.entries(stats.profiles).map(([id]) => (
                              <Cell key={id} fill={PROFILE_COLORS[id] || "#3b82f6"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Recent Responses */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-white/5">
                    <h3 className="font-semibold text-white">Recent Responses</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left text-white/50 font-medium text-xs uppercase tracking-wider py-3 px-6">
                            ID
                          </th>
                          <th className="text-left text-white/50 font-medium text-xs uppercase tracking-wider py-3 px-6">
                            Date
                          </th>
                          <th className="text-left text-white/50 font-medium text-xs uppercase tracking-wider py-3 px-6">
                            Language
                          </th>
                          <th className="text-left text-white/50 font-medium text-xs uppercase tracking-wider py-3 px-6">
                            Status
                          </th>
                          <th className="text-left text-white/50 font-medium text-xs uppercase tracking-wider py-3 px-6">
                            Profile
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentResponses.map((response, i) => (
                          <tr
                            key={response.id}
                            className={cn("border-b border-white/5 hover:bg-white/[0.02] transition-colors")}
                          >
                            <td className="py-4 px-6">
                              <span className="font-mono text-sm text-white/70">{response.id.slice(0, 8)}...</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-sm text-white/70">
                                {new Date(response.createdAt).toLocaleDateString()}{" "}
                                <span className="text-white/40">
                                  {new Date(response.createdAt).toLocaleTimeString()}
                                </span>
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium",
                                  response.language === "fr"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-purple-500/20 text-purple-400"
                                )}
                              >
                                <Globe className="w-3 h-3" />
                                {response.language.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium",
                                  response.completed
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-amber-500/20 text-amber-400"
                                )}
                              >
                                {response.completed ? (
                                  <>
                                    <CheckCircle className="w-3 h-3" />
                                    Complete
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3" />
                                    Partial
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-sm text-white/50">
                                {PROFILE_LABELS[response.profile] || response.profile}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "responses" && stats && (
              <motion.div
                key="responses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search responses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                      showFilters
                        ? "bg-blue-600 text-white"
                        : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                    )}
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                </div>

                {/* Conversion Funnel */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                  <h3 className="font-semibold text-white mb-6">Conversion Funnel</h3>
                  <div className="grid grid-cols-5 gap-4">
                    {[
                      { label: "Started", value: stats.conversionFunnel.started, color: "#3b82f6" },
                      { label: "Section 1", value: stats.conversionFunnel.section1Complete, color: "#8b5cf6" },
                      { label: "Section 2", value: stats.conversionFunnel.section2Complete, color: "#06b6d4" },
                      { label: "Section 3", value: stats.conversionFunnel.section3Complete, color: "#10b981" },
                      { label: "Completed", value: stats.conversionFunnel.completed, color: "#22c55e" },
                    ].map((step, i) => (
                      <div key={step.label} className="text-center">
                        <div
                          className="h-24 rounded-lg mb-2 flex items-end justify-center"
                          style={{
                            background: `linear-gradient(to top, ${step.color}30, transparent)`,
                          }}
                        >
                          <div
                            className="w-full rounded-lg transition-all"
                            style={{
                              height: `${(step.value / stats.conversionFunnel.started) * 100}%`,
                              backgroundColor: step.color,
                            }}
                          />
                        </div>
                        <p className="text-lg font-bold text-white">{step.value.toLocaleString()}</p>
                        <p className="text-xs text-white/50">{step.label}</p>
                        {i > 0 && (
                          <p className="text-xs text-white/30 mt-1">
                            {Math.round(
                              (step.value /
                                [
                                  stats.conversionFunnel.started,
                                  stats.conversionFunnel.section1Complete,
                                  stats.conversionFunnel.section2Complete,
                                  stats.conversionFunnel.section3Complete,
                                ][i - 1]) *
                                100
                            )}
                            % retained
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* All Responses Table */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-semibold text-white">All Responses</h3>
                    <span className="text-sm text-white/50">
                      {stats.overview.totalResponses.toLocaleString()} total
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left text-white/50 font-medium text-xs uppercase tracking-wider py-3 px-6">
                            ID
                          </th>
                          <th className="text-left text-white/50 font-medium text-xs uppercase tracking-wider py-3 px-6">
                            Date
                          </th>
                          <th className="text-left text-white/50 font-medium text-xs uppercase tracking-wider py-3 px-6">
                            Language
                          </th>
                          <th className="text-left text-white/50 font-medium text-xs uppercase tracking-wider py-3 px-6">
                            Status
                          </th>
                          <th className="text-left text-white/50 font-medium text-xs uppercase tracking-wider py-3 px-6">
                            Religiosity
                          </th>
                          <th className="text-left text-white/50 font-medium text-xs uppercase tracking-wider py-3 px-6">
                            AI Score
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentResponses.map((response) => (
                          <tr
                            key={response.id}
                            className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-4 px-6">
                              <span className="font-mono text-sm text-white/70">{response.id.slice(0, 8)}...</span>
                            </td>
                            <td className="py-4 px-6 text-sm text-white/70">
                              {new Date(response.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium",
                                  response.language === "fr"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-purple-500/20 text-purple-400"
                                )}
                              >
                                {response.language.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                                  response.completed
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-amber-500/20 text-amber-400"
                                )}
                              >
                                {response.completed ? "Complete" : "Partial"}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm text-white/70">{response.religiosityScore}</td>
                            <td className="py-4 px-6 text-sm text-white/70">{response.aiScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "analytics" && stats && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Score Overview */}
                <div className="grid lg:grid-cols-3 gap-4">
                  <ScoreCard
                    label="Average Religiosity"
                    score={stats.scores.avgReligiosity}
                    maxScore={5}
                    color="blue"
                  />
                  <ScoreCard
                    label="Average AI Adoption"
                    score={stats.scores.avgAIAdoption}
                    maxScore={5}
                    color="green"
                  />
                  <ScoreCard
                    label="Spiritual Resistance"
                    score={stats.scores.avgResistance}
                    maxScore={4}
                    color="amber"
                  />
                </div>

                {/* Distribution Charts */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Religiosity Distribution */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-6">Religiosity Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(stats.scores.religiosityDistribution).map(([range, count]) => ({
                            range,
                            count,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                          <XAxis dataKey="range" stroke="#ffffff30" fontSize={11} />
                          <YAxis stroke="#ffffff30" fontSize={11} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* AI Adoption Distribution */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-6">AI Adoption Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(stats.scores.aiAdoptionDistribution).map(([range, count]) => ({
                            range,
                            count,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                          <XAxis dataKey="range" stroke="#ffffff30" fontSize={11} />
                          <YAxis stroke="#ffffff30" fontSize={11} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Demographics */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* By Role */}
                  {Object.keys(stats.demographics.byRole).length > 0 && (
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-6">By Role</h3>
                      <div className="space-y-3">
                        {Object.entries(stats.demographics.byRole).map(([role, count], i) => (
                          <div key={role}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-white/70 capitalize">{role.replace("_", " ")}</span>
                              <span className="text-white font-medium">{count.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(count / stats.overview.totalResponses) * 100}%`,
                                  backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* By Age */}
                  {Object.keys(stats.demographics.byAge).length > 0 && (
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-6">By Age Group</h3>
                      <div className="space-y-3">
                        {Object.entries(stats.demographics.byAge).map(([age, count], i) => (
                          <div key={age}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-white/70">{age}</span>
                              <span className="text-white font-medium">{count.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(count / stats.overview.totalResponses) * 100}%`,
                                  backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "export" && (
              <motion.div
                key="export"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-3xl mx-auto space-y-6"
              >
                {/* Export Card */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Download className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Export Data</h2>
                    <p className="text-white/60">
                      Download survey responses in JSON or CSV format. Only consented responses are included.
                    </p>
                  </div>

                  {/* Filters */}
                  <div className="bg-white/5 rounded-xl p-6 mb-6">
                    <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filter Options
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-white/50 mb-1.5">Start Date</label>
                        <input
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1.5">End Date</label>
                        <input
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1.5">Language</label>
                        <select
                          value={filters.language}
                          onChange={(e) => setFilters({ ...filters, language: e.target.value as "" | "fr" | "en" })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          <option value="">All Languages</option>
                          <option value="fr">French</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Export Buttons */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleExport("json")}
                      disabled={exportLoading !== null}
                      className={cn(
                        "flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all",
                        "bg-blue-600 hover:bg-blue-500 text-white",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {exportLoading === "json" ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <FileJson className="w-5 h-5" />
                      )}
                      Export as JSON
                    </button>

                    <button
                      onClick={() => handleExport("csv")}
                      disabled={exportLoading !== null}
                      className={cn(
                        "flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all",
                        "bg-green-600 hover:bg-green-500 text-white",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {exportLoading === "csv" ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="w-5 h-5" />
                      )}
                      Export as CSV
                    </button>
                  </div>

                  <AnimatePresence>
                    {exportSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-2 mt-6 text-green-400"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {exportSuccess}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Export Info */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex gap-3">
                    <FileText className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-400 mb-1">Data Privacy Notice</h4>
                      <p className="text-sm text-blue-300/70">
                        Exported data includes only responses from participants who provided consent. Personal
                        identifiers are anonymized according to GDPR guidelines.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  trend,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: { value: number; label: string; suffix?: string };
  subtext?: string;
  color: "blue" | "green" | "purple" | "amber";
}) {
  const colorStyles = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/20",
    green: "from-green-500/20 to-green-600/20 border-green-500/20",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/20",
    amber: "from-amber-500/20 to-amber-600/20 border-amber-500/20",
  };

  const iconColors = {
    blue: "text-blue-400",
    green: "text-green-400",
    purple: "text-purple-400",
    amber: "text-amber-400",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5",
        "bg-gradient-to-br",
        colorStyles[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-2 rounded-lg bg-white/10", iconColors[color])}>{icon}</div>
        {trend && (
          <div className="text-right">
            <span className={cn("text-sm font-medium", iconColors[color])}>
              +{trend.value}
              {trend.suffix}
            </span>
            <p className="text-xs text-white/40">{trend.label}</p>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl lg:text-3xl font-bold text-white">{value}</p>
        <p className="text-sm text-white/50 mt-1">{subtext || label}</p>
      </div>
    </div>
  );
}

// Score Card Component
function ScoreCard({
  label,
  score,
  maxScore,
  color,
}: {
  label: string;
  score: number;
  maxScore: number;
  color: "blue" | "green" | "amber";
}) {
  const percentage = (score / maxScore) * 100;

  const colors = {
    blue: { bg: "bg-blue-500", text: "text-blue-400" },
    green: { bg: "bg-green-500", text: "text-green-400" },
    amber: { bg: "bg-amber-500", text: "text-amber-400" },
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      <h4 className="text-sm text-white/50 mb-2">{label}</h4>
      <div className="flex items-end gap-2 mb-4">
        <span className={cn("text-4xl font-bold", colors[color].text)}>{score.toFixed(1)}</span>
        <span className="text-white/30 text-lg mb-1">/ {maxScore}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", colors[color].bg)}
        />
      </div>
    </div>
  );
}
