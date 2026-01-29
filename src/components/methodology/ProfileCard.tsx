"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Search,
  Anchor,
  Scale,
  Laptop,
  Rocket,
  AlertCircle,
  Compass,
  type LucideIcon,
} from "lucide-react";
import { PROFILE_DEFINITIONS, PROFILE_COLORS } from "@/lib/scoring/constants";
import type { PrimaryProfile } from "@/lib/scoring/types";

// Professional icon mapping for each profile
const PROFILE_ICONS: Record<PrimaryProfile, LucideIcon> = {
  gardien_tradition: Shield,
  prudent_eclaire: Search,
  innovateur_ancre: Anchor,
  equilibriste: Scale,
  pragmatique_moderne: Laptop,
  pionnier_spirituel: Rocket,
  progressiste_critique: AlertCircle,
  explorateur: Compass,
};

interface ProfileCardProps {
  profile: PrimaryProfile;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function ProfileCard({ profile, isExpanded, onToggle }: ProfileCardProps) {
  const def = PROFILE_DEFINITIONS[profile];
  const color = PROFILE_COLORS[profile];
  const Icon = PROFILE_ICONS[profile];

  return (
    <motion.div
      layout
      className="glass-card-refined rounded-xl overflow-hidden cursor-pointer group"
      onClick={onToggle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-white truncate"
              style={{ color }}
            >
              {def.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {def.shortDescription}
            </p>
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-4"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {def.fullDescription}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground/60 mb-1">Motivation</p>
                  <p className="text-sm text-white">{def.coreMotivation}</p>
                </div>
                <div className="glass-card p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground/60 mb-1">Préoccupation</p>
                  <p className="text-sm text-white">{def.primaryFear}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground/60 mb-2">Sous-profils</p>
                <div className="flex flex-wrap gap-2">
                  {def.subProfiles.map((sub) => (
                    <span
                      key={sub}
                      className="px-2 py-1 text-xs rounded-full"
                      style={{ backgroundColor: `${color}30`, color }}
                    >
                      {sub.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Color accent bar */}
      <div className="h-1" style={{ backgroundColor: color }} />
    </motion.div>
  );
}

interface ProfileGalleryProps {
  translations: {
    profilesTitle: string;
    profilesDescription: string;
  };
}

export function ProfileGallery({ translations: t }: ProfileGalleryProps) {
  const [expanded, setExpanded] = useState<PrimaryProfile | null>(null);

  const profiles = Object.keys(PROFILE_DEFINITIONS) as PrimaryProfile[];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{t.profilesTitle}</h2>
        <p className="text-muted-foreground">{t.profilesDescription}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile}
            profile={profile}
            isExpanded={expanded === profile}
            onToggle={() => setExpanded(expanded === profile ? null : profile)}
          />
        ))}
      </div>
    </div>
  );
}
