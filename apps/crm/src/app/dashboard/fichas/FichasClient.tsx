"use client";

import { FileText, FileSignature } from "lucide-react";
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
  documentacao?: any | null;
}

interface FichasClientProps {
  leads: Lead[];
  user: { id: string; nome: string; role: string };
}

export default function FichasClient({ leads, user }: FichasClientProps) {
  return (
    <div className="space-y-6 animate-fadeIn">

      <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-brand-teal flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-brand-blue font-barlow tracking-wide uppercase">Central de Fichas Cadastrais KYC</h3>
              <p className="text-slate-500 text-xs mt-0.5">Acompanhamento e preenchimento de propostas e assinaturas digitais na tela.</p>
            </div>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200/80 p-16 text-center text-slate-400 rounded-3xl">
            <FileSignature className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="font-black text-slate-750 text-base">Nenhum lead disponível para preencher ficha.</p>
            <p className="text-xs mt-1 text-slate-550">Cadastre um novo lead para preencher a ficha cadastral.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/85 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50 font-barlow">
                  <th className="p-4 pl-6">Lead / Cliente</th>
                  <th className="p-4">Telefone</th>
                  <th className="p-4">Ficha Status</th>
                  <th className="p-4">Vendedor</th>
                  <th className="p-4 pr-6 text-right">Ação Operacional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors text-slate-700">
                    <td className="p-4 pl-6 font-bold text-slate-800 text-sm">{lead.nome}</td>
                    <td className="p-4 text-xs font-semibold text-slate-500">{lead.telefone}</td>
                    <td className="p-4 text-xs font-semibold">
                      {lead.documentacao ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-255 text-emerald-700">
                          Completo (Com Assinatura)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-255 text-amber-700">
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-500">{lead.vendedor.nome}</td>
                    <td className="p-4 text-right pr-6">
                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-brand-blue hover:opacity-95 rounded-xl text-xs font-extrabold text-white shadow-md shadow-brand-blue/15 active:scale-[0.98] transition-all font-barlow uppercase tracking-wider"
                      >
                        {lead.documentacao ? "Ver e Editar" : "Preencher Ficha"}
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
