"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Home,
  Maximize2,
  Minimize2,
  Percent,
  Wallet,
  Calculator,
  Clock,
  Ban,
  Award,
  AlertTriangle,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useConsultantProfile } from "@/lib/session-store";
import {
  calculateCycles,
  calculateSavingYearsVsConsorcio,
  formatBRL,
} from "@/lib/cycles-calculator";
import { DomusLogo } from "@/components/DomusLogo";

type StepId =
  | "missao"
  | "mito-realidade"
  | "fatores-curitiba"
  | "abordagem"
  | "comparativo"
  | "ciclos";

export default function PrimeiraReuniaoPage() {
  const { profile } = useConsultantProfile();

  const [viewMode, setViewMode] = useState<"all" | "slides">("all");
  const [activeStep, setActiveStep] = useState<StepId>("missao");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [consorcioUnlocked, setConsorcioUnlocked] = useState(false);

  // Interactive operational timeline
  const [selectedWorkPhase, setSelectedWorkPhase] = useState<1 | 2 | 3>(1);

  // Saving vs Consórcio calculator
  const [targetPropertyVal, setTargetPropertyVal] = useState<number>(1000000);
  const [monthlySavingVal, setMonthlySavingVal] = useState<number>(4000);

  // Calculadora de Ciclos Domus
  const [monthlyInvestmentInput, setMonthlyInvestmentInput] =
    useState<number>(3000);
  const [initialEntryInput, setInitialEntryInput] = useState<number>(0);
  const [numCyclesInput, setNumCyclesInput] = useState<number>(3);
  const [cyclesViewTab, setCyclesViewTab] = useState<"tabela" | "cards">(
    "tabela"
  );

  const steps: { id: StepId; number: number; label: string }[] = [
    { id: "missao", number: 1, label: "A Domus & Missão" },
    { id: "mito-realidade", number: 2, label: "Mito vs. Realidade" },
    { id: "fatores-curitiba", number: 3, label: "Mercado & Curitiba" },
    { id: "abordagem", number: 4, label: "Metodologia Domus" },
    { id: "comparativo", number: 5, label: "3 Vias de Aquisição" },
    { id: "ciclos", number: 6, label: "Simulador de Ciclos" },
  ];

  const simulation = useMemo(
    () =>
      calculateCycles(monthlyInvestmentInput, initialEntryInput, numCyclesInput),
    [monthlyInvestmentInput, initialEntryInput, numCyclesInput]
  );

  const savingComparison = useMemo(
    () =>
      calculateSavingYearsVsConsorcio(targetPropertyVal, monthlySavingVal),
    [targetPropertyVal, monthlySavingVal]
  );

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

  const workPhases = {
    1: {
      badge: "ETAPA 01 • DIAGNÓSTICO & ESTRUTURAÇÃO DE CRÉDITO",
      title: "Planejamento Financeiro Compatível com a Sua Realidade",
      subtitle:
        "Traduzimos indicadores técnicos (CET, TR, IPCA, SAC, Price e taxas administrativas) em um plano seguro e previsível.",
      items: [
        "Mapeamento de região de interesse, padrão do imóvel, orçamento mensal e custo de vida",
        "Análise comparativa imparcial entre linhas de crédito e grupos de consórcio",
        "Seleção técnica de administradoras fiscalizadas pelo Banco Central",
        "Dimensionamento de parcelas e estratégias de lance sem comprometer sua liquidez familiar",
        "Planejamento transparente de prazos e probabilidades reais de contemplação",
      ],
    },
    2: {
      badge: "ETAPA 02 • CURADORIA IMOBILIÁRIA & SEGURANÇA",
      title: "Escolha Técnica do Ativo (Moradia ou Investimento)",
      subtitle:
        "Apoiamos a decisão imobiliária com base em dados concretos de valorização, liquidez e segurança jurídica.",
      items: [
        "Estudo de valorização regional (com forte atuação em Curitiba e Região Metropolitana)",
        "Avaliação de liquidez, potencial de locação e segurança construtiva/documental",
        "Acompanhamento completo no processo de liberação e utilização da carta de crédito",
        "Negociação estratégica à vista com o crédito contemplado junto a proprietários e construtoras",
        "Prevenção contra armadilhas contratuais, juros abusivos e descapitalização",
      ],
    },
    3: {
      badge: "ETAPA 03 • CONSOLIDAÇÃO & CICLOS PATRIMONIAIS",
      title: "Rentabilização, Autoquitação e Expansão de Patrimônio",
      subtitle:
        "Para quem busca investir ou expandir patrimônio, estruturamos ciclos onde o próprio ativo gera renda e sustenta o próximo passo.",
      items: [
        "Alocação do imóvel para geração de renda passiva mensal consistente",
        "Autoquitação patrimonial: a receita de locação cobre a parcela do crédito utilizado",
        "Reinvestimento inteligente do excedente para iniciar novos ciclos patrimoniais",
        "Proteção do poder de compra da família contra a inflação e desvalorização da moeda",
        "Construção gradual de legado e independência financeira através de ativos reais",
      ],
    },
  };

  const currentPhaseData = workPhases[selectedWorkPhase];

  const shouldShowSection = (id: StepId) => {
    if (id === "ciclos" && !consorcioUnlocked && activeStep !== "ciclos") {
      return false;
    }
    return viewMode === "all" || activeStep === id;
  };

  const currentIndex = steps.findIndex((s) => s.id === activeStep);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      {/* Sticky Top Presentation Control Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back & Domus Brand */}
          <div className="flex items-center gap-4">
            <Link
              href="/apresentacoes"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#283970] hover:text-[#1d2b57] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Central
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <DomusLogo variant="navy" showText={false} className="w-5 h-5" />
              <span className="text-xs font-extrabold tracking-wider uppercase text-[#283970]">
                {profile.companyName}
              </span>
              <span className="text-[11px] text-slate-400">
                • Apresentação Consultiva
              </span>
            </div>
          </div>

          {/* Center: Step Navigation Pills */}
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
                      const el = document.getElementById(`section-${s.id}`);
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

          {/* Right: View Mode & Fullscreen */}
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

      {/* Main Interactive Presentation Body */}
      <main className="presentation-content flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-10 space-y-16">
        {/* =====================================================================
            SLIDE 1: A DOMUS & NOSSA MISSÃO (Págs. 1 a 3 do PDF Institucional)
           ===================================================================== */}
        {shouldShowSection("missao") && (
          <section
            id="section-missao"
            className="bg-[#060b1e] text-white rounded-3xl border border-[#1e2f63] shadow-xl p-8 sm:p-12"
          >
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#101c42] border border-[#283970] flex items-center justify-center mb-5">
                <DomusLogo variant="white" showText={false} className="w-9 h-9" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-4">
                DOMUS • ÉTICA, TRANSPARÊNCIA E EDUCAÇÃO FINANCEIRA
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Transformando o Mercado Imobiliário Brasileiro
              </h1>
              <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed">
                A <strong>Domus</strong> nasceu com um propósito claro: mudar a
                forma como o brasileiro conquista seu imóvel e constrói
                patrimônio, substituindo promessas vazias por{" "}
                <strong>
                  análise técnica, linguagem clara e planejamento real
                </strong>
                .
              </p>
            </div>

            {/* As Perguntas Que Todos Fazem vs. Nossa Resposta */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
              {/* Left: As Perguntas Que Todos Fazem */}
              <div className="rounded-2xl bg-[#0b1536] border border-[#1e2f63] p-6 sm:p-7">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Dúvidas Comuns do Mercado
                </span>
                <h3 className="text-xl font-bold text-white mt-1 mb-4">
                  As Perguntas Que Todos Fazem
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      q: "Qual a melhor taxa de juros?",
                      d: "A diferença real entre juros nominais, CET, TR, IPCA, tabela SAC e Price no custo final do imóvel.",
                    },
                    {
                      q: "Quanto preciso dar de entrada?",
                      d: "O impacto de descapitalizar reservas familiares versus estruturar o acesso gradual ao crédito.",
                    },
                    {
                      q: "Posso usar meu FGTS?",
                      d: "Regras de enquadramento, amortização extraordinária e uso inteligente dos recursos próprios.",
                    },
                    {
                      q: "Qual renda preciso comprovar?",
                      d: "Como o comprometimento de renda exigido pelos bancos afeta o orçamento e o padrão de vida.",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-[#060b1e]/80 border border-[#1a2957]"
                    >
                      <p className="text-xs sm:text-sm font-bold text-emerald-400">
                        • {item.q}
                      </p>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {item.d}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Nossa Resposta (Diagnóstico Domus) */}
              <div className="rounded-2xl bg-[#101f4c] border border-emerald-500/40 p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Diagnóstico Personalizado Domus
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1 mb-2">
                    Nossa Resposta: Não Existe Fórmula Pronta
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
                    Antes de falar em produto financeiro, analisamos as{" "}
                    <strong>4 variáveis essenciais</strong> da sua realidade:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {[
                      {
                        t: "1. Região de Interesse",
                        s: "Valorização, infraestrutura e dinâmica local",
                      },
                      {
                        t: "2. Padrão do Imóvel",
                        s: "Tipologia e ticket alinhados ao seu objetivo",
                      },
                      {
                        t: "3. Orçamento Disponível",
                        s: "Capacidade mensal sem comprometer a família",
                      },
                      {
                        t: "4. Custo de Vida",
                        s: "Preservação do padrão de vida e reserva de segurança",
                      },
                    ].map((v, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#060b1e]/90 border border-[#243875]"
                      >
                        <p className="text-xs font-bold text-white">{v.t}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {v.s}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tríade do Investidor */}
                <div className="p-4 rounded-xl bg-[#060b1e] border border-emerald-500/30">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block mb-2">
                    E para quem busca investir em imóveis:
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-[#0b1536]">
                      <span className="text-xs font-extrabold text-white block">
                        Liquidez
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Velocidade de saída
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0b1536]">
                      <span className="text-xs font-extrabold text-emerald-400 block">
                        Rentabilidade
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Retorno real
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0b1536]">
                      <span className="text-xs font-extrabold text-white block">
                        Segurança
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Proteção patrimonial
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            SLIDE 2: O MITO DA SIMPLICIDADE VS. REALIDADE (Págs. 4 e 5 do PDF)
           ===================================================================== */}
        {shouldShowSection("mito-realidade") && (
          <section
            id="section-mito-realidade"
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12"
          >
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-slate-100 text-[#283970] border border-slate-200 mb-3">
                Por Que Tanta Gente Se Frustra?
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                O Mito da Simplicidade vs. A Realidade
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Comprar um imóvel parece simples na propaganda, mas sem educação
                financeira e planejamento técnico o sonho pode se tornar um peso
                no orçamento.
              </p>
            </div>

            {/* O Que Parece vs. O Que É */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  A Ilusão Comercial
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1 mb-3">
                  O Que Parece Ser
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 font-bold">•</span>
                    <span>
                      &ldquo;Basta escolher o imóvel, dar uma entrada e aprovar
                      o crédito no banco.&rdquo;
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 font-bold">•</span>
                    <span>
                      &ldquo;As parcelas cabem no bolso hoje, então caberão
                      pelos próximos 30 anos.&rdquo;
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 font-bold">•</span>
                    <span>
                      &ldquo;Qualquer consórcio ou financiamento funciona do
                      mesmo jeito.&rdquo;
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl bg-[#0b1536] text-white border border-[#1e2f63] p-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  O Cenário Técnico Real
                </span>
                <h3 className="text-lg font-extrabold text-white mt-1 mb-3">
                  O Que Realmente É
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Uma decisão de longo prazo impactada por indexadores (TR,
                      IPCA, INCC), Custo Efetivo Total (CET) e variações de
                      renda.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Exige preservação de reserva financeira e compatibilidade
                      real com o custo de vida familiar.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Requer acompanhamento especializado para não pagar 2 a 3
                      vezes o valor do bem em juros.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* A Realidade do Mercado em Números (ABECIP 2025) */}
            <div className="mt-8 rounded-2xl bg-slate-900 text-white p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                    A Realidade do Mercado em Números
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    Consequências da Falta de Planejamento Imobiliário no Brasil
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Fonte: ABECIP &amp; Indicadores Econômicos (2025)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="p-5 rounded-xl bg-slate-800/70 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-extrabold text-white">
                      116 mil+
                    </span>
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-xs font-bold text-amber-400 mt-1">
                    +25,1% em leilões de imóveis em 2025
                  </p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Imóveis retomados por instituições financeiras devido à
                    inadimplência de compradores que assumiram parcelas
                    incompatíveis com seu orçamento (ABECIP).
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-800/70 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-extrabold text-white">
                      1,2 Milhão
                    </span>
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-xs font-bold text-amber-400 mt-1">
                    Contratos renegociados ou refinanciados
                  </p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Famílias que precisaram alongar dívidas ou buscar
                    refinanciamento por não compreenderem a evolução do saldo
                    devedor no contrato inicial.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-800/70 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-extrabold text-white">
                      43%
                    </span>
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-xs font-bold text-amber-400 mt-1">
                    Aumento real no custo de vida
                  </p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Compressão da renda disponível das famílias brasileiras nos
                    últimos anos, tornando indispensável um planejamento com
                    margem de segurança.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            SLIDE 3: FATORES DE RISCO, CURITIBA & REALIDADE DA POPULAÇÃO (Págs. 6 e 7)
           ===================================================================== */}
        {shouldShowSection("fatores-curitiba") && (
          <section
            id="section-fatores-curitiba"
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12"
          >
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-slate-100 text-[#283970] border border-slate-200 mb-3">
                Cenário Econômico &amp; Regional
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                4 Fatores Que Agravam o Problema &amp; A Realidade da População
              </h2>
            </div>

            {/* 4 Fatores que Agravam o Problema (com destaque Curitiba +14,3%) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#283970]">
                  Fator 01
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Desvalorização da Moeda
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  A perda contínua do poder de compra faz com que o dinheiro
                  guardado sem estratégia compre cada vez menos metros quadrados
                  ao longo do tempo.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#283970]">
                  Fator 02
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Custo de Vida Elevado
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Despesas fixas crescentes reduzem a capacidade de poupança
                  espontânea e exigem parcelas planejadas que caibam com folga
                  no orçamento mensal.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b1536] text-white border border-emerald-500/40 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Fator 03 • Curitiba &amp; Região
                  </span>
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-base font-extrabold text-white mt-1">
                  Preços em Alta (+14,3% em 2025)
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Em <strong>Curitiba e Região</strong>, os imóveis valorizaram
                  em média <strong>14,3% em 2025</strong>, com destaque para
                  bairros como <strong>Cabral</strong> e{" "}
                  <strong>Água Verde</strong>. Quem espera para juntar sozinho
                  vê o imóvel subir mais rápido que a poupança.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#283970]">
                  Fator 04
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Imprevistos no Caminho
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Mudanças profissionais, familiares ou econômicas ao longo de
                  10 a 30 anos exigem contratos flexíveis e reservas preservadas.
                </p>
              </div>
            </div>

            {/* A Realidade da População (90% Desinformados | 53% Despreparados Datafolha | 93% Esperançosos) */}
            <div className="mt-10 rounded-2xl bg-slate-50 border border-slate-200 p-6 sm:p-8">
              <div className="text-center max-w-2xl mx-auto mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#283970]">
                  Retrato do Comprador Brasileiro
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  A Realidade da População Diante do Mercado Imobiliário
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                  <div className="w-20 h-20 rounded-full border-4 border-[#283970] flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-extrabold text-[#283970]">
                      90%
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Desinformados
                  </h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Não compreendem tecnicamente as cláusulas, indexadores e o
                    custo efetivo real dos contratos imobiliários que assinam.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                  <div className="w-20 h-20 rounded-full border-4 border-amber-500 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-extrabold text-slate-900">
                      53%
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Despreparados (Datafolha)
                  </h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Mais da metade dos brasileiros não possui planejamento
                    financeiro estruturado de longo prazo para grandes
                    aquisições.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-emerald-500/50 p-6 text-center">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-extrabold text-emerald-700">
                      93%
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    Esperançosos
                  </h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Mantêm o sonho vivo de conquistar a casa própria ou
                    construir patrimônio sólido em imóveis com segurança.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            SLIDE 4: NOSSA ABORDAGEM & METODOLOGIA DOMUS (Págs. 8 e 9 do PDF)
           ===================================================================== */}
        {shouldShowSection("abordagem") && (
          <section
            id="section-abordagem"
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12"
          >
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-slate-100 text-[#283970] border border-slate-200 mb-3">
                O Papel da Domus
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                Nossa Abordagem em 4 Pilares
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Unimos rigor técnico e atendimento humano para que você tome a
                melhor decisão patrimonial com total clareza.
              </p>
            </div>

            {/* 4 Pilares da Abordagem Domus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
              {[
                {
                  num: "01",
                  title: "Entender a Complexidade",
                  desc: "Analisamos a fundo taxas, indexadores, regras de grupos, lances e cenários macroeconômicos por você.",
                },
                {
                  num: "02",
                  title: "Traduzir em Linguagem Clara",
                  desc: "Eliminamos o 'economês' e as letras miúdas para que você enxergue exatamente cada centavo investido.",
                },
                {
                  num: "03",
                  title: "Educar com Propósito",
                  desc: "Compartilhamos conhecimento real para que sua decisão seja consciente, segura e alinhada à sua família.",
                },
                {
                  num: "04",
                  title: "Criar Soluções Reais",
                  desc: "Desenhamos estratégias sob medida — seja para o primeiro imóvel ou para multiplicação patrimonial.",
                },
              ].map((p) => (
                <div
                  key={p.num}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#283970] transition"
                >
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#283970] text-white text-xs font-extrabold mb-4">
                    {p.num}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Interactive 3-Step Execution Stepper */}
            <div className="max-w-3xl mx-auto mt-12">
              <div className="text-center mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Jornada Operacional Domus
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Como Conduzimos Seu Planejamento na Prática
                </h3>
              </div>

              <div className="relative flex items-center justify-between">
                <div className="absolute left-12 right-12 top-6 h-0.5 bg-slate-200 -z-0" />

                {[
                  { id: 1 as const, label: "1. Crédito & Plano", icon: Wallet },
                  { id: 2 as const, label: "2. Curadoria do Ativo", icon: Home },
                  {
                    id: 3 as const,
                    label: "3. Rentabilização",
                    icon: Percent,
                  },
                ].map((phase) => {
                  const Icon = phase.icon;
                  const active = selectedWorkPhase === phase.id;
                  return (
                    <button
                      key={phase.id}
                      type="button"
                      onClick={() => setSelectedWorkPhase(phase.id)}
                      className="relative z-10 flex flex-col items-center group focus:outline-none"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 shadow-xs ${
                          active
                            ? "bg-[#283970] border-[#283970] text-white scale-110 shadow-md"
                            : "bg-white border-slate-300 text-slate-500 hover:border-[#283970]"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`mt-2.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                          active
                            ? "bg-[#283970] text-white shadow-xs"
                            : "text-slate-600 group-hover:text-slate-900"
                        }`}
                      >
                        {phase.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Phase Detail Box */}
            <div className="max-w-2xl mx-auto mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 text-left">
              <div className="text-center mb-6">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-[#283970]/10 text-[#283970]">
                  {currentPhaseData.badge}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-3">
                  {currentPhaseData.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
                  {currentPhaseData.subtitle}
                </p>
              </div>

              <div className="space-y-2.5">
                {currentPhaseData.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#283970] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-800">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =====================================================================
            SLIDE 5: ANÁLISE COMPARATIVA DAS 3 VIAS DE AQUISIÇÃO
           ===================================================================== */}
        {shouldShowSection("comparativo") && (
          <section
            id="section-comparativo"
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12"
          >
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-slate-100 text-[#283970] border border-slate-200 mb-3">
                Educação Financeira &amp; Transparência
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                Análise Comparativa das 3 Vias de Aquisição
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Avalie de forma objetiva o impacto financeiro de cada modalidade
                no patrimônio da sua família:
              </p>
            </div>

            {/* 3 Comparison Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
              {/* 1. À Vista / Acumulação Isolada */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-200 text-slate-700">
                      Via 1 • Recursos Próprios
                    </span>
                    <Ban className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Descapitalização Imediata ou Longa Espera
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Dispor de 100% do valor à vista retira liquidez importante da
                    família. Já tentar poupar sozinho mês a mês compete contra a
                    valorização acelerada dos imóveis (+14,3% em Curitiba em
                    2025).
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">✕</span>
                      <span>
                        Exige 100% do capital líquido disponível na largada
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">✕</span>
                      <span>
                        Poupando R$ 4.000/mês, leva-se cerca de{" "}
                        <strong>13 anos</strong> para acumular o equivalente a
                        R$ 1 milhão
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">✕</span>
                      <span>
                        Custo de oportunidade elevado frente aos rendimentos
                        financeiros
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-semibold text-slate-600">
                  Impacto: Perda de liquidez ou perda de tempo
                </div>
              </div>

              {/* 2. Financiamento Bancário */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-200 text-slate-700">
                      Via 2 • Financiamento Tradicional
                    </span>
                    <Ban className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Custo Efetivo Elevado (CET) &amp; Entrada Alta
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Atende quem tem urgência imediata de mudança, mas cobra um
                    preço alto: juros compostos que podem multiplicar o custo
                    final do imóvel por 2,5x a 3x.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">✕</span>
                      <span>
                        Exige <strong>20% a 30% de entrada à vista</strong> (R$
                        200 mil a R$ 300 mil em um imóvel de R$ 1 milhão)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">✕</span>
                      <span>
                        Parcelas iniciais elevadas e exigência de comprovação de
                        renda formal ~3,3x superior à prestação
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">✕</span>
                      <span>
                        Risco de inadimplência caso o orçamento familiar sofra
                        imprevistos
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-semibold text-slate-600">
                  Impacto: Alto custo financeiro (Juros + CET)
                </div>
              </div>

              {/* 3. Planejamento via Consórcio Estratégico Domus */}
              <div
                role="button"
                tabIndex={0}
                aria-expanded={consorcioUnlocked}
                onClick={() => {
                  const nextState = !consorcioUnlocked;
                  setConsorcioUnlocked(nextState);
                  if (nextState) {
                    setTimeout(() => {
                      document
                        .getElementById("calc-tempo-acumulacao")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 50);
                  }
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setConsorcioUnlocked((prev) => !prev);
                  }
                }}
                className={`rounded-2xl border p-6 flex flex-col justify-between cursor-pointer transition ${
                  consorcioUnlocked
                    ? "border-[#283970] bg-slate-50 shadow-md"
                    : "border-slate-200 bg-slate-50 hover:border-[#283970]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-200 text-slate-700">
                      Via 3 • Planejamento Domus
                    </span>
                    <Award className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Acesso Planejado Sem Juros &amp; Com Segurança
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Para quem planeja com inteligência: você constrói ou amplia
                    patrimônio com parcelas compatíveis com seu orçamento, sem
                    juros bancários e sem descapitalizar sua família.
                  </p>
                  <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>Zero juros:</strong> apenas taxa de
                        administração transparente e diluída no prazo
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>Estratégias técnicas de contemplação:</strong>{" "}
                        seleção de grupos, lance fixo, lance embutido e uso do
                        FGTS
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>Autoquitação patrimonial:</strong> após a
                        aquisição, a locação do imóvel pode cobrir a própria
                        parcela
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-semibold text-slate-600">
                  Impacto: Eficiência, liquidez preservada e crescimento real
                </div>
              </div>
            </div>

            {/* Interactive Sub-Calculator: Tempo de Acumulação (Abre ao clicar no card de Consórcio) */}
            {consorcioUnlocked && (
              <div
                id="calc-tempo-acumulacao"
                className="mt-10 rounded-2xl bg-slate-50 border border-slate-200 p-6 sm:p-8"
              >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#283970] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Simulador de Tempo de Acumulação
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                    Quanto tempo leva para acumular o valor do imóvel poupando
                    isoladamente?
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Simule o tempo necessário considerando o diferencial entre
                    rendimento líquido e a valorização imobiliária:
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Valor do Imóvel (R$)
                    </label>
                    <input
                      type="number"
                      step={50000}
                      value={targetPropertyVal}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTargetPropertyVal(Number(e.target.value) || 0)
                      }
                      className="w-40 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Aporte Mensal (R$)
                    </label>
                    <input
                      type="number"
                      step={500}
                      value={monthlySavingVal}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setMonthlySavingVal(Number(e.target.value) || 0)
                      }
                      className="w-40 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <span className="text-xs text-slate-500">
                    Acumulando de forma isolada
                  </span>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">
                    ~{savingComparison.yearsToSave} anos
                  </p>
                  <span className="text-[11px] text-slate-500">
                    ({savingComparison.monthsToSave} meses de acumulação)
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-emerald-200">
                  <span className="text-xs text-slate-500">
                    Com contemplação planejada em 3 anos
                  </span>
                  <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                    Antecipa{" "}
                    {Math.max(0, +(savingComparison.yearsToSave - 3).toFixed(1))}{" "}
                    anos
                  </p>
                  <span className="text-[11px] text-slate-500">
                    O ativo passa a gerar renda ou moradia muito antes
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-emerald-200">
                  <span className="text-xs text-slate-500">
                    Com contemplação planejada em 5 anos
                  </span>
                  <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                    Antecipa{" "}
                    {Math.max(0, +(savingComparison.yearsToSave - 5).toFixed(1))}{" "}
                    anos
                  </p>
                  <span className="text-[11px] text-slate-500">
                    Proteção contra a alta de preços dos imóveis
                  </span>
                </div>
              </div>
            </div>
            )}
          </section>
        )}

        {/* =====================================================================
            SLIDE 6: SIMULADOR INTERATIVO DE CICLOS PATRIMONIAIS DOMUS
           ===================================================================== */}
        {shouldShowSection("ciclos") && (
          <section
            id="section-ciclos"
            className="bg-white rounded-3xl border-2 border-[#283970] shadow-xl p-6 sm:p-12"
          >
            <div className="text-center max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-[#283970] border border-slate-200 mb-2">
                <Calculator className="w-3.5 h-3.5" />
                Planejamento Patrimonial Domus
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                Simulador de Ciclos Patrimoniais
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                Projete de forma conservadora e transparente a construção de
                patrimônio e renda passiva através de ciclos planejados.
              </p>
            </div>

            {/* Main Calculator Box */}
            <div className="max-w-4xl mx-auto mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
              {/* Two Big Inputs on Top */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
                <div className="text-center">
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Orçamento mensal destinado ao projeto
                  </label>
                  <div className="inline-flex items-center justify-center bg-white border-2 border-[#283970] rounded-xl px-4 py-2.5 shadow-2xs">
                    <span className="text-sm font-bold text-slate-400 mr-2">
                      R$
                    </span>
                    <input
                      type="number"
                      step={250}
                      min={500}
                      value={monthlyInvestmentInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setMonthlyInvestmentInput(
                          Math.max(0, Number(e.target.value) || 0)
                        )
                      }
                      className="w-36 text-center text-xl sm:text-2xl font-extrabold text-slate-900 outline-none bg-transparent"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-2.5 flex-wrap">
                    {[1500, 3000, 4500, 10000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setMonthlyInvestmentInput(val)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                          monthlyInvestmentInput === val
                            ? "bg-[#283970] text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {formatBRL(val)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Capital inicial / lance disponível (opcional)
                  </label>
                  <div className="inline-flex items-center justify-center bg-white border border-slate-300 focus-within:border-[#283970] rounded-xl px-4 py-2.5 shadow-2xs">
                    <span className="text-sm font-bold text-slate-400 mr-2">
                      R$
                    </span>
                    <input
                      type="number"
                      step={10000}
                      min={0}
                      value={initialEntryInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setInitialEntryInput(
                          Math.max(0, Number(e.target.value) || 0)
                        )
                      }
                      className="w-36 text-center text-xl sm:text-2xl font-extrabold text-slate-900 outline-none bg-transparent"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-2.5 flex-wrap">
                    {[0, 30000, 50000, 100000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setInitialEntryInput(val)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                          initialEntryInput === val
                            ? "bg-[#283970] text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {val === 0 ? "R$ 0 (Sem aporte inicial)" : formatBRL(val)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5 Summary KPIs Row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-6 items-center text-center">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="block text-[10px] font-bold uppercase text-slate-400">
                    1º Crédito / Parcela
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900">
                    {formatBRL(simulation.initialInstallment)}/mês
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Carta: {formatBRL(simulation.initialCredit)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="block text-[10px] font-bold uppercase text-slate-400">
                    Aporte Inicial
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900">
                    {formatBRL(simulation.initialEntry)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 border border-slate-300">
                  <label className="block text-[10px] font-bold uppercase text-[#283970] mb-1">
                    Horizonte de Ciclos
                  </label>
                  <select
                    value={numCyclesInput}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNumCyclesInput(Number(e.target.value))}
                    className="w-full bg-white border border-[#283970] rounded-lg px-2.5 py-1 text-xs sm:text-sm font-extrabold text-slate-900 outline-none cursor-pointer text-center"
                  >
                    <option value={1}>1 Ciclo</option>
                    <option value={2}>2 Ciclos</option>
                    <option value={3}>3 Ciclos</option>
                    <option value={4}>4 Ciclos</option>
                    <option value={5}>5 Ciclos</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="block text-[10px] font-bold uppercase text-emerald-800">
                    Patrimônio Projetado
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-emerald-900">
                    {formatBRL(simulation.totalPatrimony)}
                  </span>
                  <span className="block text-[10px] text-emerald-700 font-semibold">
                    Multiplicador {simulation.patrimonyMultiplier}x
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0b1536] text-white col-span-2 sm:col-span-1">
                  <span className="block text-[10px] font-bold uppercase text-emerald-400">
                    Renda Passiva Estimada
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-white">
                    {formatBRL(simulation.totalMonthlyPassiveIncome)}/mês
                  </span>
                  <span className="block text-[10px] text-slate-300">
                    Receita mensal consolidada
                  </span>
                </div>
              </div>
            </div>

            {/* Toggle Pills ("Tabela" vs "Cards") */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                type="button"
                onClick={() => setCyclesViewTab("tabela")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition ${
                  cyclesViewTab === "tabela"
                    ? "bg-[#283970] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Tabela Detalhada dos Ciclos
              </button>
              <button
                type="button"
                onClick={() => setCyclesViewTab("cards")}
                className={`px-5 py-2 rounded-full text-xs font-bold transition ${
                  cyclesViewTab === "cards"
                    ? "bg-[#283970] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Visão em Cards por Ciclo
              </button>
            </div>

            {/* Detailed Table View */}
            {cyclesViewTab === "tabela" ? (
              <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white">
                <div className="bg-[#0b1536] text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                  <span className="text-emerald-400 uppercase tracking-wider">
                    Evolução Patrimonial Ciclo a Ciclo ({numCyclesInput}{" "}
                    {numCyclesInput === 1 ? "Ciclo" : "Ciclos"})
                  </span>
                  <span className="text-slate-300">
                    Desembolso próprio estimado até a 1ª contemplação:{" "}
                    <strong className="text-white">
                      {formatBRL(simulation.totalInvestedOutOfPocket)}
                    </strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                        <th className="py-3.5 px-4">Ciclo</th>
                        <th className="py-3.5 px-4">Crédito Planejado</th>
                        <th className="py-3.5 px-4">Parcela Mensal</th>
                        <th className="py-3.5 px-4">Ativo Valorizado</th>
                        <th className="py-3.5 px-4">Receita de Locação</th>
                        <th className="py-3.5 px-4">Saldo Líquido / Mês</th>
                        <th className="py-3.5 px-4 text-right">
                          Patrimônio Acumulado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                      {simulation.cycles.map((c) => (
                        <tr
                          key={c.cycleNumber}
                          className="hover:bg-slate-50 transition"
                        >
                          <td className="py-4 px-4 font-extrabold text-slate-900">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#283970] text-white text-xs mr-2">
                              {c.cycleNumber}
                            </span>
                            Ciclo {c.cycleNumber}
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-900">
                            {formatBRL(c.creditAmount)}
                          </td>
                          <td className="py-4 px-4 text-slate-600">
                            {formatBRL(c.installment)}/mês
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-800">
                            {formatBRL(c.propertyValueAfterAppreciation)}
                          </td>
                          <td className="py-4 px-4 font-bold text-emerald-700">
                            {formatBRL(c.monthlyRent)}/mês
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                              +{formatBRL(c.netCashflowMonthly)}/mês
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-extrabold text-[#283970]">
                            {formatBRL(c.accumulatedPatrimony)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
                {simulation.cycles.map((c) => (
                  <div
                    key={c.cycleNumber}
                    className="rounded-2xl bg-white border border-slate-200 shadow-xs p-6 flex flex-col justify-between hover:border-[#283970] transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#283970] text-white">
                          Ciclo {c.cycleNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {c.PropertiesCount}{" "}
                          {c.PropertiesCount === 1
                            ? "Ativo Consolidado"
                            : "Ativos Consolidados"}
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">
                            Carta de Crédito:
                          </span>
                          <span className="font-bold text-slate-900">
                            {formatBRL(c.creditAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">
                            Parcela Mensal:
                          </span>
                          <span className="font-semibold text-slate-800">
                            {formatBRL(c.installment)}/mês
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">
                            Ativo Valorizado:
                          </span>
                          <span className="font-bold text-slate-900">
                            {formatBRL(c.propertyValueAfterAppreciation)}
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">
                            Receita de Locação:
                          </span>
                          <span className="font-bold text-emerald-700">
                            {formatBRL(c.monthlyRent)}/mês
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">
                        Patrimônio no Ciclo {c.cycleNumber}:
                      </span>
                      <span className="text-base font-extrabold text-[#283970]">
                        {formatBRL(c.accumulatedPatrimony)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Institutional Closing Banner (Pág. 9 do PDF Domus: "Seu sonho realizado é o nosso legado") */}
            <div className="mt-10 rounded-2xl bg-[#060b1e] border border-[#1e2f63] text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#101c42] border border-[#283970] flex items-center justify-center shrink-0">
                  <DomusLogo variant="white" showText={false} className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Compromisso Domus • Ética, Transparência e Educação
                  </span>
                  <h3 className="text-lg sm:text-2xl font-extrabold text-white mt-2">
                    &ldquo;Seu sonho realizado é o nosso legado.&rdquo;
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    Nosso próximo passo é estruturar o estudo técnico
                    personalizado para o seu perfil, comparando grupos e
                    condições reais com total clareza.
                  </p>
                </div>
              </div>

              <Link
                href="/apresentacoes/jornada-cliente"
                className="px-6 py-3.5 rounded-xl bg-[#283970] hover:bg-[#34498f] border border-[#455ea8] text-white font-bold text-xs uppercase tracking-wider shrink-0 shadow-lg transition flex items-center gap-2"
              >
                Iniciar Apresentação do Cliente (Sua Jornada Imobiliária)
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </Link>
            </div>
          </section>
        )}
      </main>

      {/* Bottom Slide Navigation Bar when in Slide-by-Slide mode */}
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
              Slide Anterior
            </button>

            <span className="text-xs font-bold text-slate-500">
              Slide {currentIndex + 1} de {steps.length}:{" "}
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
              Próximo Slide
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
