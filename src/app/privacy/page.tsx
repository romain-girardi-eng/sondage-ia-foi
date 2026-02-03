import type { Metadata } from "next";
import { PrivacyContent, getPrivacyMetadata } from "../[lang]/privacy/page";

export const metadata: Metadata = getPrivacyMetadata("fr");

export default function PrivacyPageFr() {
  return <PrivacyContent lang="fr" />;
}
