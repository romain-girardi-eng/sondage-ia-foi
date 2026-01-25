"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Mail, HelpCircle, Users } from "lucide-react";
import { useLanguage } from "@/lib";
import { AnimatedBackground } from "@/components/ui";

interface AlreadySubmittedScreenProps {
  errorCode?: string;
}

export function AlreadySubmittedScreen({ errorCode }: AlreadySubmittedScreenProps) {
  const { t } = useLanguage();

  const isIpLimit = errorCode === "IP_LIMIT_EXCEEDED";

  return (
    <AnimatedBackground variant="subtle" showGrid showOrbs>
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-lg w-full"
        >
          <div className="glass-card-refined rounded-3xl p-8 md:p-10 text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center"
            >
              <ShieldAlert className="w-10 h-10 text-amber-500" />
            </motion.div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {isIpLimit ? t("errors.ipLimitExceeded") : t("errors.alreadySubmitted")}
            </h1>

            {/* Description */}
            <p className="text-muted-foreground mb-8">
              {isIpLimit ? t("errors.ipLimitExceededDesc") : t("errors.alreadySubmittedDesc")}
            </p>

            {/* Help section */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 mb-8 text-left">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {t("errors.legitimateUser")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("errors.legitimateUserDesc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("errors.alreadySubmittedHelp")}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact button */}
            <a
              href={`mailto:${t("errors.contactEmail")}?subject=Survey%20Access%20Request&body=Hello,%0A%0AI%20am%20trying%20to%20access%20the%20survey%20but%20received%20an%20error%20(${errorCode || "unknown"}).%0A%0AMy%20situation:%0A%0AThank%20you.`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Mail className="w-5 h-5" />
              {t("errors.contactUs")}
            </a>

            {/* Contact email */}
            <p className="mt-4 text-sm text-muted-foreground">
              {t("errors.contactEmail")}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
}
