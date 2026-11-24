"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateLeadAction, saveLeadDocumentationAction, updateLeadStatusAction } from "@/app/actions/leads";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  Briefcase,
  FileText,
  ShieldAlert,
  CheckCircle2,
  Eye,
  Eraser,
  PenTool,
  Upload,
  FileCheck2,
  FileSignature,
  CalendarDays
} from "lucide-react";
import { formatToDateTimeLocal, formatToDateLocal, formatDateTimeBR } from "@/lib/dates";

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  tipo_consorcio: string;
  valor_desejado: number;
  status: string;
  origem: string | null;
  localizacao: string | null;
  observacoes: string;
  vendedor_id: string;
  vendedor: { id: string; nome: string };
  vendedor_anterior?: { id: string; nome: string } | null;
  correspondente_id?: string | null;
  data_agendamento?: Date | string | null;
  tipo_agendamento?: string | null;
  retornar_contato?: boolean;
  data_retorno?: Date | string | null;
  tags?: { id: string; nome: string; cor: string }[];
  criado_em: Date;
  valor_parcela: number | null;
  valor_entrada: number | null;
  documentacao?: {
    id: string;
    nome: string;
    cpf: string;
    data_nascimento: Date;
    email: string;
    celular: string;
    melhor_horario_comunicacao: string;
    selfie_url: string;
    assinatura_url: string;
    documento_identidade_url: string;
    comprovante_endereco_url: string;
    comprovante_renda_url: string | null;
    documento_identidade_conjuge_url: string | null;
    certidao_estado_civil_url: string | null;
    anexo_proposta_url: string | null;
  } | null;
}

interface LeadDetailsClientProps {
  lead: Lead;
  vendedores: { id: string; nome: string }[];
  user: { id: string; nome: string; role: string };
  correspondentes: { id: string; nome: string; ativo: boolean }[];
  tags: { id: string; nome: string; cor: string }[];
}

export default function LeadDetailsClient({ lead, vendedores, user, correspondentes, tags }: LeadDetailsClientProps) {
  const router = useRouter();

  // Abas do Lead (Remove poluição visual)
  const [activeTab, setActiveTab] = useState<"kyc_view" | "kyc_edit" | "crm_data">(
    lead.documentacao ? "kyc_view" : "kyc_edit"
  );

  // 1. Estados de Edição do Lead
  const [isEditingCrm, setIsEditingCrm] = useState(false);
  const [nomeLead, setNomeLead] = useState(lead.nome);
  const [telefoneLead, setTelefoneLead] = useState(lead.telefone);
  const [emailLead, setEmailLead] = useState(lead.email || "");
  const [tipoConsorcioLead, setTipoConsorcioLead] = useState(lead.tipo_consorcio);
  const [valorDesejadoLead, setValorDesejadoLead] = useState(String(lead.valor_desejado));
  const [valorParcelaLead, setValorParcelaLead] = useState(lead.valor_parcela ? String(lead.valor_parcela) : "");
  const [valorEntradaLead, setValorEntradaLead] = useState(lead.valor_entrada ? String(lead.valor_entrada) : "");
  const [statusLead, setStatusLead] = useState(lead.status);
  const [origemLead, setOrigemLead] = useState(lead.origem || "");
  const [localizacaoLead, setLocalizacaoLead] = useState(lead.localizacao || "");
  const [observacoesLead, setObservacoesLead] = useState(lead.observacoes);
  const [vendedorIdLead, setVendedorIdLead] = useState(lead.vendedor_id);
  const [correspondenteIdLead, setCorrespondenteIdLead] = useState(lead.correspondente_id || "");
  const [dataAgendamentoLead, setDataAgendamentoLead] = useState(
    formatToDateTimeLocal(lead.data_agendamento)
  );
  const [tipoAgendamentoLead, setTipoAgendamentoLead] = useState(lead.tipo_agendamento || "LIGAÇÃO");
  
  const [retornarContatoLead, setRetornarContatoLead] = useState(lead.retornar_contato || false);
  const [dataRetornoLead, setDataRetornoLead] = useState(
    formatToDateTimeLocal(lead.data_retorno)
  );

  const [leadTags, setLeadTags] = useState<string[]>(lead.tags?.map(t => t.id) || []);
  const [updatingLead, setUpdatingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  // Modal de WhatsApp
  const [whatsappModal, setWhatsappModal] = useState<{ phone: string; name: string } | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState("");

  const handleOpenWhatsapp = (phone: string, name: string) => {
    setWhatsappModal({ phone, name });
    setWhatsappMessage(`Olá ${name}, tudo bem? Aqui é o(a) ${user.nome} da Domus Consórcios. `);
  };

  const handleSendWhatsapp = () => {
    if (!whatsappModal) return;
    const phone = whatsappModal.phone.replace(/\D/g, "");
    const text = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/55${phone}?text=${text}`, "_blank");
    setWhatsappModal(null);
  };

  // 2. Estados da Documentação (KYC / Proposta)
  const [nomeDoc, setNomeDoc] = useState(lead.documentacao?.nome || lead.nome);
  const [cpfDoc, setCpfDoc] = useState(lead.documentacao?.cpf || "");
  const formattedBirth = formatToDateLocal(lead.documentacao?.data_nascimento);
  const [dataNascimentoDoc, setDataNascimentoDoc] = useState(formattedBirth);
  const [emailDoc, setEmailDoc] = useState(lead.documentacao?.email || lead.email || "");
  const [celularDoc, setCelularDoc] = useState(lead.documentacao?.celular || lead.telefone);
  const [melhorHorarioDoc, setMelhorHorarioDoc] = useState(lead.documentacao?.melhor_horario_comunicacao || "Manhã");

  // Arquivos
  const [selfie, setSelfie] = useState<File | null>(null);
  const [documentoIdentidade, setDocumentoIdentidade] = useState<File | null>(null);
  const [comprovanteEndereco, setComprovanteEndereco] = useState<File | null>(null);
  const [comprovanteRenda, setComprovanteRenda] = useState<File | null>(null);
  const [documentoIdentidadeConjuge, setDocumentoIdentidadeConjuge] = useState<File | null>(null);
  const [certidaoEstadoCivil, setCertidaoEstadoCivil] = useState<File | null>(null);
  const [anexoProposta, setAnexoProposta] = useState<File | null>(null);

  const [savingDoc, setSavingDoc] = useState(false);
  const [docSuccess, setDocSuccess] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  // 3. Canvas da Assinatura Digital
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const statusList = ["Novo", "Em Contato?", "Agendado", "Presente", "Ficha", "Fechado", "Cancelado"];

  // Configurações do Canvas de Desenho
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configura tamanho interno baseado no display
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.strokeStyle = getComputedStyle(canvas).getPropertyValue("--brand-primary").trim(); // Azul escuro da marca para desenhar no fundo branco do canvas
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [activeTab, lead.documentacao]);

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

  const handleToggleTag = async (tagId: string) => {
    if (leadTags.includes(tagId)) {
      setLeadTags(prev => prev.filter(id => id !== tagId));
      await import("@/app/actions/tags").then(m => m.removeTagFromLeadAction(lead.id, tagId));
    } else {
      setLeadTags(prev => [...prev, tagId]);
      await import("@/app/actions/tags").then(m => m.addTagToLeadAction(lead.id, tagId));
    }
  };

  // Enviar formulário de Edição do Lead (CRM)
  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingLead(true);
    setLeadError(null);
    setLeadSuccess(false);

    if (statusLead === "Agendado" && !dataAgendamentoLead) {
      setLeadError("Por favor, preencha a data e o horário do agendamento.");
      setUpdatingLead(false);
      return;
    }

    if (retornarContatoLead && !dataRetornoLead) {
      setLeadError("Por favor, informe a data e horário para retornar o contato.");
      setUpdatingLead(false);
      return;
    }

    const result = await updateLeadAction(lead.id, {
      nome: nomeLead,
      telefone: telefoneLead,
      email: emailLead || undefined,
      tipo_consorcio: tipoConsorcioLead,
      valor_desejado: Number(valorDesejadoLead),
      valor_parcela: valorParcelaLead ? Number(valorParcelaLead) : undefined,
      valor_entrada: valorEntradaLead ? Number(valorEntradaLead) : undefined,
      status: statusLead,
      origem: origemLead || undefined,
      localizacao: localizacaoLead || undefined,
      observacoes: observacoesLead,
      vendedor_id: (user.role === "ADM" || user.role === "SECRETARIA") ? vendedorIdLead : undefined,
      correspondente_id: correspondenteIdLead || undefined,
      data_agendamento: statusLead === "Agendado" && dataAgendamentoLead ? new Date(dataAgendamentoLead) : null,
      tipo_agendamento: statusLead === "Agendado" ? tipoAgendamentoLead : null,
      retornar_contato: retornarContatoLead,
      data_retorno: retornarContatoLead && dataRetornoLead ? new Date(dataRetornoLead) : null,
    });

    if (result.success) {
      setLeadSuccess(true);
      setIsEditingCrm(false);
      router.refresh();
      setTimeout(() => window.location.reload(), 300);
    } else {
      setLeadError(result.error || "Erro ao atualizar dados do lead.");
    }
    setUpdatingLead(false);
  };

  // Enviar formulário de KYC e salvar no banco
  const handleSaveDocumentation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDoc(true);
    setDocError(null);
    setDocSuccess(false);

    try {
      const formData = new FormData();
      formData.append("lead_id", lead.id);
      formData.append("nome", nomeDoc);
      formData.append("cpf", cpfDoc);
      formData.append("data_nascimento", dataNascimentoDoc);
      formData.append("email", emailDoc);
      formData.append("celular", celularDoc);
      formData.append("melhor_horario_comunicacao", melhorHorarioDoc);

      if (selfie) formData.append("selfie", selfie);
      if (documentoIdentidade) formData.append("documento_identidade", documentoIdentidade);
      if (comprovanteEndereco) formData.append("comprovante_endereco", comprovanteEndereco);
      if (comprovanteRenda) formData.append("comprovante_renda", comprovanteRenda);
      if (documentoIdentidadeConjuge) formData.append("documento_identidade_conjuge", documentoIdentidadeConjuge);
      if (certidaoEstadoCivil) formData.append("certidao_estado_civil", certidaoEstadoCivil);
      if (anexoProposta) formData.append("anexo_proposta", anexoProposta);

      if (hasSigned && canvasRef.current) {
        const signatureBase64 = canvasRef.current.toDataURL("image/png");
        formData.append("assinatura_base64", signatureBase64);
      }

      const result = await saveLeadDocumentationAction(formData);

      if (result.success) {
        setDocSuccess(true);
        router.refresh();
        setTimeout(() => {
          setActiveTab("kyc_view");
          window.location.reload();
        }, 500);
      } else {
        setDocError(result.error || "Ocorreu um erro ao salvar a documentação.");
      }
    } catch (err) {
      setDocError("Erro na leitura ou upload dos arquivos.");
    } finally {
      setSavingDoc(false);
    }
  };

  const handleIniciarAnalise = async () => {
    if (lead.status !== "Ficha") {
      const result = await updateLeadStatusAction(lead.id, "Ficha");
      if (result.success) {
        setStatusLead("Ficha");
        setActiveTab("kyc_edit");
        router.refresh();
      } else {
        alert(result.error || "Erro ao iniciar análise");
      }
    } else {
      setActiveTab("kyc_edit");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Cabeçalho superior: Retorno ao Funil e Nome do Cliente */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/dashboard");
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-teal transition-colors font-barlow tracking-widest uppercase cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao CRM
          </button>
          <h2 className="text-2xl font-black text-brand-blue tracking-wide uppercase font-barlow">
            {lead.nome}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-full text-xs font-bold uppercase font-barlow tracking-wider">
              CRM status: {lead.status}
            </span>
            <span className="px-2.5 py-0.5 bg-brand-teal/10 border border-brand-teal/20 text-brand-teal rounded-full text-xs font-bold uppercase font-barlow tracking-wider">
              {lead.tipo_consorcio}
            </span>
            {lead.vendedor_anterior && (
              <span className="px-2.5 py-0.5 bg-amber-100 border border-amber-200 text-amber-700 rounded-full text-xs font-bold uppercase font-barlow tracking-wider" title={`Transferido de: ${lead.vendedor_anterior.nome}`}>
                Transferido de: {lead.vendedor_anterior.nome.split(" ")[0]}
              </span>
            )}
          </div>
        </div>

        {/* Informações Básicas Rápidas */}
        <div className="flex items-center gap-3">
          <div className="text-right bg-slate-50 border border-slate-200 p-3 rounded-2xl">
            <p className="text-xs font-bold text-slate-400 uppercase font-barlow">Valor do Crédito</p>
            <p className="font-extrabold text-brand-blue text-sm">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(lead.valor_desejado)}
            </p>
          </div>
          
          <button
            onClick={handleIniciarAnalise}
            className="flex items-center gap-2 bg-brand-teal hover:bg-teal-600 text-white px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider font-barlow shadow-lg shadow-brand-teal/20 transition-all"
          >
            <FileCheck2 className="w-4 h-4" />
            Iniciar Análise de Crédito
          </button>
        </div>
      </div>

      {/*  SISTEMA DE ABAS (ORGANIZAÇÃO UX - ANTI-POLUIÇÃO VISUAL) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap border-b border-slate-100 pb-3 gap-2 sm:gap-4 shrink-0">
          {lead.documentacao && (
            <button
              onClick={() => setActiveTab("kyc_view")}
              className={`px-4 py-2 font-barlow font-bold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer ${
                activeTab === "kyc_view"
                  ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                  : "bg-slate-50 text-slate-600 hover:text-brand-blue hover:bg-slate-100/80"
              }`}
            >
               Ficha KYC Ativa
            </button>
          )}

          <button
            onClick={() => setActiveTab("kyc_edit")}
            className={`px-4 py-2 font-barlow font-bold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer ${
              activeTab === "kyc_edit"
                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                : "bg-slate-50 text-slate-600 hover:text-brand-blue hover:bg-slate-100/80"
            }`}
          >
            {lead.documentacao ? " Atualizar Documentos & KYC" : " Criar Ficha KYC & Assinatura"}
          </button>

          <button
            onClick={() => setActiveTab("crm_data")}
            className={`px-4 py-2 font-barlow font-bold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer ${
              activeTab === "crm_data"
                ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                : "bg-slate-50 text-slate-600 hover:text-brand-blue hover:bg-slate-100/80"
            }`}
          >
             Dados Comerciais
          </button>
        </div>

        {/* ------------------ ABA 1: VISUALIZADOR DE KYC ------------------ */}
        {activeTab === "kyc_view" && lead.documentacao && (
          <div className="space-y-8 animate-fadeIn">
            {/* Cabeçalho da Ficha */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue flex items-center justify-center">
                <FileCheck2 className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800 font-barlow uppercase tracking-wider">Dados Cadastrais Consolidados (KYC)</h3>
                <p className="text-slate-500 text-xs">Ficha técnica gerada com os dados e assinaturas do cliente.</p>
              </div>
            </div>

            {/* Tabela de Dados Cadastrais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50 border border-slate-200 p-6 rounded-2xl">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">Nome Completo</p>
                <p className="text-sm font-bold text-slate-800">{lead.documentacao.nome}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">CPF do Cliente</p>
                <p className="text-sm font-bold text-slate-800">{lead.documentacao.cpf}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">Data de Nascimento</p>
                <p className="text-sm font-bold text-slate-800">
                  {new Date(lead.documentacao.data_nascimento).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">E-mail</p>
                <p className="text-sm font-bold text-slate-800 truncate" title={lead.documentacao.email}>{lead.documentacao.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">Telefone</p>
                <p className="text-sm font-bold text-slate-800">{lead.documentacao.celular}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">Melhor Horário para Contato</p>
                <p className="text-sm font-bold text-slate-800">{lead.documentacao.melhor_horario_comunicacao}</p>
              </div>
            </div>

            {/* Documentos Anexados */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider font-barlow border-b border-slate-100 pb-2">Documentos KYC Anexados</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Selfie */}
                <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-brand-teal/40 transition-colors shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">Selfie com Documento</p>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Imagem de Segurança</p>
                    </div>
                  </div>
                  <a
                    href={lead.documentacao.selfie_url}
                    target="_blank"
                    className="p-2 bg-slate-50 hover:bg-brand-blue/10 border border-slate-200 hover:border-brand-blue/20 text-slate-500 hover:text-brand-blue rounded-lg transition-all"
                    title="Visualizar Selfie"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                </div>

                {/* Identidade */}
                <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-brand-teal/40 transition-colors shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">Documento de Identidade (RG/CNH)</p>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Identificação Civil</p>
                    </div>
                  </div>
                  <a
                    href={lead.documentacao.documento_identidade_url}
                    target="_blank"
                    className="p-2 bg-slate-50 hover:bg-brand-blue/10 border border-slate-200 hover:border-brand-blue/20 text-slate-500 hover:text-brand-blue rounded-lg transition-all"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                </div>

                {/* Comprovante Endereco */}
                <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-brand-teal/40 transition-colors shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">Comprovante de Residência</p>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Endereço Atualizado</p>
                    </div>
                  </div>
                  <a
                    href={lead.documentacao.comprovante_endereco_url}
                    target="_blank"
                    className="p-2 bg-slate-50 hover:bg-brand-blue/10 border border-slate-200 hover:border-brand-blue/20 text-slate-500 hover:text-brand-blue rounded-lg transition-all"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                </div>

                {/* Comprovante Renda */}
                {lead.documentacao.comprovante_renda_url && (
                  <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-brand-teal/40 transition-colors shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">Comprovante de Renda</p>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">Holerite / Extrato</p>
                      </div>
                    </div>
                    <a
                      href={lead.documentacao.comprovante_renda_url}
                      target="_blank"
                      className="p-2 bg-slate-50 hover:bg-brand-blue/10 border border-slate-200 hover:border-brand-blue/20 text-slate-500 hover:text-brand-blue rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {/* RG Conjuge */}
                {lead.documentacao.documento_identidade_conjuge_url && (
                  <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-brand-teal/40 transition-colors shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">Identificação do Cônjuge</p>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">RG Cônjuge</p>
                      </div>
                    </div>
                    <a
                      href={lead.documentacao.documento_identidade_conjuge_url}
                      target="_blank"
                      className="p-2 bg-slate-50 hover:bg-brand-blue/10 border border-slate-200 hover:border-brand-blue/20 text-slate-500 hover:text-brand-blue rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {/* Certidao Casamento */}
                {lead.documentacao.certidao_estado_civil_url && (
                  <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-brand-teal/40 transition-colors shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">Certidão de Estado Civil</p>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">Documentação Civil</p>
                      </div>
                    </div>
                    <a
                      href={lead.documentacao.certidao_estado_civil_url}
                      target="_blank"
                      className="p-2 bg-slate-50 hover:bg-brand-blue/10 border border-slate-200 hover:border-brand-blue/20 text-slate-500 hover:text-brand-blue rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {/* Anexo Proposta */}
                {lead.documentacao.anexo_proposta_url && (
                  <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-brand-teal/40 transition-colors shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">Proposta Física Digitalizada</p>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">PDF ou Imagem da Proposta</p>
                      </div>
                    </div>
                    <a
                      href={lead.documentacao.anexo_proposta_url}
                      target="_blank"
                      className="p-2 bg-slate-50 hover:bg-brand-blue/10 border border-slate-200 hover:border-brand-blue/20 text-slate-500 hover:text-brand-blue rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Assinatura do Cliente */}
            <div className="space-y-4 border-t border-slate-100 pt-5">
              <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider font-barlow">Assinatura Formal do Cliente</h4>
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center max-w-sm">
                <img
                  src={lead.documentacao.assinatura_url}
                  alt="Assinatura digital do cliente"
                  className="max-h-24 object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* ------------------ ABA 2: PREENCHER/EDITAR FICHA KYC ------------------ */}
        {activeTab === "kyc_edit" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue flex items-center justify-center">
                <FileSignature className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800 font-barlow uppercase tracking-wider">
                  {lead.documentacao ? "Atualizar KYC & Enviar Novos Arquivos" : "Preencher Ficha KYC Inicial"}
                </h3>
                <p className="text-slate-500 text-xs">Informe os dados técnicos de KYC e envie os documentos obrigatórios do cliente.</p>
              </div>
            </div>

            {docError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2 animate-shake">
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
                <span>{docError}</span>
              </div>
            )}

            {docSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-250 text-emerald-800 text-sm flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                <span>Documentação salva e atualizada com sucesso!</span>
              </div>
            )}

            <form onSubmit={handleSaveDocumentation} className="space-y-6">
              {/* Informações pessoais da Ficha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Nome Completo do Cliente</label>
                  <input
                    type="text"
                    required
                    value={nomeDoc}
                    onChange={(e) => setNomeDoc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">CPF</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={cpfDoc}
                    onChange={(e) => setCpfDoc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Data de Nascimento</label>
                  <input
                    type="date"
                    required
                    value={dataNascimentoDoc}
                    onChange={(e) => setDataNascimentoDoc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-850 text-sm outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">E-mail do Cliente</label>
                  <input
                    type="email"
                    required
                    value={emailDoc}
                    onChange={(e) => setEmailDoc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={celularDoc}
                    onChange={(e) => setCelularDoc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Melhor Horário Contato</label>
                  <select
                    value={melhorHorarioDoc}
                    onChange={(e) => setMelhorHorarioDoc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-sm outline-none cursor-pointer"
                  >
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                    <option value="Qualquer Horário">Qualquer Horário</option>
                  </select>
                </div>
              </div>

              {/* Uploads de Arquivos */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider font-barlow border-t border-slate-100 pt-5">
                  Anexar Arquivos do Cliente (Imagens ou PDF)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Selfie */}
                  <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wide block font-barlow">
                      Selfie do Cliente {!lead.documentacao && <span className="text-red-500 font-bold">*</span>}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelfie(e.target.files ? e.target.files[0] : null)}
                      className="text-xs text-slate-500 mt-1 block w-full file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-blue/10 file:text-brand-blue file:cursor-pointer hover:file:bg-brand-blue/20"
                    />
                  </div>

                  {/* Identidade */}
                  <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wide block font-barlow">
                      Documento Identidade (RG/CNH) {!lead.documentacao && <span className="text-red-500 font-bold">*</span>}
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setDocumentoIdentidade(e.target.files ? e.target.files[0] : null)}
                      className="text-xs text-slate-500 mt-1 block w-full file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-blue/10 file:text-brand-blue file:cursor-pointer hover:file:bg-brand-blue/20"
                    />
                  </div>

                  {/* Residência */}
                  <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wide block font-barlow">
                      Comprovante de Residência {!lead.documentacao && <span className="text-red-500 font-bold">*</span>}
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setComprovanteEndereco(e.target.files ? e.target.files[0] : null)}
                      className="text-xs text-slate-500 mt-1 block w-full file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-blue/10 file:text-brand-blue file:cursor-pointer hover:file:bg-brand-blue/20"
                    />
                  </div>

                  {/* Renda */}
                  <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wide block font-barlow">
                      Comprovante de Renda {!lead.documentacao && <span className="text-red-500 font-bold">*</span>}
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setComprovanteRenda(e.target.files ? e.target.files[0] : null)}
                      className="text-xs text-slate-500 mt-1 block w-full file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-blue/10 file:text-brand-blue file:cursor-pointer hover:file:bg-brand-blue/20"
                    />
                  </div>

                  {/* Cônjuge */}
                  <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wide block font-barlow">RG/CNH Cônjuge (Opcional)</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setDocumentoIdentidadeConjuge(e.target.files ? e.target.files[0] : null)}
                      className="text-xs text-slate-500 mt-1 block w-full file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-blue/10 file:text-brand-blue file:cursor-pointer"
                    />
                  </div>

                  {/* Estado Civil */}
                  <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wide block font-barlow">Certidão Casamento (Opcional)</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setCertidaoEstadoCivil(e.target.files ? e.target.files[0] : null)}
                      className="text-xs text-slate-500 mt-1 block w-full file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-blue/10 file:text-brand-blue file:cursor-pointer"
                    />
                  </div>

                  {/* Proposta */}
                  <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wide block font-barlow">Anexo Proposta Física (Opcional)</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => setAnexoProposta(e.target.files ? e.target.files[0] : null)}
                      className="text-xs text-slate-500 mt-1 block w-full file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-blue/10 file:text-brand-blue file:cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Canvas de Assinatura */}
              <div className="space-y-3 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">
                    Assinatura Digital na Tela {!lead.documentacao && <span className="text-red-500 font-bold">*</span>}
                  </label>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer font-barlow uppercase"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    Limpar Assinatura
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-2 bg-slate-50 relative">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-48 bg-white border border-slate-200 rounded-xl cursor-crosshair touch-none"
                  />
                  {!hasSigned && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 flex-col gap-2">
                      <PenTool className="w-8 h-8 text-slate-300" />
                      <span className="text-xs font-bold tracking-wide uppercase font-barlow">Desenhe a assinatura do cliente aqui</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirmar */}
              <button
                type="submit"
                disabled={savingDoc}
                className="w-full py-3.5 bg-brand-blue   hover:opacity-95 text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-lg shadow-brand-blue/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-barlow tracking-wider uppercase"
              >
                <Upload className="w-4 h-4 text-white" />
                <span>{savingDoc ? "Processando e Enviando..." : "Confirmar e Enviar Ficha Cadastral"}</span>
              </button>
            </form>
          </div>
        )}

        {/* ------------------ ABA 3: DADOS COMERCIAIS / CRM ------------------ */}
        {activeTab === "crm_data" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header da proposta */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-brand-blue" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800 font-barlow uppercase tracking-wider">Dados Básicos da Proposta Comercial</h3>
                <p className="text-slate-500 text-xs">Controle operacional de status, valores e atribuições comerciais.</p>
              </div>
            </div>

            {leadError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2 animate-shake">
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
                <span>{leadError}</span>
              </div>
            )}

            {leadSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-250 text-emerald-800 text-sm flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                <span>Dados de proposta atualizados!</span>
              </div>
            )}

            {!isEditingCrm ? (
              /* MODO LEITURA (Spacious & Clean - Não Poluído) */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">Nome do Lead</p>
                    <p className="text-sm font-bold text-slate-800">{lead.nome}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">WhatsApp de Contato</p>
                    <button
                      type="button"
                      onClick={() => handleOpenWhatsapp(lead.telefone, lead.nome)}
                      className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors flex items-center gap-1.5"
                    >
                      <Phone className="w-4 h-4" />
                      {lead.telefone}
                    </button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">E-mail</p>
                    <p className="text-sm font-bold text-slate-800">{lead.email || "Não cadastrado"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">Consórcio Selecionado</p>
                    <p className="text-sm font-bold text-slate-800">{lead.tipo_consorcio}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">Crédito Desejado</p>
                    <p className="text-sm font-bold text-brand-blue">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(lead.valor_desejado)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">Parcela Máxima</p>
                    <p className="text-sm font-bold text-slate-800">
                      {lead.valor_parcela
                        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(lead.valor_parcela)
                        : "Não informada"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">Valor de Entrada</p>
                    <p className="text-sm font-bold text-slate-800">
                      {lead.valor_entrada
                        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(lead.valor_entrada)
                        : "Não informado"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">Status do Funil</p>
                    <p className="text-sm font-bold text-brand-teal uppercase tracking-wider font-barlow">{lead.status}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">Localização / Bairro</p>
                    <p className="text-sm font-bold text-slate-800">{lead.localizacao || "Não informada"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">Origem do Contato</p>
                    <p className="text-sm font-bold text-slate-800">{lead.origem || "Não informada"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">Vendedor Atribuído</p>
                    <p className="text-sm font-bold text-slate-800">{lead.vendedor.nome}</p>
                  </div>
                  {lead.status === "Agendado" && lead.data_agendamento && (
                    <div className="space-y-1 bg-purple-50/70 p-2.5 -m-2 rounded-xl border border-purple-200">
                      <p className="text-xs font-bold text-purple-700 uppercase tracking-wider font-barlow flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-purple-600" />
                        Compromisso ({lead.tipo_agendamento || "Presencial"})
                      </p>
                      <p className="text-sm font-extrabold text-purple-900">
                        {formatDateTimeBR(lead.data_agendamento)}
                      </p>
                    </div>
                  )}
                  {lead.retornar_contato && lead.data_retorno && (
                    <div className="space-y-1 bg-amber-50/50 p-2 -m-2 rounded-lg border border-amber-100">
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wider font-barlow">Retorno Agendado</p>
                      <p className="text-sm font-bold text-amber-700 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {formatDateTimeBR(lead.data_retorno)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bloco de Observações */}
                <div className="space-y-2 bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-barlow">Anotações e Histórico Comercial</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed italic">
                    {lead.observacoes || "Nenhuma observação ou anotação inserida."}
                  </p>
                </div>

                {/* Ação de alternar para Edição */}
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setIsEditingCrm(true)}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-750 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] font-barlow uppercase tracking-wider"
                  >
                    Editar Informações da Proposta
                  </button>
                </div>
              </div>
            ) : (
              /* MODO FORMULÁRIO DE EDIÇÃO (Aparece sob demanda!) */
              <form onSubmit={handleUpdateLead} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={nomeLead}
                      onChange={(e) => setNomeLead(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow font-medium">WhatsApp</label>
                    <input
                      type="text"
                      required
                      value={telefoneLead}
                      onChange={(e) => setTelefoneLead(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">E-mail</label>
                    <input
                      type="email"
                      value={emailLead}
                      onChange={(e) => setEmailLead(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Consórcio</label>
                    <select
                      value={tipoConsorcioLead}
                      onChange={(e) => setTipoConsorcioLead(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-sm outline-none cursor-pointer"
                    >
                      <option value="Imóvel">Imóvel</option>
                      <option value="Veículo">Veículo</option>
                      <option value="Serviços">Serviços</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow font-medium">Valor Desejado</label>
                    <input
                      type="number"
                      required
                      value={valorDesejadoLead}
                      onChange={(e) => setValorDesejadoLead(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Status do Lead</label>
                    <select
                      value={statusLead}
                      onChange={(e) => setStatusLead(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-sm outline-none cursor-pointer"
                    >
                      {statusList.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {statusLead === "Ficha" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow text-brand-teal">Correspondente / Adm</label>
                      <select
                        value={correspondenteIdLead}
                        onChange={(e) => setCorrespondenteIdLead(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-brand-teal/40 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-sm outline-none cursor-pointer"
                      >
                        <option value="">Selecione o Correspondente...</option>
                        {correspondentes.filter(c => c.ativo).map((c) => (
                          <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {statusLead === "Agendado" && (
                    <div className="space-y-4 col-span-1 sm:col-span-2 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow text-amber-700">Tipo de Agendamento</label>
                        <select
                          value={tipoAgendamentoLead}
                          onChange={(e) => setTipoAgendamentoLead(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-amber-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-slate-700 text-sm outline-none cursor-pointer"
                        >
                          <option value="LIGAÇÃO">Lembrete de Ligação </option>
                          <option value="PRESENCIAL">Reunião Presencial / Visita </option>
                          <option value="ONLINE">Reunião Online </option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow text-amber-700">Data e Hora do Agendamento</label>
                        <input
                          type="datetime-local"
                          value={dataAgendamentoLead}
                          onChange={(e) => setDataAgendamentoLead(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-amber-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-slate-800 text-sm outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow font-medium">Localização</label>
                    <input
                      type="text"
                      placeholder="Ex: Pinheirinho, Centro"
                      value={localizacaoLead}
                      onChange={(e) => setLocalizacaoLead(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                    />
                  </div>

                  {/* Agendar Retorno */}
                  <div className="space-y-4 col-span-1 sm:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-200 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 font-barlow tracking-wide">Entrar em contato novamente?</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Agendar um follow-up com este lead.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={retornarContatoLead}
                          onChange={(e) => setRetornarContatoLead(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    {retornarContatoLead && (
                      <div className="space-y-1.5 pt-3 border-t border-slate-200">
                        <label className="text-xs font-bold text-amber-600 uppercase tracking-wider block font-barlow">Data e Hora do Retorno</label>
                        <input
                          type="datetime-local"
                          value={dataRetornoLead}
                          onChange={(e) => setDataRetornoLead(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-amber-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-slate-800 text-sm outline-none cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Origem</label>
                    <input
                      type="text"
                      value={origemLead}
                      onChange={(e) => setOrigemLead(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Valor Parcela Máxima (Opcional)</label>
                    <input
                      type="number"
                      value={valorParcelaLead}
                      onChange={(e) => setValorParcelaLead(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Valor de Entrada (Opcional)</label>
                    <input
                      type="number"
                      value={valorEntradaLead}
                      onChange={(e) => setValorEntradaLead(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                    />
                  </div>

                  {(user.role === "ADM" || user.role === "SECRETARIA") && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Vendedor Responsável</label>
                      <select
                        value={vendedorIdLead}
                        onChange={(e) => setVendedorIdLead(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-755 text-sm outline-none cursor-pointer"
                      >
                        <option value={lead.vendedor_id}>{lead.vendedor.nome} (Atual)</option>
                        {vendedores
                          .filter((v) => v.id !== lead.vendedor_id)
                          .map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.nome}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Observações / Anotações do Contato</label>
                  <textarea
                    value={observacoesLead}
                    onChange={(e) => setObservacoesLead(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none resize-none"
                  />
                </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Etiquetas do Lead</label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {tags.map(tag => {
                        const isSelected = leadTags.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleToggleTag(tag.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-2 ${isSelected ? "text-white scale-105 shadow-md" : "text-slate-500 bg-slate-50 hover:bg-slate-100"}`}
                            style={isSelected ? { backgroundColor: tag.cor, borderColor: tag.cor } : { borderColor: "transparent" }}
                          >
                            {tag.nome}
                          </button>
                        );
                      })}
                      {tags.length === 0 && (
                        <p className="text-xs text-slate-400 italic">Nenhuma etiqueta cadastrada pelo ADM.</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-1.5 pt-2 border-t border-slate-100 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingCrm(false)}
                    className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs font-barlow uppercase transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={updatingLead}
                    className="px-5 py-2.5 bg-brand-blue   hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-brand-blue/20 transition-all cursor-pointer font-barlow uppercase tracking-wider"
                  >
                    {updatingLead ? "Processando..." : "Salvar Alterações"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* MODAL MENSAGEM WHATSAPP */}
      {whatsappModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40  p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-800 font-barlow uppercase tracking-wider">Enviar Mensagem</h3>
                <p className="text-slate-500 text-xs">Personalize a mensagem para {whatsappModal.name.split(" ")[0]}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Mensagem via WhatsApp</label>
                <textarea
                  required
                  rows={4}
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-800 text-sm outline-none resize-none"
                  placeholder="Digite sua mensagem aqui..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWhatsappModal(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider font-barlow transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSendWhatsapp}
                  disabled={!whatsappMessage.trim()}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-barlow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Abrir WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
