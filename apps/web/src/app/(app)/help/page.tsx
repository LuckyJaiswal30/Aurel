import type { Metadata } from "next";
import { HelpPage } from "@/features/help/components/HelpPage";

export const metadata: Metadata = { title: "How Aurel works" };

export default function HelpRoute() {
  return <HelpPage />;
}
