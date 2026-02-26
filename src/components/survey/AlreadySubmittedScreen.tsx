"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Mail, Smartphone, Globe, Users, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib";
import { AnimatedBackground } from "@/components/ui";

interface AlreadySubmittedScreenProps {
  errorCode?: string;
}

export function AlreadySubmittedScreen({ errorCode }: AlreadySubmittedScreenProps) {
  const { t } = useLanguage();

  const isIpLimit = errorCode === "IP_LIMIT_EXCEEDED";
  const isCookieBlocked = errorCode === "ALREADY_SUBMITTED_COOKIE";

  const title = isIpLimit
    ? t("errors.ipLimitExceeded")
    : isCookieBlocked
      ? t("errors.cookieBlockTitle")
      : t("errors.alreadySubmitted");

  const description = isIpLimit
    ? t("errors.ipLimitExceededDesc")
    : isCookieBlocked
      ? t("errors.cookieBlockDesc")
      : t("errors.alreadySubmittedDesc");

  return (
    <AnimatedBackground variant="subtle" showGrid showOrbs>
      <div className="min-h-screen flex items-center justify-center p-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-xl w-full"
        >
          <div className="glass-card-refined rounded-3xl p-8 md:p-10">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center"
              >
                <ShieldAlert className="w-10 h-10 text-amber-500" />
              </motion.div>

              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{title}</h1>

              <p className="text-muted-foreground">{description}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                {t("errors.solutionsTitle")}
              </h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Smartphone className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">
                      {isCookieBlocked ? t("errors.cookieSolution1Title") : t("errors.solution1Title")}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isCookieBlocked ? t("errors.cookieSolution1Desc") : t("errors.solution1Desc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Globe className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">
                      {isCookieBlocked ? t("errors.cookieSolution2Title") : t("errors.solution2Title")}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isCookieBlocked ? t("errors.cookieSolution2Desc") : t("errors.solution2Desc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">{t("errors.solution3Title")}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("errors.solution3Desc")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4">{t("errors.stillNeedHelp")}</p>
              <a
                href={`mailto:${t("errors.contactEmail")}?subject=${encodeURIComponent(t("errors.emailSubject"))}&body=${encodeURIComponent(t("errors.emailBody", { errorCode: errorCode || "unknown" }))}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Mail className="w-5 h-5" />
                {t("errors.contactUs")}
              </a>
              <p className="mt-3 text-xs text-muted-foreground">{t("errors.contactEmail")}</p>
              {errorCode && (
                <p className="mt-2 text-[11px] text-muted-foreground/70">
                  {t("errors.errorCode")}: {errorCode}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
}
