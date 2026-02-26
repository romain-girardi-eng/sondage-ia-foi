import {
  Shield,
  Search,
  Anchor,
  Scale,
  Laptop,
  Rocket,
  AlertCircle,
  Compass,
  ShieldCheck,
  BookOpen,
  Users,
  BarChart3,
  Sparkles,
  Eye,
  ArrowLeftRight,
  Smartphone,
  BookMarked,
  Handshake,
  SearchCheck,
  RefreshCw,
  Zap,
  Megaphone,
  Target,
  Telescope,
  FlaskConical,
  MessageSquare,
  Heart,
  MessageCircle,
  Sprout,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import type { PrimaryProfile } from "./types";
import type { SubProfileType } from "./types";

export const PROFILE_ICONS: Record<PrimaryProfile, LucideIcon> = {
  gardien_tradition: Shield,
  prudent_eclaire: Search,
  innovateur_ancre: Anchor,
  equilibriste: Scale,
  pragmatique_moderne: Laptop,
  pionnier_spirituel: Rocket,
  progressiste_critique: AlertCircle,
  explorateur: Compass,
};

export const SUB_PROFILE_ICONS: Record<SubProfileType, LucideIcon> = {
  // Gardien de la Tradition
  protecteur_sacre: ShieldCheck,
  sage_prudent: BookOpen,
  berger_communautaire: Users,
  // Prudent Éclairé
  analyste_spirituel: BarChart3,
  discerneur_pastoral: Sparkles,
  observateur_engage: Eye,
  // Innovateur Ancré
  pont_generationnel: ArrowLeftRight,
  evangeliste_digital: Smartphone,
  theologien_techno: BookMarked,
  // Équilibriste
  mediateur: Handshake,
  chercheur_sens: SearchCheck,
  adaptateur_prudent: RefreshCw,
  // Pragmatique Moderne
  efficace_engage: Zap,
  communicateur_digital: Megaphone,
  optimisateur_pastoral: Target,
  // Pionnier Spirituel
  visionnaire: Telescope,
  experimentateur: FlaskConical,
  prophete_digital: MessageSquare,
  // Progressiste Critique
  ethicien: Scale,
  reformateur_social: Heart,
  philosophe_spirituel: MessageCircle,
  // Explorateur
  curieux_spirituel: Sprout,
  novice_technologique: GraduationCap,
  chercheur_seculier: Search,
};
