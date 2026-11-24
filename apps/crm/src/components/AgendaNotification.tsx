"use client";

import { useEffect, useState, useRef } from "react";
import { X, Phone, Laptop, Users } from "lucide-react";

interface LeadAgenda {
  id: string;
  nome: string;
  data_agendamento: Date | string | null;
  tipo_agendamento: string | null;
  retornar_contato?: boolean;
  data_retorno?: Date | string | null;
}

export default function AgendaNotification() {
  const [activeAlerts, setActiveAlerts] = useState<LeadAgenda[]>([]);
  const notifiedSet = useRef<Set<string>>(new Set());

  useEffect(() => {
    // We import getLeadsAction dynamically to avoid passing as prop and avoid cyclic dependency if needed, or just standard import.
    // Actually we can't import server actions directly in standard react useEffect without wrapping it.
    // We will just do a standard import at the top of the file.
    const fetchAndCheck = async () => {
      try {
        // We will import getLeadsAction at the top
        const { getLeadsAction } = await import("@/app/actions/leads");
        const leads = (await getLeadsAction()) as unknown as LeadAgenda[];
        
        if (!leads || leads.length === 0) return;
        
        const now = new Date();
        const newAlerts: LeadAgenda[] = [];

        leads.forEach(lead => {
          if (lead.data_agendamento && !notifiedSet.current.has(lead.id + "_agend")) {
            const dataAgendamento = new Date(lead.data_agendamento);
            const diffMs = dataAgendamento.getTime() - now.getTime();
            const diffMin = diffMs / (1000 * 60);

            if (diffMin > 0 && diffMin <= 5.5) {
              newAlerts.push({ ...lead, tipo_agendamento: lead.tipo_agendamento || "Presencial" });
              notifiedSet.current.add(lead.id + "_agend");
            }
          }

          if (lead.retornar_contato && lead.data_retorno && !notifiedSet.current.has(lead.id + "_retorno")) {
            const dataRetorno = new Date(lead.data_retorno);
            const diffMs = dataRetorno.getTime() - now.getTime();
            const diffMin = diffMs / (1000 * 60);

            if (diffMin > 0 && diffMin <= 5.5) {
              newAlerts.push({ ...lead, tipo_agendamento: "RETORNO_CONTATO" });
              notifiedSet.current.add(lead.id + "_retorno");
            }
          }
        });

        if (newAlerts.length > 0) {
          setActiveAlerts(prev => [...prev, ...newAlerts]);
          try {
            const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
            audio.volume = 0.5;
            audio.play().catch(() => {}); 
          } catch {}
        }
      } catch (error) {
        console.error("Erro no AgendaNotification:", error);
      }
    };

    // Executa a primeira vez
    fetchAndCheck();

    // Depois a cada 1 minuto
    const checkInterval = setInterval(fetchAndCheck, 60000);
    return () => clearInterval(checkInterval);
  }, []);

  const dismissAlert = (id: string) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (activeAlerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      {activeAlerts.map(alert => {
        const isLigacao = alert.tipo_agendamento === "LIGAÇÃO";
        const isOnline = alert.tipo_agendamento === "ONLINE";
        const isRetorno = alert.tipo_agendamento === "RETORNO_CONTATO";
        
        return (
          <div key={alert.id + alert.tipo_agendamento} className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 w-80 animate-slideUp flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isLigacao ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
              isOnline ? "bg-sky-50 text-sky-600 border border-sky-100" :
              isRetorno ? "bg-amber-50 text-amber-600 border border-amber-100" :
              "bg-emerald-50 text-emerald-600 border border-emerald-100"
            }`}>
              {isLigacao ? <Phone className="w-5 h-5" /> : isOnline ? <Laptop className="w-5 h-5" /> : isRetorno ? <Phone className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            </div>
            
            <div className="flex-1">
              <h4 className="font-bold text-sm text-slate-800">{isRetorno ? "Lembrete de Retorno!" : "Lembrete de Agenda!"}</h4>
              <p className="text-xs text-slate-500 mt-1">
                Faltam menos de 5 minutos para o seu {isRetorno ? "retorno agendado" : `compromisso (${alert.tipo_agendamento})`} com <strong className="text-slate-700">{alert.nome}</strong>.
              </p>
            </div>

            <button onClick={() => dismissAlert(alert.id)} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
