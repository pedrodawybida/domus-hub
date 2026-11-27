"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  Handshake,
  Search,
  Target,
  FileText,
  KeyRound,
} from "lucide-react";
import { useConsultantProfile } from "@/lib/session-store";
import { formatBRL } from "@/lib/cycles-calculator";
import { DomusLogo } from "@/components/DomusLogo";
import { JourneyStaircase } from "@/components/JourneyStaircase";
import { ScenarioComparisonGraphic } from "@/components/ScenarioComparisonGraphic";

type JornadaStepId =
  | "escada"
  | "capa"
  | "mercado"
  | "passos"
  | "opcoes"
  | "estrategia"
  | "cotas";

interface IBGERegionRecord {
  code: string;
  level: "municipality" | "neighborhood";
  name: string;
  municipalityCode: string;
  municipality: string;
  stateCode: string;
  state: string;
  region: string;
  areaKm2: number | null;
  population: number | null;
  populationDensityPerKm2: number | null;
  totalHousingUnits: number | null;
  privateHousingUnits: number | null;
  collectiveHousingUnits: number | null;
  averageResidentsPerOccupiedPrivateUnit: number | null;
  occupiedPrivateHousingUnits: number | null;
  occasionalUseHousingUnits: number | null;
  vacantPrivateHousingUnits: number | null;
  referenceYear: number;
}

interface MarketRecord {
  municipio: string;
  nome: string;
  periodo: string;
  preco: number | null;
  variacao12m: number | null;
  status: string;
  metodo: string;
  confianca: string;
}

const formatCensusValue = (value: number | null | undefined, decimals = 0) =>
  value == null
    ? "—"
    : new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);

const PREZI_STEPS = [
  {
    id: 1,
    icon: Handshake,
    title: "Entendimento",
    desc: "Recebemos você para alinhar suas expectativas e iniciar o mapeamento dos seus desejos.",
    extra:
      "Avaliamos Região de Interesse, Padrão Desejado, Orçamento Mensal e Custo de Vida sem comprometer sua tranquilidade.",
  },
  {
    id: 2,
    icon: Search,
    title: "Imóvel ideal",
    desc: "Utilizamos filtros avançados e nossa rede de parcerias para apresentar opções que atendem seu perfil.",
    extra:
      "Busca inteligente com IA simultânea em 15 portais imobiliários, além de oportunidades de leilão e retomados.",
  },
  {
    id: 3,
    icon: Target,
    title: "Estratégia",
    desc: "Analisamos as melhores opções de aquisição: financiamento ou Crédito imobiliário.",
    extra:
      "Comparativo matemático imparcial entre Financiamento Bancário (SAC/Price) e Carta de Crédito Estruturada Domus.",
  },
  {
    id: 4,
    icon: FileText,
    title: "Formalização",
    desc: "Preparamos a documentação e esclarecemos todas as etapas do processo de compra.",
    extra:
      "Segurança jurídica, auditoria documental completa e acompanhamento junto às instituições fiscalizadas pelo Banco Central.",
  },
  {
    id: 5,
    icon: KeyRound,
    title: "Conquista",
    desc: "Após a aprovação do valor, negociamos e finalizamos a aquisição do seu novo imóvel.",
    extra:
      "Poder de compra à vista para negociar descontos reais na entrega das chaves ou rentabilizar o patrimônio.",
  },
];

const JOURNEY_STEPS: { id: JornadaStepId; number: number; label: string }[] = [
  { id: "escada", number: 1, label: "Visão Geral" },
  { id: "capa", number: 2, label: "Planejamento do Cliente" },
  { id: "mercado", number: 3, label: "Análise da Região" },
  { id: "passos", number: 4, label: "As 5 Etapas & Ferramentas" },
  { id: "opcoes", number: 5, label: "Leilão & Retomados" },
  { id: "estrategia", number: 6, label: "Critérios & Propostas" },
  { id: "cotas", number: 7, label: "Crédito, Cotas & Próximo Passo" },
];

const OCCUPIED_QUOTAS = [
  101, 102, 103, 107, 108, 110, 111, 112, 115, 116, 118, 121, 122, 123, 126,
  128, 129, 131, 134, 135, 138, 139, 140,
];

export default function JornadaClientePage() {
  const { profile } = useConsultantProfile();

  const [viewMode, setViewMode] = useState<"all" | "slides">("all");
  const [activeStep, setActiveStep] = useState<JornadaStepId>("escada");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Personalização do Cliente (Tela 2 do Prezi + Tela 05 Capital)
  const [clientName, setClientName] = useState("CREONICE");
  const [citySearch, setCitySearch] = useState("Pinhais");
  const [citySuggestions, setCitySuggestions] = useState<IBGERegionRecord[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState<IBGERegionRecord | null>(null);
  const [neighborhoods, setNeighborhoods] = useState<IBGERegionRecord[]>([]);
  const [selectedNeighborhoodCode, setSelectedNeighborhoodCode] = useState("");
  const [regionLoading, setRegionLoading] = useState(false);
  const [regionError, setRegionError] = useState("");
  const [market, setMarket] = useState<MarketRecord | null>(null);
  const [neighborhoodMarket, setNeighborhoodMarket] = useState<Record<string, MarketRecord | null>>({});
  const [marketPriceOverride, setMarketPriceOverride] = useState("");
  const [marketVariationOverride, setMarketVariationOverride] = useState("");
  const [investmentRange, setInvestmentRange] = useState("");
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

  const steps = JOURNEY_STEPS;

  const regionData = selectedNeighborhoodCode
    ? neighborhoods.find((item) => item.code === selectedNeighborhoodCode) || selectedMunicipality
    : selectedMunicipality;

  const selectedMarket = selectedNeighborhoodCode
    ? neighborhoodMarket[selectedNeighborhoodCode] || market
    : market;

  useEffect(() => {
    const payload = {
      name: clientName,
      city: selectedMunicipality?.name || citySearch,
      neighborhood: neighborhoods.find((item) => item.code === selectedNeighborhoodCode)?.name || "",
      budgetMin: 0,
      budgetMax: 0,
      marketPrice: marketPriceOverride || selectedMarket?.preco || "",
      marketVariation: marketVariationOverride || selectedMarket?.variacao12m || "",
      investmentRange,
    };
    try {
      sessionStorage.setItem("domus-client-presentation", JSON.stringify(payload));
    } catch {
      // A apresentação continua funcionando quando o navegador bloqueia o armazenamento local.
    }
    window.postMessage({ type: "domus-ficha-client", payload }, window.location.origin);
  }, [citySearch, clientName, investmentRange, marketPriceOverride, marketVariationOverride, neighborhoods, selectedMarket, selectedMunicipality, selectedNeighborhoodCode]);

  const selectMunicipality = useCallback(async (municipality: IBGERegionRecord) => {
    setCitySearch(`${municipality.name}, ${municipality.state}`);
    setSelectedMunicipality(municipality);
    setSelectedNeighborhoodCode("");
    setNeighborhoods([]);
    setCitySuggestions([]);
    setRegionError("");
    setRegionLoading(true);
    try {
      const response = await fetch(`/api/regions?municipalityCode=${encodeURIComponent(municipality.code)}`);
      if (!response.ok) throw new Error("Não foi possível carregar os bairros desta cidade.");
      const data = await response.json();
      setSelectedMunicipality(data.municipality as IBGERegionRecord);
      setNeighborhoods(data.neighborhoods as IBGERegionRecord[]);
      setMarket(data.market as MarketRecord | null);
      setNeighborhoodMarket(data.neighborhoodMarket as Record<string, MarketRecord | null>);
    } catch (error) {
      setRegionError(error instanceof Error ? error.message : "Erro ao consultar a base local do IBGE.");
    } finally {
      setRegionLoading(false);
    }
  }, []);

  useEffect(() => {
    const query = citySearch.trim();
    const selectedLabel = selectedMunicipality
      ? `${selectedMunicipality.name}, ${selectedMunicipality.state}`
      : "";
    if (query.length < 2 || query === selectedLabel) {
      setCitySuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/regions?search=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        setCitySuggestions(data.municipalities as IBGERegionRecord[]);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setRegionError("Não foi possível pesquisar municípios na base mockada do IBGE.");
        }
      }
    }, 220);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [citySearch, selectedMunicipality]);

  useEffect(() => {
    let cancelled = false;
    async function loadDefaultMunicipality() {
      try {
        const response = await fetch("/api/regions?search=Pinhais");
        const data = await response.json();
        const pinhais = (data.municipalities as IBGERegionRecord[]).find(
          (item) => item.name === "Pinhais" && item.stateCode === "41",
        );
        if (!cancelled && pinhais) await selectMunicipality(pinhais);
      } catch {
        if (!cancelled) setRegionError("Não foi possível carregar a referência inicial do IBGE.");
      }
    }
    loadDefaultMunicipality();
    return () => {
      cancelled = true;
    };
  }, [selectMunicipality]);
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
      domusTotal,
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.defaultPrevented) return;
      if (viewMode !== "slides" || ["INPUT", "SELECT", "TEXTAREA"].includes(target?.tagName ?? "")) return;
      const isNext = event.key === "ArrowRight" || event.key === "PageDown";
      const isPrevious = event.key === "ArrowLeft" || event.key === "PageUp";
      if (!isNext && !isPrevious) return;
      event.preventDefault();
      const nextIndex = Math.max(0, Math.min(steps.length - 1, currentIndex + (isNext ? 1 : -1)));
      setActiveStep(steps[nextIndex].id);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, currentIndex, steps]);

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
      <main data-view-mode={viewMode} className="presentation-content flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-10 space-y-12">
        {shouldShowSection("escada") && (
          <section
            id="jsection-escada"
            className="journey-overview bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-12 relative overflow-hidden"
          >
            <div className="journey-overview__intro">
              <span className="journey-overview__eyebrow">Domus · Jornada do cliente</span>
              <h1>Um caminho claro, do plano à conquista.</h1>
              <p>Veja as etapas que vamos percorrer juntos para encontrar e adquirir o imóvel certo para você.</p>
            </div>
            <JourneyStaircase
              steps={PREZI_STEPS.map((step) => ({
                id: step.id,
                title: step.title,
                description: step.desc,
                detail: step.extra,
                icon: step.icon,
              }))}
              activeStep={activePreziStep}
              onStepChange={setActivePreziStep}
              onComplete={() => {
                setViewMode("slides");
                setActiveStep("capa");
              }}
              completeLabel="Começar apresentação"
            />
          </section>
        )}
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
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  Cidade de interesse · base IBGE
                </label>
                <div className="relative">
                  <input
                    type="search"
                    value={citySearch}
                    onChange={(event) => {
                      setCitySearch(event.target.value);
                      setCitySuggestions([]);
                      setSelectedMunicipality(null);
                      setNeighborhoods([]);
                      setSelectedNeighborhoodCode("");
                      setRegionError("");
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 outline-none"
                    placeholder="Digite cidade ou UF"
                    aria-label="Pesquisar cidade"
                    aria-expanded={citySuggestions.length > 0}
                  />
                  {citySuggestions.length > 0 && (
                    <ul className="absolute z-20 top-full mt-1 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                      {citySuggestions.map((municipality) => (
                        <li key={municipality.code}>
                          <button
                            type="button"
                            onClick={() => void selectMunicipality(municipality)}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-800 hover:bg-indigo-50"
                          >
                            {municipality.name} — {municipality.state}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-500" aria-live="polite">
                  {regionLoading ? "Carregando dados oficiais…" : regionError || "Pesquise e selecione um município."}
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Bairro · Censo 2022
                </label>
                <select
                  value={selectedNeighborhoodCode}
                  onChange={(event) => setSelectedNeighborhoodCode(event.target.value)}
                  disabled={!selectedMunicipality || neighborhoods.length === 0}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">{neighborhoods.length ? "Município inteiro" : "Sem dados por bairro"}</option>
                  {neighborhoods.map((neighborhood) => (
                    <option key={neighborhood.code} value={neighborhood.code}>
                      {neighborhood.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  {selectedMunicipality && !neighborhoods.length
                    ? "O IBGE não publicou agregados por bairro para este município; exibimos o total municipal."
                    : "Os bairros dependem da cobertura publicada pelo IBGE."}
                </p>
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

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Preço médio anunciado · edição manual
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={marketPriceOverride || (selectedMarket?.preco != null ? String(selectedMarket.preco) : "")}
                  onChange={(event) => setMarketPriceOverride(event.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 outline-none"
                  placeholder="Ex.: 11716"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Variação em 12 meses · edição manual
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={marketVariationOverride || (selectedMarket?.variacao12m != null ? String(selectedMarket.variacao12m) : "")}
                  onChange={(event) => setMarketVariationOverride(event.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 outline-none"
                  placeholder="Ex.: 8,5%"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Faixa de investimento · edição manual
                </label>
                <input
                  type="text"
                  value={investmentRange}
                  onChange={(event) => setInvestmentRange(event.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 outline-none"
                  placeholder="Ex.: R$ 400 mil a R$ 600 mil"
                />
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
                    Região: <strong>{regionData ? `${regionData.name}${regionData.level === "neighborhood" ? ` — ${regionData.municipality}` : ` — ${regionData.state}`}` : "selecione uma cidade"}</strong> • {clientGoal}
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
              Contexto demográfico · IBGE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0e1e78]">
              Retrato da região selecionada
            </h2>
            <p className="text-base sm:text-lg text-slate-700 mt-1.5">
              Censo Demográfico 2022 para{" "}
              <strong className="text-[#283970]">
                {regionData
                  ? `${regionData.name}${regionData.level === "neighborhood" ? ` — ${regionData.municipality}` : ` — ${regionData.state}`}`
                  : "selecione uma cidade acima"}
              </strong>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
              <div className="bg-[#f5f7fc] border border-indigo-100 rounded-2xl p-6">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-600">Preço médio anunciado</p>
                <p className="text-3xl font-bold text-[#283970] mt-2">
                  {selectedMarket?.preco != null ? `${formatBRL(selectedMarket.preco)} / m²` : "Indisponível"}
                </p>
                <p className="text-xs text-slate-600 mt-3">
                  {selectedMarket ? `${selectedMarket.status === "ESTIMADO" ? "Estimativa · " : "Observado · "}${selectedMarket.periodo}` : "Sem registro para a região selecionada"}
                </p>
              </div>
              <div className="bg-[#f5f7fc] border border-indigo-100 rounded-2xl p-6">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-600">Variação em 12 meses</p>
                <p className="text-3xl font-bold text-[#283970] mt-2">
                  {selectedMarket?.variacao12m != null ? `${selectedMarket.variacao12m.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%` : "Indisponível"}
                </p>
                <p className="text-xs text-slate-600 mt-3">Fonte: FipeZAP · confiança {selectedMarket?.confianca || "—"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
              {[
                {
                  label: "População residente",
                  value: formatCensusValue(regionData?.population),
                  description: `Pessoas residentes · Censo ${regionData?.referenceYear ?? 2022}`,
                },
                {
                  label: "Domicílios particulares ocupados",
                  value: formatCensusValue(regionData?.occupiedPrivateHousingUnits),
                  description: "Unidades domiciliares ocupadas",
                },
                {
                  label: "Densidade demográfica",
                  value:
                    regionData?.populationDensityPerKm2 == null
                      ? "—"
                      : `${formatCensusValue(regionData.populationDensityPerKm2, 1)} hab./km²`,
                  description: "Cálculo: população ÷ área territorial",
                },
                {
                  label: "Moradores por domicílio ocupado",
                  value: formatCensusValue(
                    regionData?.averageResidentsPerOccupiedPrivateUnit,
                    1,
                  ),
                  description: "Média em domicílios particulares ocupados",
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between min-h-[190px] shadow-xs"
                >
                  <div>
                    <div className="h-0.5 bg-slate-300 mb-5" />
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-600">
                      {metric.label}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 leading-snug mt-2">
                      {metric.value}
                    </p>
                  </div>
                  <p className="text-sm text-slate-700 mt-5">
                    {metric.description}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-slate-500">
              Fontes: <a className="underline" href="https://www.ibge.gov.br/estatisticas/sociais/trabalho/22827-censo-demografico-2022.html?edicao=41852&amp;t=resultados" target="_blank" rel="noreferrer">IBGE · Censo Demográfico 2022</a> e <a className="underline" href="https://www.fipe.org.br/pt-br/indices/fipezap/" target="_blank" rel="noreferrer">FipeZAP</a>. Valores estimados estão identificados na própria apresentação.
            </p>
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

            <JourneyStaircase
              steps={PREZI_STEPS.map((step) => ({
                id: step.id,
                title: step.title,
                description: step.desc,
                detail: step.extra,
                icon: step.icon,
              }))}
              activeStep={activePreziStep}
              onStepChange={setActivePreziStep}
            />

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

            <ScenarioComparisonGraphic
              bankTotal={calculations.bankTotal}
              domusTotal={calculations.domusTotal}
              savings={calculations.domusSaving}
              formatValue={formatBRL}
            />

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

