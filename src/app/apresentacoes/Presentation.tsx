"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen, FileCheck, MessageSquareQuote, ShieldAlert, X } from "lucide-react";
import { DomusLogo } from "@/components/DomusLogo";
import brand from "../hub.module.css";
import styles from "./central.module.css";

const presentations = [
  { file: "Sobre_nos_Domus", title: "Sobre a Domus", detail: "Planejamento imobiliário e formas de aquisição." },
  { file: "Domus_Investimentos", title: "Jornada imobiliária", detail: "Estratégias de investimento e etapas do atendimento." },
  { file: "Curitiba_RMC_Domus", title: "Curitiba e região metropolitana", detail: "Linha do tempo do mercado imobiliário regional." },
];

export default function CentralApresentacoesPage() {
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [activeScriptTab, setActiveScriptTab] = useState<"etapas" | "qualificacao" | "objecoes" | "fechamento">("etapas");

  return (
    <div className={brand.page}>
      <header className={brand.header}>
        <div className={brand.signature}><DomusLogo variant="navy" className="h-11 w-11" />Domus Hub</div>
        <Link href="/" className={styles.back}><ArrowLeft size={16} /> Voltar ao Hub</Link>
      </header>
      <main className={brand.main}>
        <section className={`${brand.cover} ${styles.cover}`}>
          <div className={brand.art} aria-hidden="true" />
          <div className={brand.intro}><h1>Central de<br />apresentações</h1></div>
        </section>
        <div className={styles.columns}>
          <section aria-labelledby="decks">
            <h2 className={styles.heading} id="decks">Apresentações</h2>
            {presentations.map(({file, title, detail}) => (
              <a className={styles.row} key={file} href={`/slides/${file}.html`}>
                <div><h3>{title}</h3><p>{detail}</p></div><ArrowUpRight size={20} />
              </a>
            ))}
          </section>
          <section className={styles.tools} aria-labelledby="tools">
            <h2 className={styles.heading} id="tools">Ferramentas de reunião</h2>
            <a className={styles.row} href="/slides/Ficha.html">
              <div><h3>Domus Ficha</h3><p>Registre o perfil e as preferências do cliente.</p></div><ArrowUpRight size={18} />
            </a>
            <a className={styles.row} href="/slides/Simulador.html">
              <div><h3>Simulador de Financiamento &amp; Crédito</h3><p>Compare parcelas SAC e PRICE e simule cenários de crédito.</p></div><ArrowUpRight size={18} />
            </a>
            <button type="button" className={styles.row} onClick={() => setShowScriptModal(true)}>
              <div><h3>Guia de reunião</h3><p>Consulte o roteiro de diagnóstico e qualificação.</p></div><BookOpen size={18} />
            </button>
          </section>
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
                aria-label="Fechar guia"
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
