import { redirect } from "next/navigation";
import { getAdminToken } from "@/lib/admin-auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin — Condensation",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAdminToken();
  if (!token) redirect("/");

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--on-surface)]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
