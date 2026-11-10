"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MonitorPlay,
  Headphones,
  BarChart3,
  Megaphone,
  GraduationCap,
  LogOut,
  UserCheck,
  CheckCircle2,
  Clock,
  Info,
} from "lucide-react";
import { useConsultantProfile } from "@/lib/session-store";
import { DomusLogo } from "@/components/DomusLogo";

export default function ConsultantHubPage() {
  const { profile } = useConsultantProfile();
  const [activeNotice, setActiveNotice] = useState<string | null>(null);

  const modules = [
    {
      id: "agenda",
      title: "Agenda",
      description:
        "Controle de reuniões de diagnóstico patrimonial, viabilidade e acompanhamento.",
      icon: Calendar,
      buttonLabel: "Acessar Agenda",
      href: null,
      badge: "CRM Domus",
    },
    {
      id: "apresentacoes",
      title: "Apresentações",
      description:
        "1ª Apresentação (Institucional Domus) e 2ª Apresentação (Jornada do Cliente Prezi + Simuladores).",
      icon: MonitorPlay,
      buttonLabel: "Acessar Apresentações",
      href: "/apresentacoes",
      highlight: true,
      badge: "Módulo Principal",
    },
    {
      id: "chamado",
      title: "Backoffice",
      description:
        "Solicitações contratuais, análise documental e acompanhamento pós-adesão.",
      icon: Headphones,
      buttonLabel: "Acessar Backoffice",
      href: null,
      badge: "Operações",
    },
    {
      id: "gestao",
      title: "Jornada & Cotas",
      description:
        "Apresentação focada no cliente (Prezi Domus), simulador de crédito e mapa de cotas.",
      icon: BarChart3,
      buttonLabel: "Abrir Jornada do Cliente",
      href: "/apresentacoes/jornada-cliente",
      badge: "Etapa 2 • Cliente",
    },
    {
      id: "marketing",
      title: "Inteligência",
      description:
        "Estudos de mercado (Curitiba e Região), dados ABECIP e materiais institucionais.",
      icon: Megaphone,
      buttonLabel: "Acessar Estudos",
      href: null,
      badge: "Dados de Mercado",
    },
    {
      id: "treinamentos",
      title: "Metodologia Domus",
      description:
        "Roteiros consultivos baseados em ética, transparência e educação financeira.",
      icon: GraduationCap,
      buttonLabel: "Acessar Metodologia",
      href: null,
      badge: "Academy",
    },
  ];

  return (
    <div className="min-h-screen bg-[#060b1e] text-white flex flex-col justify-between relative overflow-hidden">
      {/* Top Navbar */}
      <header className="w-full border-b border-[#1c2b59] bg-[#060b1e]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DomusLogo variant="white" showText={false} className="w-7 h-7" />
            <div>
              <span className="text-sm font-extrabold tracking-widest uppercase text-white block leading-none">
                {profile.companyName}
              </span>
              <span className="text-[11px] text-slate-400">
                Planejamento &amp; Inteligência Imobiliária
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101c42] border border-[#24356b] text-xs text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{profile.role}</span>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#101c42] hover:bg-[#162659] border border-[#24356b] text-xs font-medium text-slate-200 transition"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              Perfil do Consultor
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center">
        {/* Domus Center Brand */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#101c42] border border-[#283970] shadow-xl flex items-center justify-center mb-4">
            <DomusLogo variant="white" showText={false} className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-1.5">
            DOMUS • ECOSSISTEMA CONSULTIVO
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-center tracking-tight text-white">
            Bem-vindo, {profile.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2 text-center max-w-xl">
            Transformando o mercado imobiliário brasileiro com clareza, técnica e planejamento real.
          </p>
        </div>

        {/* Toast Notice when clicking secondary modules */}
        {activeNotice && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-[#101c42] border border-emerald-500/40 text-xs sm:text-sm text-slate-200 flex items-center gap-2.5 max-w-xl text-center">
            <Info className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{activeNotice}</span>
          </div>
        )}

        {/* First Row: 5 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full mt-4">
          {modules.slice(0, 5).map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                className={`rounded-2xl p-5 flex flex-col justify-between transition duration-200 border ${mod.highlight
                  ? "bg-[#101f4c] border-emerald-500/60 shadow-xl"
                  : "bg-[#0b1536] hover:bg-[#101c44] border-[#1e2f63]"
                  }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 ${mod.highlight
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-[#132252] text-slate-200 border border-[#263b7a]"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#060b1e] text-slate-400 border border-[#1e2f63] mb-2.5">
                    {mod.badge}
                  </span>
                  <h2 className="text-base font-bold text-white mb-1.5">
                    {mod.title}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed mb-5">
                    {mod.description}
                  </p>
                </div>

                {mod.href ? (
                  <Link
                    href={mod.href}
                    className="w-full py-2.5 px-3 rounded-lg bg-[#283970] hover:bg-[#33488c] border border-[#445ca8] text-white font-semibold text-xs text-center shadow-md transition"
                  >
                    {mod.buttonLabel}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveNotice(
                        mod.id === "gestao"
                          ? "O Painel Administrativo de Gestão de Grupos e Cotas será conectado na Fase 3 do cronograma."
                          : `O módulo "${mod.title}" faz parte do Hub complementar. Clique em "Acessar Apresentações" para iniciar a apresentação institucional e os simuladores Domus!`
                      )
                    }
                    className="w-full py-2.5 px-3 rounded-lg bg-[#132252] hover:bg-[#1b2f6e] border border-[#283d80] text-slate-200 font-semibold text-xs text-center transition"
                  >
                    {mod.buttonLabel}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Second Row: Centered 6th Card */}
        <div className="w-full flex justify-center mt-4">
          {modules.slice(5, 6).map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                className="w-full sm:w-64 rounded-2xl p-5 flex flex-col justify-between bg-[#0b1536] hover:bg-[#101c44] border border-[#1e2f63] transition duration-200"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 bg-[#132252] text-slate-200 border border-[#263b7a]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#060b1e] text-slate-400 border border-[#1e2f63] mb-2.5">
                    {mod.badge}
                  </span>
                  <h2 className="text-base font-bold text-white mb-1.5">
                    {mod.title}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed mb-5">
                    {mod.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setActiveNotice(
                      "Dentro de 'Apresentações' você já conta com o Guia de Diagnóstico & Metodologia Domus completo!"
                    )
                  }
                  className="w-full py-2.5 px-3 rounded-lg bg-[#132252] hover:bg-[#1b2f6e] border border-[#283d80] text-slate-200 font-semibold text-xs text-center transition"
                >
                  {mod.buttonLabel}
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer status bar */}
      <footer className="w-full border-t border-[#1c2b59] py-4 px-6 text-center text-xs text-slate-400 flex flex-wrap items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Domus • Sistema de Apresentação Institucional &amp; Simulador de Ciclos Patrimoniais</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Seu sonho realizado é o nosso legado</span>
        </div>
      </footer>
    </div>
  );
}
