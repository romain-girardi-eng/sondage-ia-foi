import { redirect } from "next/navigation";

// Redirect localized privacy routes to the main privacy page
export default function LocalizedPrivacyPage() {
  redirect("/privacy");
}
