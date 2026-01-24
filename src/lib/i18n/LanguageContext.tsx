"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { translations, type Language } from "./translations";
import { questionTranslations } from "./questions";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tQuestion: (questionId: string) => string;
  tOption: (optionKey: string) => string;
  tScale: (scaleKey: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let value: unknown = obj;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return path; // Return the key if not found
    }
  }

  return typeof value === "string" ? value : path;
}

function getInitialLanguage(): Language {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("survey-language") as Language | null;
    if (saved && (saved === "fr" || saved === "en")) {
      return saved;
    }
  }
  return "fr";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    // Persist to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("survey-language", lang);
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = getNestedValue(
        translations[language] as unknown as Record<string, unknown>,
        key
      );

      // Replace parameters like {current}, {total}, etc.
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = value.replace(`{${paramKey}}`, String(paramValue));
        });
      }

      return value;
    },
    [language]
  );

  const tQuestion = useCallback(
    (questionId: string): string => {
      const questions = questionTranslations[language].questions;
      return (
        (questions as Record<string, string>)[questionId] || questionId
      );
    },
    [language]
  );

  const tOption = useCallback(
    (optionKey: string): string => {
      const options = questionTranslations[language].options;
      return (options as Record<string, string>)[optionKey] || optionKey;
    },
    [language]
  );

  const tScale = useCallback(
    (scaleKey: string): string => {
      const scales = questionTranslations[language].scales;
      return (scales as Record<string, string>)[scaleKey] || scaleKey;
    },
    [language]
  );

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      tQuestion,
      tOption,
      tScale,
    }),
    [language, setLanguage, t, tQuestion, tOption, tScale]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
