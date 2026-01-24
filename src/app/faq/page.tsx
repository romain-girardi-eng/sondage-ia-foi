import { FAQSection } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Sondage IA & Vie Spirituelle",
  description: "Questions frequentes sur l'etude academique concernant l'intelligence artificielle et les pratiques religieuses chretiennes.",
};

export default function FAQPage() {
  return <FAQSection />;
}
