"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  LogOut,
  Download,
  RefreshCw,
  Users,
  FileJson,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  X,
  Globe,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Search,
  Bell,
  Shield,
  Timer,
  UserCheck,
  FileText,
  TrendingUp,
  Sparkles,
  Target,
  GitCompare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { SURVEY_QUESTIONS } from "@/data/surveySchema";

// Helper functions to get question labels
const getQuestionText = (questionId: string): string => {
  const question = SURVEY_QUESTIONS.find((q) => q.id === questionId);
  return question?.text || questionId;
};

const getAnswerLabel = (questionId: string, value: string | number | string[]): string => {
  if (Array.isArray(value)) {
    return value
      .map((v) => {
        const question = SURVEY_QUESTIONS.find((q) => q.id === questionId);
        const option = question?.options?.find((o) => o.value === v);
        return option?.label || v;
      })
      .join(", ");
  }

  const question = SURVEY_QUESTIONS.find((q) => q.id === questionId);
  const option = question?.options?.find((o) => o.value === value);
  return option?.label || String(value);
};

const getQuestionCategory = (questionId: string): string => {
  const question = SURVEY_QUESTIONS.find((q) => q.id === questionId);
  return question?.category || "other";
};

const CATEGORY_LABELS: Record<string, string> = {
  profile: "📋 Profil & Démographie",
  religiosity: "🙏 Religiosité (CRS-5)",
  usage: "💻 Usage de l'IA",
  digital_spiritual: "🌐 Pratiques spirituelles numériques",
  ministry_preaching: "📖 Ministère - Prédication",
  ministry_pastoral: "💬 Ministère - Accompagnement",
  ministry_vision: "🔮 Ministère - Vision future",
  spirituality: "✨ Spiritualité & IA",
  theology: "📚 Théologie & IA",
  psychology: "🧠 Perception psychologique",
  community: "👥 Communauté",
  future: "🚀 Futur de l'IA",
  social_desirability: "📊 Contrôle",
  open: "💭 Questions ouvertes",
  other: "📝 Autres",
};

// Types
interface SegmentStats {
  count: number;
  avgReligiosity: number;
  avgAiAdoption: number;
  avgResistance: number;
  profileDistribution: Record<string, number>;
  dimensionAverages: Record<string, number>;
}

interface DimensionStat {
  mean: number;
  stdDev: number;
  median: number;
  distribution: number[];
}

interface KeyFinding {
  type: 'correlation' | 'segment' | 'pattern';
  title: string;
  description: string;
  significance: 'high' | 'medium' | 'low';
}

interface ProfileCluster {
  profile: string;
  count: number;
  avgReligiosity: number;
  avgAiOpenness: number;
}

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
    byGender?: Record<string, number>;
    byCountry?: Record<string, number>;
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
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  conversionFunnel: {
    started: number;
    section1Complete: number;
    section2Complete: number;
    section3Complete: number;
    completed: number;
  };
  // Enhanced analytics
  segmentedAnalysis?: {
    byRole: Record<string, SegmentStats>;
    byDenomination: Record<string, SegmentStats>;
    byAge: Record<string, SegmentStats>;
  };
  dimensionStats?: Record<string, DimensionStat>;
  correlationMatrix?: Record<string, Record<string, number>>;
  profileClusters?: ProfileCluster[];
  keyFindings?: KeyFinding[];
  populationAverages?: Record<string, number>;
  demo?: boolean;
}

interface ExportFilters {
  dateFrom: string;
  dateTo: string;
  language: "" | "fr" | "en";
}

interface ResponseDetail {
  id: string;
  createdAt: string;
  language: string;
  completionTime: number | null;
  answers: Record<string, string | number | string[]>;
  scores: {
    crs5: {
      value: number;
      breakdown: Record<string, number>;
    };
    aiAdoption: {
      value: number;
      breakdown: Record<string, number>;
    };
    resistanceIndex: number;
  };
  profile: {
    primary: {
      name: string;
      score: number;
      title: string;
      emoji: string;
    };
    secondary: {
      name: string;
      score: number;
      title: string;
    } | null;
    subProfile: string;
    allMatches: Array<{ name: string; score: number }>;
  };
  dimensions: {
    religiosity: { value: number; percentile: number };
    aiOpenness: { value: number; percentile: number };
    sacredBoundary: { value: number; percentile: number };
    ethicalConcern: { value: number; percentile: number };
    psychologicalPerception: { value: number; percentile: number };
    communityInfluence: { value: number; percentile: number };
    futureOrientation: { value: number; percentile: number };
  };
  interpretation: {
    headline: string;
    narrative: string;
    uniqueAspects: string[];
    blindSpots: string[];
  };
  growthAreas: Array<{
    area: string;
    currentState: string;
    potentialGrowth: string;
    actionableStep: string;
  }>;
  tensions: Array<{
    dimension1: string;
    dimension2: string;
    description: string;
    suggestion: string;
  }>;
  insights: Array<{
    category: string;
    icon: string;
    title: string;
    message: string;
    priority: number;
  }>;
}

const DIMENSION_LABELS: Record<string, string> = {
  religiosity: "Religiosité",
  aiOpenness: "Ouverture IA",
  sacredBoundary: "Frontière sacrée",
  ethicalConcern: "Préoccupation éthique",
  psychologicalPerception: "Perception psychologique",
  communityInfluence: "Influence communautaire",
  futureOrientation: "Orientation future",
};

const ROLE_LABELS: Record<string, string> = {
  clerge: "Clergé",
  religieux: "Religieux/Religieuse",
  laic_engagé: "Laïc engagé",
  laic_pratiquant: "Laïc pratiquant",
  curieux: "Curieux/Sympathisant",
};

const DENOMINATION_LABELS: Record<string, string> = {
  catholique: "Catholique",
  protestant: "Protestant",
  orthodoxe: "Orthodoxe",
  autre: "Autre",
  sans_religion: "Sans religion",
};

const AGE_LABELS: Record<string, string> = {
  "18-35": "18-35 ans",
  "36-50": "36-50 ans",
  "51-65": "51-65 ans",
  "66+": "Plus de 66 ans",
};

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
  const [activeTab, setActiveTab] = useState<"overview" | "responses" | "analytics" | "executive" | "export">("overview");
  const [exportLoading, setExportLoading] = useState<"json" | "csv" | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ExportFilters>({
    dateFrom: "",
    dateTo: "",
    language: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);
  const [responseDetail, setResponseDetail] = useState<ResponseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<"profil" | "scores" | "reponses" | "analyse">("profil");
const [selectedResponseIds, setSelectedResponseIds] = useState<string[]>([]);
const [showComparison, setShowComparison] = useState(false);
const [showNotifications, setShowNotifications] = useState(false);
const [comparisonData, setComparisonData] = useState<ResponseDetail[]>([]);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [responsesPerPage] = useState(20);

  const fetchStats = useCallback(async (page = 1, search = "") => {
    try {
      setIsLoading(true);
      setStatsError(null);
      const token = sessionStorage.getItem("admin_token");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: responsesPerPage.toString(),
        ...(search && { search }),
      });
      const response = await fetch(`/api/admin/stats?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastRefresh(new Date());
      } else {
        const errorData = await response.json().catch(() => ({}));
        setStatsError(errorData.error || `Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setStatsError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [responsesPerPage]);

  const fetchResponseDetail = useCallback(async (responseId: string) => {
    try {
      setDetailLoading(true);
      setDetailError(null);
      const token = sessionStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/response/${responseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setResponseDetail(data);
        setActiveDetailTab("profil");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setDetailError(errorData.error || `Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to fetch response detail:", error);
      setDetailError("Failed to load response details.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleOpenDetail = (responseId: string) => {
    setSelectedResponseId(responseId);
    fetchResponseDetail(responseId);
  };

  const handleCloseDetail = () => {
    setSelectedResponseId(null);
    setResponseDetail(null);
  };

  const handleToggleSelection = (id: string) => {
    setSelectedResponseIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 3) {
        // Max 3 selections for comparison
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const handleClearSelection = () => {
    setSelectedResponseIds([]);
    setShowComparison(false);
    setComparisonData([]);
  };

  const handleCompareSelected = async () => {
    if (selectedResponseIds.length < 2) return;

    setShowComparison(true);
    setComparisonData([]);

    // Fetch details for all selected responses
    const token = sessionStorage.getItem("admin_token") || "";
    const details: ResponseDetail[] = [];

    for (const id of selectedResponseIds) {
      try {
        const response = await fetch(`/api/admin/response/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          details.push(data);
        }
      } catch (error) {
        console.error("Error fetching response for comparison:", id, error);
      }
    }

    setComparisonData(details);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchStats(newPage, searchQuery);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchStats(1, searchQuery);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showNotifications && !target.closest('[data-notifications]')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
          <div className="bg-card backdrop-blur-2xl border border-border rounded-3xl p-8 shadow-2xl">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">Sondage IA & Foi</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-2">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
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

            <p className="text-xs text-muted-foreground/50 text-center mt-6">
              Protected area. Authorized access only.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border p-4 hidden lg:block">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Dashboard</h1>
            <p className="text-xs text-muted-foreground">Sondage IA & Foi</p>
          </div>
        </div>

        <nav className="space-y-1">
          {[
            { id: "overview", icon: Activity, label: "Overview" },
            { id: "responses", icon: Users, label: "Responses" },
            { id: "analytics", icon: PieChart, label: "Analytics" },
            { id: "executive", icon: Sparkles, label: "Executive" },
            { id: "export", icon: Download, label: "Export" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu */}
              <button className="lg:hidden p-2 hover:bg-accent rounded-lg">
                <BarChart3 className="w-5 h-5 text-foreground" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground capitalize">{activeTab}</h2>
                  {stats?.demo && (
                    <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium rounded-full">
                      Demo
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {lastRefresh
                    ? `Last updated: ${lastRefresh.toLocaleTimeString()}`
                    : "Loading..."}
                  {stats && !stats.demo && ` • ${stats.overview.completedResponses} responses`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchStats(currentPage, searchQuery)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-accent border border-border rounded-xl text-foreground text-sm transition-all"
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <div className="relative" data-notifications>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 bg-muted hover:bg-accent border border-border rounded-xl transition-all"
                >
                  <Bell className="w-4 h-4 text-foreground" />
                  {stats && stats.recentResponses.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && stats && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-border flex items-center justify-between">
                        <h4 className="text-sm font-medium text-foreground">Recent Responses</h4>
                        <span className="text-xs text-muted-foreground">{stats.recentResponses.length} latest</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {stats.recentResponses.length === 0 ? (
                          <div className="p-6 text-center text-muted-foreground text-sm">
                            No responses yet
                          </div>
                        ) : (
                          stats.recentResponses.slice(0, 5).map((response) => (
                            <button
                              key={response.id}
                              onClick={() => {
                                handleOpenDetail(response.id);
                                setShowNotifications(false);
                              }}
                              className="w-full p-3 hover:bg-accent border-b border-border last:border-0 text-left transition-colors"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-xs text-foreground/70">
                                  #{response.id.slice(0, 8)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(response.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "text-xs px-1.5 py-0.5 rounded",
                                    response.completed
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-amber-500/20 text-amber-400"
                                  )}
                                >
                                  {response.completed ? "Complete" : "Partial"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {PROFILE_LABELS[response.profile] || response.profile}
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      {stats.recentResponses.length > 0 && (
                        <div className="p-2 border-t border-border">
                          <button
                            onClick={() => {
                              setActiveTab("responses");
                              setShowNotifications(false);
                            }}
                            className="w-full text-center text-xs text-blue-400 hover:text-blue-300 py-2 transition-colors"
                          >
                            View all responses →
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="flex gap-2 mt-4 lg:hidden overflow-x-auto pb-2">
            {[
              { id: "overview", icon: Activity, label: "Overview" },
              { id: "responses", icon: Users, label: "Responses" },
              { id: "analytics", icon: PieChart, label: "Analytics" },
              { id: "executive", icon: Sparkles, label: "Executive" },
              { id: "export", icon: Download, label: "Export" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
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
          {/* Error State */}
          {statsError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-400">Error Loading Data</h3>
                  <p className="text-sm text-red-300/70 mt-1">{statsError}</p>
                </div>
                <button
                  onClick={() => fetchStats(currentPage, searchQuery)}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            </motion.div>
          )}

          {/* Loading Skeleton */}
          {isLoading && !stats && (
            <div className="space-y-6">
              {/* Skeleton Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border bg-card p-5 animate-pulse"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-lg bg-muted" />
                      <div className="w-16 h-4 rounded bg-muted" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="w-20 h-8 rounded bg-muted" />
                      <div className="w-32 h-4 rounded bg-muted/50" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skeleton Chart */}
              <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
                <div className="w-40 h-6 rounded bg-muted mb-6" />
                <div className="h-64 flex items-end gap-2">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-muted/50"
                      style={{ height: `${Math.random() * 80 + 20}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

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
                  <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-foreground">Response Timeline</h3>
                      <span className="text-xs text-muted-foreground">Last 30 days</span>
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                        <AreaChart data={stats.timeline}>
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis
                            dataKey="date"
                            className="stroke-muted-foreground"
                            fontSize={11}
                            tickFormatter={(v) => new Date(v).getDate().toString()}
                          />
                          <YAxis className="stroke-muted-foreground" fontSize={11} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              color: "hsl(var(--foreground))",
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
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-semibold text-foreground mb-6">By Language</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
                            formatter={(value) => <span className="text-muted-foreground text-xs">{value}</span>}
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
                            <span className="text-sm text-muted-foreground">
                              {lang === "fr" ? "French" : lang === "en" ? "English" : lang}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-foreground">{count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Profile Distribution */}
                {Object.keys(stats.profiles).length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-semibold text-foreground mb-6">Spiritual-AI Profiles</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                        <BarChart
                          data={Object.entries(stats.profiles).map(([id, value]) => ({
                            name: PROFILE_LABELS[id] || id,
                            value,
                            fill: PROFILE_COLORS[id] || "#3b82f6",
                          }))}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis type="number" className="stroke-muted-foreground" fontSize={11} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            className="stroke-muted-foreground"
                            fontSize={11}
                            width={140}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              color: "hsl(var(--foreground))",
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
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-border">
                    <h3 className="font-semibold text-foreground">Recent Responses</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-muted-foreground font-medium text-xs uppercase tracking-wider py-3 px-6">
                            ID
                          </th>
                          <th className="text-left text-muted-foreground font-medium text-xs uppercase tracking-wider py-3 px-6">
                            Date
                          </th>
                          <th className="text-left text-muted-foreground font-medium text-xs uppercase tracking-wider py-3 px-6">
                            Language
                          </th>
                          <th className="text-left text-muted-foreground font-medium text-xs uppercase tracking-wider py-3 px-6">
                            Status
                          </th>
                          <th className="text-left text-muted-foreground font-medium text-xs uppercase tracking-wider py-3 px-6">
                            Profile
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentResponses.map((response) => (
                          <tr
                            key={response.id}
                            onClick={() => handleOpenDetail(response.id)}
                            className={cn("border-b border-border hover:bg-accent transition-colors cursor-pointer")}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-muted-foreground" />
                                <span className="font-mono text-sm text-foreground/70">{response.id.slice(0, 8)}...</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-sm text-foreground/70">
                                {new Date(response.createdAt).toLocaleDateString()}{" "}
                                <span className="text-muted-foreground">
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
                              <span className="text-sm text-muted-foreground">
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
                  <div className="relative flex-1 flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search by ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all"
                    >
                      Search
                    </button>
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                      showFilters
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent border border-border"
                    )}
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                </div>

                {/* Conversion Funnel */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-6">Conversion Funnel</h3>
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
                        <p className="text-lg font-bold text-foreground">{step.value.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{step.label}</p>
                        {i > 0 && (
                          <p className="text-xs text-muted-foreground/50 mt-1">
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
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">All Responses</h3>
                    <span className="text-sm text-muted-foreground">
                      {stats.pagination ? (
                        <>
                          Showing {((stats.pagination.page - 1) * stats.pagination.limit) + 1}-
                          {Math.min(stats.pagination.page * stats.pagination.limit, stats.pagination.total)} of{" "}
                          {stats.pagination.total.toLocaleString()}
                        </>
                      ) : (
                        <>{stats.overview.totalResponses.toLocaleString()} total</>
                      )}
                    </span>
                  </div>
                  {/* Selection Action Bar */}
                  {selectedResponseIds.length > 0 && (
                    <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-blue-400 font-medium">
                          {selectedResponseIds.length} selected
                        </span>
                        <button
                          onClick={handleClearSelection}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      <button
                        onClick={handleCompareSelected}
                        disabled={selectedResponseIds.length < 2}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                          selectedResponseIds.length >= 2
                            ? "bg-blue-600 hover:bg-blue-500 text-white"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                      >
                        <GitCompare className="w-4 h-4" />
                        Compare ({selectedResponseIds.length}/3)
                      </button>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-muted-foreground font-medium text-xs uppercase tracking-wider py-3 px-3 w-12">
                            <span className="sr-only">Select</span>
                          </th>
                          <th className="text-left text-muted-foreground font-medium text-xs uppercase tracking-wider py-3 px-6">
                            ID
                          </th>
                          <th className="text-left text-muted-foreground font-medium text-xs uppercase tracking-wider py-3 px-6">
                            Date
                          </th>
                          <th className="text-left text-muted-foreground font-medium text-xs uppercase tracking-wider py-3 px-6">
                            Language
                          </th>
                          <th className="text-left text-muted-foreground font-medium text-xs uppercase tracking-wider py-3 px-6">
                            Status
                          </th>
                          <th className="text-left text-muted-foreground font-medium text-xs uppercase tracking-wider py-3 px-6">
                            Religiosity
                          </th>
                          <th className="text-left text-muted-foreground font-medium text-xs uppercase tracking-wider py-3 px-6">
                            AI Score
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentResponses.map((response) => (
                          <tr
                            key={response.id}
                            className={cn(
                              "border-b border-border hover:bg-accent transition-colors",
                              selectedResponseIds.includes(response.id) && "bg-blue-500/10"
                            )}
                          >
                            <td className="py-4 px-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSelection(response.id);
                                }}
                                className={cn(
                                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                  selectedResponseIds.includes(response.id)
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "border-white/20 hover:border-white/40"
                                )}
                              >
                                {selectedResponseIds.includes(response.id) && (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                              </button>
                            </td>
                            <td
                              className="py-4 px-6 cursor-pointer"
                              onClick={() => handleOpenDetail(response.id)}
                            >
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-muted-foreground/50" />
                                <span className="font-mono text-sm text-foreground/70">{response.id.slice(0, 8)}...</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-foreground/70">
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
                            <td className="py-4 px-6 text-sm text-foreground/70">{response.religiosityScore}</td>
                            <td className="py-4 px-6 text-sm text-foreground/70">{response.aiScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {stats.pagination && stats.pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-border flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Page {stats.pagination.page} of {stats.pagination.totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={stats.pagination.page === 1}
                          className="px-3 py-1.5 text-sm bg-muted hover:bg-accent text-foreground/70 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          First
                        </button>
                        <button
                          onClick={() => handlePageChange(stats.pagination.page - 1)}
                          disabled={stats.pagination.page === 1}
                          className="px-3 py-1.5 text-sm bg-muted hover:bg-accent text-foreground/70 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          Previous
                        </button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, stats.pagination.totalPages) }, (_, i) => {
                            let pageNum: number;
                            const totalPages = stats.pagination.totalPages;
                            const currentPage = stats.pagination.page;

                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={cn(
                                  "w-8 h-8 text-sm rounded-lg transition-all",
                                  pageNum === currentPage
                                    ? "bg-blue-600 text-white"
                                    : "bg-muted hover:bg-accent text-foreground/70"
                                )}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => handlePageChange(stats.pagination.page + 1)}
                          disabled={stats.pagination.page === stats.pagination.totalPages}
                          className="px-3 py-1.5 text-sm bg-muted hover:bg-accent text-foreground/70 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          Next
                        </button>
                        <button
                          onClick={() => handlePageChange(stats.pagination.totalPages)}
                          disabled={stats.pagination.page === stats.pagination.totalPages}
                          className="px-3 py-1.5 text-sm bg-muted hover:bg-accent text-foreground/70 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          Last
                        </button>
                      </div>
                    </div>
                  )}
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

                {/* Profile Distribution */}
                {Object.keys(stats.profiles).some((k) => stats.profiles[k] > 0) && (
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Profile Pie Chart */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="font-semibold text-foreground mb-6">Profile Distribution</h3>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                          <RechartsPieChart>
                            <Pie
                              data={Object.entries(stats.profiles)
                                .filter(([, count]) => count > 0)
                                .map(([profile, count]) => ({
                                  name: PROFILE_LABELS[profile] || profile,
                                  value: count,
                                  fill: PROFILE_COLORS[profile] || "#3b82f6",
                                }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {Object.entries(stats.profiles)
                                .filter(([, count]) => count > 0)
                                .map(([profile], index) => (
                                  <Cell key={`cell-${index}`} fill={PROFILE_COLORS[profile] || "#3b82f6"} />
                                ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                color: "hsl(var(--foreground))",
                                borderRadius: "8px",
                              }}
                            />
                            <Legend
                              layout="vertical"
                              align="right"
                              verticalAlign="middle"
                              wrapperStyle={{ fontSize: "11px" }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Profile Bar Chart */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="font-semibold text-foreground mb-6">Profiles by Count</h3>
                      <div className="space-y-3">
                        {Object.entries(stats.profiles)
                          .sort(([, a], [, b]) => b - a)
                          .map(([profile, count]) => (
                            <div key={profile}>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-foreground/70">{PROFILE_LABELS[profile] || profile}</span>
                                <span className="text-foreground font-medium">{count}</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${(count / stats.overview.completedResponses) * 100}%`,
                                    backgroundColor: PROFILE_COLORS[profile] || "#3b82f6",
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Distribution Charts */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Religiosity Distribution */}
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-semibold text-foreground mb-6">Religiosity Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                        <BarChart
                          data={Object.entries(stats.scores.religiosityDistribution).map(([range, count]) => ({
                            range,
                            count,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="range" className="stroke-muted-foreground" fontSize={11} />
                          <YAxis className="stroke-muted-foreground" fontSize={11} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              color: "hsl(var(--foreground))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* AI Adoption Distribution */}
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-semibold text-foreground mb-6">AI Adoption Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                        <BarChart
                          data={Object.entries(stats.scores.aiAdoptionDistribution).map(([range, count]) => ({
                            range,
                            count,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="range" className="stroke-muted-foreground" fontSize={11} />
                          <YAxis className="stroke-muted-foreground" fontSize={11} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              color: "hsl(var(--foreground))",
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
                  {/* By Denomination */}
                  {Object.keys(stats.demographics.byDenomination).length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="font-semibold text-foreground mb-6">By Denomination</h3>
                      <div className="space-y-3">
                        {Object.entries(stats.demographics.byDenomination)
                          .sort(([, a], [, b]) => b - a)
                          .map(([denomination, count], i) => (
                          <div key={denomination}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-foreground/70">
                                {DENOMINATION_LABELS[denomination] || denomination}
                              </span>
                              <span className="text-foreground font-medium">{count.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(count / stats.overview.completedResponses) * 100}%`,
                                  backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* By Role */}
                  {Object.keys(stats.demographics.byRole).length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="font-semibold text-foreground mb-6">By Role</h3>
                      <div className="space-y-3">
                        {Object.entries(stats.demographics.byRole)
                          .sort(([, a], [, b]) => b - a)
                          .map(([role, count], i) => (
                          <div key={role}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-foreground/70">
                                {ROLE_LABELS[role] || role.replace(/_/g, " ")}
                              </span>
                              <span className="text-foreground font-medium">{count.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(count / stats.overview.completedResponses) * 100}%`,
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

                {/* More Demographics */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* By Age */}
                  {Object.keys(stats.demographics.byAge).length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="font-semibold text-foreground mb-6">By Age Group</h3>
                      <div className="space-y-3">
                        {Object.entries(stats.demographics.byAge)
                          .sort(([a], [b]) => {
                            const order = ["18-35", "36-50", "51-65", "66+"];
                            return order.indexOf(a) - order.indexOf(b);
                          })
                          .map(([age, count], i) => (
                          <div key={age}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-foreground/70">{AGE_LABELS[age] || age}</span>
                              <span className="text-foreground font-medium">{count.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(count / stats.overview.completedResponses) * 100}%`,
                                  backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* By Country */}
                  {stats.demographics.byCountry && Object.keys(stats.demographics.byCountry).length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="font-semibold text-foreground mb-6">By Country</h3>
                      <div className="space-y-3">
                        {Object.entries(stats.demographics.byCountry)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 8)
                          .map(([country, count], i) => (
                          <div key={country}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-foreground/70 capitalize">{country.replace(/_/g, " ")}</span>
                              <span className="text-foreground font-medium">{count.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(count / stats.overview.completedResponses) * 100}%`,
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

                {/* Cross-Segment Analysis */}
                {stats.segmentedAnalysis && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      Cross-Segment Analysis
                    </h3>

                    {/* Clergy vs Laity Comparison */}
                    {stats.segmentedAnalysis.byRole?.clergy && stats.segmentedAnalysis.byRole?.laity && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-foreground/70 mb-4">Clergy vs Laity Comparison</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Clergy */}
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-blue-400">Clergy</span>
                              <span className="text-xs text-muted-foreground">n={stats.segmentedAnalysis.byRole.clergy.count}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <p className="text-lg font-bold text-foreground">{stats.segmentedAnalysis.byRole.clergy.avgReligiosity.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">Religiosity</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold text-foreground">{stats.segmentedAnalysis.byRole.clergy.avgAiAdoption.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">AI Adoption</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold text-foreground">{stats.segmentedAnalysis.byRole.clergy.avgResistance.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">Resistance</p>
                              </div>
                            </div>
                          </div>
                          {/* Laity */}
                          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-green-400">Laity</span>
                              <span className="text-xs text-muted-foreground">n={stats.segmentedAnalysis.byRole.laity.count}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <p className="text-lg font-bold text-foreground">{stats.segmentedAnalysis.byRole.laity.avgReligiosity.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">Religiosity</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold text-foreground">{stats.segmentedAnalysis.byRole.laity.avgAiAdoption.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">AI Adoption</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold text-foreground">{stats.segmentedAnalysis.byRole.laity.avgResistance.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">Resistance</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Difference indicator */}
                        <div className="mt-3 flex items-center justify-center gap-4 text-xs">
                          <span className="text-muted-foreground/60">Difference:</span>
                          <span className={cn(
                            "font-medium",
                            Math.abs(stats.segmentedAnalysis.byRole.clergy.avgReligiosity - stats.segmentedAnalysis.byRole.laity.avgReligiosity) > 0.5
                              ? "text-amber-400"
                              : "text-muted-foreground"
                          )}>
                            Δ Rel: {(stats.segmentedAnalysis.byRole.clergy.avgReligiosity - stats.segmentedAnalysis.byRole.laity.avgReligiosity).toFixed(1)}
                          </span>
                          <span className={cn(
                            "font-medium",
                            Math.abs(stats.segmentedAnalysis.byRole.clergy.avgAiAdoption - stats.segmentedAnalysis.byRole.laity.avgAiAdoption) > 0.5
                              ? "text-amber-400"
                              : "text-muted-foreground"
                          )}>
                            Δ AI: {(stats.segmentedAnalysis.byRole.clergy.avgAiAdoption - stats.segmentedAnalysis.byRole.laity.avgAiAdoption).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* By Age Group */}
                    {Object.keys(stats.segmentedAnalysis.byAge || {}).length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-foreground/70 mb-4">Dimension Averages by Age Group</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Age</th>
                                <th className="text-center py-2 px-3 text-muted-foreground font-medium">n</th>
                                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Rel.</th>
                                <th className="text-center py-2 px-3 text-muted-foreground font-medium">AI Open.</th>
                                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Sacred</th>
                                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Future</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(stats.segmentedAnalysis.byAge)
                                .sort(([a], [b]) => {
                                  const order = ["18-35", "36-50", "51-65", "66+"];
                                  return order.indexOf(a) - order.indexOf(b);
                                })
                                .map(([age, data]) => (
                                  <tr key={age} className="border-b border-border hover:bg-muted">
                                    <td className="py-2 px-3 text-foreground">{AGE_LABELS[age] || age}</td>
                                    <td className="py-2 px-3 text-center text-muted-foreground">{data.count}</td>
                                    <td className="py-2 px-3 text-center">
                                      <span className="text-blue-400 font-medium">{data.avgReligiosity.toFixed(1)}</span>
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                      <span className="text-green-400 font-medium">{data.avgAiAdoption.toFixed(1)}</span>
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                      <span className="text-amber-400 font-medium">{data.dimensionAverages?.sacredBoundary?.toFixed(1) || '—'}</span>
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                      <span className="text-purple-400 font-medium">{data.dimensionAverages?.futureOrientation?.toFixed(1) || '—'}</span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Profile Distribution by Segment */}
                    {stats.segmentedAnalysis.byRole?.clergy && stats.segmentedAnalysis.byRole?.laity && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground/70 mb-4">Profile Distribution by Role</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Clergy profiles */}
                          <div className="bg-card border border-border rounded-xl p-4">
                            <p className="text-xs text-muted-foreground mb-3">Clergy Top Profiles</p>
                            <div className="space-y-2">
                              {Object.entries(stats.segmentedAnalysis.byRole.clergy.profileDistribution)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 4)
                                .map(([profile, count]) => (
                                  <div key={profile} className="flex items-center gap-2">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: PROFILE_COLORS[profile] || '#3b82f6' }}
                                    />
                                    <span className="text-xs text-foreground/70 flex-1">{PROFILE_LABELS[profile] || profile}</span>
                                    <span className="text-xs text-foreground">{count}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                          {/* Laity profiles */}
                          <div className="bg-card border border-border rounded-xl p-4">
                            <p className="text-xs text-muted-foreground mb-3">Laity Top Profiles</p>
                            <div className="space-y-2">
                              {Object.entries(stats.segmentedAnalysis.byRole.laity.profileDistribution)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 4)
                                .map(([profile, count]) => (
                                  <div key={profile} className="flex items-center gap-2">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: PROFILE_COLORS[profile] || '#3b82f6' }}
                                    />
                                    <span className="text-xs text-foreground/70 flex-1">{PROFILE_LABELS[profile] || profile}</span>
                                    <span className="text-xs text-foreground">{count}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Full Correlation Matrix */}
                {stats.correlationMatrix && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                      <GitCompare className="w-4 h-4 text-purple-400" />
                      7-Dimension Correlation Matrix
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Pearson correlation coefficients between the seven dimensions. Blue = positive, Red = negative.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            <th className="p-2 text-left text-muted-foreground"></th>
                            {Object.keys(stats.correlationMatrix).map((dim) => (
                              <th key={dim} className="p-2 text-center text-muted-foreground font-normal" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '80px' }}>
                                {DIMENSION_LABELS[dim]?.split(' ').slice(0, 2).join(' ') || dim}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(stats.correlationMatrix).map(([dim1, row]) => (
                            <tr key={dim1}>
                              <td className="p-2 text-foreground/70 whitespace-nowrap">
                                {DIMENSION_LABELS[dim1]?.split(' ').slice(0, 2).join(' ') || dim1}
                              </td>
                              {Object.entries(row).map(([dim2, value]) => {
                                const intensity = Math.abs(value);
                                const bgColor = value > 0
                                  ? `rgba(59, 130, 246, ${intensity * 0.8})`
                                  : value < 0
                                  ? `rgba(239, 68, 68, ${intensity * 0.8})`
                                  : 'rgba(255, 255, 255, 0.05)';
                                return (
                                  <td
                                    key={dim2}
                                    className="p-2 text-center border border-border"
                                    style={{ backgroundColor: bgColor }}
                                  >
                                    <span className={cn(
                                      "font-medium",
                                      dim1 === dim2 ? "text-muted-foreground/50" : "text-white"
                                    )}>
                                      {dim1 === dim2 ? '1' : value.toFixed(2)}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.6)' }} />
                        <span>Negative correlation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-muted" />
                        <span>No correlation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.6)' }} />
                        <span>Positive correlation</span>
                      </div>
                    </div>
                  </div>
                )}
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
                <div className="bg-card border border-border rounded-2xl p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Download className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Export Data</h2>
                    <p className="text-muted-foreground">
                      Download survey responses in JSON or CSV format. Only consented responses are included.
                    </p>
                  </div>

                  {/* Filters */}
                  <div className="bg-muted rounded-xl p-6 mb-6">
                    <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filter Options
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1.5">Start Date</label>
                        <input
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                          className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1.5">End Date</label>
                        <input
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                          className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1.5">Language</label>
                        <select
                          value={filters.language}
                          onChange={(e) => setFilters({ ...filters, language: e.target.value as "" | "fr" | "en" })}
                          className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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

            {/* Executive Summary Tab */}
            {activeTab === "executive" && stats && (
              <motion.div
                key="executive"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Research Quality Header */}
                <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        Executive Summary
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Research-ready insights and statistical analysis
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-foreground">{stats.overview.completedResponses.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Valid Responses</p>
                    </div>
                  </div>

                  {/* Research Quality Metrics */}
                  <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="bg-muted rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-green-400">{stats.overview.completionRate}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Completion Rate</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-blue-400">{stats.overview.avgCompletionTime}m</p>
                      <p className="text-xs text-muted-foreground mt-1">Avg. Time</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-purple-400">
                        {Object.keys(stats.demographics.byDenomination || {}).length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Denominations</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-amber-400">
                        {Object.keys(stats.demographics.byAge || {}).length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Age Groups</p>
                    </div>
                  </div>
                </div>

                {/* Key Findings */}
                {stats.keyFindings && stats.keyFindings.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-400" />
                      Key Research Findings
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {stats.keyFindings.map((finding, i) => (
                        <div
                          key={i}
                          className={cn(
                            "p-4 rounded-xl border",
                            finding.significance === 'high'
                              ? "bg-green-500/10 border-green-500/30"
                              : finding.significance === 'medium'
                              ? "bg-blue-500/10 border-blue-500/30"
                              : "bg-muted border-border"
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded-full",
                              finding.type === 'correlation' ? "bg-purple-500/20 text-purple-400" :
                              finding.type === 'segment' ? "bg-blue-500/20 text-blue-400" :
                              "bg-amber-500/20 text-amber-400"
                            )}>
                              {finding.type === 'correlation' ? '📊 Correlation' :
                               finding.type === 'segment' ? '👥 Segment' : '📈 Pattern'}
                            </span>
                            <span className={cn(
                              "text-xs",
                              finding.significance === 'high' ? "text-green-400" :
                              finding.significance === 'medium' ? "text-blue-400" : "text-muted-foreground/60"
                            )}>
                              {finding.significance === 'high' ? '●●●' :
                               finding.significance === 'medium' ? '●●○' : '●○○'}
                            </span>
                          </div>
                          <h4 className="font-medium text-foreground text-sm">{finding.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{finding.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Profile Clusters Visualization */}
                {stats.profileClusters && stats.profileClusters.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      Profile Clusters (Religiosity × AI Openness)
                    </h3>
                    <div className="h-80 relative">
                      {/* Axis labels */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground/60 whitespace-nowrap">
                        AI Openness →
                      </div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/60">
                        Religiosity →
                      </div>
                      {/* Scatter/Bubble area */}
                      <div className="ml-8 mb-6 h-full relative bg-card rounded-xl overflow-hidden">
                        {/* Grid lines */}
                        <div className="absolute inset-0 grid grid-cols-5 grid-rows-5">
                          {[...Array(25)].map((_, i) => (
                            <div key={i} className="border border-border" />
                          ))}
                        </div>
                        {/* Bubbles */}
                        {stats.profileClusters.map((cluster) => {
                          const x = ((cluster.avgReligiosity - 1) / 4) * 100;
                          const y = 100 - ((cluster.avgAiOpenness - 1) / 4) * 100;
                          const size = Math.max(30, Math.min(80, cluster.count / 5 + 20));
                          return (
                            <div
                              key={cluster.profile}
                              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center group"
                              style={{
                                left: `${x}%`,
                                top: `${y}%`,
                                width: size,
                                height: size,
                              }}
                            >
                              <div
                                className="rounded-full flex items-center justify-center text-xs font-medium text-foreground opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  backgroundColor: PROFILE_COLORS[cluster.profile] || '#3b82f6',
                                }}
                              >
                                {cluster.count}
                              </div>
                              {/* Tooltip */}
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                                <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs whitespace-nowrap">
                                  <p className="font-medium text-foreground">{PROFILE_LABELS[cluster.profile]}</p>
                                  <p className="text-muted-foreground">n={cluster.count}</p>
                                  <p className="text-muted-foreground">Rel: {cluster.avgReligiosity} | AI: {cluster.avgAiOpenness}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 mt-4 justify-center">
                      {stats.profileClusters.slice(0, 6).map((cluster) => (
                        <div key={cluster.profile} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: PROFILE_COLORS[cluster.profile] || '#3b82f6' }}
                          />
                          <span className="text-xs text-muted-foreground">{PROFILE_LABELS[cluster.profile]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dimension Statistics Table */}
                {stats.dimensionStats && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      📊 Dimension Statistics
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left text-muted-foreground font-medium text-xs uppercase tracking-wider py-3 px-4">
                              Dimension
                            </th>
                            <th className="text-center text-muted-foreground font-medium text-xs uppercase tracking-wider py-3 px-4">
                              Mean
                            </th>
                            <th className="text-center text-muted-foreground font-medium text-xs uppercase tracking-wider py-3 px-4">
                              Std Dev
                            </th>
                            <th className="text-center text-muted-foreground font-medium text-xs uppercase tracking-wider py-3 px-4">
                              Median
                            </th>
                            <th className="text-center text-muted-foreground font-medium text-xs uppercase tracking-wider py-3 px-4">
                              Distribution
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(stats.dimensionStats).map(([dim, stat]) => (
                            <tr key={dim} className="border-b border-border hover:bg-muted">
                              <td className="py-3 px-4">
                                <span className="text-sm text-foreground">{DIMENSION_LABELS[dim] || dim}</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-sm font-medium text-blue-400">{stat.mean.toFixed(2)}</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-sm text-muted-foreground">±{stat.stdDev.toFixed(2)}</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-sm text-muted-foreground">{stat.median.toFixed(2)}</span>
                              </td>
                              <td className="py-3 px-4">
                                {/* Mini sparkline/distribution */}
                                <div className="flex items-end gap-0.5 h-6 justify-center">
                                  {stat.distribution.map((count, i) => {
                                    const maxCount = Math.max(...stat.distribution);
                                    const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                                    return (
                                      <div
                                        key={i}
                                        className="w-3 bg-blue-500/50 rounded-t"
                                        style={{ height: `${Math.max(10, height)}%` }}
                                        title={`${['1-2', '2-3', '3-4', '4-5', '5'][i]}: ${count}`}
                                      />
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Correlation Matrix Preview */}
                {stats.correlationMatrix && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <GitCompare className="w-4 h-4 text-purple-400" />
                      Correlation Matrix (7 Dimensions)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      See full matrix in Analytics tab
                    </p>
                    {/* Top correlations preview */}
                    <div className="grid md:grid-cols-3 gap-3">
                      {(() => {
                        const correlations: { dim1: string; dim2: string; value: number }[] = [];
                        const dims = Object.keys(stats.correlationMatrix);
                        for (let i = 0; i < dims.length; i++) {
                          for (let j = i + 1; j < dims.length; j++) {
                            correlations.push({
                              dim1: dims[i],
                              dim2: dims[j],
                              value: stats.correlationMatrix[dims[i]][dims[j]],
                            });
                          }
                        }
                        return correlations
                          .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
                          .slice(0, 6)
                          .map((c, i) => (
                            <div key={i} className="bg-muted rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">
                                  {DIMENSION_LABELS[c.dim1]?.split(' ')[0] || c.dim1}
                                  {' × '}
                                  {DIMENSION_LABELS[c.dim2]?.split(' ')[0] || c.dim2}
                                </span>
                                <span className={cn(
                                  "text-sm font-bold",
                                  c.value > 0 ? "text-blue-400" : "text-red-400"
                                )}>
                                  {c.value > 0 ? '+' : ''}{c.value.toFixed(2)}
                                </span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    c.value > 0 ? "bg-blue-500" : "bg-red-500"
                                  )}
                                  style={{
                                    width: `${Math.abs(c.value) * 100}%`,
                                    marginLeft: c.value < 0 ? 'auto' : 0,
                                  }}
                                />
                              </div>
                            </div>
                          ));
                      })()}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Response Detail Modal */}
      <AnimatePresence>
        {selectedResponseId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseDetail}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-card border border-border rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Réponse #{selectedResponseId.slice(0, 8)}...
                  </h2>
                  {responseDetail && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(responseDetail.createdAt).toLocaleDateString()} •{" "}
                      {responseDetail.language.toUpperCase()}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleCloseDetail}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex gap-1 p-2 border-b border-border bg-card">
                {[
                  { id: "profil", label: "Profil" },
                  { id: "scores", label: "Scores" },
                  { id: "reponses", label: "Réponses" },
                  { id: "analyse", label: "Analyse" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDetailTab(tab.id as typeof activeDetailTab)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      activeDetailTab === tab.id
                        ? "bg-blue-600 text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {detailLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-sm text-muted-foreground">Loading response details...</p>
                  </div>
                ) : detailError ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium text-foreground mb-1">Failed to Load</h3>
                      <p className="text-sm text-muted-foreground">{detailError}</p>
                    </div>
                    <button
                      onClick={() => selectedResponseId && fetchResponseDetail(selectedResponseId)}
                      className="px-4 py-2 bg-muted hover:bg-accent rounded-lg text-sm font-medium text-foreground transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : responseDetail ? (
                  <>
                    {/* Profil Tab */}
                    {activeDetailTab === "profil" && (
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Demographics */}
                          <div className="bg-card border border-border rounded-xl p-5">
                            <h3 className="font-semibold text-foreground mb-4">Profil Démographique</h3>
                            <div className="space-y-3">
                              {[
                                { label: "Confession", value: DENOMINATION_LABELS[responseDetail.answers.profil_confession as string] || responseDetail.answers.profil_confession },
                                { label: "Statut", value: ROLE_LABELS[responseDetail.answers.profil_statut as string] || responseDetail.answers.profil_statut },
                                { label: "Âge", value: AGE_LABELS[responseDetail.answers.profil_age as string] || responseDetail.answers.profil_age },
                                { label: "Pays", value: responseDetail.answers.profil_pays },
                                { label: "Milieu", value: responseDetail.answers.profil_milieu },
                                { label: "Orientation théo.", value: responseDetail.answers.theo_orientation },
                              ].map((item, i) => (
                                <div key={i} className="flex justify-between">
                                  <span className="text-muted-foreground text-sm">{item.label}</span>
                                  <span className="text-foreground text-sm font-medium">
                                    {typeof item.value === "string" ? item.value : "—"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Profile Type */}
                          <div className="bg-card border border-border rounded-xl p-5">
                            <h3 className="font-semibold text-foreground mb-4">Profil Typologique</h3>
                            <div className="flex items-center gap-4 mb-4">
                              <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
                                style={{ backgroundColor: `${PROFILE_COLORS[responseDetail.profile.primary.name]}30` }}
                              >
                                {responseDetail.profile.primary.emoji}
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-foreground">
                                  {PROFILE_LABELS[responseDetail.profile.primary.name] || responseDetail.profile.primary.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Match: {responseDetail.profile.primary.score}%
                                </p>
                              </div>
                            </div>
                            {responseDetail.profile.secondary && (
                              <div className="pt-3 border-t border-border">
                                <p className="text-sm text-muted-foreground">
                                  Profil secondaire:{" "}
                                  <span className="text-foreground">
                                    {PROFILE_LABELS[responseDetail.profile.secondary.name]} ({responseDetail.profile.secondary.score}%)
                                  </span>
                                </p>
                              </div>
                            )}
                            <div className="pt-3 mt-3 border-t border-border">
                              <p className="text-sm text-muted-foreground">
                                Sous-profil:{" "}
                                <span className="text-foreground">{responseDetail.profile.subProfile}</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Profile Match Distribution */}
                        <div className="bg-card border border-border rounded-xl p-5">
                          <h3 className="font-semibold text-foreground mb-4">Distribution des Correspondances</h3>
                          <div className="space-y-2">
                            {responseDetail.profile.allMatches.slice(0, 5).map((match) => (
                              <div key={match.name}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-foreground/70">
                                    {PROFILE_LABELS[match.name] || match.name}
                                  </span>
                                  <span className="text-foreground">{match.score}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${match.score}%`,
                                      backgroundColor: PROFILE_COLORS[match.name] || "#3b82f6",
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Scores Tab */}
                    {activeDetailTab === "scores" && (
                      <div className="space-y-6">
                        {/* Main Scores */}
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                            <h4 className="text-sm text-blue-400 mb-2">CRS-5 (Religiosité)</h4>
                            <p className="text-3xl font-bold text-foreground">
                              {responseDetail.scores.crs5.value.toFixed(1)}
                              <span className="text-lg text-muted-foreground">/5</span>
                            </p>
                            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${(responseDetail.scores.crs5.value / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5">
                            <h4 className="text-sm text-green-400 mb-2">Adoption IA</h4>
                            <p className="text-3xl font-bold text-foreground">
                              {responseDetail.scores.aiAdoption.value.toFixed(1)}
                              <span className="text-lg text-muted-foreground">/5</span>
                            </p>
                            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${(responseDetail.scores.aiAdoption.value / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                            <h4 className="text-sm text-amber-400 mb-2">Résistance Spirituelle</h4>
                            <p className="text-3xl font-bold text-foreground">
                              {responseDetail.scores.resistanceIndex.toFixed(1)}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {responseDetail.scores.resistanceIndex <= 0
                                ? "Aucune résistance"
                                : responseDetail.scores.resistanceIndex < 1
                                ? "Légère réserve"
                                : responseDetail.scores.resistanceIndex < 2
                                ? "Résistance modérée"
                                : "Forte résistance"}
                            </p>
                          </div>
                        </div>

                        {/* Radar Chart - 7 Dimensions with Population Comparison */}
                        <div className="bg-card border border-border rounded-xl p-5">
                          <h3 className="font-semibold text-foreground mb-2">Les 7 Dimensions vs Population</h3>
                          <p className="text-xs text-muted-foreground mb-4">Blue: This response • Gray: Population average</p>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                              <RadarChart
                                data={Object.entries(responseDetail.dimensions).map(([key, dim]) => ({
                                  dimension: DIMENSION_LABELS[key] || key,
                                  value: dim.value,
                                  population: stats?.populationAverages?.[key] || 3,
                                  fullMark: 5,
                                }))}
                              >
                                <PolarGrid className="stroke-border" />
                                <PolarAngleAxis
                                  dataKey="dimension"
                                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                                />
                                <PolarRadiusAxis
                                  angle={30}
                                  domain={[0, 5]}
                                  tick={{ fill: "#a1a1aa", fontSize: 10 }}
                                />
                                <Radar
                                  name="Population"
                                  dataKey="population"
                                  stroke="hsl(var(--muted-foreground))"
                                  fill="hsl(var(--muted-foreground))"
                                  fillOpacity={0.1}
                                  strokeDasharray="5 5"
                                />
                                <Radar
                                  name="This Response"
                                  dataKey="value"
                                  stroke="#3b82f6"
                                  fill="#3b82f6"
                                  fillOpacity={0.4}
                                />
                                <Legend wrapperStyle={{ color: "#a1a1aa" }} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    color: "hsl(var(--foreground))",
                                    borderRadius: "8px",
                                  }}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Enhanced Dimension Details with Percentile Visualization */}
                        <div className="bg-card border border-border rounded-xl p-5">
                          <h3 className="font-semibold text-foreground mb-4">Détail des Dimensions & Percentiles</h3>
                          <div className="space-y-4">
                            {Object.entries(responseDetail.dimensions).map(([key, dim]) => {
                              const popAvg = stats?.populationAverages?.[key] || 3;
                              const diff = dim.value - popAvg;
                              return (
                                <div key={key} className="bg-card rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <p className="text-sm font-medium text-foreground">
                                        {DIMENSION_LABELS[key] || key}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        vs Population: {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-bold text-foreground">{dim.value.toFixed(1)}</p>
                                      <p className={cn(
                                        "text-xs",
                                        dim.percentile > 70 ? "text-green-400" :
                                        dim.percentile > 30 ? "text-muted-foreground" : "text-amber-400"
                                      )}>
                                        Top {100 - dim.percentile}%
                                      </p>
                                    </div>
                                  </div>
                                  {/* Percentile visualization */}
                                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                                    {/* Population marker */}
                                    <div
                                      className="absolute top-0 bottom-0 w-0.5 bg-muted0 z-10"
                                      style={{ left: `${(popAvg / 5) * 100}%` }}
                                    />
                                    {/* Score bar */}
                                    <div
                                      className={cn(
                                        "h-full rounded-full transition-all",
                                        diff > 0.5 ? "bg-green-500" : diff < -0.5 ? "bg-amber-500" : "bg-blue-500"
                                      )}
                                      style={{ width: `${(dim.value / 5) * 100}%` }}
                                    />
                                  </div>
                                  {/* Percentile position */}
                                  <div className="relative h-1.5 mt-2">
                                    <div className="absolute inset-x-0 h-full bg-gradient-to-r from-red-500/30 via-yellow-500/30 to-green-500/30 rounded-full" />
                                    <div
                                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-lg border border-border"
                                      style={{ left: `${dim.percentile}%`, marginLeft: '-4px' }}
                                    />
                                  </div>
                                  <div className="flex justify-between text-xs text-muted-foreground/50 mt-1">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Responses Tab */}
                    {activeDetailTab === "reponses" && (
                      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                        {/* Group answers by category */}
                        {(() => {
                          const groupedAnswers: Record<string, Array<{ key: string; value: string | number | string[] }>> = {};

                          Object.entries(responseDetail.answers).forEach(([key, value]) => {
                            const category = getQuestionCategory(key);
                            if (!groupedAnswers[category]) {
                              groupedAnswers[category] = [];
                            }
                            groupedAnswers[category].push({ key, value });
                          });

                          // Define category order
                          const categoryOrder = [
                            "profile", "religiosity", "usage", "digital_spiritual",
                            "ministry_preaching", "ministry_pastoral", "ministry_vision",
                            "spirituality", "theology", "psychology", "community",
                            "future", "social_desirability", "open", "other"
                          ];

                          return categoryOrder
                            .filter((cat) => groupedAnswers[cat]?.length > 0)
                            .map((category) => (
                              <div key={category} className="bg-card border border-border rounded-xl overflow-hidden">
                                <div className="px-5 py-3 bg-muted border-b border-border">
                                  <h3 className="font-semibold text-foreground text-sm">
                                    {CATEGORY_LABELS[category] || category}
                                  </h3>
                                </div>
                                <div className="divide-y divide-white/5">
                                  {groupedAnswers[category].map(({ key, value }) => (
                                    <div key={key} className="px-5 py-4">
                                      <div className="flex flex-col gap-2">
                                        <p className="text-sm text-foreground/90 font-medium">
                                          {getQuestionText(key)}
                                        </p>
                                        <div className="flex items-start gap-2">
                                          <span className="text-xs text-muted-foreground/50 font-mono bg-muted px-2 py-0.5 rounded">
                                            {key}
                                          </span>
                                          <p className="text-sm text-blue-400 font-medium">
                                            {getAnswerLabel(key, value)}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ));
                        })()}

                        {/* Summary stats */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                          <h4 className="text-sm font-medium text-blue-400 mb-3">📊 Résumé</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                              <p className="text-2xl font-bold text-foreground">
                                {Object.keys(responseDetail.answers).length}
                              </p>
                              <p className="text-xs text-muted-foreground">Questions répondues</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground">
                                {responseDetail.completionTime ? `${responseDetail.completionTime}m` : "—"}
                              </p>
                              <p className="text-xs text-muted-foreground">Temps de complétion</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground">
                                {responseDetail.scores.crs5.value.toFixed(1)}
                              </p>
                              <p className="text-xs text-muted-foreground">Score CRS-5</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-foreground">
                                {responseDetail.scores.aiAdoption.value.toFixed(1)}
                              </p>
                              <p className="text-xs text-muted-foreground">Score IA</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Analysis Tab */}
                    {activeDetailTab === "analyse" && (
                      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                        {/* Key Summary Banner */}
                        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
                          <div className="flex items-start gap-4">
                            <div
                              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
                              style={{ backgroundColor: `${PROFILE_COLORS[responseDetail.profile.primary.name]}30` }}
                            >
                              {responseDetail.profile.primary.emoji}
                            </div>
                            <div className="flex-1">
                              <h2 className="text-xl font-bold text-foreground mb-1">
                                {responseDetail.profile.primary.title}
                              </h2>
                              <p className="text-sm text-foreground/70 mb-3">
                                {responseDetail.interpretation.headline}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                                  CRS-5: {responseDetail.scores.crs5.value.toFixed(1)}/5
                                </span>
                                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                                  IA: {responseDetail.scores.aiAdoption.value.toFixed(1)}/5
                                </span>
                                <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                                  Match: {responseDetail.profile.primary.score}%
                                </span>
                                {responseDetail.profile.subProfile && (
                                  <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">
                                    {responseDetail.profile.subProfile}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Interpretation Narrative */}
                        <div className="bg-card border border-border rounded-xl p-5">
                          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-400" />
                            Analyse Narrative
                          </h3>
                          <p className="text-foreground/80 text-sm leading-relaxed">
                            {responseDetail.interpretation.narrative}
                          </p>
                        </div>

                        {/* Why This Profile? Explainer */}
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
                          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Target className="w-4 h-4 text-purple-400" />
                            Pourquoi ce profil?
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Les réponses clés qui ont déterminé la classification:
                          </p>
                          <div className="space-y-3">
                            {/* Key dimension indicators */}
                            {Object.entries(responseDetail.dimensions)
                              .sort(([, a], [, b]) => Math.abs(b.value - 3) - Math.abs(a.value - 3))
                              .slice(0, 4)
                              .map(([key, dim]) => {
                                const isHigh = dim.value > 3.5;
                                const isLow = dim.value < 2.5;
                                if (!isHigh && !isLow) return null;
                                return (
                                  <div key={key} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                    <div className={cn(
                                      "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                                      isHigh ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                                    )}>
                                      {isHigh ? "↑" : "↓"}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-foreground">
                                        {DIMENSION_LABELS[key] || key}: {dim.value.toFixed(1)}/5
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {isHigh ? `Score élevé (Top ${100 - dim.percentile}%)` : `Score faible (Bottom ${dim.percentile}%)`}
                                      </p>
                                    </div>
                                    <span className={cn(
                                      "text-xs px-2 py-1 rounded-full",
                                      isHigh ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                                    )}>
                                      {isHigh ? "Distinctif +" : "Distinctif -"}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                          {/* Profile match explanation */}
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <p className="text-xs text-foreground/70">
                              <span className="text-purple-400 font-medium">Match {responseDetail.profile.primary.score}%:</span>{" "}
                              Ce profil correspond le mieux au pattern de réponses observé.
                              {responseDetail.profile.secondary && (
                                <span className="text-muted-foreground">
                                  {" "}Profil secondaire: {PROFILE_LABELS[responseDetail.profile.secondary.name]} ({responseDetail.profile.secondary.score}%)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Answer Influence Scoring */}
                        <div className="bg-card border border-border rounded-xl p-5">
                          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            📊 Réponses Clés par Impact
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Réponses qui ont le plus contribué à la classification du profil:
                          </p>
                          <div className="space-y-2">
                            {[
                              { key: 'ctrl_ia_frequence', label: "Fréquence d'usage IA", dimension: 'aiOpenness' },
                              { key: 'ctrl_ia_confort', label: "Niveau de confort IA", dimension: 'aiOpenness' },
                              { key: 'crs_private_practice', label: "Pratique religieuse privée", dimension: 'religiosity' },
                              { key: 'theo_inspiration', label: "L'IA peut-elle transmettre la grâce?", dimension: 'sacredBoundary' },
                              { key: 'futur_intention_usage', label: "Intention d'augmenter l'usage", dimension: 'futureOrientation' },
                            ].map(item => {
                              const answer = responseDetail.answers[item.key];
                              if (!answer) return null;
                              const dimValue = responseDetail.dimensions[item.dimension as keyof typeof responseDetail.dimensions]?.value || 3;
                              const impact = Math.abs(dimValue - 3) / 2;
                              return (
                                <div key={item.key} className="flex items-center gap-3 p-2 bg-card rounded-lg">
                                  <div className="w-24 text-xs text-muted-foreground/60 truncate">{item.label}</div>
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-full rounded-full",
                                        impact > 0.6 ? "bg-purple-500" : impact > 0.3 ? "bg-blue-500" : "bg-muted"
                                      )}
                                      style={{ width: `${Math.min(100, impact * 100 + 30)}%` }}
                                    />
                                  </div>
                                  <div className="w-20 text-right">
                                    <span className="text-xs text-foreground/70 font-mono">
                                      {typeof answer === 'string' ? answer.slice(0, 12) : Array.isArray(answer) ? answer.length + ' items' : String(answer)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* CRS-5 Breakdown */}
                        <div className="bg-card border border-border rounded-xl p-5">
                          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            🙏 Détail CRS-5 (Religiosité)
                          </h3>
                          <div className="grid grid-cols-5 gap-2">
                            {Object.entries(responseDetail.scores.crs5.breakdown).map(([key, value]) => {
                              const labels: Record<string, string> = {
                                intellect: "Intellect",
                                ideology: "Idéologie",
                                public: "Pratique pub.",
                                private: "Pratique priv.",
                                experience: "Expérience",
                              };
                              return (
                                <div key={key} className="text-center p-3 bg-card rounded-lg">
                                  <p className="text-xs text-muted-foreground mb-1">{labels[key] || key}</p>
                                  <p className="text-2xl font-bold text-blue-400">{value}</p>
                                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-500 rounded-full"
                                      style={{ width: `${(value / 5) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* AI Adoption Breakdown */}
                        <div className="bg-card border border-border rounded-xl p-5">
                          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            🤖 Détail Adoption IA
                          </h3>
                          <div className="grid grid-cols-3 gap-4">
                            {Object.entries(responseDetail.scores.aiAdoption.breakdown).map(([key, value]) => {
                              const labels: Record<string, string> = {
                                frequency: "Fréquence d'usage",
                                comfort: "Niveau de confort",
                                contexts: "Variété des contextes",
                              };
                              const icons: Record<string, string> = {
                                frequency: "📊",
                                comfort: "😌",
                                contexts: "🎯",
                              };
                              return (
                                <div key={key} className="p-4 bg-card rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span>{icons[key] || "📈"}</span>
                                    <p className="text-xs text-muted-foreground">{labels[key] || key}</p>
                                  </div>
                                  <p className="text-2xl font-bold text-green-400">{typeof value === 'number' ? value.toFixed(1) : value}</p>
                                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-green-500 rounded-full"
                                      style={{ width: `${(Number(value) / 5) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Unique Aspects & Blind Spots */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5">
                            <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                              ✨ Forces & Aspects Uniques
                            </h4>
                            <ul className="space-y-2">
                              {responseDetail.interpretation.uniqueAspects.length > 0 ? (
                                responseDetail.interpretation.uniqueAspects.map((aspect, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                                    <span className="text-green-400 mt-0.5">✓</span>
                                    {aspect}
                                  </li>
                                ))
                              ) : (
                                <li className="text-sm text-muted-foreground italic">Aucun aspect unique identifié</li>
                              )}
                            </ul>
                          </div>
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                            <h4 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
                              ⚠️ Points d&apos;attention
                            </h4>
                            <ul className="space-y-2">
                              {responseDetail.interpretation.blindSpots.length > 0 ? (
                                responseDetail.interpretation.blindSpots.map((spot, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                                    <span className="text-amber-400 mt-0.5">!</span>
                                    {spot}
                                  </li>
                                ))
                              ) : (
                                <li className="text-sm text-muted-foreground italic">Aucun point d&apos;attention</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* Insights */}
                        {responseDetail.insights.length > 0 && (
                          <div className="bg-card border border-border rounded-xl p-5">
                            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                              💡 Insights Clés
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              {responseDetail.insights.map((insight, i) => (
                                <div key={i} className="flex gap-3 p-4 bg-muted rounded-lg border border-border">
                                  <span className="text-2xl">{insight.icon}</span>
                                  <div>
                                    <h5 className="text-sm font-medium text-foreground">{insight.title}</h5>
                                    <p className="text-xs text-muted-foreground mt-1">{insight.message}</p>
                                    <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground/60">
                                      Priorité: {insight.priority}/10
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tensions */}
                        {responseDetail.tensions.length > 0 && (
                          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
                            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                              ⚡ Points de Tension Identifiés
                            </h3>
                            <div className="space-y-4">
                              {responseDetail.tensions.map((tension, i) => (
                                <div key={i} className="p-4 bg-muted rounded-lg">
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full font-medium">
                                      {DIMENSION_LABELS[tension.dimension1] || tension.dimension1}
                                    </span>
                                    <span className="text-purple-400">↔</span>
                                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full font-medium">
                                      {DIMENSION_LABELS[tension.dimension2] || tension.dimension2}
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground/80 mb-2">{tension.description}</p>
                                  <div className="flex items-start gap-2 p-2 bg-blue-500/10 rounded-lg">
                                    <span className="text-blue-400">💡</span>
                                    <p className="text-xs text-blue-300">{tension.suggestion}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Growth Areas */}
                        {responseDetail.growthAreas.length > 0 && (
                          <div className="bg-card border border-border rounded-xl p-5">
                            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                              🌱 Axes de Développement
                            </h3>
                            <div className="space-y-4">
                              {responseDetail.growthAreas.map((area, i) => (
                                <div key={i} className="p-4 bg-muted rounded-lg border-l-4 border-green-500">
                                  <h5 className="text-sm font-medium text-foreground mb-2">{area.area}</h5>
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                                      État actuel: {area.currentState}
                                    </span>
                                    <span className="text-muted-foreground/50">→</span>
                                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                                      Potentiel: {area.potentialGrowth}
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2 p-2 bg-green-500/10 rounded-lg">
                                    <span>🎯</span>
                                    <p className="text-xs text-green-300">{area.actionableStep}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Profile Match Details */}
                        <div className="bg-card border border-border rounded-xl p-5">
                          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            📊 Correspondance des Profils
                          </h3>
                          <div className="space-y-2">
                            {responseDetail.profile.allMatches.slice(0, 5).map((match, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <span className="w-6 text-center text-sm text-muted-foreground/60">{i + 1}</span>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-foreground/80">
                                      {PROFILE_LABELS[match.name] || match.name}
                                    </span>
                                    <span className="text-sm text-muted-foreground">{match.score}%</span>
                                  </div>
                                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${match.score}%`,
                                        backgroundColor: i === 0 ? PROFILE_COLORS[match.name] : "hsl(var(--muted-foreground) / 0.3)",
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-20 text-muted-foreground">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowComparison(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-card border border-border rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <GitCompare className="w-5 h-5 text-blue-400" />
                    Response Comparison
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comparing {comparisonData.length} responses
                  </p>
                </div>
                <button
                  onClick={() => setShowComparison(false)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                {comparisonData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-sm text-muted-foreground">Loading comparison data...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Overlay Radar Chart */}
                    <div className="bg-card border border-border rounded-xl p-6">
                      <h3 className="font-semibold text-foreground mb-4">7 Dimensions Overlay</h3>
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                          <RadarChart
                            data={Object.keys(comparisonData[0]?.dimensions || {}).map((key) => ({
                              dimension: DIMENSION_LABELS[key] || key,
                              ...comparisonData.reduce((acc, d, i) => ({
                                ...acc,
                                [`resp${i}`]: d.dimensions[key as keyof typeof d.dimensions]?.value || 0,
                              }), {}),
                              fullMark: 5,
                            }))}
                          >
                            <PolarGrid className="stroke-border" />
                            <PolarAngleAxis dataKey="dimension" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                            {comparisonData.map((d, i) => (
                              <Radar
                                key={d.id}
                                name={`#${d.id.slice(0, 6)}`}
                                dataKey={`resp${i}`}
                                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                fill={CHART_COLORS[i % CHART_COLORS.length]}
                                fillOpacity={0.2}
                              />
                            ))}
                            <Legend wrapperStyle={{ color: "#a1a1aa" }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                color: "hsl(var(--foreground))",
                                borderRadius: "8px",
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Profile Comparison Cards */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {comparisonData.map((d, i) => (
                        <div
                          key={d.id}
                          className="bg-card border rounded-xl p-4"
                          style={{ borderColor: `${CHART_COLORS[i % CHART_COLORS.length]}50` }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                            />
                            <span className="font-mono text-sm text-foreground/70">#{d.id.slice(0, 8)}</span>
                          </div>
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                              style={{ backgroundColor: `${PROFILE_COLORS[d.profile.primary.name]}30` }}
                            >
                              {d.profile.primary.emoji}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {PROFILE_LABELS[d.profile.primary.name] || d.profile.primary.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{d.profile.primary.score}% match</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-muted rounded-lg p-2">
                              <p className="text-lg font-bold text-blue-400">{d.scores.crs5.value.toFixed(1)}</p>
                              <p className="text-xs text-muted-foreground/60">CRS-5</p>
                            </div>
                            <div className="bg-muted rounded-lg p-2">
                              <p className="text-lg font-bold text-green-400">{d.scores.aiAdoption.value.toFixed(1)}</p>
                              <p className="text-xs text-muted-foreground/60">AI Score</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Dimension Comparison Table */}
                    <div className="bg-card border border-border rounded-xl p-6">
                      <h3 className="font-semibold text-foreground mb-4">Dimension Comparison</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Dimension</th>
                              {comparisonData.map((d, i) => (
                                <th key={d.id} className="text-center py-2 px-3 font-medium" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
                                  #{d.id.slice(0, 6)}
                                </th>
                              ))}
                              <th className="text-center py-2 px-3 text-muted-foreground font-medium">Δ Max</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.keys(comparisonData[0]?.dimensions || {}).map((dimKey) => {
                              const values = comparisonData.map(d => d.dimensions[dimKey as keyof typeof d.dimensions]?.value || 0);
                              const maxDiff = Math.max(...values) - Math.min(...values);
                              return (
                                <tr key={dimKey} className="border-b border-border hover:bg-muted">
                                  <td className="py-2 px-3 text-foreground/70">{DIMENSION_LABELS[dimKey] || dimKey}</td>
                                  {values.map((val, i) => (
                                    <td key={i} className="py-2 px-3 text-center text-foreground font-medium">
                                      {val.toFixed(1)}
                                    </td>
                                  ))}
                                  <td className={cn(
                                    "py-2 px-3 text-center font-medium",
                                    maxDiff > 1.5 ? "text-red-400" : maxDiff > 0.8 ? "text-amber-400" : "text-green-400"
                                  )}>
                                    {maxDiff.toFixed(1)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Answer Diff View - Show only differing answers */}
                    <div className="bg-card border border-border rounded-xl p-6">
                      <h3 className="font-semibold text-foreground mb-4">Key Answer Differences</h3>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {(() => {
                          // Find questions where answers differ
                          const allKeys = new Set<string>();
                          comparisonData.forEach(d => {
                            if (d.answers) {
                              Object.keys(d.answers).forEach(k => allKeys.add(k));
                            }
                          });

                          const differingKeys = Array.from(allKeys).filter(key => {
                            const values = comparisonData.map(d => d.answers?.[key]);
                            return new Set(values.map(v => JSON.stringify(v))).size > 1;
                          });

                          return differingKeys.slice(0, 10).map(key => (
                            <div key={key} className="bg-muted rounded-lg p-3">
                              <p className="text-xs text-muted-foreground mb-2 font-mono">{key}</p>
                              <div className="flex flex-wrap gap-2">
                                {comparisonData.map((d, i) => (
                                  <span
                                    key={d.id}
                                    className="text-xs px-2 py-1 rounded-full"
                                    style={{
                                      backgroundColor: `${CHART_COLORS[i % CHART_COLORS.length]}20`,
                                      color: CHART_COLORS[i % CHART_COLORS.length],
                                    }}
                                  >
                                    {typeof d.answers?.[key] === 'string'
                                      ? d.answers[key]
                                      : Array.isArray(d.answers?.[key])
                                      ? (d.answers[key] as string[]).join(', ')
                                      : String(d.answers?.[key] ?? '—')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
        "relative rounded-2xl border p-5",
        "bg-gradient-to-br",
        colorStyles[color]
      )}
    >
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className={cn("p-2 rounded-lg bg-muted", iconColors[color])}>{icon}</div>
          {trend && (
            <div className="text-right">
              <span className={cn("text-sm font-medium", iconColors[color])}>
                +{trend.value}
                {trend.suffix}
              </span>
              <p className="text-xs text-muted-foreground/60">{trend.label}</p>
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl lg:text-3xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{subtext || label}</p>
        </div>
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
    <div className="bg-card border border-border rounded-2xl p-6">
      <h4 className="text-sm text-muted-foreground mb-2">{label}</h4>
      <div className="flex items-end gap-2 mb-4">
        <span className={cn("text-4xl font-bold", colors[color].text)}>{score.toFixed(1)}</span>
        <span className="text-muted-foreground/50 text-lg mb-1">/ {maxScore}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
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
