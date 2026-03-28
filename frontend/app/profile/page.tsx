import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProfileClient } from "@/components/profile/ProfileClient";
import { getAuthState } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Profile — Condensation",
  description: "View your profile, badges, and linked accounts.",
};

export default async function ProfilePage() {
  const { isLoggedIn, userName } = await getAuthState();

  if (!isLoggedIn) {
    redirect("/api/auth/login");
  }

  return (
    <>
      <Header isLoggedIn={isLoggedIn} userName={userName} />
      <main>
        <ProfileClient userName={userName} />
      </main>
      <Footer />
    </>
  );
}
