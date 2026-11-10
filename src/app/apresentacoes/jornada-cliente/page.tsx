"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Award,
  MapPin,
  ShieldCheck,
  User,
  TrendingUp,
  FileCheck,
  X,
} from "lucide-react";
import { useConsultantProfile } from "@/lib/session-store";
import { formatBRL } from "@/lib/cycles-calculator";
import { DomusLogo } from "@/components/DomusLogo";

type JornadaStepId =
  | "capa"
  | "mercado"
  | "passos"
  | "opcoes"
  | "estrategia"
  | "cotas";

interface RegionPreset {
  name: string;
  sqm: string;
  sqmDesc: string;
  hist: string;
  histDesc: string;
  avgVal: string;
  avgDesc: string;
  future: string;
  futureDesc: string;
}

const REGION_PRESETS: Record<string, RegionPreset> = {
  pinhais: {
    name: "Pinhais",
    sqm: "R$ 3.500,00 a R$ 4.500,00",
    sqmDesc: "Preço médio por m² na região de Pinhais",
    hist: "8%",
    histDesc: "Valorização média da região nos últimos 10 anos",
    avgVal: "R$ 300.000,00 a R$ 450.000,00",
    avgDesc: "Valor médio de imóveis residenciais na região",
    future: "Valorização futura de 9%/ano",
    futureDesc: "Projeção de mercado para os próximos 10 anos",
  },
  agua_verde: {
    name: "Curitiba — Água Verde",
    sqm: "R$ 10.800,00 a R$ 13.500,00",
    sqmDesc: "Preço médio por m² no bairro Água Verde (Curitiba)",
    hist: "14,3%",
    histDesc: "Valorização média registrada em Curitiba e Região (2025)",
    avgVal: "R$ 650.000,00 a R$ 1.200.000,00",
    avgDesc: "Valor médio de imóveis residenciais na região",
    future: "Valorização futura de 12%/ano",
    futureDesc: "Projeção de mercado para os próximos 10 anos",
  },
  cabral: {
    name: "Curitiba — Cabral",
    sqm: "R$ 11.500,00 a R$ 14.800,00",
    sqmDesc: "Preço médio por m² no bairro Cabral (Curitiba)",
    hist: "14,3%",
    histDesc: "Valorização de destaque em Curitiba (FipeZAP / Domus)",
    avgVal: "R$ 750.000,00 a R$ 1.500.000,00",
    avgDesc: "Valor médio de imóveis residenciais na região",
    future: "Valorização futura de 12,5%/ano",
    futureDesc: "Projeção de mercado para os próximos 10 anos",
  },
  batel: {
    name: "Curitiba — Batel",
    sqm: "R$ 14.500,00 a R$ 19.200,00",
    sqmDesc: "Preço médio por m² na região do Batel (Curitiba)",
    hist: "13,8%",
    histDesc: "Valorização média consolidada de alto padrão",
    avgVal: "R$ 1.100.000,00 a R$ 2.500.000,00",
    avgDesc: "Valor médio de imóveis residenciais na região",
    future: "Valorização futura de 11,5%/ano",
    futureDesc: "Projeção de mercado para os próximos 10 anos",
  },
  sjp: {
    name: "São José dos Pinhais",
    sqm: "R$ 4.200,00 a R$ 5.800,00",
    sqmDesc: "Preço médio por m² em São José dos Pinhais",
    hist: "9,5%",
    histDesc: "Valorização média da região nos últimos 10 anos",
    avgVal: "R$ 350.000,00 a R$ 580.000,00",
    avgDesc: "Valor médio de imóveis residenciais na região",
    future: "Valorização futura de 10%/ano",
    futureDesc: "Projeção de mercado para os próximos 10 anos",
  },
};

const PREZI_STEPS = [
  {
    id: 1,
    icon: "🤝",
    title: "1. Entendimento Inicial",
    desc: "Recebemos você para alinhar suas expectativas e iniciar o mapeamento dos seus desejos.",
    extra:
      "Avaliamos Região de Interesse, Padrão Desejado, Orçamento Mensal e Custo de Vida sem comprometer sua tranquilidade.",
  },
  {
    id: 2,
    icon: "🔍",
    title: "2. Identificação do Imóvel Ideal",
    desc: "Utilizamos filtros avançados e nossa rede de parcerias para apresentar opções que atendem seu perfil.",
    extra:
      "Busca inteligente com IA simultânea em 15 portais imobiliários, além de oportunidades de leilão e retomados.",
  },
  {
    id: 3,
    icon: "📋",
    title: "3. Definição da Estratégia",
    desc: "Analisamos as melhores opções de aquisição: financiamento ou Crédito imobiliário.",
    extra:
      "Comparativo matemático imparcial entre Financiamento Bancário (SAC/Price) e Carta de Crédito Estruturada Domus.",
  },
  {
    id: 4,
    icon: "📄",
    title: "4. Formalização e Suporte",
    desc: "Preparamos a documentação e esclarecemos todas as etapas do processo de compra.",
    extra:
      "Segurança jurídica, auditoria documental completa e acompanhamento junto às instituições fiscalizadas pelo Banco Central.",
  },
  {
    id: 5,
    icon: "🔑",
    title: "5. Concretização da Compra",
    desc: "Após a aprovação do valor, negociamos e finalizamos a aquisição do seu novo imóvel.",
    extra:
      "Poder de compra à vista para negociar descontos reais na entrega das chaves ou rentabilizar o patrimônio.",
  },
];

const OCCUPIED_QUOTAS = [
  101, 102, 103, 107, 108, 110, 111, 112, 115, 116, 118, 121, 122, 123, 126,
  128, 129, 131, 134, 135, 138, 139, 140,
];

export default function JornadaClientePage() {
  const { profile } = useConsultantProfile();

  const [viewMode, setViewMode] = useState<"all" | "slides">("all");
  const [activeStep, setActiveStep] = useState<JornadaStepId>("capa");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Personalização do Cliente (Tela 2 do Prezi + Tela 05 Capital)
  const [clientName, setClientName] = useState("CREONICE");
  const [selectedRegionKey, setSelectedRegionKey] = useState("pinhais");
  const [clientGoal, setClientGoal] = useState(
    "Aquisição do Imóvel Perfeito & Moradia"
  );

  // Etapa ativa das 5 Etapas do Prezi
  const [activePreziStep, setActivePreziStep] = useState<number>(1);
  const [aiSearchQuery, setAiSearchQuery] = useState(
    "Apartamento 3 quartos, 2 banheiros, com churrasqueira, até R$ 450.000 em Pinhais / Curitiba"
  );

  // Simulador de Crédito & Liquidez (Elementos da Capital)
  const [creditAmount, setCreditAmount] = useState<number>(400000);
  const [contemplationMonth, setContemplationMonth] = useState<number>(24);
  const [selectedQuotas, setSelectedQuotas] = useState<number[]>([104, 105]);
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [clientCpf, setClientCpf] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [reservationSuccess, setReservationSuccess] = useState(false);

  const steps: { id: JornadaStepId; number: number; label: string }[] = [
    { id: "capa", number: 1, label: "Planejamento do Cliente" },
    { id: "mercado", number: 2, label: "Análise da Região" },
    { id: "passos", number: 3, label: "As 5 Etapas & Ferramentas" },
    { id: "opcoes", number: 4, label: "Leilão & Retomados" },
    { id: "estrategia", number: 5, label: "Critérios & Propostas" },
    { id: "cotas", number: 6, label: "Crédito, Cotas & Próximo Passo" },
  ];

  const regionData = REGION_PRESETS[selectedRegionKey] || REGION_PRESETS.pinhais;
  const currentPreziStepObj =
    PREZI_STEPS.find((s) => s.id === activePreziStep) || PREZI_STEPS[0];

  const calculations = useMemo(() => {
    const halfInstallment = Math.round(creditAmount * 0.00458166);
    const fullInstallment = halfInstallment * 2;
    const bankEntry = Math.round(creditAmount * 0.2);
    const bankInstallment = Math.round(creditAmount * 0.0096);
    const bankTotal = Math.round(creditAmount * 2.7);
    const domusTotal = Math.round(creditAmount * 1.28);
    const domusSaving = Math.max(0, bankTotal - domusTotal);

    const paidUntilContemplation = halfInstallment * contemplationMonth;
    const saleValue = Math.round(creditAmount * 0.27);
    const netProfit = saleValue - paidUntilContemplation;
    const roiPercent =
      paidUntilContemplation > 0
        ? Math.round((netProfit / paidUntilContemplation) * 100)
        : 0;

    return {
      halfInstallment,
      fullInstallment,
      bankEntry,
      bankInstallment,
      bankTotal,
      domusSaving,
      paidUntilContemplation,
      saleValue,
      netProfit,
      roiPercent,
    };
  }, [creditAmount, contemplationMonth]);

  const toggleQuota = (num: number) => {
    if (OCCUPIED_QUOTAS.includes(num)) return;
    setSelectedQuotas((prev) =>
      prev.includes(num)
        ? prev.filter((item) => item !== num)
        : [...prev, num].sort((a, b) => a - b)
    );
  };

  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const shouldShowSection = (id: JornadaStepId) =>
    viewMode === "all" || activeStep === id;

  const currentIndex = steps.findIndex((s) => s.id === activeStep);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/apresentacoes"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#283970] hover:text-[#1d2b57] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Central
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <Link
              href="/apresentacoes/primeira-reuniao"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#283970] transition"
            >
              1. Institucional
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <DomusLogo variant="navy" showText={false} className="w-5 h-5" />
              <span className="text-xs font-extrabold tracking-wider uppercase text-[#283970]">
                {profile.companyName} • Jornada do Cliente
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-1.5 overflow-x-auto py-1">
            {steps.map((s) => {
              const isCurrent = activeStep === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setActiveStep(s.id);
                    if (viewMode === "all") {
                      const el = document.getElementById(`jsection-${s.id}`);
                      el?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    isCurrent
                      ? "bg-[#283970] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isCurrent
                        ? "bg-emerald-400 text-slate-950"
                        : "bg-slate-300 text-slate-700"
                    }`}
                  >
                    {s.number}
                  </span>
                  {s.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setViewMode((prev) => (prev === "all" ? "slides" : "all"))
              }
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
            >
              {viewMode === "all" ? "Modo Slide a Slide" : "Modo Página Inteira"}
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
              title="Tela Cheia"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-10 space-y-12">
        {/* =====================================================================
            ETAPA 1: CAPA PREZI DOMUS & PLANEJAMENTO PATRIMONIAL DO CLIENTE
           ===================================================================== */}
        {shouldShowSection("capa") && (
          <section
            id="jsection-capa"
            className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-12 relative overflow-hidden"
          >
            {/* Cover Banner from Prezi Slide 1 */}
            <div className="text-center pb-8 border-b border-slate-200">
              <div className="flex justify-center mb-4">
                <DomusLogo
                  variant="navy"
                  showText={false}
                  className="w-24 h-24"
                />
              </div>
              <div className="inline-block bg-[#6e76c6]/85 text-white font-serif font-bold text-xl sm:text-3xl px-6 py-3 rounded shadow-md mb-2">
                Sua Jornada Imobiliária com Domus Investimentos
              </div>
              <br />
              <div className="inline-block bg-[#7c85d0]/80 text-white font-serif font-bold text-base sm:text-xl px-5 py-2 rounded shadow-sm">
                Transformando Seus Sonhos em Realidade
              </div>
            </div>

            {/* Live Personalization Bar */}
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#283970] mb-1.5">
                  Nome do Cliente (Personalização ao Vivo)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setClientName(e.target.value)
                    }
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-[#283970] bg-white text-sm font-extrabold text-slate-900 outline-none"
                    placeholder="Ex: CREONICE"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Região de Interesse Mapeada
                </label>
                <select
                  value={selectedRegionKey}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSelectedRegionKey(e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 outline-none cursor-pointer"
                >
                  <option value="pinhais">
                    Pinhais (Região Metropolitana de Curitiba)
                  </option>
                  <option value="agua_verde">
                    Curitiba — Água Verde &amp; Vila Izabel
                  </option>
                  <option value="cabral">Curitiba — Cabral &amp; Juvevê</option>
                  <option value="batel">Curitiba — Batel &amp; Bigorrilho</option>
                  <option value="sjp">São José dos Pinhais / RMC</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Objetivo Principal da Jornada
                </label>
                <select
                  value={clientGoal}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setClientGoal(e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 outline-none cursor-pointer"
                >
                  <option value="Aquisição do Imóvel Perfeito & Moradia">
                    Aquisição do Imóvel Perfeito &amp; Moradia
                  </option>
                  <option value="Investimento Imobiliário & Renda Passiva">
                    Investimento Imobiliário &amp; Renda Passiva
                  </option>
                  <option value="Multiplicação Patrimonial & Leilões">
                    Multiplicação Patrimonial &amp; Leilões
                  </option>
                </select>
              </div>
            </div>

            {/* Prezi Slide 2 Hero: "Planejamento patrimonial: CREONICE" */}
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-[#283970] via-[#1b2956] to-[#5c4d42] text-white p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-xl">
              <div>
                <div className="w-28 h-1 bg-white/40 mb-5" />
                <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
                  Planejamento
                  <br />
                  patrimonial:
                  <br />
                  <span className="text-amber-200 uppercase">
                    {clientName || "CLIENTE DOMUS"}
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-slate-100 mt-4 leading-relaxed max-w-md">
                  Sua jornada para encontrar o imóvel perfeito começa agora.
                  Estamos aqui para guiá-lo com expertise e segurança em cada
                  etapa.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    Região: <strong>{regionData.name}</strong> • {clientGoal}
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl px-10 py-8 text-center shadow-2xl">
                  <div className="text-6xl mb-3">🏠🔑</div>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-200">
                    Expertise &amp; Segurança em Cada Etapa
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            ETAPA 2: ANÁLISE DE MERCADO PERSONALIZADA (Telas 3 e 4 do Prezi)
           ===================================================================== */}
        {shouldShowSection("mercado") && (
          <section
            id="jsection-mercado"
            className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-12"
          >
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-indigo-50 text-[#283970] border border-indigo-200 mb-3">
              Inteligência de Mercado Domus
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0e1e78]">
              Análise de Mercado Personalizada
            </h2>
            <p className="text-base sm:text-lg text-slate-700 mt-1.5">
              Dados Essenciais para Sua Decisão na Região de Interesse (
              <strong className="text-[#283970]">{regionData.name}</strong>)
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(REGION_PRESETS).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedRegionKey(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedRegionKey === key
                      ? "bg-[#283970] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between min-h-[210px] shadow-xs">
                <div>
                  <div className="h-0.5 bg-slate-300 mb-5" />
                  <p className="text-xl font-bold text-slate-900 leading-snug">
                    {regionData.sqm}
                  </p>
                </div>
                <p className="text-sm text-slate-700 mt-6">
                  {regionData.sqmDesc}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between min-h-[210px] shadow-xs">
                <div>
                  <div className="h-0.5 bg-slate-300 mb-5" />
                  <p className="text-4xl font-bold text-slate-900">
                    {regionData.hist}
                  </p>
                </div>
                <p className="text-sm text-slate-700 mt-6">
                  {regionData.histDesc}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between min-h-[210px] shadow-xs">
                <div>
                  <div className="h-0.5 bg-slate-300 mb-5" />
                  <p className="text-xl font-bold text-slate-900 leading-snug">
                    {regionData.avgVal}
                  </p>
                </div>
                <p className="text-sm text-slate-700 mt-6">
                  {regionData.avgDesc}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between min-h-[210px] shadow-xs">
                <div>
                  <div className="h-0.5 bg-slate-300 mb-5" />
                  <p className="text-xl font-bold text-slate-900 leading-snug">
                    {regionData.future}
                  </p>
                </div>
                <p className="text-sm text-slate-700 mt-6">
                  {regionData.futureDesc}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            ETAPA 3: SUA JORNADA IMOBILIÁRIA, PASSO A PASSO + FERRAMENTAS (Telas 5 a 10 do Prezi)
           ===================================================================== */}
        {shouldShowSection("passos") && (
          <section
            id="jsection-passos"
            className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-12"
          >
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-indigo-50 text-[#283970] border border-indigo-200 mb-3">
              Metodologia Passo a Passo • Zoom Interativo
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0e1e78]">
              Sua Jornada Imobiliária, Passo a Passo
            </h2>
            <p className="text-sm sm:text-base font-bold text-slate-800 mt-2 max-w-3xl">
              Conduzindo você com as melhores ferramentas disponíveis no mercado
              para encontrar o que realmente faz sentido!
            </p>

            {/* 5 Chevron Cards from Prezi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-7">
              {PREZI_STEPS.map((st) => {
                const isSelected = activePreziStep === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setActivePreziStep(st.id)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? "bg-white border-[#283970] shadow-lg -translate-y-1"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-xl mb-3">
                      {st.icon}
                    </div>
                    <h3 className="text-sm font-extrabold text-[#0e1e78]">
                      {st.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {st.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Prezi Zoom Stage */}
            <div className="mt-6 rounded-2xl border-2 border-[#283970] bg-slate-50 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-3xl shrink-0">
                  {currentPreziStepObj.icon}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#0e1e78]">
                    {currentPreziStepObj.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-800 mt-1">
                    {currentPreziStepObj.desc}
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold mt-2">
                    ✓ {currentPreziStepObj.extra}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setActivePreziStep((prev) => (prev >= 5 ? 1 : prev + 1))
                }
                className="px-4 py-2.5 rounded-xl bg-[#283970] hover:bg-[#1e2c59] text-white text-xs font-bold shrink-0 transition"
              >
                Próxima Etapa →
              </button>
            </div>

            {/* 2 Tools from Prezi Slide 5: Bank Simulator + AI Property Search in 15 Portals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                <div className="bg-[#1a2642] text-white px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <DomusLogo
                      variant="white"
                      showText={false}
                      className="w-5 h-5"
                    />
                    <div>
                      <div className="text-xs font-bold">
                        Simulador de Financiamento Imobiliário
                      </div>
                      <div className="text-[10px] text-slate-300">
                        Análise completa com critérios bancários reais (SAC vs
                        PRICE)
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    ANÁLISE BANCÁRIA REAL
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Comparamos simultaneamente taxas, score de crédito, renda
                    exigida, SAC vs. PRICE e evolução patrimonial nas principais
                    instituições financeiras:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1 rounded-lg bg-blue-700 text-white text-xs font-extrabold">
                      CAIXA
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-extrabold">
                      Santander
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-red-700 text-white text-xs font-extrabold">
                      Bradesco
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-yellow-400 text-blue-950 text-xs font-extrabold">
                      Banco do Brasil
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-orange-600 text-white text-xs font-extrabold">
                      Itaú
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-orange-500 text-white text-xs font-extrabold">
                      Inter
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                <div className="bg-[#233329] text-white px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <DomusLogo
                      variant="white"
                      showText={false}
                      className="w-5 h-5"
                    />
                    <div>
                      <div className="text-xs font-bold">
                        Domus — Pesquisa Imobiliária
                      </div>
                      <div className="text-[10px] text-emerald-200">
                        Busca inteligente com IA em 15 portais
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    15 PORTAIS
                  </span>
                </div>
                <div className="p-5 bg-[#f4f6f0]">
                  <div className="bg-[#234733] text-white p-4 rounded-xl">
                    <div className="text-xs font-bold text-emerald-200">
                      ✨ Busca Inteligente com IA
                    </div>
                    <div className="text-[11px] text-emerald-100 mt-0.5">
                      Descreva o imóvel e receba links diretos para 15 portais —
                      já com filtros aplicados
                    </div>
                    <input
                      type="text"
                      value={aiSearchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAiSearchQuery(e.target.value)
                      }
                      className="w-full mt-2.5 px-3 py-2 rounded-lg bg-white text-slate-900 text-xs font-semibold outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            ETAPA 4: AMPLIE SUAS OPÇÕES — VIAS INTELIGENTES DE AQUISIÇÃO (Tela 11 do Prezi)
           ===================================================================== */}
        {shouldShowSection("opcoes") && (
          <section
            id="jsection-opcoes"
            className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-slate-50 border-2 border-slate-200 shadow-xl flex flex-col items-center justify-center p-8 text-center">
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0e1e78] leading-snug">
                    Amplie Suas Opções: Vias Inteligentes de Aquisição
                  </h2>
                  <span className="mt-4 px-3.5 py-1 rounded-full bg-[#283970] text-amber-200 text-xs font-bold">
                    ⚖️ Oportunidades Abaixo do Mercado
                  </span>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-4 p-5 rounded-full bg-slate-50 border border-slate-200 hover:border-[#283970] transition">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-300 flex items-center justify-center text-xl shrink-0">
                    🔨
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Imóveis de Leilão
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                      Descubra oportunidades abaixo do valor de mercado, com
                      base em fontes como Tribunais de Justiça e leiloeiros
                      oficiais.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 rounded-full bg-slate-50 border border-slate-200 hover:border-[#283970] transition">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-300 flex items-center justify-center text-xl shrink-0">
                    🏛️
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Imóveis Retomados de Financiamento
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                      Propriedades oferecidas por instituições financeiras com
                      condições especiais de venda (ex: Caixa Econômica
                      Federal).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 rounded-full bg-slate-50 border border-slate-200 hover:border-[#283970] transition">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-300 flex items-center justify-center text-xl shrink-0">
                    📋
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Venda Direta Pós-Leilão
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                      Imóveis não arrematados em leilões, disponíveis para
                      negociação facilitada diretamente com bancos ou
                      leiloeiros.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            ETAPA 5: CRITÉRIOS BACEN, COMPARATIVO DE PROPOSTAS & LUCRO NA CARTA (Capital + Domus)
           ===================================================================== */}
        {shouldShowSection("estrategia") && (
          <section
            id="jsection-estrategia"
            className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-12"
          >
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-indigo-50 text-[#283970] border border-indigo-200 mb-3">
              Engenharia Financeira Domus • Critérios Técnicos
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0e1e78]">
              Critérios Técnicos &amp; Comparativo de Cenários para{" "}
              <span className="uppercase">{clientName}</span>
            </h2>

            {/* 5 Critérios Técnicos (Tela 06 da Capital) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
              {[
                {
                  badge: "01 • BACEN",
                  title: "Ranking Banco Central",
                  desc: "Apenas instituições fiscalizadas e no topo de solidez do Banco Central.",
                  dark: true,
                },
                {
                  badge: "02 • CUSTO",
                  title: "Taxa Administrativa",
                  desc: "Zero juros compostos: apenas taxa administrativa diluída no prazo.",
                  dark: false,
                },
                {
                  badge: "03 • LIQUIDEZ",
                  title: "Média de Contemplações",
                  desc: "Seleção de grupos com alto saldo de caixa e histórico comprovado.",
                  dark: false,
                },
                {
                  badge: "04 • FLUXO",
                  title: "Meia Parcela",
                  desc: "Parcela reduzida até a contemplação para preservar seu orçamento.",
                  dark: false,
                },
                {
                  badge: "05 • LANCES",
                  title: "Estratégia de Lances",
                  desc: "Uso inteligente de Lance Fixo, Lance Embutido e FGTS.",
                  dark: false,
                },
              ].map((crit, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border ${
                    crit.dark
                      ? "bg-[#0b1536] text-white border-[#283970]"
                      : "bg-slate-50 text-slate-900 border-slate-200"
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      crit.dark ? "text-emerald-400" : "text-[#283970]"
                    }`}
                  >
                    {crit.badge}
                  </span>
                  <h3 className="text-sm font-extrabold mt-1">{crit.title}</h3>
                  <p
                    className={`text-xs mt-1.5 leading-relaxed ${
                      crit.dark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {crit.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Comparativo Lado a Lado: Cenário A vs Cenário B (Tela 07 da Capital) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Cenário A • Mercado Tradicional
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
                    Custo Elevado (CET)
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mt-2">
                  Financiamento Bancário Tradicional
                </h3>
                <div className="mt-4 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-500">Crédito de Referência:</span>
                    <strong className="text-slate-900">
                      {formatBRL(creditAmount)}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-500">
                      Entrada Obrigatória (20%):
                    </span>
                    <strong className="text-red-600">
                      {formatBRL(calculations.bankEntry)} à vista
                    </strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-500">
                      Parcela Inicial Estimada:
                    </span>
                    <strong className="text-slate-900">
                      {formatBRL(calculations.bankInstallment)}/mês
                    </strong>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">
                      Custo Final Acumulado:
                    </span>
                    <strong className="text-red-600">
                      ~{formatBRL(calculations.bankTotal)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border-2 border-emerald-500 bg-[#0b1536] text-white shadow-xl">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-emerald-400">
                    Cenário B • Curadoria Domus
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    Recomendado
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white mt-2">
                  Planejamento Estratégico Domus (Meia Parcela)
                </h3>
                <div className="mt-4 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-slate-300">Crédito Planejado:</span>
                    <strong className="text-white">
                      {formatBRL(creditAmount)}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-slate-300">Entrada Obrigatória:</span>
                    <strong className="text-emerald-400">
                      R$ 0 (Preserva sua liquidez)
                    </strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/10">
                    <span className="text-slate-300">
                      Meia Parcela (Até Contemplar):
                    </span>
                    <strong className="text-amber-300 text-base">
                      {formatBRL(calculations.halfInstallment)}/mês
                    </strong>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-300">
                      Economia Patrimonial Estimada:
                    </span>
                    <strong className="text-emerald-400">
                      +{formatBRL(calculations.domusSaving)} de economia
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulador de Liquidez / Lucro na Venda da Carta Contemplada (Tela 08 da Capital) */}
            <div className="mt-6 p-6 rounded-2xl bg-indigo-50/70 border border-indigo-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#283970]">
                    Simulador de Liquidez • Opção de Venda da Carta Contemplada
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                    E se você optar por vender o crédito contemplado com ágio (~27%)?
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600">
                    Mês da Contemplação:
                  </label>
                  <select
                    value={contemplationMonth}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setContemplationMonth(Number(e.target.value))
                    }
                    className="px-3 py-1.5 rounded-lg border border-[#283970] bg-white text-xs font-bold text-slate-900"
                  >
                    <option value={12}>12 meses (1 ano)</option>
                    <option value={24}>24 meses (2 anos)</option>
                    <option value={36}>36 meses (3 anos)</option>
                    <option value={48}>48 meses (4 anos)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[11px] text-slate-500">
                    Crédito Contemplado
                  </span>
                  <p className="text-lg font-extrabold text-slate-900 mt-1">
                    {formatBRL(creditAmount)}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[11px] text-slate-500">
                    Total Investido em Parcelas
                  </span>
                  <p className="text-lg font-extrabold text-slate-800 mt-1">
                    {formatBRL(calculations.paidUntilContemplation)}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-emerald-200">
                  <span className="text-[11px] text-emerald-700">
                    Valor de Venda (~27% Ágio)
                  </span>
                  <p className="text-lg font-extrabold text-emerald-700 mt-1">
                    {formatBRL(calculations.saleValue)}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0b1536] text-white">
                  <span className="text-[11px] text-emerald-400">
                    Lucro Líquido Estimado
                  </span>
                  <p className="text-lg font-extrabold text-white mt-1">
                    +{formatBRL(calculations.netProfit)} (+
                    {calculations.roiPercent}%)
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            ETAPA 6: SIMULADOR DE CRÉDITO (SLIDER + 20X), MAPA DE COTAS & PRÓXIMO PASSO PREZI
           ===================================================================== */}
        {shouldShowSection("cotas") && (
          <section
            id="jsection-cotas"
            className="bg-white rounded-3xl border-2 border-[#283970] shadow-xl p-6 sm:p-12 space-y-10"
          >
            {/* Slider Interativo de Crédito + Acelerador 20x */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Crédito Imobiliário Selecionado
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#283970]">
                    {formatBRL(creditAmount)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[300000, 400000, 600000, 1000000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCreditAmount(val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        creditAmount === val
                          ? "bg-[#283970] text-white"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {formatBRL(val)}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="range"
                min={150000}
                max={2000000}
                step={25000}
                value={creditAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreditAmount(Number(e.target.value))
                }
                className="w-full h-3 rounded-lg accent-[#283970] cursor-pointer"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-white border-2 border-[#283970]">
                  <span className="text-[11px] font-bold uppercase text-[#283970]">
                    Meia Parcela (Até Contemplar)
                  </span>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">
                    {formatBRL(calculations.halfInstallment)}/mês
                  </p>
                  <span className="text-[11px] text-slate-500">
                    Parcela integral: {formatBRL(calculations.fullInstallment)}
                    /mês
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <span className="text-[11px] font-bold uppercase text-slate-500">
                    Acelerador de Contemplação
                  </span>
                  <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                    20x Mais Chances
                  </p>
                  <span className="text-[11px] text-slate-500">
                    Sorteio + Lance Fixo (10x) + Embutido
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <span className="text-[11px] font-bold uppercase text-slate-500">
                    Grupo Estratégico Domus
                  </span>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">
                    Grupo #4082 • Imóveis
                  </p>
                  <span className="text-[11px] text-slate-500">
                    Prazo: 200 meses • Fiscalizado BACEN
                  </span>
                </div>
              </div>
            </div>

            {/* Mapa Interativo de Assentos de Cotas (Tela 10 da Capital) */}
            <div className="border border-slate-200 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Mapa de Disponibilidade de Cotas • Grupo #4082
                  </h3>
                  <p className="text-xs text-slate-500">
                    Clique nas cotas disponíveis para reservar a posição de{" "}
                    <strong className="uppercase">{clientName}</strong>:
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                    Disponível
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#283970] inline-block" />
                    Selecionada
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-slate-300 inline-block" />
                    Ocupada
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {Array.from({ length: 40 }, (_, i) => 101 + i).map((num) => {
                  const isOccupied = OCCUPIED_QUOTAS.includes(num);
                  const isSelected = selectedQuotas.includes(num);
                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => toggleQuota(num)}
                      className={`py-2.5 px-2 rounded-lg text-xs font-bold border transition ${
                        isOccupied
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                          : isSelected
                          ? "bg-[#283970] text-white border-[#0b1536] shadow-md scale-105"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      #{num}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs sm:text-sm">
                  Cotas selecionadas:{" "}
                  <strong className="text-[#283970]">
                    {selectedQuotas.length > 0
                      ? selectedQuotas.map((n) => `Cota #${n}`).join(", ")
                      : "Nenhuma selecionada"}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReservationSuccess(false);
                    setShowReservaModal(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition"
                >
                  Reservar Cotas Selecionadas (CPF) →
                </button>
              </div>
            </div>

            {/* Por Que Escolher a Domus Investimentos? (Tela 12 do Prezi) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6 border-t border-slate-200">
              <div className="lg:col-span-5">
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0e1e78] leading-tight">
                  Por Que Escolher a Domus Investimentos?
                </h2>
                <p className="text-sm text-slate-600 mt-3">
                  Acompanhamento consultivo completo, do diagnóstico inicial até
                  a entrega das chaves.
                </p>
              </div>

              <div className="lg:col-span-7 space-y-3">
                {[
                  {
                    t: "Expertise de Mercado:",
                    d: "Análises detalhadas e personalizadas para a sua região de interesse.",
                  },
                  {
                    t: "Portfólio Exclusivo:",
                    d: "Acesso privilegiado a imóveis que se encaixam perfeitamente no seu perfil.",
                  },
                  {
                    t: "Estratégia Otimizada:",
                    d: "Orientação completa sobre financiamento, consórcio e alternativas de aquisição.",
                  },
                  {
                    t: "Transparência Total:",
                    d: "Clareza em todas as etapas, garantindo segurança e tranquilidade na sua decisão.",
                  },
                  {
                    t: "Suporte Dedicado:",
                    d: "Nossa equipe ao seu lado, do primeiro contato à entrega das chaves.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-5 py-3.5 rounded-full bg-slate-50 border border-slate-200"
                  >
                    <span className="text-[#0e1e78] font-black">➔</span>
                    <p className="text-xs sm:text-sm text-slate-800">
                      <strong>{item.t}</strong> {item.d}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pronto Para Dar o Próximo Passo? + Chave Dourada Domus (Telas 13 e 14 do Prezi) */}
            <div className="rounded-2xl bg-[#060b1e] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Domus Investimentos • Próximo Passo
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold mt-3">
                  Pronto Para Dar o Próximo Passo,{" "}
                  <span className="text-amber-300 uppercase">{clientName}</span>?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  A Domus Investimentos está aqui para transformar seu sonho da
                  casa própria em uma feliz realidade. Vamos construir juntos?
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setReservationSuccess(false);
                  setShowReservaModal(true);
                }}
                className="px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shrink-0 shadow-lg transition flex items-center gap-2"
              >
                🔑 Confirmar Reserva &amp; Próximo Passo
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Bottom Slide Bar when in Slide Mode */}
      {viewMode === "slides" && (
        <footer className="sticky bottom-0 z-30 bg-white border-t border-slate-200 px-6 py-3.5 shadow-lg">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button
              type="button"
              disabled={currentIndex <= 0}
              onClick={() =>
                currentIndex > 0 && setActiveStep(steps[currentIndex - 1].id)
              }
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Etapa Anterior
            </button>

            <span className="text-xs font-bold text-slate-500">
              Etapa {currentIndex + 1} de {steps.length}:{" "}
              <strong className="text-[#283970]">
                {steps[currentIndex]?.label}
              </strong>
            </span>

            <button
              type="button"
              disabled={currentIndex >= steps.length - 1}
              onClick={() =>
                currentIndex < steps.length - 1 &&
                setActiveStep(steps[currentIndex + 1].id)
              }
              className="px-5 py-2 rounded-xl bg-[#283970] text-white text-xs font-bold disabled:opacity-40 hover:bg-[#1e2c59] flex items-center gap-1.5 transition"
            >
              Próxima Etapa
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      )}

      {/* Modal de Reserva Técnica de Cota (Tela 11 da Capital) */}
      {showReservaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-[#0b1536] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <DomusLogo
                  variant="white"
                  showText={false}
                  className="w-6 h-6"
                />
                <div>
                  <h3 className="text-sm font-bold">
                    Reserva Técnica de Cota • Domus
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Formalização do Planejamento Patrimonial
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReservaModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cliente:</span>
                  <strong className="text-[#283970] uppercase">
                    {clientName}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Crédito Selecionado:</span>
                  <strong>{formatBRL(creditAmount)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Meia Parcela:</span>
                  <strong className="text-emerald-700">
                    {formatBRL(calculations.halfInstallment)}/mês
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cotas Grupo #4082:</span>
                  <strong className="text-[#283970]">
                    {selectedQuotas.map((n) => `#${n}`).join(", ")}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  CPF / CNPJ do Titular
                </label>
                <input
                  type="text"
                  value={clientCpf}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setClientCpf(e.target.value)
                  }
                  placeholder="000.000.000-00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setClientPhone(e.target.value)
                  }
                  placeholder="(41) 99999-9999"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
                />
              </div>

              {reservationSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
                  ✅ Reserva técnica registrada com sucesso para {clientName}!
                </div>
              )}

              <button
                type="button"
                onClick={() => setReservationSuccess(true)}
                className="w-full py-3 rounded-xl bg-[#283970] hover:bg-[#1e2c59] text-white font-bold text-xs uppercase tracking-wider transition"
              >
                Confirmar Reserva das Cotas →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

