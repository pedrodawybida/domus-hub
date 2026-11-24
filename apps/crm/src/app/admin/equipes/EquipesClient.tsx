"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEquipeAction, updateEquipeAction, deleteEquipeAction } from "@/app/actions/equipes";
import { Users, Plus, Edit2, Trash2, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface Equipe {
  id: string;
  nome: string;
  criado_em: Date;
  _count: { users: number };
}

export default function EquipesClient({ initialEquipes }: { initialEquipes: Equipe[] }) {
  const [equipes, setEquipes] = useState<Equipe[]>(initialEquipes);
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    
    setLoading(true);
    setError(null);
    const result = await createEquipeAction(nome);
    
    if (result.success && result.equipe) {
      setEquipes([{ ...result.equipe, _count: { users: 0 } }, ...equipes]);
      setNome("");
      router.refresh();
    } else {
      setError(result.error || "Erro ao criar equipe.");
    }
    setLoading(false);
  };

  const handleUpdate = async (id: string) => {
    if (!editNome.trim()) return;
    
    setLoading(true);
    const result = await updateEquipeAction(id, editNome);
    
    if (result.success) {
      setEquipes(equipes.map(eq => eq.id === id ? { ...eq, nome: editNome } : eq));
      setEditingId(null);
      router.refresh();
    } else {
      alert(result.error || "Erro ao atualizar.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta equipe?")) return;
    
    setLoading(true);
    const result = await deleteEquipeAction(id);
    
    if (result.success) {
      setEquipes(equipes.filter(eq => eq.id !== id));
      router.refresh();
    } else {
      alert(result.error || "Erro ao excluir. Verifique se não há vendedores nesta equipe.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-blue   rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest font-barlow flex items-center gap-3">
            <Users className="w-8 h-8 opacity-80" />
            Gestão de Equipes
          </h1>
          <p className="text-brand-blue-50 mt-2 font-medium max-w-xl text-sm">
            Crie equipes de vendas e vincule os usuários em <Link href="/admin/vendedores" className="underline hover:text-white">Colaboradores</Link>. Gestores poderão visualizar os leads de sua equipe.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-black text-brand-blue uppercase tracking-wider font-barlow mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-teal" />
              Nova Equipe
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nome da Equipe</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none transition-all font-medium"
                  placeholder="Ex: Equipe Alfa"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !nome.trim()}
                className="w-full py-3.5 bg-brand-teal hover:bg-teal-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-barlow transition-all shadow-lg shadow-brand-teal/20 disabled:opacity-50"
              >
                {loading ? "Criando..." : "Criar Equipe"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Equipes Cadastradas</h3>
            </div>
            
            {equipes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Nenhuma equipe cadastrada. Crie uma equipe para organizar os colaboradores.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {equipes.map((equipe) => (
                  <div key={equipe.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    {editingId === equipe.id ? (
                      <div className="flex-1 flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editNome}
                          onChange={(e) => setEditNome(e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-slate-300 focus:border-brand-teal rounded-lg text-sm outline-none"
                        />
                        <button
                          onClick={() => handleUpdate(equipe.id)}
                          disabled={loading}
                          className="px-3 py-2 bg-brand-teal text-white rounded-lg text-xs font-bold uppercase"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-2 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center text-brand-blue">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-sm">{equipe.nome}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-400 font-medium">
                                Criado em {new Date(equipe.criado_em).toLocaleDateString("pt-BR")}
                              </span>
                              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">
                                {equipe._count.users} vendedores
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingId(equipe.id);
                              setEditNome(equipe.nome);
                            }}
                            className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(equipe.id)}
                            disabled={loading || equipe._count.users > 0}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30"
                            title={equipe._count.users > 0 ? "Remova os vendedores antes de excluir" : "Excluir"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
