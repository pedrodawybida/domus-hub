"use client";

import Link from "next/link";
import {
  Calendar,
  MonitorPlay,
  BarChart3,
  GraduationCap,
  ArrowUpRight,
  LogOut,
} from "lucide-react";
import styles from "./hub.module.css";
import { DomusLogo } from "@/components/DomusLogo";

export default function ConsultantHubPage({ name, canPresent, crmUrl }: { name: string; canPresent: boolean; crmUrl: string }) {
  const modules = [
    {
      id: "agenda",
      title: "CRM Domus",
      description:
        "Acompanhe clientes, negociações e atividades comerciais.",
      icon: Calendar,
      buttonLabel: "Acessar CRM",
      href: crmUrl,
    },
    {
      id: "apresentacoes",
      title: "Apresentações",
      description:
        "Apresentações institucionais, Jornada do Cliente e Linha do Tempo Imobiliária de Curitiba e RMC.",
      icon: MonitorPlay,
      buttonLabel: "Acessar Apresentações",
      href: "/apresentacoes",
    },
    {
      id: "gestao",
      title: "Jornada & Cotas",
      description:
        "Apresentação focada no cliente (Prezi Domus), simulador de crédito e mapa de cotas.",
      icon: BarChart3,
      buttonLabel: "Abrir Jornada do Cliente",
      href: "/slides/Domus_Investimentos.html",
    },
    {
      id: "treinamentos",
      title: "Domus Academy",
      description:
        "Acesse os módulos e acompanhe seu progresso nos treinamentos da Domus.",
      icon: GraduationCap,
      buttonLabel: "Acessar Domus Academy",
      href: crmUrl.replace(/\/$/, "") + "/dashboard/academy",
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.signature}><DomusLogo variant="navy" className="h-11 w-11" /> Domus Hub</div>
        <form action="/api/logout" method="post">
          <button type="submit" className="flex items-center gap-2 px-2 py-2 text-sm hover:underline"><LogOut size={16} aria-hidden="true" /> Sair</button>
        </form>
      </header>
      <main className={styles.main}>
        <section className={styles.cover}>
          <div className={styles.art} aria-hidden="true" />
          <div className={styles.intro}>
            <p>Bem-vindo, {name}</p>
            <h1>Domus Hub</h1>
          </div>
        </section>
        <div className={styles.grid}>
          {modules.filter(mod => canPresent || !["apresentacoes", "gestao"].includes(mod.id)).map(mod => {
            const Icon = mod.icon;
            const ModuleLink = mod.id === "apresentacoes" ? Link : "a";
            return (
              <article key={mod.id} className={styles.card}>
                <Icon size={25} strokeWidth={1.5} aria-hidden="true" />
                <h2>{mod.title}</h2>
                <p>{mod.description}</p>
                <ModuleLink href={mod.href} className={styles.action}>{mod.buttonLabel}<ArrowUpRight size={17} /></ModuleLink>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
