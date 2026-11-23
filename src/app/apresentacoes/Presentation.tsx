"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  TrendingUp,
  Award,
  CheckCircle2,
  ChevronRight,
  X,
  MessageSquareQuote,
  ShieldAlert,
  FileCheck,
  MapPin,
} from "lucide-react";
import { useConsultantProfile } from "@/lib/session-store";
import { DomusLogo } from "@/components/DomusLogo";

export default function CentralApresentacoesPage() {
  const { profile } = useConsultantProfile();
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [activeScriptTab, setActiveScriptTab] = useState<
    "etapas" | "qualificacao" | "objecoes" | "fechamento"
  >("etapas");

  return (
    <div className="presentations-central min-h-screen bg-[var(--ds-canvas)] text-slate-900 flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#283970] hover:text-[#1d2b57] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Hub Domus
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <DomusLogo variant="navy" showText={false} className="w-4 h-4" />
            <span className="font-extrabold text-[#283970] tracking-wider uppercase">
              {profile.companyName}
            </span>
            <span>•</span>
            <span>Consultor: {profile.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl w-full mx-auto px-6 py-10 flex-1 flex flex-col items-center">
        {/* Top Icon & Title */}
        <div className="w-14 h-14 rounded-2xl bg-[#283970] text-white flex items-center justify-center shadow-md mb-4">
          <DomusLogo variant="white" showText={false} className="w-7 h-7" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-2">
          DOMUS • CENTRAL DE APRESENTAÇÕES
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight text-center">
          Apresentações Consultivas
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 text-center max-w-xl">
          Estrutura minimalista, ética e orientada a dados reais de mercado para condução de reuniões de planejamento imobiliário.
        </p>

        {/* Guia de Diagnóstico & Metodologia Domus */}
        <div className="w-full mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#283970] text-white flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900">
                  Guia de Diagnóstico &amp; Metodologia Domus
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#283970] border border-slate-200">
                  Playbook Consultivo
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Roteiro estruturado: diagnóstico das 4 variáveis do cliente, análise de liquidez/rentabilidade/segurança e comparativo técnico das 3 vias de aquisição.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowScriptModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#283970] font-bold text-xs shrink-0 flex items-center gap-1.5 border border-slate-300 transition"
          >
            Abrir Guia de Reunião
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Main Presentation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-8">
          {/* Card 1: 1ª Reunião Domus */}
          <div className="bg-white rounded-2xl border-2 border-[#283970] shadow-lg p-6 flex flex-col justify-between relative">
            <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#283970] text-white shadow">
              Fase 1 • Ativo
            </span>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#283970] border border-slate-200 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                1ª Reunião • Diagnóstico Domus
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Apresentação institucional completa, realidade do mercado brasileiro e Simulador de Ciclos.
              </p>

              <ul className="text-left text-xs text-slate-600 space-y-2 w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Quem é a Domus &amp; Diagnóstico de Perfil</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>O Mito da Simplicidade &amp; Dados ABECIP 2025</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Mercado Curitiba (+14,3%: Cabral &amp; Água Verde)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>4 Pilares Domus &amp; Simulador de Ciclos (1 a 5)</span>
                </li>
              </ul>
            </div>

            <Link
              href="/apresentacoes/primeira-reuniao"
              className="w-full py-3 px-4 rounded-xl bg-[#283970] hover:bg-[#1e2c59] text-white font-bold text-xs uppercase tracking-wider text-center shadow-md transition flex items-center justify-center gap-2"
            >
              Iniciar Apresentação Domus
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: 2ª Apresentação (Jornada do Cliente Prezi + Capital) */}
          <div className="bg-white rounded-2xl border-2 border-[#283970] shadow-md p-6 flex flex-col justify-between relative">
            <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Etapa 2 • Focada no Cliente
            </span>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-[#283970]/10 text-[#283970] border border-[#283970]/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                2ª Apresentação • Sua Jornada Imobiliária
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Apresentação Prezi Domus completa integrada às ferramentas de fechamento da Capital.
              </p>

              <ul className="text-left text-xs text-slate-600 space-y-2 w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#283970] shrink-0" />
                  <span>Planejamento Patrimonial &amp; Análise de Mercado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#283970] shrink-0" />
                  <span>Simulador Bancário + IA em 15 Portais + Leilões</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#283970] shrink-0" />
                  <span>Os 5 Passos da Jornada Imobiliária (Prezi)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#283970] shrink-0" />
                  <span>Critérios BACEN, Proposta A vs B e Mapa de Cotas</span>
                </li>
              </ul>
            </div>

            <Link
              href="/apresentacoes/jornada-cliente"
              className="w-full py-3 px-4 rounded-xl bg-[#283970] hover:bg-[#1e2b58] text-white font-bold text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-2 shadow-sm"
            >
              Iniciar Jornada do Cliente
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Linha do tempo imobiliária de Curitiba e da RMC */}
          <div className="bg-white rounded-2xl border-2 border-[#283970] shadow-md p-6 flex flex-col justify-between relative">
            <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#283970] text-white">
              Apresentação 03 • Mercado
            </span>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-[#283970]/10 text-[#283970] border border-[#283970]/20 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Curitiba e RMC • Linha do Tempo Imobiliária
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Planejamento urbano, demografia e expansão metropolitana em uma apresentação visual interativa.
              </p>

              <ul className="text-left text-xs text-slate-600 space-y-2 w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-6">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#283970] shrink-0" /><span>Do plano urbano à metrópole policêntrica</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#283970] shrink-0" /><span>Cinco momentos históricos com zoom Prezi</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-[#283970] shrink-0" /><span>Dinâmicas de moradia e crédito na RMC</span></li>
              </ul>
            </div>

            <a
              href="/slides/Curitiba_RMC_Domus.html"
              className="w-full py-3 px-4 rounded-xl bg-[#283970] hover:bg-[#1e2c59] text-white font-bold text-xs uppercase tracking-wider text-center shadow-md transition flex items-center justify-center gap-2"
            >
              Iniciar Linha do Tempo <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Card 3: Alocação de Cotas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between relative">
            <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
              Fechamento &amp; Reserva
            </span>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-[#283970] border border-slate-200 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Alocação &amp; Mapa de Cotas
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Simulador de crédito sob medida e mapa interativo de disponibilidade de cotas.
              </p>

              <ul className="text-left text-xs text-slate-600 space-y-2 w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#283970] shrink-0" />
                  <span>Análise de grupos e probabilidades reais</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#283970] shrink-0" />
                  <span>Dimensionamento de crédito e parcelas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#283970] shrink-0" />
                  <span>Mapa de disponibilidade em tempo real</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#283970] shrink-0" />
                  <span>Formalização e reserva técnica da cota</span>
                </li>
              </ul>
            </div>

            <Link
              href="/apresentacoes/jornada-cliente"
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-2"
            >
              Abrir Simulador &amp; Mapa de Cotas
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Modal do Guia Consultivo Domus */}
      {showScriptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 my-8">
            {/* Modal Header */}
            <div className="bg-[#0b1536] text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#283970] border border-[#3d549e] text-white flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Guia Consultivo Domus • Ética, Clareza e Planejamento
                  </h2>
                  <p className="text-xs text-slate-300">
                    Estrutura de diagnóstico de perfil e educação financeira imobiliária
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowScriptModal(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 overflow-x-auto">
              {[
                { id: "etapas", label: "1. Diagnóstico Domus" },
                { id: "qualificacao", label: "2. Alinhamento Técnico" },
                { id: "objecoes", label: "3. Educação & Esclarecimentos" },
                { id: "fechamento", label: "4. Próximos Passos" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveScriptTab(t.id as typeof activeScriptTab)}
                  className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition ${
                    activeScriptTab === t.id
                      ? "border-[#283970] text-[#283970] bg-white"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-5 text-sm text-slate-700">
              {activeScriptTab === "etapas" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-1">
                      1. As Perguntas que Todos Fazem vs. A Resposta Domus
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      O cliente chega focado apenas em taxa de juros, entrada ou uso do FGTS. A Domus aprofunda para um diagnóstico real baseado em <strong>Região de interesse, Padrão do imóvel, Orçamento disponível e Custo de vida</strong> — e, para investidores, <strong>Liquidez, Rentabilidade e Segurança</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-1">
                      2. O Mito da Simplicidade (Dados ABECIP 2025)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Demonstre com fatos por que decisões sem planejamento geram frustração: mais de <strong>116 mil imóveis retomados</strong> em 2025 (+25,1% em leilões), <strong>1,2 milhão de refinanciamentos</strong> e <strong>43% de aumento real</strong> no custo de vida nos últimos anos.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-1">
                      3. Os 4 Pilares da Abordagem Domus
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>01. Entender a Complexidade:</strong> domínio técnico de juros, CET, TR, IPCA, SAC e Price.
                      <br />
                      <strong>02. Traduzir em Linguagem Clara:</strong> sem jargões ou letras miúdas.
                      <br />
                      <strong>03. Educar com Propósito:</strong> autonomia para o cliente decidir com segurança.
                      <br />
                      <strong>04. Criar Soluções Reais:</strong> estratégias personalizadas para moradia ou investimento.
                    </p>
                  </div>
                </div>
              )}

              {activeScriptTab === "qualificacao" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <MessageSquareQuote className="w-4 h-4 text-[#283970]" />
                      Perguntas de Diagnóstico Patrimonial
                    </h4>
                    <ol className="list-decimal list-inside text-xs space-y-2 text-slate-700">
                      <li>
                        <strong>Objetivo Central:</strong> O foco é conquista do imóvel próprio (moradia) ou construção de patrimônio e renda passiva?
                      </li>
                      <li>
                        <strong>Região e Padrão:</strong> Qual região (ex.: Curitiba — Cabral, Água Verde, etc.) e qual faixa de valor de imóvel atende seu projeto?
                      </li>
                      <li>
                        <strong>Orçamento Mensal Confortável:</strong> Qual aporte mensal respeita seu custo de vida atual sem comprometer sua reserva de liquidez?
                      </li>
                      <li>
                        <strong>Horizonte de Tempo e Capital Inicial:</strong> Existe capital disponível para entrada/lance ou o planejamento será 100% parcelado?
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {activeScriptTab === "objecoes" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-[#283970]" />
                      Comparativo Técnico: Guardar Sozinho vs. Financiamento vs. Planejamento
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Enquanto os preços dos imóveis em Curitiba e Região subiram em média <strong>14,3% em 2025</strong>, tentar acumular capital de forma isolada frequentemente perde poder de compra para a valorização imobiliária. Por outro lado, o financiamento tradicional sem planejamento pode comprometer a renda familiar e dobrar ou triplicar o custo final via CET. O planejamento estruturado equilibra custo efetivo reduzido e disciplina patrimonial.
                    </p>
                  </div>
                </div>
              )}

              {activeScriptTab === "fechamento" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-700" />
                      Preparação do Estudo Personalizado (2ª Reunião)
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Ao concluir o diagnóstico e a simulação de ciclos na 1ª reunião, alinhe os parâmetros exatos do cliente para apresentar na 2ª reunião o estudo comparativo de grupos, administradoras e viabilidade cadastral com total transparência.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Domus • Seu sonho realizado é o nosso legado.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowScriptModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Fechar
                </button>
                <Link
                  href="/apresentacoes/primeira-reuniao"
                  className="px-5 py-2 rounded-xl bg-[#283970] hover:bg-[#1e2c59] text-white text-xs font-bold transition"
                >
                  Ir para Apresentação Domus →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
