"use client";

import { useState } from "react";
import { createTagAction } from "@/app/actions/tags";
import { Plus, Tag as TagIcon, CheckCircle2, ShieldAlert } from "lucide-react";

interface Tag {
  id: string;
  nome: string;
  cor: string;
}

const PREDEFINED_COLORS = Array.from({ length: 10 }, (_, index) => `var(--tag-color-${String(index + 1).padStart(2, "0")})`);

function resolveTokenColor(color: string): string {
  const tokenName = color.match(/^var\((--[\w-]+)\)$/)?.[1];
  return tokenName ? getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim() : color;
}

export default function EtiquetasClient({ initialTags }: { initialTags: Tag[] }) {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [isCreating, setIsCreating] = useState(false);
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState(PREDEFINED_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await createTagAction(nome, resolveTokenColor(cor));
    if (result.success && result.tag) {
      setTags((prev) => [...prev, result.tag as Tag]);
      setNome("");
      setIsCreating(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "Erro ao criar etiqueta");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-brand-blue tracking-wide uppercase font-barlow flex items-center gap-2">
            <TagIcon className="w-6 h-6" />
            Etiquetas
          </h2>
          <p className="text-sm text-slate-500 mt-1">Use etiquetas para classificar leads.</p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-teal hover:bg-teal-600 text-white rounded-xl text-sm font-bold uppercase tracking-wider font-barlow transition-all shadow-md shadow-brand-teal/20"
        >
          <Plus className="w-4 h-4" />
          Nova Etiqueta
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-250 text-emerald-800 text-sm flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>Etiqueta criada com sucesso!</span>
        </div>
      )}

      {isCreating && (
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm animate-fadeIn">
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider font-barlow mb-4">Criar Nova Etiqueta</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Nome da Etiqueta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cliente Premium"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Cor</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {PREDEFINED_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${cor === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider font-barlow transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-brand-blue hover:bg-blue-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-barlow transition-all"
              >
                {loading ? "Salvando…" : "Salvar etiqueta"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {tags.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Nenhuma etiqueta cadastrada ainda.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tags.map((tag) => (
              <li key={tag.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span 
                    className="px-3 py-1 rounded text-xs font-bold text-white uppercase tracking-wider shadow-sm"
                    style={{ backgroundColor: tag.cor }}
                  >
                    {tag.nome}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
