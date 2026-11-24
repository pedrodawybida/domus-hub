"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { logoutAction } from "../actions/auth";
import Link from "next/link";
import { DomusLogo } from "@/components/DomusLogo";
import AgendaNotification from "@/components/AgendaNotification";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Shield,
  Trophy,
  FileCheck,
  ClipboardCheck,
  FileText,
  Megaphone,
  Building2,
  CalendarDays,
  Tag,
  Share2
} from "lucide-react";

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  role: string;
}

export default function DashboardLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserProfile;
}) {
  const menuRef = useRef<HTMLDialogElement>(null);
  const hubUrl = process.env.NEXT_PUBLIC_HUB_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "/hub");
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutAction();
    window.location.replace(hubUrl.replace(/\/$/, "") + "/login");
  };
  const navItems = [
    {
      name: "Domus Hub",
      href: hubUrl,
      icon: LayoutDashboard,
      roles: ["ADM", "VENDEDOR", "SECRETARIA", "GESTOR"],
    },
    {
      name: "Funil de leads",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADM", "VENDEDOR", "SECRETARIA", "GESTOR"],
    },
    {
      name: "Agenda",
      href: "/dashboard/agenda",
      icon: CalendarDays,
      roles: ["ADM", "VENDEDOR", "SECRETARIA", "GESTOR"],
    },
    {
      name: "Campanhas",
      href: "/dashboard/campanhas",
      icon: Megaphone,
      roles: ["ADM", "VENDEDOR", "SECRETARIA", "GESTOR"],
    },
    {
      name: "Vendas",
      href: "/dashboard/ranking",
      icon: Trophy,
      roles: ["ADM", "VENDEDOR", "SECRETARIA", "GESTOR"],
    },
    {
      name: "Análise de crédito",
      href: "/dashboard/analise",
      icon: FileCheck,
      roles: ["ADM", "VENDEDOR", "SECRETARIA", "GESTOR"],
    },
    {
      name: "Contratos",
      href: "/dashboard/contratos",
      icon: ClipboardCheck,
      roles: ["ADM", "VENDEDOR", "SECRETARIA", "GESTOR"],
    },
    {
      name: "Fichas KYC",
      href: "/dashboard/fichas",
      icon: FileText,
      roles: ["ADM", "VENDEDOR", "SECRETARIA", "GESTOR"],
    },
    {
      name: "Contas do Facebook",
      href: "/dashboard/contas-facebook",
      icon: Share2,
      roles: ["ADM", "VENDEDOR", "GESTOR"],
    },
    {
      name: "Administração",
      href: "/admin/vendedores",
      icon: Shield,
      roles: ["ADM"],
    },
  ];
  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">
      <dialog
        id="crm-navigation"
        ref={menuRef}
        aria-label="Navegação do CRM"
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none max-w-full border-0 p-0 backdrop:bg-black/40"
        onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close(); }}
      >
          <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full animate-slideRight">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <DomusLogo />
              <button
                aria-label="Fechar navegação"
                onClick={() => menuRef.current?.close()}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const NavLink = item.icon === LayoutDashboard && item.href !== "/dashboard" ? "a" : Link;
                const isActive = pathname === item.href || (item.href === "/dashboard" && pathname.startsWith("/dashboard/leads/"));
                return (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    onClick={() => menuRef.current?.close()}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-brand-blue/10 border border-brand-blue/20 text-brand-blue"
                        : "text-slate-600 hover:text-brand-blue hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-brand-teal" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0">
                  <UserIcon className="w-5 h-5 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{user.nome}</p>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wide mt-0.5">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-red-50 hover:text-red-600 border border-slate-200 text-slate-700 font-bold rounded-xl transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </aside>
      </dialog>

      {/* 3. Área Principal */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Mobile / Desktop */}
        <header className="min-h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4">
            <button
              aria-label="Abrir navegação"
              aria-haspopup="dialog"
              aria-controls="crm-navigation"
              onClick={() => menuRef.current?.showModal()}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumb simples */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-barlow">
                Domus CRM
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-brand-blue mt-0.5 tracking-tight font-barlow">
                {pathname === "/dashboard"
                  ? "Funil de leads"
                  : pathname === "/admin/vendedores"
                  ? "Equipe"
                  : pathname === "/dashboard/campanhas"
                  ? "Campanhas"
                  : pathname === "/dashboard/academy"
                  ? "Domus Academy"
                  : pathname === "/dashboard/contas-facebook"
                  ? "Contas Facebook"
                  : pathname.includes("/leads/")
                  ? "Dados do lead"
                  : "Domus CRM"}
              </h2>
            </div>
          </div>

        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-x-hidden bg-[#f7f7f4]">
          <div className="max-w-[var(--layout-content-max)] mx-auto p-4 md:p-7 w-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Notificações Globais de Agendamento */}
      <AgendaNotification />
    </div>
  );
}
