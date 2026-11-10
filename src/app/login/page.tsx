"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { useConsultantProfile } from "@/lib/session-store";
import { DomusLogo } from "@/components/DomusLogo";

export default function LoginPage() {
  const router = useRouter();
  const { profile, updateProfile, loaded } = useConsultantProfile();

  const [name, setName] = useState(profile.name);
  const [companyName, setCompanyName] = useState(profile.companyName);
  const [role, setRole] = useState(profile.role);
  const [password, setPassword] = useState("••••••••••••");

  useEffect(() => {
    if (loaded) {
      setName(profile.name);
      setCompanyName(profile.companyName);
      setRole(profile.role);
    }
  }, [loaded, profile]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || "Consultor Domus",
      companyName: companyName.trim() || "Domus",
      role: role.trim() || "Especialista em Planejamento Patrimonial",
    });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#060b1e] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle architectural background glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#283970]/30 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Domus Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#101c42] border border-[#24356b] shadow-xl flex items-center justify-center mb-4">
            <DomusLogo variant="white" showText={false} className="w-8 h-8" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 mb-3">
            DOMUS • Inteligência &amp; Planejamento Imobiliário
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Portal do Consultor
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Identifique seu perfil para personalizar o diagnóstico e as apresentações da Domus.
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          className="bg-[#0b1536]/95 backdrop-blur-md border border-[#1e2f63] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5"
        >
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
              Nome do Consultor / Especialista
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="Ex: Consultor Domus"
                className="w-full bg-[#060b1e] border border-[#24356b] focus:border-emerald-400 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
              Unidade / Assessoria
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={companyName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
                placeholder="Domus"
                className="w-full bg-[#060b1e] border border-[#24356b] focus:border-emerald-400 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
              Cargo / Especialidade
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={role}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRole(e.target.value)}
                placeholder="Especialista em Planejamento Patrimonial"
                className="w-full bg-[#060b1e] border border-[#24356b] focus:border-emerald-400 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
              Credencial de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="w-full bg-[#060b1e] border border-[#24356b] focus:border-emerald-400 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-5 rounded-xl bg-[#283970] hover:bg-[#33488c] border border-[#445ca8] text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition"
          >
            Acessar Plataforma Domus
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Ética, transparência e educação financeira • Domus
          </div>
        </form>
      </div>
    </div>
  );
}
