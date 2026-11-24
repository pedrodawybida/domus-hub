import { getCurrentUser } from "../actions/auth";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "../dashboard/DashboardLayoutClient";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Apenas ADM pode acessar páginas sob a rota /admin
  if (!user || user.role !== "ADM") {
    redirect("/dashboard");
  }

  return (
    <DashboardLayoutClient user={user}>
      <div className="flex flex-col min-h-screen bg-slate-50/50 pb-32">
        <AdminNav />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </DashboardLayoutClient>
  );
}
