"use client";
import { useState } from "react";
import { createVendedorAction, updateColaboradorAction, deleteColaboradorAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Key,
  Globe,
  Laptop,
  Users,
  Clock,
  Pencil,
  X
} from "lucide-react";

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
  pode_apresentar: boolean;
  equipe_id: string | null;
  criado_em: Date;
}

interface LoginLog {
  id: string;
  user_id: string;
  ip_address: string | null;
  user_agent: string | null;
  criado_em: Date;
  user: {
    nome: string;
    email: string;
    role: string;
  };
}

interface VendedoresClientProps {
  initialColaboradores: Colaborador[];
  loginLogs: LoginLog[];
  equipes: { id: string; nome: string }[];
}

export default function VendedoresClient({ initialColaboradores, loginLogs, equipes }: VendedoresClientProps) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(initialColaboradores);
  const [activeTab, setActiveTab] = useState<"colaboradores" | "logins">("colaboradores");
  
  // Form States (Criação)
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("VENDEDOR");
  const [equipeId, setEquipeId] = useState<string>("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Form States (Edição)
  const [editingUser, setEditingUser] = useState<Colaborador | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("VENDEDOR");
  const [editEquipeId, setEditEquipeId] = useState<string>("");
  const [podeApresentar, setPodeApresentar] = useState(false);
  const [editAtivo, setEditAtivo] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleCreateColaborador = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!nome || !email || !password || !role) {
      setError("Todos os campos são obrigatórios.");
      setLoading(false);
      return;
    }

    const result = await createVendedorAction(nome, email, password, role, equipeId || undefined);

    if (result.success) {
      setSuccess(true);
      setNome("");
      setEmail("");
      setPassword("");
      setRole("VENDEDOR");
      setEquipeId("");
      router.refresh();
      setTimeout(() => window.location.reload(), 300);
    } else {
      setError(result.error || "Ocorreu um erro ao cadastrar o colaborador.");
      setLoading(false);
    }
  };

  const openEditModal = (colab: Colaborador) => {
    setEditingUser(colab);
    setEditNome(colab.nome);
    setEditEmail(colab.email);
    setEditRole(colab.role);
    setEditEquipeId(colab.equipe_id || "");
    setEditAtivo(colab.ativo);
    setPodeApresentar(colab.pode_apresentar);
    setEditPassword(""); // Limpo por padrão
    setEditError(null);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditError(null);
    setDeleteError(null);
  };

  const handleDeleteColaborador = async () => {
    if (!editingUser) return;
    if (!confirm(`Excluir permanentemente "${editingUser.nome}"? Esta ação não pode ser desfeita.`)) return;
    setDeleteLoading(true);
    setDeleteError(null);
    const result = await deleteColaboradorAction(editingUser.id);
    if (result.success) {
      closeEditModal();
      router.refresh();
      setTimeout(() => window.location.reload(), 300);
    } else {
      setDeleteError(result.error || "Erro ao excluir.");
      setDeleteLoading(false);
    }
  };

  const handleUpdateColaborador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setEditLoading(true);
    setEditError(null);

    const result = await updateColaboradorAction(
      editingUser.id,
      editNome,
      editEmail,
      editRole,
      editAtivo,
      editPassword,
      editEquipeId || undefined,
      podeApresentar
    );

    if (result.success) {
      setEditLoading(false);
      closeEditModal();
      router.refresh();
      setTimeout(() => window.location.reload(), 300);
    } else {
      setEditError(result.error || "Ocorreu um erro ao atualizar.");
      setEditLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 animate-fadeIn space-y-6">
      {/* Modal de Edição */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40  animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-extrabold text-brand-blue uppercase tracking-wide font-barlow">Editar Colaborador</h3>
                <p className="text-xs text-slate-500">Altere os dados ou desative o acesso.</p>
              </div>
              <button onClick={closeEditModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateColaborador} className="p-6 space-y-5">
              {editError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-shake">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-550" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <p className="text-sm font-bold text-slate-800">Status de Acesso</p>
                  <p className="text-xs text-slate-500">Desativar impede o login mas mantém o histórico.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={editAtivo} onChange={(e) => setEditAtivo(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Nome Completo</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-450"><User className="w-4 h-4" /></span>
                  <input type="text" required value={editNome} onChange={(e) => setEditNome(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={podeApresentar} onChange={(e) => setPodeApresentar(e.target.checked)} />
                Permitir acesso às apresentações do Hub Domus
              </label>
              {/* Login */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Login de Acesso</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-450"><User className="w-4 h-4" /></span>
                  <input type="text" required value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400" />
                </div>
              </div>

              {/* Nova Senha */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Nova Senha</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-450"><Lock className="w-4 h-4" /></span>
                  <input type="password" placeholder="Deixe em branco para manter a atual" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400" />
                </div>
              </div>

              {/* Cargo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Cargo / Função</label>
                <select required value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-sm outline-none cursor-pointer">
                  <option value="VENDEDOR">Vendedor</option>
                  <option value="GESTOR">Gestor de Equipe</option>
                  <option value="SECRETARIA">Secretária (Esteira)</option>
                  <option value="ADM">Administrador Global</option>
                </select>
              </div>

              {/* Equipe */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Equipe (Opcional)</label>
                <select value={editEquipeId} onChange={(e) => setEditEquipeId(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-sm outline-none cursor-pointer">
                  <option value="">Nenhuma Equipe</option>
                  {equipes.map((eq) => (
                    <option key={eq.id} value={eq.id}>{eq.nome}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={editLoading} className="w-full py-3 bg-brand-blue   hover:opacity-95 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md shadow-brand-blue/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center font-barlow tracking-wider uppercase">
                  {editLoading ? "Salvando…" : "Salvar alterações"}
                </button>
              </div>

              {/* Zona de perigo — Excluir */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                {deleteError && (
                  <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {deleteError}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleDeleteColaborador}
                  disabled={deleteLoading}
                  className="w-full py-2.5 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  {deleteLoading ? "Excluindo..." : "Excluir Permanentemente"}
                </button>
                <p className="text-xs text-slate-400 text-center mt-1.5">Só é possível excluir colaboradores sem leads vinculados.</p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER DA PÁGINA */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-bluer   flex items-center justify-center font-bold text-white shadow-lg shadow-brand-blue/20">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-slate-800 tracking-wide font-barlow uppercase">Controle Operacional da Equipe</h3>
            <p className="text-xs text-slate-500">Cadastre vendedores, secretárias e acompanhe o registro de logins.</p>
          </div>
        </div>

        {/* Alternador de Abas */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("colaboradores")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "colaboradores" ? "bg-white text-brand-blue shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Colaboradores</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logins")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "logins" ? "bg-white text-brand-blue shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Histórico de Logins</span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      {activeTab === "colaboradores" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full items-start">
          {/* Formulário de Criação (Esquerda/1 coluna) */}
          <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-sm">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue flex items-center justify-center mb-3">
                <UserPlus className="w-5 h-5 text-brand-teal" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-brand-blue font-barlow tracking-wide uppercase">Cadastrar Colaborador</h3>
                <p className="text-slate-500 text-xs mt-0.5">Adicione um novo profissional à equipe.</p>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2 animate-shake">
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-550" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                <span>Colaborador cadastrado com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleCreateColaborador} className="space-y-4">
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Nome Completo</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-450">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Nome do colaborador"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Login */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Login de Acesso</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-450">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="ex. joaovendedor"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Senha Inicial</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-450">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Cargo / Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Cargo / Função</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-sm outline-none cursor-pointer"
                >
                  <option value="VENDEDOR">Vendedor</option>
                  <option value="GESTOR">Gestor de Equipe</option>
                  <option value="SECRETARIA">Secretária (Esteira)</option>
                  <option value="ADM">Administrador Global</option>
                </select>
              </div>

              {/* Equipe (Opcional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Equipe (Opcional)</label>
                <select
                  value={equipeId}
                  onChange={(e) => setEquipeId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-sm outline-none cursor-pointer"
                >
                  <option value="">Nenhuma Equipe</option>
                  {equipes.map((eq) => (
                    <option key={eq.id} value={eq.id}>{eq.nome}</option>
                  ))}
                </select>
              </div>

              {/* Botão de Criação */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-brand-blue   hover:opacity-95 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md shadow-brand-blue/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 font-barlow tracking-wider uppercase"
              >
                {loading ? "Cadastrando..." : "Cadastrar Colaborador"}
              </button>
            </form>
          </div>

          {/* Lista de Colaboradores (Direita/2 colunas) */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="p-6 border-b border-slate-100 text-center flex flex-col items-center justify-center">
              <h3 className="font-extrabold text-lg text-brand-blue font-barlow tracking-wide uppercase">Colaboradores Cadastrados</h3>
              <p className="text-slate-500 text-xs mt-0.5">Total de colaboradores cadastrados no CRM.</p>
            </div>

            {colaboradores.length === 0 ? (
              <div className="p-16 text-center text-slate-450 flex-1 flex flex-col justify-center items-center">
                <User className="w-12 h-12 text-slate-300 mb-3" />
                <p className="font-semibold text-lg text-slate-700">Nenhum colaborador cadastrado. Use o formulário para adicionar alguém.</p>
                <p className="text-sm text-slate-500 mt-0.5">Adicione o primeiro colaborador usando o formulário ao lado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50 font-barlow">
                      <th className="p-4 pl-6">Nome</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Login</th>
                      <th className="p-4 text-center">Data</th>
                      <th className="p-4 text-right pr-6">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {colaboradores.map((colab) => (
                      <tr key={colab.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 font-bold flex items-center justify-center text-xs shrink-0 uppercase">
                              {colab.nome.substring(0, 2)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-800 text-sm truncate max-w-36 block">{colab.nome}</span>
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{colab.role}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-center">
                          {colab.ativo ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-600 uppercase tracking-wider">Ativo</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold border border-slate-200 bg-slate-100 text-slate-500 uppercase tracking-wider">Inativo</span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-slate-650 text-center font-medium">
                          {colab.email}
                        </td>
                        <td className="p-4 text-sm text-slate-650 text-center font-medium">
                          <span className="inline-flex items-center gap-1.5 justify-center">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(colab.criado_em).toLocaleDateString("pt-BR")}
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6">
                           <button 
                             onClick={() => openEditModal(colab)}
                             className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-brand-blue hover:border-brand-blue rounded-xl shadow-sm transition-all inline-flex items-center justify-center cursor-pointer"
                             title="Editar ou Inativar"
                           >
                             <Pencil className="w-4 h-4" />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Histórico de Logins */
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 text-center">
            <h3 className="font-extrabold text-lg text-brand-blue font-barlow tracking-wide uppercase">Histórico de Logins da Equipe</h3>
            <p className="text-slate-500 text-xs mt-0.5">Auditoria e controle de acessos em tempo real.</p>
          </div>

          {loginLogs.length === 0 ? (
            <div className="p-16 text-center text-slate-450 flex flex-col justify-center items-center">
              <Clock className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-semibold text-lg text-slate-700">Nenhum registro de login encontrado.</p>
              <p className="text-sm text-slate-500 mt-0.5">Os logs de login aparecerão conforme os usuários se autenticarem.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50 font-barlow">
                    <th className="p-4 pl-6">Nome do Profissional</th>
                    <th className="p-4 text-center">Cargo</th>
                    <th className="p-4 text-center">Endereço IP</th>
                    <th className="p-4 pl-8">Sistema / Navegador (User Agent)</th>
                    <th className="p-4 text-center pr-6">Data e Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                  {loginLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 font-bold flex items-center justify-center text-xs shrink-0 uppercase text-slate-650">
                            {log.user.nome.substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block">{log.user.nome}</span>
                            <span className="text-xs text-slate-400 block">{log.user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                          log.user.role === "SECRETARIA"
                            ? "bg-purple-50 text-purple-700 border-purple-200/60"
                            : log.user.role === "ADM"
                            ? "bg-rose-50 text-rose-700 border-rose-200/60"
                            : "bg-blue-50 text-blue-700 border-blue-200/60"
                        }`}>
                          {log.user.role === "SECRETARIA" ? "Secretária" : log.user.role === "ADM" ? "ADM" : "Vendedor"}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          {log.ip_address || "Localhost"}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 pl-8 max-w-72 truncate" title={log.user_agent || "Desconhecido"}>
                        <span className="inline-flex items-center gap-1.5 truncate max-w-full">
                          <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{log.user_agent || "Desconhecido"}</span>
                        </span>
                      </td>
                      <td className="p-4 text-center pr-6 font-mono text-slate-650">
                        <span className="inline-flex items-center gap-1.5 justify-center">
                          <Clock className="w-3.5 h-3.5 text-slate-450" />
                          {new Date(log.criado_em).toLocaleDateString("pt-BR")} às {new Date(log.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
