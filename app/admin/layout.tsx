// app/admin/layout.tsx
import "@/app/styles/admin-overrides.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Your Secret Japan",
  description: "Admin dashboard for Your Secret Japan website",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 admin-layout">
      <div className="container mx-auto py-8">
        <div className="bg-white p-6 rounded-lg shadow">{children}</div>
      </div>
    </div>
  );
}
