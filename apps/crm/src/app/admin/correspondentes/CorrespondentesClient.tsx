"use client";

import { useState } from "react";
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical, 
  Check, 
  X,
  Pencil
} from "lucide-react";
import { createCorrespondenteAction, updateCorrespondenteAction } from "@/app/actions/correspondentes";
import toast from "react-hot-toast";

export default function CorrespondentesClient({ user, initialCorrespondentes }: { user: any, initialCorrespondentes: any[] }) {
  const [correspondentes, setCorrespondentes] = useState(initialCorrespondentes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [nome, setNome] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenNew = () => {
    setEditingId(null);
    setNome("");
    setAtivo(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingId(c.id);
    setNome(c.nome);
    setAtivo(c.ativo);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return toast.error("Nome é obrigatório.");
    
    setIsSubmitting(true);
    try {
      if (editingId) {
        const res = await updateCorrespondenteAction(editingId, nome, ativo);
        if (res.success) {
          toast.success("Correspondente atualizado!");
          setCorrespondentes(prev => prev.map(c => c.id === editingId ? { ...c, nome, ativo } : c));
          setIsModalOpen(false);
        } else {
          toast.error(res.error || "Erro ao atualizar.");
        }
      } else {
        const res = await createCorrespondenteAction(nome);
        if (res.success) {
          toast.success("Correspondente criado com sucesso!");
          // Reload page to get new ID or just add a mock one and rely on revalidatePath
          window.location.reload();
        } else {
          toast.error(res.error || "Erro ao criar.");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = correspondentes.filter(c => c.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 font-barlow uppercase tracking-wide flex items-center gap-2">
              <Building2 className="w-6 h-6 text-brand-teal" />
              Bancos / Administradoras
            </h1>
            <p className="text-slate-500 text-sm mt-1">Gerencie os correspondentes bancários e administradoras de consórcio.</p>
          </div>
          <button
            onClick={handleOpenNew}
            className="flex items-center justify-center gap-2 bg-brand-teal hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-brand-teal/20"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Correspondente</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-5xl mx-auto p-8">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Buscar correspondente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal outline-none"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {filtered.length} banco(s)
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-barlow">Nome da Administradora</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-barlow">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-barlow text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{c.nome}</div>
                    </td>
                    <td className="px-6 py-4">
                      {c.ativo ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          <Check className="w-3.5 h-3.5" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <X className="w-3.5 h-3.5" />
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-2 text-slate-400 hover:text-brand-teal hover:bg-teal-50 rounded-lg transition-colors inline-flex items-center gap-2"
                        title="Editar Administradora"
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="text-xs font-medium">Editar</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                      Nenhuma administradora encontrada. Cadastre uma para começar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50  animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[var(--layout-dialog-max-height)]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-xl text-slate-800 font-barlow uppercase tracking-wide">
                {editingId ? "Editar Administradora" : "Nova Administradora"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Nome da Instituição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Embracon, Itaú, Ademicon..."
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                />
              </div>

              {editingId && (
                <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-teal/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-teal"></div>
                  </label>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Status Ativo</div>
                    <div className="text-xs text-slate-500">Instituição aparece nas opções para os vendedores</div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold bg-brand-teal hover:bg-teal-600 text-white rounded-xl transition-colors shadow-md shadow-brand-teal/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Salvando…" : "Salvar administradora"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
