"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Phone, Users, Laptop, CalendarDays, Clock, Plus, X } from "lucide-react";
import { updateLeadStatusAction } from "@/app/actions/leads";
import { formatToDateTimeLocal } from "@/lib/dates";

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  status: string;
  data_agendamento: Date | null | string;
  tipo_agendamento: string | null;
  retornar_contato?: boolean;
  data_retorno?: Date | null | string;
  vendedor_id: string;
  vendedor: { nome: string };
}

interface Evento {
  id: string;
  leadId: string;
  nome: string;
  telefone: string;
  hora: number;
  minuto: number;
  tipo: "LIGAÇÃO" | "PRESENCIAL" | "ONLINE" | "RETORNO";
  vendedor: string;
  dataOriginal: Date;
}

const HORA_INICIO = 7;
const HORA_FIM = 21;
const HORAS = Array.from({ length: HORA_FIM - HORA_INICIO + 1 }, (_, i) => i + HORA_INICIO);
const DIAS_SEMANA_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function formatDateBR(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

const tipoConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  "LIGAÇÃO":   { color: "bg-purple-50 border-purple-400 text-purple-800", icon: <Phone className="w-3 h-3" />,  label: "Ligação" },
  "PRESENCIAL":{ color: "bg-amber-50 border-amber-400 text-amber-800",    icon: <Users className="w-3 h-3" />,  label: "Presencial" },
  "ONLINE":    { color: "bg-sky-50 border-sky-400 text-sky-800",           icon: <Laptop className="w-3 h-3" />, label: "Online" },
  "RETORNO":   { color: "bg-teal-50 border-teal-400 text-teal-800",        icon: <Phone className="w-3 h-3" />,  label: "Retorno" },
};

// ─── Mini Calendário ───────────────────────────────────────────────────────────
function MiniCalendario({
  semanaBase,
  onDiaClick,
  eventDates,
}: {
  semanaBase: Date;
  onDiaClick: (d: Date) => void;
  eventDates: Date[];
}) {
  const hoje = new Date();
  const [mesVis, setMesVis] = useState<Date>(() => {
    const d = new Date(semanaBase);
    d.setDate(1);
    return d;
  });

  const ano = mesVis.getFullYear();
  const mes = mesVis.getMonth();

  // Dias do mês
  const primeiroDia = new Date(ano, mes, 1).getDay(); // 0=Dom
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  // Offset para começar na segunda (0=Seg)
  const offset = primeiroDia === 0 ? 6 : primeiroDia - 1;
  const totalCelulas = offset + diasNoMes;
  const cells = Array.from({ length: Math.ceil(totalCelulas / 7) * 7 }, (_, i) => {
    const dayNum = i - offset + 1;
    return dayNum >= 1 && dayNum <= diasNoMes ? new Date(ano, mes, dayNum) : null;
  });

  // Dias da semana selecionada
  const diasDaSemanaAtual = Array.from({ length: 6 }, (_, i) => addDays(semanaBase, i));

  const mesAnterior = () => setMesVis(new Date(ano, mes - 1, 1));
  const proximoMes  = () => setMesVis(new Date(ano, mes + 1, 1));

  const temEvento = (d: Date) => eventDates.some(e => isSameDay(e, d));
  const isNaSemanaAtual = (d: Date) => diasDaSemanaAtual.some(s => isSameDay(s, d));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs select-none w-full">
      {/* Cabeçalho do mês */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={mesAnterior} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-barlow">
          {MESES_PT[mes]} {ano}
        </span>
        <button onClick={proximoMes} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Cabeçalho dos dias */}
      <div className="grid grid-cols-7 mb-1">
        {["S","T","Q","Q","S","S","D"].map((d, i) => (
          <div key={i} className="text-center text-xs font-bold text-slate-400 uppercase py-1">{d}</div>
        ))}
      </div>

      {/* Células dos dias */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isHoje = isSameDay(d, hoje);
          const isSemana = isNaSemanaAtual(d);
          const hasEv = temEvento(d);
          const isDomingo = d.getDay() === 0;
          return (
            <button
              key={i}
              onClick={() => onDiaClick(d)}
              className={`
                w-7 h-7 mx-auto text-xs font-bold rounded-full flex items-center justify-center relative transition-all
                ${isHoje ? "bg-brand-blue text-white" : ""}
                ${isSemana && !isHoje ? "bg-brand-blue/10 text-brand-blue" : ""}
                ${!isHoje && !isSemana ? "hover:bg-slate-100 text-slate-600" : ""}
                ${isDomingo && !isHoje && !isSemana ? "text-slate-300" : ""}
              `}
            >
              {d.getDate()}
              {hasEv && (
                <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isHoje ? "bg-white" : "bg-brand-teal"}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────
export default function AgendaClient({ leads, vendedores, user }: { leads: Lead[]; vendedores?: { id: string; nome: string }[]; user: { role: string; nome: string } }) {
  const router = useRouter();
  const [leadsList, setLeadsList] = useState<Lead[]>(leads);
  useEffect(() => {
    setLeadsList(leads);
  }, [leads]);

  const [semanaBase, setSemanaBase] = useState<Date>(() => startOfWeek(new Date()));
  const [vendedorFilter, setVendedorFilter] = useState("");
  const hoje = new Date();

  const [agendamentoModal, setAgendamentoModal] = useState<{
    leadId: string;
    date: string;
    tipo: "LIGAÇÃO" | "PRESENCIAL" | "ONLINE";
  } | null>(null);
  const [savingAgendamento, setSavingAgendamento] = useState(false);

  const diasDaSemana = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => addDays(semanaBase, i)),
    [semanaBase]
  );

  // Montar todos os eventos
  const eventos = useMemo((): Evento[] => {
    const result: Evento[] = [];
    const filteredLeads = vendedorFilter ? leadsList.filter(l => l.vendedor_id === vendedorFilter) : leadsList;

    for (const lead of filteredLeads) {
      if (lead.data_agendamento && lead.status === "Agendado") {
        const d = new Date(lead.data_agendamento as string);
        result.push({ id: `ag-${lead.id}`, leadId: lead.id, nome: lead.nome, telefone: lead.telefone, hora: d.getHours(), minuto: d.getMinutes(), tipo: (lead.tipo_agendamento as any) || "PRESENCIAL", vendedor: lead.vendedor.nome, dataOriginal: d });
      }
      if (lead.retornar_contato && lead.data_retorno) {
        const d = new Date(lead.data_retorno as string);
        result.push({ id: `ret-${lead.id}`, leadId: lead.id, nome: lead.nome, telefone: lead.telefone, hora: d.getHours(), minuto: d.getMinutes(), tipo: "RETORNO", vendedor: lead.vendedor.nome, dataOriginal: d });
      }
    }
    return result;
  }, [leadsList, vendedorFilter]);

  const eventDates = useMemo(() => eventos.map(e => e.dataOriginal), [eventos]);

  const getEventosDoDiaHora = (dia: Date, hora: number): Evento[] =>
    eventos.filter(ev => isSameDay(ev.dataOriginal, dia) && ev.hora === hora);

  const eventosDaSemana = useMemo(() =>
    eventos.filter(ev => diasDaSemana.some(d => isSameDay(ev.dataOriginal, d))),
    [eventos, diasDaSemana]
  );

  const countTipo = (tipo: string) => eventosDaSemana.filter(e => e.tipo === tipo).length;

  const irParaHoje = () => setSemanaBase(startOfWeek(new Date()));
  const semanaAnterior = () => setSemanaBase(prev => addDays(prev, -7));
  const proximaSemana = () => setSemanaBase(prev => addDays(prev, 7));
  const handleDiaClick = (d: Date) => setSemanaBase(startOfWeek(d));

  const handleSlotClick = (dia: Date, hora: number) => {
    const d = new Date(dia);
    d.setHours(hora, 0, 0, 0);
    setAgendamentoModal({
      leadId: leadsList[0]?.id || "",
      date: formatToDateTimeLocal(d),
      tipo: "PRESENCIAL",
    });
  };

  const handleConfirmAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agendamentoModal?.leadId || !agendamentoModal?.date) return;
    setSavingAgendamento(true);
    try {
      const dateObj = new Date(agendamentoModal.date);
      const result = await updateLeadStatusAction(
        agendamentoModal.leadId,
        "Agendado",
        dateObj,
        agendamentoModal.tipo
      );
      if (result.success) {
        setLeadsList((prev) =>
          prev.map((l) =>
            l.id === agendamentoModal.leadId
              ? {
                  ...l,
                  status: "Agendado",
                  data_agendamento: dateObj,
                  tipo_agendamento: agendamentoModal.tipo,
                }
              : l
          )
        );
        setAgendamentoModal(null);
        router.refresh();
      } else {
        alert(result.error || "Erro ao agendar.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar agendamento.");
    } finally {
      setSavingAgendamento(false);
    }
  };

  const ultimoDia = diasDaSemana[diasDaSemana.length - 1];
  const rangeLabel = `${formatDateBR(diasDaSemana[0])} – ${formatDateBR(ultimoDia)}/${ultimoDia.getFullYear()}`;

  return (
    <div className="p-4 md:p-6 max-w-full space-y-4 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-blue tracking-wide uppercase font-barlow flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-brand-teal" />
            Agenda
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Visualize e gerencie seus agendamentos da semana.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {vendedores && vendedores.length > 0 && (
            <select
              value={vendedorFilter}
              onChange={(e) => setVendedorFilter(e.target.value)}
              className="pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-xs font-bold outline-none cursor-pointer shadow-xs transition-all w-full sm:w-auto min-w-44"
            >
              <option value="">Todos os Membros</option>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>{v.nome}</option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => {
              const now = new Date();
              now.setHours(now.getHours() + 1, 0, 0, 0);
              setAgendamentoModal({
                leadId: leadsList[0]?.id || "",
                date: formatToDateTimeLocal(now),
                tipo: "PRESENCIAL",
              });
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-xs font-bold font-barlow uppercase tracking-wider shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Esta Semana", value: eventosDaSemana.length, color: "text-brand-blue", bg: "bg-brand-blue/10", icon: <CalendarDays className="w-5 h-5 text-brand-blue" /> },
          { label: "Ligações",    value: countTipo("LIGAÇÃO"),   color: "text-purple-700", bg: "bg-purple-50",     icon: <Phone className="w-5 h-5 text-purple-600" /> },
          { label: "Presenciais", value: countTipo("PRESENCIAL"),color: "text-amber-700",  bg: "bg-amber-50",      icon: <Users className="w-5 h-5 text-amber-600" /> },
          { label: "Retornos",    value: countTipo("RETORNO"),   color: "text-teal-700",   bg: "bg-teal-50",       icon: <Clock className="w-5 h-5 text-teal-600" /> },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
            <div>
              <p className={`text-2xl font-black font-barlow ${color}`}>{value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Layout em 2 colunas: mini calendário + grade */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">

        {/* ── Coluna lateral: Mini Calendário ── */}
        <div className="w-full lg:w-56 shrink-0 space-y-3 lg:sticky lg:top-4">
          <MiniCalendario
            semanaBase={semanaBase}
            onDiaClick={handleDiaClick}
            eventDates={eventDates}
          />

          {/* Legenda */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">Legenda</p>
            {Object.entries(tipoConfig).map(([key, cfg]) => (
              <span key={key} className="flex items-center gap-2 text-xs text-slate-600">
                <span className={`w-3 h-3 rounded border-l-2 shrink-0 ${cfg.color}`} />
                {cfg.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Coluna principal: Grade + Navegação ── */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Navegação de semana */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xs">
            <button onClick={semanaAnterior} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-800">{rangeLabel}</span>
              <button onClick={irParaHoje} className="px-3 py-1 bg-brand-blue text-white text-xs font-bold rounded-lg hover:bg-brand-blue/90 transition-colors font-barlow uppercase tracking-wider">
                Hoje
              </button>
            </div>
            <button onClick={proximaSemana} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Grade Semanal */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <div style={{ minWidth: "var(--layout-agenda-min-width)" }}>
                {/* Header dos dias */}
                <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: "var(--layout-agenda-time-column) repeat(6, 1fr)" }}>
                  <div className="py-3 px-2 border-r border-slate-100" />
                  {diasDaSemana.map((dia, i) => {
                    const isHoje = isSameDay(dia, hoje);
                    return (
                      <div key={i} className={`py-3 px-2 text-center border-r border-slate-100 last:border-r-0 ${isHoje ? "bg-brand-blue/5" : ""}`}>
                        <p className={`text-xs font-bold uppercase tracking-wider ${isHoje ? "text-brand-blue" : "text-slate-400"}`}>
                          {DIAS_SEMANA_CURTO[dia.getDay()]}
                        </p>
                        <p className={`text-lg font-black font-barlow mt-0.5 ${isHoje ? "text-brand-blue" : "text-slate-700"}`}>
                          {dia.getDate().toString().padStart(2, "0")}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Linhas de horário */}
                <div>
                  {HORAS.map((hora) => (
                    <div key={hora} className="grid border-b border-slate-100 last:border-b-0" style={{ gridTemplateColumns: "var(--layout-agenda-time-column) repeat(6, 1fr)", minHeight: "var(--layout-agenda-row-height)" }}>
                      <div className="py-2 px-2 border-r border-slate-100 flex items-start justify-end">
                        <span className="text-xs font-bold text-slate-400 tabular-nums">{hora.toString().padStart(2,"0")}:00</span>
                      </div>
                      {diasDaSemana.map((dia, di) => {
                        const isHoje = isSameDay(dia, hoje);
                        const evs = getEventosDoDiaHora(dia, hora);
                        return (
                          <div
                            key={di}
                            onClick={() => handleSlotClick(dia, hora)}
                            className={`p-1 border-r border-slate-100 last:border-r-0 flex flex-col gap-1 transition-colors hover:bg-slate-50/80 cursor-pointer ${isHoje ? "bg-brand-blue/[0.02]" : ""}`}
                            title={`Clique para agendar em ${dia.getDate().toString().padStart(2, "0")}/${(dia.getMonth() + 1).toString().padStart(2, "0")} às ${hora.toString().padStart(2, "0")}:00`}
                          >
                            {evs.map((ev) => {
                              const cfg = tipoConfig[ev.tipo] || tipoConfig["PRESENCIAL"];
                              return (
                                <Link
                                  key={ev.id}
                                  href={`/dashboard/leads/${ev.leadId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`flex flex-col gap-0.5 px-2 py-1.5 rounded-lg border-l-2 text-xs leading-tight hover:opacity-80 transition-opacity ${cfg.color}`}
                                  title={`${ev.nome} — ${ev.hora.toString().padStart(2,"0")}:${ev.minuto.toString().padStart(2,"0")}`}
                                >
                                  <span className="font-bold truncate">{ev.nome.split(" ")[0]}</span>
                                  <span className="flex items-center gap-0.5 opacity-70">
                                    {cfg.icon}
                                    <span>{ev.hora.toString().padStart(2,"0")}:{ev.minuto.toString().padStart(2,"0")}</span>
                                  </span>
                                  {(user.role === "ADM" || user.role === "GESTOR") && (
                                    <span className="opacity-60 truncate">{ev.vendedor.split(" ")[0]}</span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Novo Agendamento na Agenda */}
      {agendamentoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40  p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-brand-teal flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800 font-barlow uppercase tracking-wider">Novo Agendamento</h3>
                  <p className="text-slate-500 text-xs">Defina o lead e o horário do compromisso.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAgendamentoModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAgendamento} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Selecionar Lead</label>
                <select
                  required
                  value={agendamentoModal.leadId}
                  onChange={(e) => setAgendamentoModal({ ...agendamentoModal, leadId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="">Selecione um lead...</option>
                  {leadsList.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nome} ({l.telefone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Tipo do Agendamento</label>
                <select
                  value={agendamentoModal.tipo}
                  onChange={(e) => setAgendamentoModal({ ...agendamentoModal, tipo: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="LIGAÇÃO">Lembrete de Ligação </option>
                  <option value="PRESENCIAL">Reunião Presencial / Visita </option>
                  <option value="ONLINE">Reunião Online </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Data e Hora</label>
                <input
                  type="datetime-local"
                  required
                  value={agendamentoModal.date}
                  onChange={(e) => setAgendamentoModal({ ...agendamentoModal, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAgendamentoModal(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider font-barlow transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingAgendamento || !agendamentoModal.leadId || !agendamentoModal.date}
                  className="flex-1 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-barlow transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {savingAgendamento ? "Salvando..." : "Agendar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
