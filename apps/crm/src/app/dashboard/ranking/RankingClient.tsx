"use client";

import { Trophy, Award } from "lucide-react";

interface RankingItem {
  id: string;
  nome: string;
  leadsGeridos: number;
  fichasGeradas: number;
  contratosGanhos: number;
  volumeConsolidado: number;
}

interface RankingClientProps {
  ranking: RankingItem[];
  user: { id: string; nome: string; role: string };
}

export default function RankingClient({ ranking, user }: RankingClientProps) {
  return (
    <div className="space-y-6 animate-fadeIn">

      <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center animate-bounce">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 font-barlow tracking-wide uppercase">Ranking de Performance da Equipe</h3>
            <p className="text-slate-500 text-xs mt-0.5">Vendas e contratos por colaborador.</p>
          </div>
        </div>

        {/* Podium de Vendas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {ranking.slice(0, 3).map((vend, idx) => {
            const medals = [
              { color: "bg-brand-blue text-white border-brand-blue", place: "1º lugar" },
              { color: "bg-slate-100 text-slate-700 border-slate-300", place: "2º lugar" },
              { color: "bg-brand-blue/10 text-brand-blue border-brand-blue/20", place: "3º lugar" },
            ];
            const curMedal = medals[idx] || medals[0];

            return (
              <div
                key={vend.id}
                className={`bg-white border rounded-2xl p-5 flex flex-col justify-between items-center text-center relative shadow-sm hover:shadow-md transition-all duration-200 ${
                  idx === 0 ? "border-amber-400 scale-105 ring-4 ring-amber-400/10" : "border-slate-200"
                }`}
              >
                <div className={`absolute top-4 right-4 px-2.5 py-0.5 ${curMedal.color} rounded-full text-xs font-bold uppercase tracking-wider font-barlow`}>
                  {curMedal.place}
                </div>
                <Trophy className="w-7 h-7 mt-4 text-brand-blue" aria-hidden="true" />
                <h4 className="font-extrabold text-slate-800 text-base mt-2 truncate w-full font-barlow uppercase tracking-wide">{vend.nome}</h4>
                <p className="text-xs text-slate-400 font-semibold mt-1">Domus Corretor</p>

                <div className="bg-slate-50 w-full p-3 rounded-xl border border-slate-200 mt-4 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-500">
                    <span>Fechamentos</span>
                    <span className="text-slate-800 font-extrabold">{vend.contratosGanhos} leads</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-500 font-barlow tracking-wider">
                    <span>Volume Ganho</span>
                    <span className="text-emerald-600 font-black">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(vend.volumeConsolidado)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabela de Vendedores */}
        <div className="bg-white border border-slate-200/85 rounded-2xl overflow-hidden mt-6 shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50 font-barlow">
                <th className="p-4 pl-6">Vendedor</th>
                <th className="p-4 text-center">Leads Geridos</th>
                <th className="p-4 text-center">Fichas Geradas</th>
                <th className="p-4 text-center">Contratos Ganhos</th>
                <th className="p-4 text-right pr-6">Volume Consolidado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ranking.map((vend) => (
                <tr key={vend.id} className="hover:bg-slate-50 transition-colors text-slate-700">
                  <td className="p-4 pl-6 font-bold text-slate-800 text-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-600 font-bold uppercase shrink-0">
                      {vend.nome.substring(0, 2)}
                    </div>
                    <span>{vend.nome}</span>
                  </td>
                  <td className="p-4 text-center font-semibold text-sm">{vend.leadsGeridos}</td>
                  <td className="p-4 text-center font-semibold text-sm text-cyan-600">{vend.fichasGeradas}</td>
                  <td className="p-4 text-center font-bold text-sm text-emerald-600">{vend.contratosGanhos}</td>
                  <td className="p-4 text-right pr-6 font-black text-slate-900 text-sm">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(vend.volumeConsolidado)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
