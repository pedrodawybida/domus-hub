"use client";

import { ClipboardCheck, FolderOpen, Eye } from "lucide-react";
import Link from "next/link";

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  tipo_consorcio: string;
  valor_desejado: number;
  status: string;
  vendedor: { nome: string };
}

interface ContratosClientProps {
  leads: Lead[];
  user: { id: string; nome: string; role: string };
}

export default function ContratosClient({ leads, user }: ContratosClientProps) {
  const closedLeads = leads.filter((l) => l.status === "Fechado");

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-650 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-brand-blue font-barlow tracking-wide uppercase">Contratos Concluídos e Signed Deals</h3>
              <p className="text-slate-500 text-xs mt-0.5">Controle de negócios convertidos da Domus Consórcios.</p>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs font-black rounded-full font-barlow tracking-wider uppercase">
            Fechamentos
          </span>
        </div>

        {closedLeads.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200/80 p-16 text-center text-slate-400 rounded-3xl">
            <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="font-black text-slate-750 text-base">Nenhum contrato fechado. Os contratos ganhos aparecerão nesta lista.</p>
            <p className="text-xs mt-1 text-slate-550">Atualize para Fechado o status de um lead com ficha cadastrada.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/85 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50 font-barlow">
                  <th className="p-4 pl-6">Consorciado / Titular</th>
                  <th className="p-4">Tipo Consórcio</th>
                  <th className="p-4">Volume Desejado</th>
                  <th className="p-4">Vendedor Atribuído</th>
                  <th className="p-4 pr-6 text-right">KYC / Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {closedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors text-slate-700">
                    <td className="p-4 pl-6 font-bold text-slate-800 text-sm">
                      <div>
                        <p>{lead.nome}</p>
                        <p className="text-xs text-slate-400 mt-1 font-semibold"> {lead.telefone}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-slate-600">{lead.tipo_consorcio}</td>
                    <td className="p-4 text-sm font-bold text-brand-blue">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(lead.valor_desejado)}
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-500">{lead.vendedor.nome}</td>
                    <td className="p-4 text-right pr-6">
                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-50 hover:bg-brand-blue/10 border border-slate-200 text-slate-550 hover:text-brand-blue rounded-lg text-xs font-bold transition-all font-barlow uppercase"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Assinatura</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
