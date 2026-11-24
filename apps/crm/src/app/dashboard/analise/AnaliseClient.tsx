"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FileCheck, 
  FileSignature, 
  Plus, 
  XCircle, 
  Upload, 
  ShieldAlert, 
  CheckCircle2, 
  Eraser, 
  PenTool, 
  ChevronRight, 
  ChevronLeft,
  Camera,
  AlertTriangle,
  FolderOpen,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { updateLeadStatusAction, createCreditAnalysisAction } from "../../actions/leads";

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  tipo_consorcio: string;
  valor_desejado: number;
  status: string;
  localizacao: string | null;
  documentacao?: {
    nome: string;
    cpf: string;
    selfie_url: string;
    documento_identidade_url: string;
    comprovante_endereco_url: string;
    comprovante_renda_url?: string;
    comprovante_renda?: string;
  } | null;
}

interface AnaliseClientProps {
  initialLeads: Lead[];
  user: { id: string; nome: string; role: string };
}

export default function AnaliseClient({ initialLeads, user }: AnaliseClientProps) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [creditStatus, setCreditStatus] = useState<Record<string, string>>({});
  
  // Modal de Criação de Análise
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Campos do Formulário - Etapa 1
  const [correspondente, setCorrespondente] = useState("CAIXA");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [melhorHorario, setMelhorHorario] = useState("Manhã");

  // Campos do Formulário - Etapa 2 (Termos)
  const [autorizo, setAutorizo] = useState(false);

  // Campos do Formulário - Etapa 3 (Selfie & Assinatura & Documentos)
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [hasSigned, setHasSigned] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Documentos Individuais
  const [documentoIdentidade, setDocumentoIdentidade] = useState<File | null>(null);
  const [comprovanteEndereco, setComprovanteEndereco] = useState<File | null>(null);
  const [comprovanteRenda, setComprovanteRenda] = useState<File | null>(null);
  const [documentoIdentidadeConjuge, setDocumentoIdentidadeConjuge] = useState<File | null>(null);
  const [certidaoEstadoCivil, setCertidaoEstadoCivil] = useState<File | null>(null);
  const [anexoProposta, setAnexoProposta] = useState<File | null>(null);

  // Refs de Input de Arquivos
  const selfieInputRef = useRef<HTMLInputElement | null>(null);
  const rgInputRef = useRef<HTMLInputElement | null>(null);
  const enderecoInputRef = useRef<HTMLInputElement | null>(null);
  const rendaInputRef = useRef<HTMLInputElement | null>(null);
  const conjugeInputRef = useRef<HTMLInputElement | null>(null);
  const certidaoInputRef = useRef<HTMLInputElement | null>(null);

  // Resetar o formulário
  const resetForm = () => {
    setStep(1);
    setCorrespondente("CAIXA");
    setNome("");
    setCpf("");
    setDataNascimento("");
    setEmail("");
    setCelular("");
    setMelhorHorario("Manhã");
    setAutorizo(false);
    setDocumentoIdentidade(null);
    setComprovanteEndereco(null);
    setComprovanteRenda(null);
    setDocumentoIdentidadeConjuge(null);
    setCertidaoEstadoCivil(null);
    setAnexoProposta(null);
    setSelfie(null);
    setSelfiePreview(null);
    setHasSigned(false);
    setFormError(null);
  };

  // Configurações do Canvas da Assinatura no Passo 3
  useEffect(() => {
    if (step === 3 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      ctx.strokeStyle = getComputedStyle(canvas).getPropertyValue("--surface").trim();
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, [step, isCreateModalOpen]);

  // Canvas Drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasSigned(true);

    const pos = getEventCoords(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (e.cancelable) e.preventDefault();

    const pos = getEventCoords(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const getEventCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  // Mudança de Status
  const handleStatusChange = async (id: string, newStatus: string) => {
    const result = await updateLeadStatusAction(id, newStatus);
    if (result.success) {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
      );
    }
  };

  // Submissão Geral
  const handleCreateAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validações Finais
    if (!nome || !cpf || !dataNascimento || !email || !celular) {
      setFormError("Preencha todos os dados cadastrais na Etapa 1.");
      setStep(1);
      return;
    }

    if (!autorizo) {
      setFormError("Você precisa aceitar os termos de autorização na Etapa 2.");
      setStep(2);
      return;
    }

    if (!selfie) {
      setFormError("O upload da Selfie do cliente é obrigatório.");
      return;
    }

    if (!documentoIdentidade || !comprovanteEndereco) {
      setFormError("Os documentos CNH/RG e Comprovante de Endereço são obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("cpf", cpf);
      formData.append("data_nascimento", dataNascimento);
      formData.append("email", email);
      formData.append("celular", celular);
      formData.append("melhor_horario_comunicacao", melhorHorario);
      formData.append("correspondente_bancario", correspondente);

      formData.append("selfie", selfie);
      formData.append("documento_identidade", documentoIdentidade);
      formData.append("comprovante_endereco", comprovanteEndereco);
      if (comprovanteRenda) formData.append("comprovante_renda", comprovanteRenda);

      if (documentoIdentidadeConjuge) formData.append("documento_identidade_conjuge", documentoIdentidadeConjuge);
      if (certidaoEstadoCivil) formData.append("certidao_estado_civil", certidaoEstadoCivil);
      if (anexoProposta) formData.append("anexo_proposta", anexoProposta);

      // Obter assinatura como Base64 se desenhada
      if (hasSigned && canvasRef.current) {
        const signatureDataUrl = canvasRef.current.toDataURL("image/png");
        formData.append("assinatura_base64", signatureDataUrl);
      }

      const result = await createCreditAnalysisAction(formData);

      if (result.success) {
        setIsCreateModalOpen(false);
        resetForm();
        router.refresh();
        window.location.reload();
      } else {
        setFormError(result.error || "Ocorreu um erro ao salvar a análise de crédito.");
      }
    } catch (err) {
      console.error(err);
      setFormError("Ocorreu um erro de processamento de formulário.");
    } finally {
      setLoading(false);
    }
  };

  // Handler de Selfie com Preview
  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfie(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfiePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Contagem de pendências
  const getPendingCount = () => {
    let pending = 5;
    if (documentoIdentidade) pending--;
    if (comprovanteEndereco) pending--;
    if (comprovanteRenda) pending--;
    if (documentoIdentidadeConjuge) pending--;
    if (certidaoEstadoCivil) pending--;
    return pending;
  };

  const leadsWithDoc = leads.filter((l) => l.documentacao);

  return (
    <div className="space-y-6 animate-fadeIn">

      <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-brand-blue font-barlow tracking-wide uppercase">Análise de Crédito Integrada</h3>
              <p className="text-slate-500 text-xs mt-0.5">Fichas Cadastrais completadas. Faça a auditoria de assinaturas e arquivos.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetForm();
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 bg-brand-blue   hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-brand-blue/20 active:scale-[0.98] transition-all font-barlow tracking-wider uppercase"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Análise</span>
            </button>
            <span className="px-3.5 py-1.5 bg-brand-blue/10 border border-brand-blue/20 text-brand-teal text-xs font-black rounded-xl hidden sm:inline-block font-barlow tracking-wider uppercase">
              Módulo de Crédito Ativo
            </span>
          </div>
        </div>

        {leadsWithDoc.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200/80 p-16 text-center text-slate-400 rounded-3xl">
            <FileSignature className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="font-black text-slate-700 text-base">Nenhuma ficha disponível. Preencha uma ficha KYC para iniciar a análise.</p>
            <p className="text-xs mt-1 text-slate-500">Os leads precisam preencher e cadastrar a Ficha Cadastral KYC antes de entrar na análise.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {leadsWithDoc.map((lead) => {
              const currentCreditState = creditStatus[lead.id] || "Em Análise";
              const doc = lead.documentacao!;
              return (
                <div
                  key={lead.id}
                  className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-extrabold font-barlow text-slate-800 text-base uppercase tracking-wider">{doc.nome}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">CPF: {doc.cpf}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-black uppercase rounded-lg border ${
                      currentCreditState === "Aprovado"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-250"
                        : currentCreditState === "Recusado"
                        ? "bg-rose-50 text-rose-700 border-rose-250"
                        : "bg-amber-50 text-amber-700 border-amber-250"
                    }`}>
                      {currentCreditState}
                    </span>
                  </div>

                  {/* Links Rápidos de Auditoria de Arquivos */}
                  <div className="space-y-2">
                    <p className="text-xs text-slate-450 font-bold uppercase tracking-wider font-barlow">Documentos do Cliente:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <a
                        href={doc.selfie_url}
                        target="_blank"
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100/60 rounded-lg text-xs font-bold text-center text-slate-700 block truncate"
                      >
                         Selfie
                      </a>
                      <a
                        href={doc.documento_identidade_url}
                        target="_blank"
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100/60 rounded-lg text-xs font-bold text-center text-slate-700 block truncate"
                      >
                         RG ou CNH
                      </a>
                      <a
                        href={doc.comprovante_endereco_url}
                        target="_blank"
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100/60 rounded-lg text-xs font-bold text-center text-slate-700 block truncate"
                      >
                         Residência
                      </a>
                      <a
                        href={doc.comprovante_renda_url || doc.comprovante_renda}
                        target="_blank"
                        className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100/60 rounded-lg text-xs font-bold text-center text-slate-700 block truncate"
                      >
                         Renda
                      </a>
                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className="p-2 bg-brand-blue/10 border border-brand-blue/20 hover:bg-brand-blue/20 rounded-lg text-xs font-bold text-center text-brand-blue block truncate font-barlow uppercase tracking-wider"
                      >
                         Ficha & Assinatura
                      </Link>
                    </div>
                  </div>

                  {/* Ações de Crédito e Transição de Jornada */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 font-barlow">
                      <span className="text-xs text-slate-400 font-bold uppercase">Auditoria:</span>
                      <button
                        onClick={() => setCreditStatus((prev) => ({ ...prev, [lead.id]: "Aprovado" }))}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-250 text-emerald-700 text-xs font-black uppercase rounded-lg cursor-pointer transition-colors"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => setCreditStatus((prev) => ({ ...prev, [lead.id]: "Recusado" }))}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100/80 border border-rose-250 text-rose-700 text-xs font-black uppercase rounded-lg cursor-pointer transition-colors"
                      >
                        Recusar
                      </button>
                    </div>

                    {/* Mudar status para Fechado caso aprovado */}
                    {currentCreditState === "Aprovado" && lead.status !== "Fechado" && (
                      <button
                        onClick={() => handleStatusChange(lead.id, "Fechado")}
                        className="px-3 py-1 bg-brand-blue   hover:opacity-95 text-white font-bold text-xs rounded-lg shadow-md transition-all active:scale-[0.98] cursor-pointer font-barlow uppercase tracking-wider"
                      >
                         Marcar como fechado
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/*  MODAL INTEGRADO "NOVA ANÁLISE DE CRÉDITO" (MULTI-ETAPAS) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45  animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-6 md:p-8 shadow-2xl relative animate-scaleUp max-h-[var(--layout-panel-max-height)] overflow-y-auto">
            {/* Botão de Fechar */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-6 right-6 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <FileSignature className="w-6 h-6 text-brand-blue" />
              <h3 className="font-extrabold text-xl text-slate-800 font-barlow uppercase tracking-wider">Nova Análise de Crédito</h3>
            </div>

            {/* Indicador de Etapas - Replicação Exata de Status de Checkmarks */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-5 mb-6">
              {/* Etapa 1 */}
              <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                step > 1
                  ? "bg-emerald-50 border border-emerald-250 text-emerald-700"
                  : step === 1 
                  ? "bg-brand-blue text-white shadow-md shadow-brand-blue/10 font-barlow tracking-wider uppercase" 
                  : "bg-slate-100 text-slate-400"
              }`}>
                {step > 1 ? <span>✓ Dados</span> : <span>1 Dados</span>}
              </div>

              <div className={`h-0.5 flex-1 ${step > 1 ? "bg-emerald-300" : "bg-slate-200"}`} />

              {/* Etapa 2 */}
              <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                step > 2
                  ? "bg-emerald-50 border border-emerald-250 text-emerald-700"
                  : step === 2 
                  ? "bg-brand-blue text-white shadow-md shadow-brand-blue/10 font-barlow tracking-wider uppercase" 
                  : "bg-slate-100 text-slate-400"
              }`}>
                {step > 2 ? <span>✓ Termos</span> : <span>2 Termos</span>}
              </div>

              <div className={`h-0.5 flex-1 ${step > 2 ? "bg-emerald-300" : "bg-slate-200"}`} />

              {/* Etapa 3 */}
              <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                step === 3 
                  ? "bg-brand-blue text-white shadow-md shadow-brand-blue/10 font-barlow tracking-wider uppercase" 
                  : "bg-slate-100 text-slate-400"
              }`}>
                <span>3 Selfie & Assinatura</span>
              </div>
            </div>

            {formError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2 animate-fadeIn">
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAnalysis} className="space-y-5">
              
              {/* ==================== ETAPA 1: DADOS CADASTRAIS ==================== */}
              {step === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Correspondente Bancário */}
                  <div className="space-y-2 font-barlow">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">CORRESPONDENTE BANCÁRIO</label>
                    <div className="flex items-center gap-2">
                      {["CAIXA", "BANCO DO BRASIL", "OUTROS"].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setCorrespondente(bank)}
                          className={`py-2 px-6 border rounded-xl text-xs font-black transition-all cursor-pointer ${
                            correspondente === bank
                              ? "bg-brand-blue/10 border-brand-blue text-brand-blue"
                              : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nome Completo */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Nome Completo do Cliente</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal rounded-xl text-slate-800 text-sm outline-none transition-colors"
                    />
                  </div>

                  {/* Grid CPF / Data de Nascimento */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-barlow">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">CPF</label>
                      <input
                        type="text"
                        required
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal rounded-xl text-slate-800 text-sm outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Data de Nascimento</label>
                      <input
                        type="date"
                        required
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal rounded-xl text-slate-750 text-sm outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* E-mail */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">E-mail do Cliente</label>
                    <input
                      type="email"
                      required
                      placeholder="email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal rounded-xl text-slate-800 text-sm outline-none transition-colors"
                    />
                  </div>

                  {/* Grid Celular / Horário */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Celular</label>
                      <input
                        type="text"
                        required
                        placeholder="(00) 90000-0000"
                        value={celular}
                        onChange={(e) => setCelular(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal rounded-xl text-slate-800 text-sm outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Melhor horário para ligação</label>
                      <input
                        type="text"
                        placeholder="Ex: manhã, 10h-12h"
                        value={melhorHorario}
                        onChange={(e) => setMelhorHorario(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal rounded-xl text-slate-800 text-sm outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Botões Etapa 1 */}
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        if (!nome || !cpf || !dataNascimento || !email || !celular) {
                          setFormError("Preencha todos os campos obrigatórios para prosseguir.");
                          return;
                        }
                        setFormError(null);
                        setStep(2);
                      }}
                      className="px-6 py-2.5 bg-brand-blue hover:opacity-95 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-brand-blue/20 active:scale-[0.98] cursor-pointer font-barlow uppercase tracking-wider"
                    >
                      <span>Próximo: Termos</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ==================== ETAPA 2: TERMOS DE AUTORIZAÇÃO ==================== */}
              {step === 2 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center gap-2 font-barlow">
                    <FileSignature className="w-5 h-5 text-brand-teal" />
                    <span className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Termos e Condições</span>
                  </div>

                  {/* Bloco de Termo de Consentimento */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
                      Declaro que li e estou de acordo com as condições de parcelamento apresentadas, reconhecendo que os valores, prazos e taxas são meramente informativos e sujeitos à aprovação de crédito. Autorizo a coleta e uso dos meus dados pessoais para fins de análise de crédito imobiliário, conforme a LGPD. ATENÇÃO: Em caso de desistência injustificada após uma possível resposta positiva, os encargos serão aplicados ao CPF responsável.
                    </p>
                  </div>

                  {/* Checkbox de Confirmação */}
                  <label className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={autorizo}
                      onChange={(e) => setAutorizo(e.target.checked)}
                      className="mt-0.5 rounded bg-white border-slate-350 text-brand-blue focus:ring-brand-teal cursor-pointer"
                    />
                    <span className="text-xs text-slate-700 font-bold leading-normal">
                      O cliente declara que leu, compreendeu e está de acordo com os termos acima.
                    </span>
                  </label>

                  {/* Botões Etapa 2 */}
                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-800 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer font-barlow uppercase"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Voltar</span>
                    </button>

                    <button
                      type="button"
                      disabled={!autorizo}
                      onClick={() => setStep(3)}
                      className={`px-6 py-2.5 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer font-barlow uppercase tracking-wider ${
                        autorizo
                          ? "bg-brand-blue hover:opacity-95 text-white shadow-lg shadow-brand-blue/20"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <span>Próximo: Selfie & Assinatura</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ==================== ETAPA 3: SELFIE, ASSINATURA & DOCUMENTOS ==================== */}
              {step === 3 && (
                <div className="space-y-6 animate-fadeIn max-h-[var(--layout-media-max-height)] overflow-y-auto pr-1">
                  
                  {/* Seção 1: Selfie do Cliente */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 font-barlow">
                      <Camera className="w-4 h-4 text-slate-500" />
                      <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">Selfie do Cliente</label>
                    </div>

                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col items-center justify-center relative min-h-36">
                      {selfiePreview ? (
                        <div className="relative w-full max-w-48 aspect-video rounded-xl overflow-hidden border border-slate-200 bg-white">
                          <img src={selfiePreview} alt="Selfie do Cliente" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => { setSelfie(null); setSelfiePreview(null); }}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white p-1 rounded-full text-xs cursor-pointer transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center space-y-3">
                          <Camera className="w-10 h-10 text-slate-400 mx-auto" />
                          <button
                            type="button"
                            onClick={() => selfieInputRef.current?.click()}
                            className="px-4 py-2 bg-brand-blue/10 border border-brand-blue/20 hover:bg-brand-blue/20 text-brand-blue font-extrabold text-xs rounded-xl flex items-center gap-1.5 mx-auto transition-colors cursor-pointer font-barlow uppercase tracking-wider"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Abrir Câmera / Enviar</span>
                          </button>
                        </div>
                      )}
                      <input
                        ref={selfieInputRef}
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={handleSelfieChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Seção 2: Assinatura do Cliente */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block font-barlow">Assinatura do Cliente <span className="text-slate-400 font-normal">(opcional)</span></label>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">Use o mouse ou toque na tela para assinar</p>
                    </div>

                    <div className="border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-white relative">
                      <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-36 cursor-crosshair bg-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-rose-600 hover:text-rose-700 font-extrabold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors font-barlow uppercase"
                      >
                        <Eraser className="w-3 h-3" />
                        <span>Limpar</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (hasSigned) {
                            alert("Assinatura confirmada!");
                          }
                        }}
                        className={`px-3 py-1.5 font-extrabold text-xs rounded-lg flex items-center gap-1 transition-colors cursor-pointer font-barlow uppercase ${
                          hasSigned 
                            ? "bg-emerald-50 border border-emerald-250 text-emerald-700" 
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Confirmar Assinatura</span>
                      </button>
                    </div>
                  </div>

                  {/* Seção 3: Documentos do Cliente (Grade de Anexos Pendentes) */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block font-barlow">Documentos do Cliente</label>
                      <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-250 text-amber-700 text-xs font-black rounded-lg">
                        {getPendingCount()} pendentes
                      </span>
                    </div>

                    <div className="space-y-2">
                      {/* Documento 1: CNH ou RG */}
                      <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                        documentoIdentidade
                          ? "bg-emerald-50 border-emerald-250 text-emerald-800"
                          : "bg-amber-50 border-amber-200 text-amber-750"
                      }`}>
                        <div className="flex items-center gap-2">
                          {documentoIdentidade ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-800">CNH ou RG</p>
                            <p className="text-xs text-slate-500 truncate max-w-48">
                              {documentoIdentidade ? documentoIdentidade.name : "Pendente — clique para anexar"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => rgInputRef.current?.click()}
                            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Documento 2: Comprovante de Endereço */}
                      <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                        comprovanteEndereco
                          ? "bg-emerald-50 border-emerald-250 text-emerald-800"
                          : "bg-amber-50 border-amber-200 text-amber-750"
                      }`}>
                        <div className="flex items-center gap-2">
                          {comprovanteEndereco ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-800">Comprovante de Endereço</p>
                            <p className="text-xs text-slate-500 truncate max-w-48">
                              {comprovanteEndereco ? comprovanteEndereco.name : "Pendente — clique para anexar"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => enderecoInputRef.current?.click()}
                            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Documento 3: Comprovante de Renda */}
                      <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                        comprovanteRenda
                          ? "bg-emerald-50 border-emerald-250 text-emerald-800"
                          : "bg-amber-50 border-amber-200 text-amber-750"
                      }`}>
                        <div className="flex items-center gap-2">
                          {comprovanteRenda ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-800">Comprovante de Renda</p>
                            <p className="text-xs text-slate-500 truncate max-w-48">
                              {comprovanteRenda ? comprovanteRenda.name : "Pendente — clique para anexar"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => rendaInputRef.current?.click()}
                            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Documento 4: CNH/RG do Cônjuge (Opcional) */}
                      <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                        documentoIdentidadeConjuge
                          ? "bg-emerald-50 border-emerald-250 text-emerald-800"
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}>
                        <div className="flex items-center gap-2">
                          {documentoIdentidadeConjuge ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <FolderOpen className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-800">CNH/RG do Cônjuge <span className="text-xs font-normal text-slate-500">(opcional)</span></p>
                            <p className="text-xs text-slate-500 truncate max-w-48">
                              {documentoIdentidadeConjuge ? documentoIdentidadeConjuge.name : "Pendente — clique para anexar"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => conjugeInputRef.current?.click()}
                            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Documento 5: Certidão de Casamento (Opcional) */}
                      <div className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                        certidaoEstadoCivil
                          ? "bg-emerald-50 border-emerald-250 text-emerald-800"
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}>
                        <div className="flex items-center gap-2">
                          {certidaoEstadoCivil ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <FolderOpen className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-800">Certidão de Casamento <span className="text-xs font-normal text-slate-500">(opcional)</span></p>
                            <p className="text-xs text-slate-500 truncate max-w-48">
                              {certidaoEstadoCivil ? certidaoEstadoCivil.name : "Pendente — clique para anexar"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => certidaoInputRef.current?.click()}
                            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Inputs Invisíveis de Documentos */}
                    <input ref={rgInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setDocumentoIdentidade(e.target.files?.[0] || null)} />
                    <input ref={enderecoInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setComprovanteEndereco(e.target.files?.[0] || null)} />
                    <input ref={rendaInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setComprovanteRenda(e.target.files?.[0] || null)} />
                    <input ref={conjugeInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setDocumentoIdentidadeConjuge(e.target.files?.[0] || null)} />
                    <input ref={certidaoInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setCertidaoEstadoCivil(e.target.files?.[0] || null)} />
                  </div>

                  {/* Seção 4: Anexar Proposta */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block font-barlow">Anexar Proposta</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setAnexoProposta(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20 cursor-pointer font-barlow uppercase"
                    />
                  </div>

                  {/* Botões Finais */}
                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 hover:text-slate-800 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer animate-fadeIn font-barlow uppercase"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Voltar</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-brand-blue   hover:opacity-95 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-brand-blue/20 cursor-pointer transition-all active:scale-[0.98] animate-fadeIn font-barlow uppercase tracking-wider"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Enviando para Análise...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Enviar para Análise</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
