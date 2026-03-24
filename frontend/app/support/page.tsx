import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SupportHero } from "@/components/support/SupportHero";
import { HelpCategories } from "@/components/support/HelpCategories";
import { FAQ } from "@/components/support/FAQ";
import { ContactSection } from "@/components/support/ContactSection";

export const metadata: Metadata = {
  title: "Support — Condensation",
  description:
    "Get help with orders, keys, payments, and account issues. Browse FAQs or contact our support team.",
};

export default function SupportPage() {
  return (
    <>
      <Header />
      <main>
        <SupportHero />
        <HelpCategories />
        <FAQ />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
