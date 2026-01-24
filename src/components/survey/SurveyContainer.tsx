"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { SURVEY_QUESTIONS } from "@/data/surveySchema";
import { SurveyIntro } from "./SurveyIntro";
import { QuestionCard } from "./QuestionCard";
import { ThankYouScreen } from "./ThankYouScreen";
import { ResultsDashboard } from "../dashboard/ResultsDashboard";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";

type SurveyStep = "intro" | "questions" | "thanks" | "results";

export function SurveyContainer() {
  const [step, setStep] = useState<SurveyStep>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter questions based on conditions
  const visibleQuestions = useMemo(() => {
    return SURVEY_QUESTIONS.filter((q) => {
      if (!q.condition) return true;
      return q.condition(answers);
    });
  }, [answers]);

  const currentQuestion = visibleQuestions[currentIndex];
  const totalQuestions = visibleQuestions.length;
  const progress = totalQuestions > 0 ? (currentIndex / totalQuestions) * 100 : 0;

  const handleStart = useCallback(() => {
    setStep("questions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleAnswer = useCallback(
    (value: string | number | string[]) => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    },
    [currentQuestion]
  );

  const handleNext = useCallback(() => {
    if (currentIndex >= totalQuestions - 1) {
      setStep("thanks");
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalQuestions]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleViewResults = useCallback(() => {
    setStep("results");
  }, []);

  // Auto-scroll on question change
  useEffect(() => {
    if (step === "questions") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentIndex, step]);

  // Intro screen
  if (step === "intro") {
    return <SurveyIntro onStart={handleStart} />;
  }

  // Thank you screen
  if (step === "thanks") {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        <ThankYouScreen onViewResults={handleViewResults} />
      </div>
    );
  }

  // Results dashboard
  if (step === "results") {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 py-8">
        <ResultsDashboard />
      </div>
    );
  }

  // Questions screen
  if (!currentQuestion) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[100dvh] flex flex-col max-w-4xl mx-auto px-4 py-6 md:py-12 relative"
    >
      {/* Header: Progress Bar */}
      <header className="w-full shrink-0 mb-8 md:mb-12">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs text-muted-foreground font-medium">
            Question {currentIndex + 1} sur {totalQuestions}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <div
          className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progression du sondage"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
          />
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 flex flex-col justify-center py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full"
          >
            <QuestionCard
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={handleAnswer}
              onNext={handleNext}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer: Navigation */}
      <footer className="mt-auto pt-8 shrink-0">
        <div className="flex justify-between items-center w-full max-w-2xl mx-auto">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            aria-label="Question precedente"
            className="flex items-center gap-1.5 px-3 py-2 -ml-3 text-sm text-muted-foreground hover:text-white disabled:opacity-0 disabled:pointer-events-none transition-all duration-200 rounded-lg hover:bg-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Precedent</span>
          </button>

          <div
            className="text-[10px] md:text-xs tracking-[0.15em] font-medium text-muted-foreground/60 uppercase"
            aria-hidden="true"
          >
            {currentIndex + 1} / {totalQuestions}
          </div>

          {/* Spacer for layout balance */}
          <div className="w-[88px] sm:w-[100px]" />
        </div>
      </footer>
    </div>
  );
}
