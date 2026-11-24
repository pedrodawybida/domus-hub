"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap, BookOpen, CalendarDays, CheckSquare, Tv, Mic, MicOff,
  Trophy, Flame, Star, Plus, Trash2, ChevronRight, Play, ExternalLink,
  FileText, Link as LinkIcon, ClipboardList, X, ChevronDown, ChevronUp,
  Zap, Target, Award, Users, Volume2, Send, Loader2, Eye, EyeOff,
  Clock, Check, AlertCircle, Bookmark, BookmarkCheck, RotateCcw, MessageCircle
} from "lucide-react";
import {
  criarModuloAction, atualizarModuloAction, deletarModuloAction,
  criarAulaAction, atualizarAulaAction, reordenarAulasAction, deletarAulaAction, concluirAulaAction, uploadAcademyFileAction,
  salvarPaginaPdfAction,
  criarTarefaAction, concluirTarefaAction, deletarTarefaAction,
  criarAgendamentoAction, deletarAgendamentoAction,
  criarLiveAction, deletarLiveAction,
} from "@/app/actions/academy";

const MODULE_ICONS = { book: BookOpen, target: Target, video: Play, file: FileText, award: Trophy, team: Users };
type ModuleIconName = keyof typeof MODULE_ICONS;
const MODULE_ICON_VALUES: Record<ModuleIconName, string> = {
  book: "\u{1F4DA}", target: "\u{1F3AF}", video: "\u{1F3AC}",
  file: "\u{1F4C4}", award: "\u{1F3C6}", team: "\u{1F465}",
};

function normalizeModuleIcon(name: string | null): ModuleIconName {
  if (name && name in MODULE_ICONS) return name as ModuleIconName;
  const match = Object.entries(MODULE_ICON_VALUES).find(([, value]) => value === name)?.[0];
  return (match as ModuleIconName | undefined) || "book";
}

function renderModuleIcon(name: string | null, className = "w-6 h-6") {
  const Icon = MODULE_ICONS[normalizeModuleIcon(name)];
  return <Icon className={className} aria-hidden="true" />;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Aula {
  id: string; modulo_id: string; titulo: string; tipo: string;
  conteudo: string; ordem: number; duracao_min: number | null;
  progressos: { concluido: boolean; xp_ganho: number; pagina_atual?: number | null }[];
}
interface Modulo {
  id: string; titulo: string; descricao: string; ordem: number;
  icone: string | null; publicado: boolean; aulas: Aula[];
}
interface Tarefa {
  id: string; user_id: string; titulo: string; descricao: string;
  prazo: string | null; concluida: boolean; concluida_em: string | null;
  user: { id: string; nome: string };
  criador: { id: string; nome: string };
}
interface Agendamento {
  id: string; user_id: string; titulo: string; descricao: string | null;
  data_hora: string; criado_por: string;
  user: { id: string; nome: string };
}
interface Live {
  id: string; titulo: string; descricao: string | null; url: string;
  data_live: string | null; thumbnail: string | null; publicado: boolean;
}
interface RankingItem { user_id: string; nome: string; xp: number; }
interface AcademyData {
  modulos: Modulo[]; tarefas: Tarefa[]; agendamentos: Agendamento[];
  lives: Live[]; ranking: RankingItem[]; meuXP: number; streak: number;
}
interface Vendedor { id: string; nome: string; role: string; }

interface Props {
  user: { id: string; nome: string; role: string; };
  initialData: AcademyData | null;
  vendedores: Vendedor[];
}

type Tab = "inicio" | "modulos" | "agenda" | "tarefas" | "lives" | "objecoes";

// ─── Helper: extract YouTube embed URL ────────────────────────────────────────
function getYouTubeEmbed(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const pat of patterns) {
    const m = url.match(pat);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}

// ─── Helper: extract Google Drive preview URL ─────────────────────────────────
function getDrivePreviewUrl(url: string): string {
  if (!url) return "";
  if (url.includes("drive.google.com/file/d/")) {
    return url.replace(/\/view.*$/, "/preview");
  }
  return url;
}

// ─── Helper: extract PDF viewer URL with page anchor ──────────────────────────
function getPdfViewerUrl(url: string, page?: number): string {
  if (!url) return "";
  let target = url;
  if (target.includes("drive.google.com/file/d/")) {
    target = target.replace(/\/view.*$/, "/preview");
  }
  target = target.split("#")[0];
  if (page && page > 0) {
    return `${target}#page=${page}`;
  }
  return target;
}

// ─── Objeções Scenarios ────────────────────────────────────────────────────────
const CENARIOS_OBJECOES = [
  "Estou ocupado agora, liga mais tarde",
  "Não tenho dinheiro para parcela",
  "Prefiro fazer financiamento bancário",
  "Não conheço a Domus, não sei se confio",
  "Já tenho consórcio com outra empresa",
  "Não preciso disso agora",
  "É muito caro para mim",
  "Preciso falar com minha esposa/marido antes",
];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AcademyClient({ user, initialData, vendedores }: Props) {
  const router = useRouter();
  const isAdm = user.role === "ADM";
  const [activeTab, setActiveTab] = useState<Tab>("inicio");
  const [data, setData] = useState<AcademyData | null>(initialData);

  // Sincronizar dados quando o servidor recarregar via router.refresh()
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // ── Módulos / Aulas state ──
  const [expandedModulo, setExpandedModulo] = useState<string | null>(null);
  const [expandedAula, setExpandedAula] = useState<string | null>(null);
  const [showNovoModulo, setShowNovoModulo] = useState(false);
  const [novoModulo, setNovoModulo] = useState({ titulo: "", descricao: "", icone: MODULE_ICON_VALUES.book });
  const [editandoModulo, setEditandoModulo] = useState<string | null>(null); // modulo_id em edição
  const [editModuloForm, setEditModuloForm] = useState({ titulo: "", descricao: "", icone: "" });
  const [showNovaAula, setShowNovaAula] = useState<string | null>(null); // modulo_id
  const [novaAula, setNovaAula] = useState({ titulo: "", tipo: "VIDEO", conteudo: "", duracao_min: "" });
  const [editandoAula, setEditandoAula] = useState<string | null>(null); // aula_id em edição
  const [editAulaForm, setEditAulaForm] = useState({ titulo: "", tipo: "VIDEO", conteudo: "", duracao_min: "" });
  const [novoExercicio, setNovoExercicio] = useState({ pergunta: "", opcoes: [{ texto: "", correta: true }, { texto: "", correta: false }] });
  const [respostasExercicios, setRespostasExercicios] = useState<Record<string, number>>({});
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [xpToast, setXpToast] = useState<{ xp: number } | null>(null);

  // ── Marcador de Páginas PDF state ──
  const [pdfMarcadores, setPdfMarcadores] = useState<Record<string, number>>({});
  const [pdfPaginaInput, setPdfPaginaInput] = useState<Record<string, number>>({});
  const [pdfPaginaAtiva, setPdfPaginaAtiva] = useState<Record<string, number>>({});
  const [iframeReloadKeys, setIframeReloadKeys] = useState<Record<string, number>>({});
  const [salvandoMarcador, setSalvandoMarcador] = useState<Record<string, boolean>>({});
  const [feedbackSalvo, setFeedbackSalvo] = useState<Record<string, boolean>>({});

  // Sincronizar marcadores de página a partir dos dados do servidor e localStorage
  useEffect(() => {
    if (!data?.modulos) return;
    const initialMarcadores: Record<string, number> = {};
    const initialInputs: Record<string, number> = {};

    data.modulos.forEach((m) => {
      m.aulas.forEach((a) => {
        if (a.tipo === "PDF") {
          let pag = a.progressos?.[0]?.pagina_atual || 1;
          if (typeof window !== "undefined") {
            const local = localStorage.getItem(`domus_academy_pdf_page_${a.id}`);
            if (local && !isNaN(Number(local))) {
              const localNum = Number(local);
              if (localNum > pag) pag = localNum;
            }
          }
          initialMarcadores[a.id] = pag;
          initialInputs[a.id] = pag;
        }
      });
    });

    setPdfMarcadores((prev) => ({ ...initialMarcadores, ...prev }));
    setPdfPaginaInput((prev) => ({ ...initialInputs, ...prev }));
  }, [data]);

  const handleSalvarMarcador = async (aulaId: string) => {
    const inputVal = Number(pdfPaginaInput[aulaId]) || 1;
    const pagina = Math.max(1, Math.floor(inputVal));

    setSalvandoMarcador((prev) => ({ ...prev, [aulaId]: true }));
    setPdfMarcadores((prev) => ({ ...prev, [aulaId]: pagina }));
    setPdfPaginaAtiva((prev) => ({ ...prev, [aulaId]: pagina }));
    setIframeReloadKeys((prev) => ({ ...prev, [aulaId]: (prev[aulaId] || 0) + 1 }));

    if (typeof window !== "undefined") {
      localStorage.setItem(`domus_academy_pdf_page_${aulaId}`, String(pagina));
    }

    try {
      const res = await salvarPaginaPdfAction(aulaId, pagina);
      if (res.success) {
        setFeedbackSalvo((prev) => ({ ...prev, [aulaId]: true }));
        setTimeout(() => {
          setFeedbackSalvo((prev) => ({ ...prev, [aulaId]: false }));
        }, 2500);
      } else {
        alert(res.error || "Erro ao salvar marcador de página.");
      }
    } catch (err) {
      console.error("Erro ao salvar marcador de página:", err);
    } finally {
      setSalvandoMarcador((prev) => ({ ...prev, [aulaId]: false }));
    }
  };

  const handleIrParaPagina = (aulaId: string, pagina: number) => {
    const pag = Math.max(1, Math.floor(pagina));
    setPdfPaginaAtiva((prev) => ({ ...prev, [aulaId]: pag }));
    setPdfPaginaInput((prev) => ({ ...prev, [aulaId]: pag }));
    setIframeReloadKeys((prev) => ({ ...prev, [aulaId]: (prev[aulaId] || 0) + 1 }));
  };

  const alterarPaginaInput = (aulaId: string, delta: number) => {
    const atual = Number(pdfPaginaInput[aulaId]) || pdfMarcadores[aulaId] || 1;
    const nova = Math.max(1, atual + delta);
    setPdfPaginaInput((prev) => ({ ...prev, [aulaId]: nova }));
  };

  const handlePaginaInputChange = (aulaId: string, valor: string) => {
    const num = parseInt(valor, 10);
    setPdfPaginaInput((prev) => ({ ...prev, [aulaId]: isNaN(num) ? 1 : Math.max(1, num) }));
  };

  // ── Tarefas state ──
  const [showNovaTarefa, setShowNovaTarefa] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState({ user_id: "", titulo: "", descricao: "", prazo: "" });

  // ── Agendamentos state ──
  const [showNovoAgend, setShowNovoAgend] = useState(false);
  const [novoAgend, setNovoAgend] = useState({ user_id: isAdm ? "" : user.id, titulo: "", descricao: "", data_hora: "" });

  // ── Lives state ──
  const [showNovaLive, setShowNovaLive] = useState(false);
  const [novaLive, setNovaLive] = useState({ titulo: "", descricao: "", url: "", data_live: "" });

  // ── Objeções IA state ──
  const [cenarioAtivo, setCenarioAtivo] = useState(CENARIOS_OBJECOES[0]);
  const [objecoesChat, setObjecoesChat] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [objecoesInput, setObjecoesInput] = useState("");
  const [objecoesLoading, setObjecoesLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [treinoAtivo, setTreinoAtivo] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [objecoesChat]);

  // ── XP Toast ──
  const showXpToast = (xp: number) => {
    setXpToast({ xp });
    setTimeout(() => setXpToast(null), 3000);
  };

  // ─── Calculated values ────────────────────────────────────────────────────
  const totalAulas = data?.modulos.reduce((acc, m) => acc + m.aulas.length, 0) || 0;
  const aulasConcluidas = data?.modulos.reduce(
    (acc, m) => acc + m.aulas.filter((a) => a.progressos.some((p) => p.concluido)).length, 0
  ) || 0;
  const progressoPct = totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0;
  const tarefasPendentes = data?.tarefas.filter((t) => !t.concluida).length || 0;

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleCriarModulo = async () => {
    if (!novoModulo.titulo) return;
    const maxOrdem = (data?.modulos.length || 0) + 1;
    const r = await criarModuloAction({ ...novoModulo, ordem: maxOrdem, publicado: false });
    if (r.success) { router.refresh(); setShowNovoModulo(false); setNovoModulo({ titulo: "", descricao: "", icone: MODULE_ICON_VALUES.book }); }
  };

  const handleTogglePublish = async (m: Modulo) => {
    await atualizarModuloAction(m.id, { publicado: !m.publicado });
    router.refresh();
  };

  const handleDeleteModulo = async (id: string) => {
    if (!confirm("Deletar módulo e todas as aulas?")) return;
    await deletarModuloAction(id);
    router.refresh();
  };

  const handleAbrirEdicaoModulo = (e: React.MouseEvent, modulo: Modulo) => {
    e.stopPropagation();
    setEditandoModulo(modulo.id);
    setEditModuloForm({ titulo: modulo.titulo, descricao: modulo.descricao, icone: modulo.icone || MODULE_ICON_VALUES.book });
  };

  const handleSalvarEdicaoModulo = async (moduloId: string) => {
    if (!editModuloForm.titulo) return;
    await atualizarModuloAction(moduloId, editModuloForm);
    setEditandoModulo(null);
    router.refresh();
  };

  const handleAbrirEdicaoAula = (e: React.MouseEvent, aula: Aula) => {
    e.stopPropagation();
    setEditandoAula(aula.id);
    setEditAulaForm({ 
      titulo: aula.titulo, 
      tipo: aula.tipo, 
      conteudo: aula.tipo === 'EXERCICIO' ? '' : aula.conteudo, // Simplify: don't edit exercise content right now or add logic later
      duracao_min: aula.duracao_min ? String(aula.duracao_min) : "" 
    });
  };

  const handleSalvarEdicaoAula = async (aulaId: string) => {
    if (!editAulaForm.titulo) return;
    await atualizarAulaAction(aulaId, {
      titulo: editAulaForm.titulo,
      tipo: editAulaForm.tipo,
      conteudo: editAulaForm.conteudo,
      duracao_min: editAulaForm.duracao_min ? Number(editAulaForm.duracao_min) : undefined
    });
    setEditandoAula(null);
    router.refresh();
  };

  const handleMoveAula = async (e: React.MouseEvent, modulo: Modulo, index: number, direction: 'up' | 'down') => {
    e.stopPropagation();
    const newAulas = [...modulo.aulas];
    if (direction === 'up' && index > 0) {
      const temp = newAulas[index].ordem;
      newAulas[index].ordem = newAulas[index - 1].ordem;
      newAulas[index - 1].ordem = temp;
    } else if (direction === 'down' && index < newAulas.length - 1) {
      const temp = newAulas[index].ordem;
      newAulas[index].ordem = newAulas[index + 1].ordem;
      newAulas[index + 1].ordem = temp;
    } else {
      return;
    }
    
    // Prepare bulk update
    const reorders = [
      { id: newAulas[index].id, ordem: newAulas[index].ordem },
      { id: newAulas[direction === 'up' ? index - 1 : index + 1].id, ordem: newAulas[direction === 'up' ? index - 1 : index + 1].ordem }
    ];

    await reordenarAulasAction(reorders);
    router.refresh();
  };

  const handleCriarAula = async (moduloId: string) => {
    let finalConteudo = novaAula.conteudo;

    if (novaAula.tipo === "PDF" && pdfFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", pdfFile);
      const uploadResult = await uploadAcademyFileAction(formData);
      setIsUploading(false);
      
      if (uploadResult.success && uploadResult.url) {
        finalConteudo = uploadResult.url;
      } else {
        alert(uploadResult.error || "Erro ao fazer upload do PDF.");
        return;
      }
    } else if (novaAula.tipo === "EXERCICIO") {
      if (!novoExercicio.pergunta || novoExercicio.opcoes.some(o => !o.texto)) {
        alert("Preencha a pergunta e todas as opções do exercício.");
        return;
      }
      finalConteudo = JSON.stringify(novoExercicio);
    } else if (!finalConteudo) {
      return;
    }

    if (!novaAula.titulo) return;
    const maxOrdem = (data?.modulos.find((m) => m.id === moduloId)?.aulas.length || 0) + 1;
    const r = await criarAulaAction({ modulo_id: moduloId, ...novaAula, conteudo: finalConteudo, ordem: maxOrdem, duracao_min: novaAula.duracao_min ? Number(novaAula.duracao_min) : undefined });
    if (r.success) { 
      router.refresh(); 
      setShowNovaAula(null); 
      setNovaAula({ titulo: "", tipo: "VIDEO", conteudo: "", duracao_min: "" }); 
      setNovoExercicio({ pergunta: "", opcoes: [{ texto: "", correta: true }, { texto: "", correta: false }] });
      setPdfFile(null);
    }
  };

  const handleConcluirAula = async (aulaId: string) => {
    const r = await concluirAulaAction(aulaId);
    if (r.success) {
      showXpToast((r as any).xpGanho || 10);
      router.refresh();
    }
  };

  const handleCriarTarefa = async () => {
    if (!novaTarefa.user_id || !novaTarefa.titulo) return;
    const r = await criarTarefaAction({ ...novaTarefa, prazo: novaTarefa.prazo ? new Date(novaTarefa.prazo) : undefined });
    if (r.success) { router.refresh(); setShowNovaTarefa(false); setNovaTarefa({ user_id: "", titulo: "", descricao: "", prazo: "" }); }
  };

  const handleCriarAgend = async () => {
    if (!novoAgend.titulo || !novoAgend.data_hora || !novoAgend.user_id) return;
    const r = await criarAgendamentoAction({ ...novoAgend, data_hora: new Date(novoAgend.data_hora) });
    if (r.success) { router.refresh(); setShowNovoAgend(false); setNovoAgend({ user_id: isAdm ? "" : user.id, titulo: "", descricao: "", data_hora: "" }); }
  };

  const handleCriarLive = async () => {
    if (!novaLive.titulo || !novaLive.url) return;
    const r = await criarLiveAction({ ...novaLive, data_live: novaLive.data_live ? new Date(novaLive.data_live) : undefined, publicado: true });
    if (r.success) { router.refresh(); setShowNovaLive(false); setNovaLive({ titulo: "", descricao: "", url: "", data_live: "" }); }
  };

  // ─── Objeções IA ──────────────────────────────────────────────────────────
  const iniciarTreino = () => {
    setTreinoAtivo(true);
    setObjecoesChat([{
      role: "assistant",
      content: `Oi, eu vi seu anúncio... mas olha, "${cenarioAtivo}". O que você tem a dizer?`
    }]);
  };

  const enviarMensagemObjecao = async (texto: string) => {
    if (!texto.trim() || objecoesLoading) return;
    const novaMensagem = { role: "user" as const, content: texto };
    const novoChat = [...objecoesChat, novaMensagem];
    setObjecoesChat(novoChat);
    setObjecoesInput("");
    setObjecoesLoading(true);

    try {
      const historico = novoChat.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const systemPrompt = `Você é um cliente difícil que está sendo atendido por um vendedor de consórcio da Domus Consórcios.
      O cenário de objeção é: "${cenarioAtivo}".
      Seu papel é simular um cliente realista e cético. Faça objeções genuínas.
      Responda SEMPRE em português brasileiro. Seja natural, como uma conversa real de vendas.
      Não seja fácil — force o vendedor a usar argumentos sólidos sobre consórcio.
      Se o vendedor der uma boa resposta, demonstre interesse crescente, mas sempre com alguma dúvida.
      Mantenha respostas curtas (1-3 frases).
      IMPORTANTE: Nunca diga "deixa eu pensar" ou frases similares. Responda diretamente com a reação do cliente.`;

      const geminiKey = process.env.NEXT_PUBLIC_GEMINI_KEY || "";
      if (!geminiKey) {
        setObjecoesChat((prev) => [...prev, { role: "assistant", content: "Erro: chave da API não configurada. Verifique o NEXT_PUBLIC_GEMINI_KEY no .env." }]);
        setObjecoesLoading(false);
        return;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: historico,
          generationConfig: { maxOutputTokens: 150, temperature: 0.8 },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("Gemini API error:", response.status, errData);
        throw new Error(`API retornou status ${response.status}`);
      }

      const responseData = await response.json();
      const resposta = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!resposta) {
        console.error("Resposta vazia da API:", responseData);
        throw new Error("Resposta vazia");
      }
      setObjecoesChat((prev) => [...prev, { role: "assistant", content: resposta }]);

      // TTS nativo
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(resposta);
        utterance.lang = "pt-BR";
        utterance.rate = 0.95;
        speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error("Erro no treino de objeções:", err);
      setObjecoesChat((prev) => [...prev, { role: "assistant", content: "Erro ao conectar com a IA. Verifique sua conexão e tente novamente." }]);
    } finally {
      setObjecoesLoading(false);
    }
  };

  const toggleListening = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Seu navegador não suporta reconhecimento de voz. Use Chrome.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setObjecoesInput(text);
      setIsListening(false);
      enviarMensagemObjecao(text);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // ─── Rank Icons ───────────────────────────────────────────────────────────
  const rankIcon = (i: number) => i < 3
    ? <Trophy className="w-4 h-4 text-brand-blue" aria-hidden="true" />
    : `#${i + 1}`;

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "VIDEO": return <Play className="w-3.5 h-3.5" />;
      case "LINK": return <LinkIcon className="w-3.5 h-3.5" />;
      case "TEXTO": return <FileText className="w-3.5 h-3.5" />;
      case "EXERCICIO": return <ClipboardList className="w-3.5 h-3.5" />;
      case "PDF": return <BookOpen className="w-3.5 h-3.5" />;
      default: return <BookOpen className="w-3.5 h-3.5" />;
    }
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "inicio", label: "Início", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "modulos", label: "Módulos", icon: <BookOpen className="w-4 h-4" /> },
    { id: "agenda", label: "Agenda", icon: <CalendarDays className="w-4 h-4" /> },
    { id: "tarefas", label: "Tarefas", icon: <CheckSquare className="w-4 h-4" />, badge: tarefasPendentes },
    { id: "lives", label: "Lives", icon: <Tv className="w-4 h-4" /> },
    { id: "objecoes", label: "Treino IA", icon: <Mic className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* XP Toast */}
      {xpToast && (
        <div className="fixed top-6 right-6 z-50 bg-brand-blue   text-white font-bold px-6 py-3 rounded-2xl shadow-2xl shadow-orange-500/30 flex items-center gap-2 animate-bounce">
          <Zap className="w-5 h-5" />
          +{xpToast.xp} XP ganhos!
        </div>
      )}

      <section aria-labelledby="academy-title" className="rounded-md bg-brand-blue p-5 text-white sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h1 id="academy-title" className="font-barlow text-5xl font-bold tracking-tight sm:text-6xl">Domus Academy</h1>
          <dl className="flex gap-6 border-l border-white/35 pl-5">
            <div><dt className="text-sm text-white/80">Meus pontos</dt><dd className="font-barlow text-3xl font-bold">{data?.meuXP || 0} XP</dd></div>
            <div><dt className="text-sm text-white/80">Dias seguidos</dt><dd className="font-barlow text-3xl font-bold">{data?.streak || 0}</dd></div>
          </dl>
        </div>
        <div className="mt-7 flex justify-between border-t border-white/30 pt-4 text-sm">
          <span>{aulasConcluidas} de {totalAulas} aulas concluídas</span>
          <span>{progressoPct}%</span>
        </div>
        <progress aria-label="Progresso nas aulas" max={100} value={progressoPct} className="academy-progress mt-2 block h-1.5 w-full" />
      </section>

      {/* Tab Navigation */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-1.5 flex gap-1 shadow-sm overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            aria-pressed={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? "bg-brand-blue   text-white shadow-md shadow-brand-blue/20"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
            {tab.badge && tab.badge > 0 ? (
              <span className="min-w-4 px-1 h-4 bg-rose-500 text-white text-xs font-black rounded-full flex items-center justify-center">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ─── ABA INÍCIO ─────────────────────────────────────────────────── */}
      {activeTab === "inicio" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meta Diária */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-brand-blue" />
                <h3 className="font-black font-barlow text-slate-800 uppercase tracking-wide">Meta Diária de Estudo</h3>
              </div>
              <div className="text-center py-4">
                <div className="relative w-28 h-28 mx-auto mb-4">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface-subtle)" strokeWidth="12" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="var(--brand-primary)" strokeWidth="12"
                      strokeDasharray={`${(progressoPct / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-800">{progressoPct}%</span>
                    <span className="text-xs text-slate-500 font-bold">TOTAL</span>
                  </div>
                </div>
                <p className="text-slate-600 text-sm">
                  {aulasConcluidas === 0
                    ? "Nenhuma aula concluída. Abra um módulo para começar."
                    : `${aulasConcluidas} aula${aulasConcluidas !== 1 ? "s" : ""} concluída${aulasConcluidas !== 1 ? "s" : ""}.`}
                </p>
                {data?.streak && data.streak > 0 ? (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-xl text-xs font-bold">
                    <Flame className="w-3.5 h-3.5" />
                    {data.streak} dias seguidos de estudo
                  </div>
                ) : null}
              </div>
            </div>

            {/* Ranking Top 5 */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="font-black font-barlow text-slate-800 uppercase tracking-wide">Ranking de Estudo</h3>
              </div>
              {!data?.ranking || data.ranking.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">Ainda não há pontos de estudo registrados.</p>
              ) : (
                <div className="space-y-2">
                  {data.ranking.slice(0, 5).map((r, i) => (
                    <div
                      key={r.user_id}
                      className={`flex items-center gap-3 p-3 rounded-xl ${r.user_id === user.id ? "bg-brand-blue/5 border border-brand-blue/20" : "bg-slate-50"}`}
                    >
                      <span className="text-lg w-8 text-center">{rankIcon(i)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{r.nome}</p>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-brand-blue   h-1.5 rounded-full"
                            style={{ width: `${data.ranking[0]?.xp ? (r.xp / data.ranking[0].xp) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-600 font-black text-sm">
                        <Zap className="w-3.5 h-3.5" />{r.xp}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tarefas Pendentes na home */}
          {tarefasPendentes > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <p className="text-amber-800 font-bold text-sm">
                  Você tem <strong>{tarefasPendentes}</strong> tarefa{tarefasPendentes !== 1 ? "s" : ""} pendente{tarefasPendentes !== 1 ? "s" : ""}!
                </p>
              </div>
              <button onClick={() => setActiveTab("tarefas")} className="flex items-center gap-1 text-amber-700 font-bold text-xs hover:text-amber-900 cursor-pointer">
                Ver tarefas <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── ABA MÓDULOS ────────────────────────────────────────────────── */}
      {activeTab === "modulos" && (
        <div className="space-y-4">
          {isAdm && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowNovoModulo(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue   text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-blue/20 hover:opacity-90 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Novo Módulo
              </button>
            </div>
          )}

          {/* Form Novo Módulo */}
          {showNovoModulo && (
            <div className="bg-white border border-brand-blue/20 rounded-2xl p-5 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3">Criar Novo Módulo</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select aria-label="Ícone do módulo" value={normalizeModuleIcon(novoModulo.icone)} onChange={(e) => setNovoModulo({ ...novoModulo, icone: MODULE_ICON_VALUES[e.target.value as ModuleIconName] })}
                  className="col-span-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal bg-white">
                  <option value="book">Livro</option><option value="target">Meta</option><option value="video">Vídeo</option><option value="file">Documento</option><option value="award">Desempenho</option><option value="team">Equipe</option>
                </select>
                <input value={novoModulo.titulo} onChange={(e) => setNovoModulo({ ...novoModulo, titulo: e.target.value })}
                  placeholder="Título do módulo *" className="col-span-2 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal" />
                <textarea value={novoModulo.descricao} onChange={(e) => setNovoModulo({ ...novoModulo, descricao: e.target.value })}
                  placeholder="Descrição do módulo" rows={2}
                  className="col-span-3 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal resize-none" />
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={handleCriarModulo} className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-brand-blue/90">Criar</button>
                <button onClick={() => setShowNovoModulo(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl cursor-pointer">Cancelar</button>
              </div>
            </div>
          )}

          {!data?.modulos || data.modulos.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
              <BookOpen className="w-10 h-10 mb-4 mx-auto text-brand-blue" aria-hidden="true" />
              <h3 className="text-xl font-black text-slate-800 font-barlow">Nenhum módulo disponível</h3>
              <p className="text-slate-500 text-sm mt-2">{isAdm ? "Crie um módulo para disponibilizar o conteúdo à equipe." : "Peça ao administrador para cadastrar um módulo."}</p>
            </div>
          ) : (
            data.modulos.map((modulo) => {
              const aulasConcMod = modulo.aulas.filter((a) => a.progressos.some((p) => p.concluido)).length;
              const pctMod = modulo.aulas.length > 0 ? Math.round((aulasConcMod / modulo.aulas.length) * 100) : 0;
              const isOpen = expandedModulo === modulo.id;

              return (
                <div key={modulo.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  {/* Módulo Header */}
                  <div
                    onClick={() => setExpandedModulo(isOpen ? null : modulo.id)}
                    className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="w-10 h-10 flex items-center justify-center text-brand-blue">{renderModuleIcon(modulo.icone)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-800 font-barlow">{modulo.titulo}</h3>
                        {!modulo.publicado && (
                          <span className="text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase">Rascunho</span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5 truncate">{modulo.descricao}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                          <div className="bg-brand-blue   h-1.5 rounded-full transition-all" style={{ width: `${pctMod}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 shrink-0">{aulasConcMod}/{modulo.aulas.length} aulas • {pctMod}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdm && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); handleTogglePublish(modulo); }}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${modulo.publicado ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" : "text-slate-400 bg-slate-100 hover:bg-slate-200"}`}
                            title={modulo.publicado ? "Despublicar" : "Publicar"}>
                            {modulo.publicado ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button onClick={(e) => handleAbrirEdicaoModulo(e, modulo)}
                            className="p-1.5 rounded-lg text-brand-blue bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer"
                            title="Editar módulo">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteModulo(modulo.id); }}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Form de Edição do Módulo */}
                  {editandoModulo === modulo.id && (
                    <div className="border-t border-brand-blue/20 bg-blue-50/50 p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                      <h4 className="font-bold text-slate-800 text-sm">Editar Módulo</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <select aria-label="Ícone do módulo" value={normalizeModuleIcon(editModuloForm.icone)} onChange={(e) => setEditModuloForm({ ...editModuloForm, icone: MODULE_ICON_VALUES[e.target.value as ModuleIconName] })}
                          className="col-span-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal bg-white">
                          <option value="book">Livro</option><option value="target">Meta</option><option value="video">Vídeo</option><option value="file">Documento</option><option value="award">Desempenho</option><option value="team">Equipe</option>
                        </select>
                        <input value={editModuloForm.titulo} onChange={(e) => setEditModuloForm({ ...editModuloForm, titulo: e.target.value })}
                          placeholder="Título *" className="col-span-2 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal bg-white" />
                        <textarea value={editModuloForm.descricao} onChange={(e) => setEditModuloForm({ ...editModuloForm, descricao: e.target.value })}
                          placeholder="Descrição" rows={2}
                          className="col-span-3 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal resize-none bg-white" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSalvarEdicaoModulo(modulo.id)} className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-brand-blue/90">Salvar</button>
                        <button onClick={() => setEditandoModulo(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl cursor-pointer">Cancelar</button>
                      </div>
                    </div>
                  )}

                  {/* Aulas */}
                  {isOpen && (
                    <div className="border-t border-slate-100 divide-y divide-slate-50">
                      {modulo.aulas.length === 0 && (
                        <div className="p-6 text-center text-slate-400 text-sm">
                          {isAdm ? "Nenhuma aula neste módulo. Adicione uma aula para continuar." : "Nenhuma aula disponível."}
                        </div>
                      )}
                      {modulo.aulas.map((aula, index) => {
                        const concluida = aula.progressos.some((p) => p.concluido);
                        const aulaAberta = expandedAula === aula.id;
                        const embedUrl = aula.tipo === "VIDEO" ? getYouTubeEmbed(aula.conteudo) : null;

                        return (
                          <div key={aula.id} className="bg-slate-50/30">
                            <div
                              onClick={() => setExpandedAula(aulaAberta ? null : aula.id)}
                              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${concluida ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                                {concluida ? <Check className="w-4 h-4" /> : getTipoIcon(aula.tipo)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate ${concluida ? "text-emerald-700 line-through opacity-70" : "text-slate-800"}`}>{aula.titulo}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded ${aula.tipo === "VIDEO" ? "bg-blue-50 text-blue-600" : aula.tipo === "EXERCICIO" ? "bg-purple-50 text-purple-600" : aula.tipo === "LINK" ? "bg-teal-50 text-teal-600" : "bg-slate-100 text-slate-500"}`}>
                                    {aula.tipo}
                                  </span>
                                  {aula.duracao_min && <span className="text-xs text-slate-400 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{aula.duracao_min}min</span>}
                                  {aula.tipo === "PDF" && pdfMarcadores[aula.id] && pdfMarcadores[aula.id] > 1 && !concluida && (
                                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-2xs">
                                      <Bookmark className="w-2.5 h-2.5 text-amber-500" />
                                      Parou na pág. {pdfMarcadores[aula.id]}
                                    </span>
                                  )}
                                  {!concluida && <span className="text-xs text-yellow-600 flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" />+10 XP</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isAdm && (
                                  <>
                                    {index > 0 && (
                                      <button onClick={(e) => handleMoveAula(e, modulo, index, 'up')} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer" title="Mover para cima">
                                        <ChevronUp className="w-4 h-4" />
                                      </button>
                                    )}
                                    {index < modulo.aulas.length - 1 && (
                                      <button onClick={(e) => handleMoveAula(e, modulo, index, 'down')} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer" title="Mover para baixo">
                                        <ChevronDown className="w-4 h-4" />
                                      </button>
                                    )}
                                    <button onClick={(e) => handleAbrirEdicaoAula(e, aula)}
                                      className="p-1 rounded-lg text-brand-blue hover:bg-blue-100 transition-all cursor-pointer"
                                      title="Editar aula">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); deletarAulaAction(aula.id).then(() => router.refresh()); }}
                                      className="p-1 rounded-lg text-rose-300 hover:text-rose-500 cursor-pointer" title="Deletar aula">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                                {aulaAberta ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                              </div>
                            </div>

                            {/* Form de Edição da Aula */}
                            {editandoAula === aula.id && (
                              <div className="bg-blue-50/50 p-4 border-t border-brand-blue/20" onClick={(e) => e.stopPropagation()}>
                                <h4 className="font-bold text-slate-800 text-sm mb-3">Editar Aula</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <input value={editAulaForm.titulo} onChange={(e) => setEditAulaForm({ ...editAulaForm, titulo: e.target.value })}
                                    placeholder="Título da aula *" className="col-span-2 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal bg-white" />
                                  <select value={editAulaForm.tipo} onChange={(e) => setEditAulaForm({ ...editAulaForm, tipo: e.target.value })}
                                    className="px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal bg-white" disabled>
                                    <option value={aula.tipo}>{aula.tipo} (Tipo não pode ser alterado aqui)</option>
                                  </select>
                                  <input value={editAulaForm.duracao_min} onChange={(e) => setEditAulaForm({ ...editAulaForm, duracao_min: e.target.value })}
                                    type="number" placeholder="Duração (min)" className="px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal bg-white" />
                                  {aula.tipo !== "EXERCICIO" && (
                                    <textarea value={editAulaForm.conteudo} onChange={(e) => setEditAulaForm({ ...editAulaForm, conteudo: e.target.value })}
                                      placeholder="Conteúdo / URL"
                                      rows={2} className="col-span-2 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal resize-none bg-white" />
                                  )}
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <button onClick={() => handleSalvarEdicaoAula(aula.id)} className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-brand-blue/90">Salvar</button>
                                  <button onClick={() => setEditandoAula(null)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl cursor-pointer">Cancelar</button>
                                </div>
                              </div>
                            )}

                            {/* Conteúdo da Aula */}
                            {aulaAberta && (
                              <div className="px-4 pb-4 space-y-3">
                                {aula.tipo === "VIDEO" && embedUrl && (
                                  <div className="rounded-xl overflow-hidden shadow-lg aspect-video">
                                    <iframe src={embedUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen className="w-full h-full" title={aula.titulo} />
                                  </div>
                                )}
                                {aula.tipo === "LINK" && (
                                  <a href={aula.conteudo} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-3 bg-teal-50 border border-teal-200 text-teal-700 font-bold text-sm rounded-xl hover:bg-teal-100 transition-all">
                                    <ExternalLink className="w-4 h-4" /> {aula.conteudo}
                                  </a>
                                )}
                                {aula.tipo === "TEXTO" && (
                                  <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                    {aula.conteudo}
                                  </div>
                                )}
                                {aula.tipo === "PDF" && (() => {
                                  const paginaSalva = pdfMarcadores[aula.id] || aula.progressos?.[0]?.pagina_atual || 1;
                                  const paginaAtiva = pdfPaginaAtiva[aula.id] || paginaSalva;
                                  const inputPagina = pdfPaginaInput[aula.id] ?? paginaSalva;
                                  const pdfUrl = getPdfViewerUrl(aula.conteudo, paginaAtiva);

                                  return (
                                    <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-700/60 aspect-[1/1.4] w-full bg-slate-900 flex flex-col">
                                      {/* Top Header */}
                                      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
                                        <div className="flex items-center gap-2">
                                          <BookOpen className="w-4 h-4 text-brand-teal" />
                                          <span className="text-xs font-bold font-barlow tracking-wide uppercase text-slate-200">
                                            Leitor de PDF
                                          </span>
                                          {paginaSalva > 1 && (
                                            <span className="ml-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                              <Bookmark className="w-2.5 h-2.5" />
                                              Parou na pág. {paginaSalva}
                                            </span>
                                          )}
                                        </div>

                                        {/* Retomar rápido se houver página salva */}
                                        {paginaSalva > 1 && (
                                          <div className="flex items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() => handleIrParaPagina(aula.id, paginaSalva)}
                                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
                                              title="Voltar para a página onde a leitura foi interrompida"
                                            >
                                              <RotateCcw className="w-3 h-3 text-amber-400" />
                                              Retomar na pág. {paginaSalva}
                                            </button>
                                            {paginaAtiva > 1 && (
                                              <button
                                                type="button"
                                                onClick={() => handleIrParaPagina(aula.id, 1)}
                                                className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer px-1.5 py-1"
                                                title="Voltar para a primeira página"
                                              >
                                                Início (pág. 1)
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      {/* Barra de Marcação de Leitura */}
                                      <div className="bg-slate-800/95 border-b border-slate-700/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-2 text-slate-300">
                                          <Bookmark className="w-4 h-4 text-amber-400 shrink-0" />
                                          <div>
                                            <span className="font-bold text-slate-200 text-xs">Marcador de Leitura:</span>
                                            <p className="text-xs text-slate-400">
                                              {paginaSalva > 1
                                                ? `Leitura dividida: você salvou a parada na pág. ${paginaSalva}`
                                                : "Marque a página quando precisar pausar a leitura"}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                          <div className="flex items-center bg-slate-900 rounded-xl border border-slate-700/80 p-0.5">
                                            <span className="px-2 text-xs text-slate-400 font-bold">Pág.</span>
                                            <button
                                              type="button"
                                              onClick={() => alterarPaginaInput(aula.id, -1)}
                                              className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg font-black text-sm cursor-pointer transition-colors"
                                              title="Diminuir página"
                                            >
                                              -
                                            </button>
                                            <input
                                              type="number"
                                              min={1}
                                              value={inputPagina}
                                              onChange={(e) => handlePaginaInputChange(aula.id, e.target.value)}
                                              className="w-12 text-center bg-transparent text-white font-black text-xs outline-none focus:text-brand-teal"
                                              placeholder="1"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => alterarPaginaInput(aula.id, 1)}
                                              className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg font-black text-sm cursor-pointer transition-colors"
                                              title="Aumentar página"
                                            >
                                              +
                                            </button>
                                          </div>

                                          <button
                                            type="button"
                                            disabled={salvandoMarcador[aula.id]}
                                            onClick={() => handleSalvarMarcador(aula.id)}
                                            className={`flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md ${
                                              feedbackSalvo[aula.id]
                                                ? "bg-emerald-600 text-white shadow-emerald-600/30"
                                                : "bg-brand-blue   hover: hover: text-white shadow-amber-500/20"
                                            }`}
                                          >
                                            {feedbackSalvo[aula.id] ? (
                                              <>
                                                <Check className="w-3.5 h-3.5 text-white" />
                                                <span>Página salva!</span>
                                              </>
                                            ) : salvandoMarcador[aula.id] ? (
                                              <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>Salvando...</span>
                                              </>
                                            ) : (
                                              <>
                                                <BookmarkCheck className="w-3.5 h-3.5" />
                                                <span>Marcar onde parei</span>
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      </div>

                                      {/* Banner se leitura foi interrompida */}
                                      {paginaSalva > 1 && paginaAtiva !== paginaSalva && (
                                        <div className="bg-brand-blue    border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
                                          <div className="flex items-center gap-2">
                                            <Bookmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                            <span>Sua leitura foi interrompida na <strong>página {paginaSalva}</strong>.</span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleIrParaPagina(aula.id, paginaSalva)}
                                            className="text-amber-400 font-bold hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                                          >
                                            Ir para pág. {paginaSalva} <ChevronRight className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      )}

                                      {/* Frame do visualizador */}
                                      <iframe
                                        key={`pdf-viewer-${aula.id}-${paginaAtiva}-${iframeReloadKeys[aula.id] || 0}`}
                                        src={pdfUrl}
                                        className="w-full flex-1 bg-white"
                                        title={aula.titulo}
                                      />
                                    </div>
                                  );
                                })()}
                                {aula.tipo === "EXERCICIO" && (() => {
                                  try {
                                    const ex = JSON.parse(aula.conteudo);
                                    if (ex.pergunta && ex.opcoes) {
                                      return (
                                        <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-700 text-sm">
                                          <p className="font-black text-lg font-barlow mb-4 text-slate-800">{ex.pergunta}</p>
                                          <div className="space-y-2">
                                            {ex.opcoes.map((opcao: any, idx: number) => {
                                              const selecionada = respostasExercicios[aula.id] === idx;
                                              const acertou = opcao.correta;
                                              return (
                                                <button
                                                  key={idx}
                                                  disabled={concluida}
                                                  onClick={() => setRespostasExercicios({ ...respostasExercicios, [aula.id]: idx })}
                                                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                                    selecionada && !concluida
                                                      ? "border-brand-blue bg-blue-50 text-brand-blue font-bold"
                                                      : concluida && acertou
                                                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold"
                                                      : concluida && selecionada && !acertou
                                                      ? "border-rose-500 bg-rose-50 text-rose-700 font-bold line-through opacity-70"
                                                      : "border-slate-100 hover:border-slate-300"
                                                  }`}
                                                >
                                                  <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                      selecionada && !concluida ? "border-brand-blue" : concluida && acertou ? "border-emerald-500 bg-emerald-500 text-white" : concluida && selecionada && !acertou ? "border-rose-500 bg-rose-500 text-white" : "border-slate-300"
                                                    }`}>
                                                      {concluida && acertou && <Check className="w-3 h-3" />}
                                                      {concluida && selecionada && !acertou && <X className="w-3 h-3" />}
                                                      {selecionada && !concluida && <div className="w-2 h-2 rounded-full bg-brand-blue" />}
                                                    </div>
                                                    {opcao.texto}
                                                  </div>
                                                </button>
                                              );
                                            })}
                                          </div>
                                          {!concluida && respostasExercicios[aula.id] !== undefined && (
                                            <div className="mt-6 flex justify-end">
                                              <button
                                                onClick={() => {
                                                  if (ex.opcoes[respostasExercicios[aula.id]].correta) {
                                                    handleConcluirAula(aula.id);
                                                  } else {
                                                    alert("Resposta incorreta. Tente novamente.");
                                                  }
                                                }}
                                                className="flex items-center gap-2 px-6 py-3 bg-brand-blue   text-white font-bold text-sm rounded-xl shadow-lg hover:opacity-90 transition-all cursor-pointer"
                                              >
                                                Confirmar Resposta <ChevronRight className="w-4 h-4" />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    }
                                  } catch (e) {
                                    // Fallback para exercícios antigos em formato de texto
                                  }
                                  return (
                                    <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                      {aula.conteudo}
                                    </div>
                                  );
                                })()}
                                {!concluida && aula.tipo !== "EXERCICIO" && (
                                  <button onClick={() => handleConcluirAula(aula.id)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue   text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:opacity-90 cursor-pointer">
                                    <Check className="w-4 h-4" /> Marcar como concluída (+10 XP)
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Adicionar Aula */}
                      {isAdm && (
                        <div className="p-3">
                          {showNovaAula === modulo.id ? (
                            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <input value={novaAula.titulo} onChange={(e) => setNovaAula({ ...novaAula, titulo: e.target.value })}
                                  placeholder="Título da aula *" className="col-span-2 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal" />
                                <select value={novaAula.tipo} onChange={(e) => setNovaAula({ ...novaAula, tipo: e.target.value })}
                                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal bg-white">
                                  <option value="VIDEO"> Vídeo</option>
                                  <option value="LINK"> Link</option>
                                  <option value="TEXTO"> Texto</option>
                                  <option value="EXERCICIO"> Exercício</option>
                                  <option value="PDF"> PDF</option>
                                </select>
                                <input value={novaAula.duracao_min} onChange={(e) => setNovaAula({ ...novaAula, duracao_min: e.target.value })}
                                  type="number" placeholder="Duração (min)" className="px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal" />
                                {novaAula.tipo === "EXERCICIO" ? (
                                  <div className="col-span-2 space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <input value={novoExercicio.pergunta} onChange={(e) => setNovoExercicio({ ...novoExercicio, pergunta: e.target.value })}
                                      placeholder="Qual a pergunta do exercício? *" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal" />
                                    
                                    <div className="space-y-2">
                                      <p className="text-xs font-bold text-slate-500 uppercase">Opções de resposta (Marque a correta)</p>
                                      {novoExercicio.opcoes.map((opcao, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                          <div className="flex items-center justify-center w-8 h-8 cursor-pointer" onClick={() => {
                                              const newOpcoes = novoExercicio.opcoes.map((o, i) => ({ ...o, correta: i === idx }));
                                              setNovoExercicio({ ...novoExercicio, opcoes: newOpcoes });
                                            }}>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${opcao.correta ? "border-emerald-500 bg-emerald-500" : "border-slate-300"}`}>
                                              {opcao.correta && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                          </div>
                                          <input value={opcao.texto} onChange={(e) => {
                                            const newOpcoes = [...novoExercicio.opcoes];
                                            newOpcoes[idx].texto = e.target.value;
                                            setNovoExercicio({ ...novoExercicio, opcoes: newOpcoes });
                                          }} placeholder={`Opção ${idx + 1}`} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal" />
                                          {novoExercicio.opcoes.length > 2 && (
                                            <button onClick={() => {
                                              const newOpcoes = novoExercicio.opcoes.filter((_, i) => i !== idx);
                                              if (opcao.correta) newOpcoes[0].correta = true;
                                              setNovoExercicio({ ...novoExercicio, opcoes: newOpcoes });
                                            }} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                    <button onClick={() => setNovoExercicio({ ...novoExercicio, opcoes: [...novoExercicio.opcoes, { texto: "", correta: false }] })}
                                      className="text-xs font-bold text-brand-blue hover:text-brand-teal flex items-center gap-1 cursor-pointer">
                                      <Plus className="w-3 h-3" /> Adicionar mais uma opção
                                    </button>
                                  </div>
                                ) : (
                                  <div className="col-span-2 space-y-2">
                                    {novaAula.tipo === "PDF" && (
                                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <p className="text-xs font-bold text-slate-600 mb-2 uppercase">1. Enviar arquivo PDF do computador</p>
                                        <input 
                                          type="file" 
                                          accept=".pdf" 
                                          onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                          className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20 cursor-pointer"
                                        />
                                        <p className="text-xs text-slate-400 mt-3 mb-1 uppercase font-bold text-center">Ou</p>
                                        <p className="text-xs font-bold text-slate-600 mb-2 uppercase">2. Colar link do PDF (Drive, etc)</p>
                                      </div>
                                    )}
                                    <textarea value={novaAula.conteudo} onChange={(e) => setNovaAula({ ...novaAula, conteudo: e.target.value })}
                                      placeholder={novaAula.tipo === "VIDEO" ? "URL do YouTube *" : novaAula.tipo === "LINK" ? "URL do link *" : novaAula.tipo === "PDF" ? "URL do arquivo PDF (se não enviou acima)" : "Conteúdo da aula *"}
                                      rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal resize-none" />
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button disabled={isUploading} onClick={() => handleCriarAula(modulo.id)} className="px-3 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50">
                                  {isUploading ? "Enviando..." : "Adicionar"}
                                </button>
                                <button disabled={isUploading} onClick={() => { setShowNovaAula(null); setPdfFile(null); }} className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50">Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setShowNovaAula(modulo.id)}
                              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-brand-blue border border-dashed border-slate-200 hover:border-brand-blue/40 rounded-xl cursor-pointer transition-all">
                              <Plus className="w-3.5 h-3.5" /> Adicionar Aula
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─── ABA AGENDA ─────────────────────────────────────────────────── */}
      {activeTab === "agenda" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-black font-barlow text-slate-800 text-lg uppercase tracking-wide">Agenda de Estudos</h2>
            <button onClick={() => setShowNovoAgend(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue   text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-blue/20 hover:opacity-90 cursor-pointer">
              <Plus className="w-4 h-4" /> Agendar
            </button>
          </div>

          {showNovoAgend && (
            <div className="bg-white border border-brand-blue/20 rounded-2xl p-5 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3">Novo Agendamento</h4>
              <div className="space-y-2">
                {isAdm && (
                  <select value={novoAgend.user_id} onChange={(e) => setNovoAgend({ ...novoAgend, user_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal bg-white">
                    <option value="">Selecionar Vendedor *</option>
                    {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
                  </select>
                )}
                <input value={novoAgend.titulo} onChange={(e) => setNovoAgend({ ...novoAgend, titulo: e.target.value })}
                  placeholder="Título do agendamento *" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal" />
                <input value={novoAgend.descricao} onChange={(e) => setNovoAgend({ ...novoAgend, descricao: e.target.value })}
                  placeholder="Descrição (opcional)" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal" />
                <input value={novoAgend.data_hora} onChange={(e) => setNovoAgend({ ...novoAgend, data_hora: e.target.value })}
                  type="datetime-local" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal" />
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={handleCriarAgend} className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl cursor-pointer">Salvar</button>
                <button onClick={() => setShowNovoAgend(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl cursor-pointer">Cancelar</button>
              </div>
            </div>
          )}

          {!data?.agendamentos || data.agendamentos.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
              <CalendarDays className="w-10 h-10 mb-4 mx-auto text-brand-blue" aria-hidden="true" />
              <h3 className="text-lg font-black text-slate-800 font-barlow">Nenhum agendamento</h3>
              <p className="text-slate-500 text-sm mt-2">Agende suas sessões de estudo para manter o ritmo!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.agendamentos.map((ag) => {
                const dt = new Date(ag.data_hora);
                const passado = dt < new Date();
                return (
                  <div key={ag.id} className={`bg-white border rounded-2xl p-4 shadow-sm flex items-start gap-3 ${passado ? "border-slate-200 opacity-60" : "border-brand-blue/20"}`}>
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-center shrink-0 ${passado ? "bg-slate-100" : "bg-brand-blue/10"}`}>
                      <span className="text-xs font-bold text-slate-500">{dt.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase()}</span>
                      <span className={`text-xl font-black ${passado ? "text-slate-400" : "text-brand-blue"}`}>{dt.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{ag.titulo}</p>
                      {ag.descricao && <p className="text-slate-500 text-xs mt-0.5 truncate">{ag.descricao}</p>}
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-slate-500 flex items-center gap-0.5"><Clock className="w-3 h-3" />{dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                        {isAdm && <span className="text-xs text-brand-blue font-bold">→ {ag.user.nome}</span>}
                      </div>
                    </div>
                    <button onClick={() => deletarAgendamentoAction(ag.id).then(() => router.refresh())}
                      className="p-1.5 text-slate-300 hover:text-rose-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── ABA TAREFAS ────────────────────────────────────────────────── */}
      {activeTab === "tarefas" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-black font-barlow text-slate-800 text-lg uppercase tracking-wide">Tarefas de Estudo</h2>
            {isAdm && (
              <button onClick={() => setShowNovaTarefa(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue   text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-blue/20 hover:opacity-90 cursor-pointer">
                <Plus className="w-4 h-4" /> Nova Tarefa
              </button>
            )}
          </div>

          {showNovaTarefa && (
            <div className="bg-white border border-brand-blue/20 rounded-2xl p-5 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3">Atribuir Tarefa</h4>
              <div className="space-y-2">
                <select value={novaTarefa.user_id} onChange={(e) => setNovaTarefa({ ...novaTarefa, user_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal bg-white">
                  <option value="">Selecionar Vendedor *</option>
                  {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
                </select>
                <input value={novaTarefa.titulo} onChange={(e) => setNovaTarefa({ ...novaTarefa, titulo: e.target.value })}
                  placeholder="Título da tarefa *" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal" />
                <textarea value={novaTarefa.descricao} onChange={(e) => setNovaTarefa({ ...novaTarefa, descricao: e.target.value })}
                  placeholder="Descrição da tarefa" rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal resize-none" />
                <input value={novaTarefa.prazo} onChange={(e) => setNovaTarefa({ ...novaTarefa, prazo: e.target.value })}
                  type="date" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal" />
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={handleCriarTarefa} className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl cursor-pointer">Atribuir</button>
                <button onClick={() => setShowNovaTarefa(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl cursor-pointer">Cancelar</button>
              </div>
            </div>
          )}

          {!data?.tarefas || data.tarefas.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
              <CheckSquare className="w-10 h-10 mb-4 mx-auto text-brand-blue" aria-hidden="true" />
              <h3 className="text-lg font-black text-slate-800 font-barlow">Nenhuma tarefa</h3>
              <p className="text-slate-500 text-sm mt-2">{isAdm ? "Atribua tarefas de estudo à equipe." : "Nenhuma tarefa atribuída a você."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.tarefas.map((t) => {
                const prazo = t.prazo ? new Date(t.prazo) : null;
                const atrasada = prazo && prazo < new Date() && !t.concluida;
                return (
                  <div key={t.id} className={`bg-white border rounded-2xl p-4 shadow-sm flex items-start gap-3 transition-all ${t.concluida ? "opacity-60 border-slate-200" : atrasada ? "border-rose-300" : "border-slate-200"}`}>
                    <button
                      onClick={() => !t.concluida && concluirTarefaAction(t.id).then(() => router.refresh())}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-all ${t.concluida ? "bg-emerald-500 border-emerald-500" : "border-slate-300 hover:border-emerald-400"}`}>
                      {t.concluida && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm ${t.concluida ? "line-through text-slate-400" : "text-slate-800"}`}>{t.titulo}</p>
                      {t.descricao && <p className="text-slate-500 text-xs mt-0.5">{t.descricao}</p>}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {isAdm && <span className="text-xs font-bold text-brand-blue">→ {t.user.nome}</span>}
                        <span className="text-xs text-slate-400">Por: {t.criador.nome}</span>
                        {prazo && <span className={`text-xs font-bold flex items-center gap-0.5 ${atrasada ? "text-rose-500" : "text-slate-400"}`}>
                          <Clock className="w-2.5 h-2.5" />Prazo: {prazo.toLocaleDateString("pt-BR")}
                        </span>}
                        {!t.concluida && <span className="text-xs text-yellow-600 flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" />+15 XP</span>}
                      </div>
                    </div>
                    {isAdm && (
                      <button onClick={() => deletarTarefaAction(t.id).then(() => router.refresh())}
                        className="p-1.5 text-slate-300 hover:text-rose-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── ABA LIVES ──────────────────────────────────────────────────── */}
      {activeTab === "lives" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-black font-barlow text-slate-800 text-lg uppercase tracking-wide">Lives & Notícias</h2>
            {isAdm && (
              <button onClick={() => setShowNovaLive(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-blue   text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-blue/20 hover:opacity-90 cursor-pointer">
                <Plus className="w-4 h-4" /> Adicionar Live
              </button>
            )}
          </div>

          {showNovaLive && (
            <div className="bg-white border border-brand-blue/20 rounded-2xl p-5 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3">Nova Live / Notícia</h4>
              <div className="space-y-2">
                <input value={novaLive.titulo} onChange={(e) => setNovaLive({ ...novaLive, titulo: e.target.value })}
                  placeholder="Título *" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal" />
                <input value={novaLive.url} onChange={(e) => setNovaLive({ ...novaLive, url: e.target.value })}
                  placeholder="URL do vídeo/live *" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal" />
                <textarea value={novaLive.descricao} onChange={(e) => setNovaLive({ ...novaLive, descricao: e.target.value })}
                  placeholder="Descrição (opcional)" rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal resize-none" />
                <input value={novaLive.data_live} onChange={(e) => setNovaLive({ ...novaLive, data_live: e.target.value })}
                  type="datetime-local" placeholder="Data da live" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-teal" />
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={handleCriarLive} className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-xl cursor-pointer">Publicar</button>
                <button onClick={() => setShowNovaLive(false)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl cursor-pointer">Cancelar</button>
              </div>
            </div>
          )}

          {!data?.lives || data.lives.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
              <Tv className="w-10 h-10 mb-4 mx-auto text-brand-blue" aria-hidden="true" />
              <h3 className="text-lg font-black text-slate-800 font-barlow">Nenhuma live cadastrada</h3>
              <p className="text-slate-500 text-sm mt-2">{isAdm ? "Adicione links de lives e gravações." : "Fique ligado! Novas lives serão adicionadas em breve."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.lives.map((live) => {
                const embedUrl = getYouTubeEmbed(live.url);
                const dataLive = live.data_live ? new Date(live.data_live) : null;
                return (
                  <div key={live.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                    {embedUrl ? (
                      <div className="aspect-video bg-slate-900">
                        <iframe src={embedUrl} title={live.titulo} allowFullScreen className="w-full h-full" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-brand-blue flex items-center justify-center">
                        <Tv className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="font-black text-slate-800 font-barlow text-sm">{live.titulo}</h4>
                      {live.descricao && <p className="text-slate-500 text-xs mt-1 line-clamp-2">{live.descricao}</p>}
                      <div className="flex items-center justify-between mt-3">
                        {dataLive && <span className="text-xs text-slate-400 flex items-center gap-0.5"><CalendarDays className="w-2.5 h-2.5" />{dataLive.toLocaleDateString("pt-BR")}</span>}
                        <div className="flex items-center gap-2 ml-auto">
                          <a href={live.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-bold text-brand-blue hover:text-brand-teal">
                            <ExternalLink className="w-3.5 h-3.5" /> Abrir
                          </a>
                          {isAdm && (
                            <button onClick={() => deletarLiveAction(live.id).then(() => router.refresh())}
                              className="text-slate-300 hover:text-rose-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── ABA OBJEÇÕES IA ────────────────────────────────────────────── */}
      {activeTab === "objecoes" && (
        <div className="space-y-4">
          <div className="bg-brand-blue rounded-3xl p-6 text-white shadow-2xl shadow-purple-900/30">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="w-7 h-7" aria-hidden="true" />
              <div>
                <h2 className="font-black font-barlow text-xl">Treinador de Objeções com IA</h2>
                <p className="text-white/60 text-xs">Pratique respostas a objeções com um cliente simulado por IA</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Seletor de Cenário */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
              <h3 className="font-black font-barlow text-slate-800 text-sm mb-3 uppercase tracking-wide">Escolha o Cenário</h3>
              <div className="space-y-2">
                {CENARIOS_OBJECOES.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCenarioAtivo(c); setTreinoAtivo(false); setObjecoesChat([]); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${cenarioAtivo === c ? "bg-purple-50 border border-purple-200 text-purple-800" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                  >
                    "{c}"
                  </button>
                ))}
              </div>

              {!treinoAtivo && (
                <button
                  onClick={iniciarTreino}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-brand-blue   text-white font-black text-sm rounded-xl shadow-lg shadow-purple-600/20 hover:opacity-90 cursor-pointer transition-all"
                >
                  <Play className="w-4 h-4" /> Iniciar Treino
                </button>
              )}
            </div>

            {/* Chat */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col" style={{ minHeight: "var(--layout-academy-chat-height)" }}>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-brand-blue"><Users className="w-4 h-4" aria-hidden="true" /></div>
                  <div>
                    <p className="text-xs font-black text-slate-800">Cliente Simulado</p>
                    <p className="text-xs text-slate-400 truncate max-w-48">&quot;{cenarioAtivo}&quot;</p>
                  </div>
                </div>
                {treinoAtivo && (
                  <button onClick={() => { setTreinoAtivo(false); setObjecoesChat([]); }}
                    className="flex items-center gap-1 text-xs text-rose-500 font-bold hover:text-rose-700 cursor-pointer">
                    <X className="w-3.5 h-3.5" /> Encerrar
                  </button>
                )}
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3" style={{ maxHeight: "var(--layout-academy-message-height)" }}>
                {!treinoAtivo && objecoesChat.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
                    <MessageCircle className="w-10 h-10 text-brand-blue" aria-hidden="true" />
                    <h3 className="font-black text-slate-800 font-barlow">Pronto para treinar?</h3>
                    <p className="text-slate-500 text-sm max-w-xs">Selecione um cenário e escolha Iniciar Treino para praticar o atendimento com um cliente simulado.</p>
                  </div>
                )}
                {objecoesChat.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[var(--layout-message-max)] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-brand-blue   text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {objecoesLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-2 text-slate-500 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> Digitando...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {treinoAtivo && (
                <div className="p-4 border-t border-slate-100">
                  <div className="flex gap-2">
                    <button
                      onClick={toggleListening}
                      className={`p-3 rounded-xl border-2 font-bold transition-all cursor-pointer ${
                        isListening
                          ? "bg-rose-50 border-rose-400 text-rose-600 animate-pulse"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600"
                      }`}
                      title={isListening ? "Parar gravação" : "Falar"}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <input
                      value={objecoesInput}
                      onChange={(e) => setObjecoesInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && enviarMensagemObjecao(objecoesInput)}
                      placeholder="Digite sua resposta ou use o microfone..."
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                    />
                    <button
                      onClick={() => enviarMensagemObjecao(objecoesInput)}
                      disabled={!objecoesInput.trim() || objecoesLoading}
                      className="p-3 bg-brand-blue   text-white rounded-xl disabled:opacity-50 cursor-pointer hover:opacity-90"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  {isListening && (
                    <p className="text-xs text-rose-500 font-bold mt-2 flex items-center gap-1">
                      <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                      Gravando... Fale agora
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
