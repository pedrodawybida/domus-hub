"use client";

import { useState } from "react";
import { addCampanhaAction, deleteCampanhaAction } from "@/app/actions/campanhas";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Copy,
  ExternalLink,
  Search,
  Check,
  Save,
  ShieldAlert,
  CheckCircle2,
  Link2,
  Plus,
  XCircle,
  Trash2,
  Tag
} from "lucide-react";

interface Campanha {
  id: string;
  nome: string;
  url: string;
}

interface UserCampanha {
  id: string;
  nome: string;
  email: string;
  role: string;
  url_campanha: string | null;
  campanhas: Campanha[];
}

interface CampanhasClientProps {
  user: { id: string; nome: string; role: string };
  initialCampanhas: UserCampanha[];
}

export default function CampanhasClient({ user, initialCampanhas }: CampanhasClientProps) {
  const [campanhasState, setCampanhasState] = useState<UserCampanha[]>(initialCampanhas);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Adicionar Campanha");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [nomeInput, setNomeInput] = useState("");
  const [urlInput, setUrlInput] = useState("");

  // Estados de feedback e ações
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Abrir Modal para criar/adicionar nova campanha
  const handleOpenAddModal = (userId?: string) => {
    setModalTitle(user.role === "ADM" ? "Adicionar Campanha" : "Adicionar Minha Campanha");
    // Se userId for fornecido, pré-seleciona, senão usa lógica padrão
    setSelectedUserId(userId || (user.role !== "ADM" ? user.id : ""));
    setNomeInput("");
    setUrlInput("");
    setSuccessMsg(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Salvar URL da Campanha via Modal
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setErrorMsg("Por favor, selecione um usuário.");
      return;
    }
    if (!nomeInput.trim()) {
      setErrorMsg("Por favor, informe o nome da campanha.");
      return;
    }

    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const targetUser = campanhasState.find((c) => c.id === selectedUserId);
    const result = await addCampanhaAction(selectedUserId, nomeInput, urlInput);

    if (result.success) {
      setSuccessMsg(`Campanha de ${targetUser?.nome || "usuário"} gravada com sucesso!`);
      router.refresh();
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg(null);
      }, 800);
    } else {
      setErrorMsg(result.error || "Ocorreu um erro ao salvar.");
    }
    setSaving(false);
  };

  const handleDeleteCampaign = async (campanhaId: string, userId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta campanha?")) return;
    
    setDeletingId(campanhaId);
    const result = await deleteCampanhaAction(campanhaId, userId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Erro ao deletar campanha.");
    }
    setDeletingId(null);
  };

  // Copiar link para área de transferência
  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtrar
  const filteredCampanhas = campanhasState.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn pb-20">

      {/* PAINEL CENTRAL DE LISTAGEM */}
      <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-850 font-barlow uppercase tracking-wider">
                {user.role === "ADM" ? "Campanhas ADS da Equipe" : "Minhas Campanhas ADS"}
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                {user.role === "ADM" 
                  ? "Gerencie os links de tráfego de toda a equipe e o seu próprio." 
                  : "Consulte e crie links exclusivos de divulgação."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {user.role === "ADM" && (
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar vendedor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-xs outline-none transition-all"
                />
              </div>
            )}

            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2.5 bg-brand-blue   hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-brand-blue/20 active:scale-[0.98] transition-all font-barlow tracking-wider uppercase"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Campanha</span>
            </button>
          </div>
        </div>

        {/* LISTAGEM DE USUÁRIOS E SEUS LINKS */}
        <div className="space-y-6">
          {filteredCampanhas.length === 0 ? (
            <div className="text-center py-10 text-slate-400 italic">
              Nenhum usuário com campanhas encontrado.
            </div>
          ) : (
            filteredCampanhas.map((c) => (
              <div key={c.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                {/* Cabeçalho do Vendedor */}
                <div className="bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200">
                  <div>
                    <p className="font-extrabold text-sm text-slate-850 font-barlow uppercase tracking-wide">
                      {c.nome} {c.id === user.id && <span className="text-xs bg-slate-200 border border-slate-300 px-1.5 rounded text-slate-500 font-semibold font-sans normal-case ml-1">Você</span>}
                    </p>
                    <span className="text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 font-bold uppercase mt-1 inline-block">
                      {c.role}
                    </span>
                  </div>
                  {(user.role === "ADM" || user.id === c.id) && (
                    <button
                      onClick={() => handleOpenAddModal(c.id)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-brand-teal hover:text-brand-teal text-slate-500 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Adicionar Link
                    </button>
                  )}
                </div>

                {/* Lista de Campanhas */}
                <div className="p-4 bg-white divide-y divide-slate-100">
                  {c.campanhas.length === 0 && !c.url_campanha && (
                    <div className="text-slate-400 italic text-xs py-2">Nenhuma campanha cadastrada. Adicione um link para começar.</div>
                  )}

                  {/* Legado (se existir url_campanha antiga sem estar na tabela) */}
                  {c.url_campanha && c.campanhas.length === 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-slate-700 mb-1 flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-brand-teal" /> Campanha Padrão (Antiga)
                        </div>
                        <a href={c.url_campanha} target="_blank" rel="noreferrer" className="text-brand-blue hover:text-brand-teal font-medium hover:underline flex items-center gap-1 text-xs truncate max-w-md">
                          <Link2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{c.url_campanha}</span>
                          <ExternalLink className="w-3 h-3 text-slate-450 shrink-0" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleCopyLink(c.url_campanha!, "legacy-"+c.id)} className="p-2 bg-slate-50 border border-slate-200 hover:text-brand-blue rounded-xl">
                          {copiedId === "legacy-"+c.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Novas Campanhas (Tabela Campanha) */}
                  {c.campanhas.map((camp) => (
                    <div key={camp.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-slate-700 mb-1 flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-brand-teal" /> {camp.nome}
                        </div>
                        <a href={camp.url} target="_blank" rel="noreferrer" className="text-brand-blue hover:text-brand-teal font-medium hover:underline flex items-center gap-1 text-xs truncate max-w-md">
                          <Link2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{camp.url}</span>
                          <ExternalLink className="w-3 h-3 text-slate-450 shrink-0" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleCopyLink(camp.url, camp.id)} className="p-2 bg-slate-50 border border-slate-200 hover:text-brand-blue rounded-xl" title="Copiar Link">
                          {copiedId === camp.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        {(user.role === "ADM" || user.id === c.id) && (
                          <button onClick={() => handleDeleteCampaign(camp.id, c.id)} disabled={deletingId === camp.id} className="p-2 bg-slate-50 border border-slate-200 hover:text-red-500 hover:border-red-200 rounded-xl disabled:opacity-50" title="Excluir Campanha">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/*  MODAL DE CONFIGURAÇÃO DE CAMPANHA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45  animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-scaleUp">
            {/* Fechar */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <h3 className="font-extrabold text-xl text-slate-800 mb-1 font-barlow uppercase tracking-wide">
              {modalTitle}
            </h3>
            <p className="text-slate-500 text-xs mb-5">
              Associe uma URL de tráfego exclusiva para capturar leads.
            </p>

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveCampaign} className="space-y-4">
              {/* Seleção do Vendedor (Apenas ADM no cadastro) */}
              {user.role === "ADM" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">
                    Vendedor / Usuário
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-750 text-xs outline-none cursor-pointer"
                  >
                    <option value="">Selecione um usuário...</option>
                    {campanhasState.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome} ({c.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Nome da Campanha */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">
                  Nome da Campanha
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-450" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Campanha Facebook Leads"
                    value={nomeInput}
                    onChange={(e) => setNomeInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-xs outline-none"
                  />
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">
                  URL da Campanha
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 absolute left-3 top-3 text-slate-450" />
                  <input
                    type="text"
                    required
                    placeholder="https://exemplo.com/campanha?vendedor=..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-xs outline-none"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1 font-semibold leading-relaxed">
                  Deve incluir o protocolo completo (ex: http:// ou https://).
                </p>
              </div>

              {/* Botões do Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs cursor-pointer font-barlow uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-brand-blue   hover:opacity-95 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 font-barlow tracking-wider uppercase shadow-lg shadow-brand-blue/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Salvando…" : "Salvar campanha"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
