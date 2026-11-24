"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building2, Tag, ShieldCheck, Settings } from "lucide-react";

export default function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Colaboradores",
      href: "/admin/vendedores",
      icon: Users,
    },
    {
      name: "Equipes",
      href: "/admin/equipes",
      icon: ShieldCheck,
    },
    {
      name: "Administradoras",
      href: "/admin/correspondentes",
      icon: Building2,
    },
    {
      name: "Etiquetas",
      href: "/admin/etiquetas",
      icon: Tag,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="flex items-center gap-3 py-6">
          <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-wide font-barlow">
              Painel de Administração
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Cadastros e equipes
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar border-t border-slate-100 pt-4 pb-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-all whitespace-nowrap text-sm font-bold uppercase tracking-wider font-barlow ${
                  isActive
                    ? "border-brand-teal text-brand-teal"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-teal" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
