import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SettingsClient } from "@/components/settings/SettingsClient";
import { getAuthState } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings — Condensation",
  description: "Manage your account, notifications, and preferences.",
};

export default async function SettingsPage() {
  const { isLoggedIn, userName } = await getAuthState();

  if (!isLoggedIn) {
    redirect("/api/auth/login");
  }

  return (
    <>
      <Header isLoggedIn={isLoggedIn} userName={userName} />
      <main>
        <SettingsClient userName={userName} />
      </main>
      <Footer />
    </>
  );
}
