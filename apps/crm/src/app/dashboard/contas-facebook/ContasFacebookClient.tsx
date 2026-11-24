"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  X,
  Lock,
  Loader2,
  Globe,
  User as UserIcon,
  ShieldCheck,
  AlertTriangle,
  Check,
  Copy,
} from "lucide-react";

// Custom Facebook SVG icon (lucide-react doesn't have Facebook)
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
import {
  criarContaFacebookAction,
  atualizarContaFacebookAction,
  deletarContaFacebookAction,
  toggleVisibilidadeContaFacebookAction,
} from "@/app/actions/facebook";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ContaFacebook {
  id: string;
  apelido: string;
  email: string;
  senha: string;
  observacoes: string | null;
  visivel_para_todos: boolean;
  dono_id: string;
  dono: { id: string; nome: string };
  criado_em: string;
}

interface Props {
  user: { id: string; nome: string; role: string };
  initialContas: ContaFacebook[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EMPTY_FORM = { apelido: "", email: "", senha: "", observacoes: "" };

export default function ContasFacebookClient({ user, initialContas }: Props) {
  const isAdm = user.role === "ADM";

  const [contas, setContas] = useState<ContaFacebook[]>(initialContas);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContaFacebook | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showSenha, setShowSenha] = useState(false);
  const [visibleSenhas, setVisibleSenhas] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [filterDono, setFilterDono] = useState("todos");

  // ─── Filtered list ──────────────────────────────────────────────────────────
  const donos = Array.from(new Map(contas.map((c) => [c.dono.id, c.dono])).values());

  const filtered = contas.filter((c) => {
    if (filterDono === "todos") return true;
    return c.dono.id === filterDono;
  });

  // ─── Open modal helpers ──────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowSenha(false);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (c: ContaFacebook) => {
    setEditingId(c.id);
    setForm({
      apelido: c.apelido,
      email: c.email,
      senha: c.senha,
      observacoes: c.observacoes ?? "",
    });
    setShowSenha(false);
    setError(null);
    setShowModal(true);
  };

  // ─── Submit form ─────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!form.apelido.trim() || !form.email.trim() || !form.senha.trim()) {
      setError("Apelido, e-mail e senha são obrigatórios.");
      return;
    }
    setError(null);
    startTransition(async () => {
      let res;
      if (editingId) {
        res = await atualizarContaFacebookAction(editingId, form);
      } else {
        res = await criarContaFacebookAction(form);
      }
      if (!res.success) {
        setError(res.error ?? "Não foi possível salvar a conta. Confira os dados e tente novamente.");
        return;
      }
      // Refresh local state
      const freshRes = await fetch("/dashboard/contas-facebook?_refresh=1");
      // We rely on server revalidation — just reload
      window.location.reload();
    });
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deletarContaFacebookAction(deleteTarget.id);
      if (!res.success) {
        setError(res.error ?? "Erro ao excluir.");
        setDeleteTarget(null);
        return;
      }
      setContas((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  };

  // ─── Toggle visibility ────────────────────────────────────────────────────────
  const handleToggleVisible = (conta: ContaFacebook) => {
    startTransition(async () => {
      const res = await toggleVisibilidadeContaFacebookAction(conta.id, !conta.visivel_para_todos);
      if (res.success) {
        setContas((prev) =>
          prev.map((c) =>
            c.id === conta.id ? { ...c, visivel_para_todos: !c.visivel_para_todos } : c
          )
        );
      }
    });
  };

  // ─── Copy to clipboard ───────────────────────────────────────────────────────
  const handleCopy = (text: string, id: string) => {
    // Tenta usar a API moderna primeiro (requer HTTPS ou localhost)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    } else {
      // Fallback para HTTP em rede local (sem HTTPS)
      const textArea = document.createElement("textarea");
      textArea.value = text;
      
      // Move o textarea para fora da tela
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error('Falha ao copiar usando método alternativo', err);
        setError("Seu navegador bloqueou a cópia. Copie manualmente.");
      }
      
      document.body.removeChild(textArea);
    }
  };

  // ─── UI ───────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-facebook/10 flex items-center justify-center border border-facebook/20">
            <FacebookIcon className="w-6 h-6 text-facebook" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 font-barlow tracking-wide uppercase">
              Contas Facebook
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isAdm
                ? "Visualize e gerencie todas as contas da equipe"
                : "Suas contas cadastradas e as liberadas pelo administrador"}
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-facebook hover:bg-brand-blue text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-none hover:shadow-none active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Nova Conta
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-facebook/10 rounded-xl flex items-center justify-center">
            <FacebookIcon className="w-5 h-5 text-facebook" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">{contas.length}</p>
            <p className="text-xs text-slate-500 font-medium">Total de Contas</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-800">
              {contas.filter((c) => c.visivel_para_todos).length}
            </p>
            <p className="text-xs text-slate-500 font-medium">Compartilhadas</p>
          </div>
        </div>
        {isAdm && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{donos.length}</p>
              <p className="text-xs text-slate-500 font-medium">Vendedores</p>
            </div>
          </div>
        )}
      </div>

      {/* Filter (ADM only) */}
      {isAdm && donos.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filtrar por vendedor:</span>
          <button
            onClick={() => setFilterDono("todos")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterDono === "todos"
                ? "bg-facebook text-white shadow-md"
                : "bg-white border border-slate-200 text-slate-600 hover:border-facebook/40"
            }`}
          >
            Todos
          </button>
          {donos.map((d) => (
            <button
              key={d.id}
              onClick={() => setFilterDono(d.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterDono === d.id
                  ? "bg-facebook text-white shadow-md"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-facebook/40"
              }`}
            >
              {d.nome}
            </button>
          ))}
        </div>
      )}

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl text-center gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
            <FacebookIcon className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <p className="text-slate-700 font-bold text-lg">Nenhuma conta cadastrada. Use o botão Nova conta para adicionar uma.</p>
            <p className="text-slate-400 text-sm mt-1">
              Clique em <span className="font-bold text-facebook">+ Nova Conta</span> para adicionar
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((conta) => {
            const isMine = conta.dono_id === user.id;
            const canEdit = isMine || isAdm;
            const senhaMasked = "•".repeat(Math.min(conta.senha.length, 12));
            const senhaVisible = visibleSenhas[conta.id];

            return (
              <div
                key={conta.id}
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md ${
                  conta.visivel_para_todos
                    ? "border-green-200 shadow-sm shadow-green-100/50"
                    : "border-slate-200"
                }`}
              >
                {/* Card header */}
                <div className="bg-facebook/5 px-5 py-4 flex items-start justify-between border-b border-slate-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-facebook flex items-center justify-center shrink-0">
                      <FacebookIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{conta.apelido}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <UserIcon className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500 truncate">{conta.dono.nome}</span>
                        {isMine && !isAdm && (
                          <span className="text-xs bg-facebook/10 text-facebook font-bold px-1.5 py-0.5 rounded-md">
                            Minha
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Visibility badge */}
                  {conta.visivel_para_todos && (
                    <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg">
                      <Globe className="w-3 h-3" />
                      Pública
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="px-5 py-4 space-y-3">
                  {/* Email */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">E-mail</p>
                      <p className="text-sm text-slate-700 font-medium truncate">{conta.email}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(conta.email, `email-${conta.id}`)}
                      className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      title="Copiar e-mail"
                    >
                      {copiedId === `email-${conta.id}` ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Senha */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Senha</p>
                      <p className={`text-sm font-medium truncate ${senhaVisible ? "text-slate-800 font-mono" : "text-slate-400 tracking-widest"}`}>
                        {senhaVisible ? conta.senha : senhaMasked}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() =>
                          setVisibleSenhas((prev) => ({ ...prev, [conta.id]: !prev[conta.id] }))
                        }
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        title={senhaVisible ? "Esconder senha" : "Ver senha"}
                      >
                        {senhaVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      {senhaVisible && (
                        <button
                          onClick={() => handleCopy(conta.senha, `senha-${conta.id}`)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                          title="Copiar senha"
                        >
                          {copiedId === `senha-${conta.id}` ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Observações */}
                  {conta.observacoes && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Obs</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{conta.observacoes}</p>
                    </div>
                  )}
                </div>

                {/* Card actions */}
                {(canEdit || isAdm) && (
                  <div className="px-5 pb-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <>
                          <button
                            onClick={() => openEdit(conta)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-facebook hover:bg-facebook/8 border border-slate-200 hover:border-facebook/30 transition-all"
                          >
                            <Pencil className="w-3 h-3" />
                            Editar
                          </button>
                          <button
                            onClick={() => setDeleteTarget(conta)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                            Excluir
                          </button>
                        </>
                      )}
                    </div>

                    {/* ADM toggle visibility */}
                    {isAdm && (
                      <button
                        onClick={() => handleToggleVisible(conta)}
                        disabled={isPending}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          conta.visivel_para_todos
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                        title={conta.visivel_para_todos ? "Tornar privada" : "Compartilhar com todos"}
                      >
                        {isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : conta.visivel_para_todos ? (
                          <Globe className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                        {conta.visivel_para_todos ? "Pública" : "Privada"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Modal Criar/Editar ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50  p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-[fadeInScale_0.2s_ease-out]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-facebook/10 flex items-center justify-center">
                  <FacebookIcon className="w-4 h-4 text-facebook" />
                </div>
                <h2 className="font-black text-slate-800 text-lg font-barlow">
                  {editingId ? "Editar Conta" : "Nova Conta Facebook"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Apelido / Identificação *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Conta ADS Pedro, Conta Pessoal"
                  value={form.apelido}
                  onChange={(e) => setForm((f) => ({ ...f, apelido: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-facebook/30 focus:border-facebook transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  E-mail do Facebook *
                </label>
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-facebook/30 focus:border-facebook transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Senha *
                </label>
                <div className="relative">
                  <input
                    type={showSenha ? "text" : "password"}
                    placeholder="Senha da conta"
                    value={form.senha}
                    onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                    className="w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-facebook/30 focus:border-facebook transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Observações (opcional)
                </label>
                <textarea
                  placeholder="Informações extras sobre a conta..."
                  value={form.observacoes}
                  onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-facebook/30 focus:border-facebook transition-all resize-none"
                />
              </div>

              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 font-medium">
                  As senhas ficam protegidas e visíveis apenas para você e para o ADM.
                  Só o ADM pode compartilhar uma conta com toda a equipe.
                </p>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-facebook hover:bg-brand-blue text-white font-bold rounded-xl transition-all disabled:opacity-60 shadow-lg shadow-none"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingId ? (
                  "Salvar Alterações"
                ) : (
                  "Cadastrar Conta"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Confirmar Exclusão ────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50  p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-[fadeInScale_0.2s_ease-out]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg">Excluir Conta</h3>
                <p className="text-sm text-slate-500">Esta ação é irreversível.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Tem certeza que deseja excluir a conta{" "}
              <span className="font-bold text-slate-800">&quot;{deleteTarget.apelido}&quot;</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
                className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-60"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
