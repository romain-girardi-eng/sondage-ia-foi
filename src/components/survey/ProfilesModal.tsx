"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Info } from "lucide-react";
import { useLanguage } from "@/lib";
import { PROFILE_DEFINITIONS, PROFILE_COLORS } from "@/lib/scoring/constants";
import type { PrimaryProfile } from "@/lib/scoring/types";

interface ProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile?: PrimaryProfile;
  initialSelectedProfile?: PrimaryProfile | null;
}

const PROFILE_ORDER: PrimaryProfile[] = [
  "gardien_tradition",
  "prudent_eclaire",
  "innovateur_ancre",
  "equilibriste",
  "pragmatique_moderne",
  "pionnier_spirituel",
  "progressiste_critique",
  "explorateur",
];

export function ProfilesModal({ isOpen, onClose, currentProfile, initialSelectedProfile }: ProfilesModalProps) {
  const { t, language } = useLanguage();
  const [selectedProfile, setSelectedProfile] = useState<PrimaryProfile | null>(null);
  const profileRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Set initial selected profile when modal opens and scroll to it
  useEffect(() => {
    if (isOpen && initialSelectedProfile) {
      setSelectedProfile(initialSelectedProfile);
      // Scroll to the selected profile after a short delay to allow rendering
      setTimeout(() => {
        const element = profileRefs.current[initialSelectedProfile];
        if (element && scrollContainerRef.current) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    } else if (!isOpen) {
      setSelectedProfile(null);
    }
  }, [isOpen, initialSelectedProfile]);

  const getProfileTranslation = (profileId: PrimaryProfile) => {
    const key = `profiles.${profileId}` as const;
    return {
      title: t(`${key}.title` as any) || PROFILE_DEFINITIONS[profileId].title,
      short: t(`${key}.short` as any) || PROFILE_DEFINITIONS[profileId].shortDescription,
      description: t(`${key}.description` as any) || PROFILE_DEFINITIONS[profileId].fullDescription,
    };
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl bg-[#0d1424] border border-white/10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-[#0d1424]/95 backdrop-blur-sm">
            <div>
              <h2 className="text-2xl font-bold text-white">{t("profiles.title")}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t("profiles.subtitle")}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={t("profiles.close")}
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Content */}
          <div ref={scrollContainerRef} className="p-6 overflow-y-auto max-h-[calc(85vh-88px)]">
            {/* Intro explanation */}
            <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-200">{t("resultsExplain.intro")}</p>
                  <p className="text-xs text-blue-300/70 mt-2">{t("resultsExplain.disclaimer")}</p>
                </div>
              </div>
            </div>

            {/* Profiles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROFILE_ORDER.map((profileId) => {
                const profile = PROFILE_DEFINITIONS[profileId];
                const translation = getProfileTranslation(profileId);
                const isCurrentProfile = currentProfile === profileId;
                const isSelected = selectedProfile === profileId;
                const color = PROFILE_COLORS[profileId];

                return (
                  <motion.button
                    key={profileId}
                    ref={(el) => { profileRefs.current[profileId] = el; }}
                    onClick={() => setSelectedProfile(isSelected ? null : profileId)}
                    className={`relative text-left p-4 rounded-xl border transition-all ${
                      isCurrentProfile
                        ? "border-purple-500/50 bg-purple-500/10"
                        : isSelected
                        ? "border-white/30 bg-white/5"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isCurrentProfile && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-medium rounded-full bg-purple-500/30 text-purple-300">
                        {t("profiles.yourProfile")}
                      </span>
                    )}

                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        {profile.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm">{translation.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {translation.short}
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-white/40 shrink-0 transition-transform ${isSelected ? "rotate-90" : ""}`}
                      />
                    </div>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 mt-4 border-t border-white/10">
                            <p className="text-sm text-white/80 leading-relaxed">
                              {translation.description}
                            </p>

                            <div className="mt-4 space-y-2">
                              <div className="flex items-start gap-2">
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {t("profiles.coreMotivation")}:
                                </span>
                                <span className="text-xs text-emerald-400">
                                  {profile.coreMotivation}
                                </span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {t("profiles.primaryFear")}:
                                </span>
                                <span className="text-xs text-amber-400">
                                  {profile.primaryFear}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>

            {/* Match explanation */}
            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-sm font-medium text-white mb-2">{t("resultsExplain.title")}</h4>
              <p className="text-xs text-muted-foreground">{t("resultsExplain.matchExplain")}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
