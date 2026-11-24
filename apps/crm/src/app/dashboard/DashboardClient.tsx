"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createLeadAction, updateLeadStatusAction, deleteLeadAction, bulkTransferLeadsAction } from "../actions/leads";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  FileText,
  UserCheck,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  User as UserIcon,
  Tag,
  FolderOpen,
  ShieldAlert,
  Trophy,
  MapPin,
  MessageSquare,
  ClipboardCheck,
  FileCheck,
  Award,
  FileSignature,
  LayoutGrid,
  List,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from "lucide-react";
import { maskPhone, maskCurrency, unmaskCurrency } from "@/lib/masks";
import { formatToDateTimeLocal, formatDateTimeBR } from "@/lib/dates";

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  tipo_consorcio: string;
  valor_desejado: number;
  valor_parcela?: number | null;
  valor_entrada?: number | null;
  status: string;
  origem: string | null;
  localizacao: string | null;
  observacoes: string;
  vendedor_id: string;
  vendedor: { nome: string };
  vendedor_anterior?: { nome: string } | null;
  criado_em: Date;
  ultima_interacao?: Date | string;
  documentacao?: any;
  tags?: { id: string; nome: string; cor: string }[];
  retornar_contato?: boolean;
  data_retorno?: Date | string | null;
  data_agendamento?: Date | string | null;
  tipo_agendamento?: string | null;
}

const isStale = (dateStr?: Date | string | null) => {
  if (!dateStr) return false;
  const daysDiff = (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24);
  return daysDiff >= 3;
};

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getConsorcioStyle = (tipo: string) => {
  switch (tipo) {
    case "Imóvel":
      return "bg-indigo-50 text-indigo-700 border border-indigo-200/50";
    case "Veículo":
      return "bg-amber-50 text-amber-700 border border-amber-200/50";
    case "Serviços":
      return "bg-teal-50 text-teal-700 border border-teal-200/50";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200/50";
  }
};

interface DashboardClientProps {
  initialLeads: Lead[];
  vendedores: { id: string; nome: string; role: string; equipe_id: string | null }[];
  equipes: { id: string; nome: string }[];
  user: { id: string; nome: string; role: string };
}

export default function DashboardClient({ initialLeads, vendedores, equipes, user }: DashboardClientProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [consorcioFilter, setConsorcioFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<"board" | "list">("board");
  const router = useRouter();

  // Form States para Novo Lead
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [tipoConsorcio, setTipoConsorcio] = useState("");
  const [valorDesejado, setValorDesejado] = useState("");
  const [origem, setOrigem] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [vendedorId, setVendedorId] = useState("");
  const [retornarContato, setRetornarContato] = useState(false);
  const [dataRetorno, setDataRetorno] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Novos Estados
  const [valorParcela, setValorParcela] = useState("");
  const [valorEntrada, setValorEntrada] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // "", "daily", "yesterday", "weekly", "monthly", "custom"
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [vendedorFilter, setVendedorFilter] = useState("");
  const [equipeFilter, setEquipeFilter] = useState("");

  // Paginação
  const KANBAN_PAGE_SIZE = 5;
  const TABLE_PAGE_SIZE = 50;
  const [kanbanPages, setKanbanPages] = useState<Record<string, number>>({});
  const [tablePage, setTablePage] = useState(1);
  const kanbanScrollRef = useRef<HTMLDivElement>(null);

  const [filtersLoaded, setFiltersLoaded] = useState(false);

  // Sincronizar leads caso o servidor revalide initialLeads
  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  // Restaurar filtros e estados de navegação ao carregar a página
  useEffect(() => {
    setSearch(sessionStorage.getItem("crm_search") || "");
    setStatusFilter(sessionStorage.getItem("crm_status") || "");
    setConsorcioFilter(sessionStorage.getItem("crm_consorcio") || "");
    setDateFilter(sessionStorage.getItem("crm_date") || "");
    setCustomStartDate(sessionStorage.getItem("crm_start_date") || "");
    setCustomEndDate(sessionStorage.getItem("crm_end_date") || "");
    setVendedorFilter(sessionStorage.getItem("crm_vendedor") || "");
    setEquipeFilter(sessionStorage.getItem("crm_equipe") || "");

    const savedFiltersOpen = sessionStorage.getItem("crm_filters_open");
    if (savedFiltersOpen !== null) {
      setIsFiltersOpen(savedFiltersOpen === "true");
    } else {
      const hasActive = !!(
        sessionStorage.getItem("crm_status") ||
        sessionStorage.getItem("crm_consorcio") ||
        sessionStorage.getItem("crm_date") ||
        sessionStorage.getItem("crm_vendedor") ||
        sessionStorage.getItem("crm_equipe")
      );
      if (hasActive) setIsFiltersOpen(true);
    }

    const savedView = sessionStorage.getItem("crm_view") as "board" | "list" | null;
    if (savedView === "board" || savedView === "list") {
      setView(savedView);
    }

    const savedTablePage = sessionStorage.getItem("crm_table_page");
    if (savedTablePage) {
      const p = parseInt(savedTablePage, 10);
      if (!isNaN(p) && p > 0) setTablePage(p);
    }

    const savedKanbanPages = sessionStorage.getItem("crm_kanban_pages");
    if (savedKanbanPages) {
      try {
        setKanbanPages(JSON.parse(savedKanbanPages));
      } catch (e) {
        console.error("Erro ao carregar kanban pages:", e);
      }
    }

    setFiltersLoaded(true);
  }, []);

  // Salvar filtros e estados na sessão
  useEffect(() => {
    if (filtersLoaded) {
      sessionStorage.setItem("crm_search", search);
      sessionStorage.setItem("crm_status", statusFilter);
      sessionStorage.setItem("crm_consorcio", consorcioFilter);
      sessionStorage.setItem("crm_date", dateFilter);
      sessionStorage.setItem("crm_start_date", customStartDate);
      sessionStorage.setItem("crm_end_date", customEndDate);
      sessionStorage.setItem("crm_vendedor", vendedorFilter);
      sessionStorage.setItem("crm_equipe", equipeFilter);
      sessionStorage.setItem("crm_filters_open", String(isFiltersOpen));
      sessionStorage.setItem("crm_view", view);
      sessionStorage.setItem("crm_table_page", String(tablePage));
      sessionStorage.setItem("crm_kanban_pages", JSON.stringify(kanbanPages));
    }
  }, [
    search,
    statusFilter,
    consorcioFilter,
    dateFilter,
    customStartDate,
    customEndDate,
    vendedorFilter,
    equipeFilter,
    isFiltersOpen,
    view,
    tablePage,
    kanbanPages,
    filtersLoaded
  ]);

  // Restaurar rolagem horizontal do Kanban
  useEffect(() => {
    if (!filtersLoaded || view !== "board") return;
    const savedScroll = sessionStorage.getItem("crm_kanban_scroll");
    if (savedScroll && kanbanScrollRef.current) {
      const scrollPos = parseInt(savedScroll, 10);
      if (!isNaN(scrollPos)) {
        setTimeout(() => {
          if (kanbanScrollRef.current) {
            kanbanScrollRef.current.scrollLeft = scrollPos;
          }
        }, 60);
      }
    }
  }, [filtersLoaded, view]);

  const scrollKanbanLeft = () => {
    if (kanbanScrollRef.current) {
      kanbanScrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollKanbanRight = () => {
    if (kanbanScrollRef.current) {
      kanbanScrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const getKanbanPage = (colName: string) => kanbanPages[colName] ?? 1;
  const setKanbanPage = (colName: string, page: number) => {
    setKanbanPages((prev) => {
      const next = { ...prev, [colName]: page };
      if (typeof window !== "undefined") {
        sessionStorage.setItem("crm_kanban_pages", JSON.stringify(next));
      }
      return next;
    });
  };

  // Status oficiais da Jornada (Tema Claro Suave)
  const statusList = [
    { name: "Novo", color: "bg-blue-50 text-blue-700 border-blue-200/60" },
    { name: "Em Contato?", color: "bg-amber-50 text-amber-700 border-amber-200/60" },
    { name: "Agendado", color: "bg-purple-50 text-purple-700 border-purple-200/60" },
    { name: "Presente", color: "bg-pink-50 text-pink-700 border-pink-200/60" },
    { name: "Ficha", color: "bg-cyan-50 text-cyan-700 border-cyan-200/60" },
    { name: "Fechado", color: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
    { name: "Cancelado", color: "bg-rose-50 text-rose-700 border-rose-200/60" },
  ];

  // Métricas do Dashboard (Cartões Superiores)
  const totalLeadsCount = leads.length;
  const novosCount = leads.filter((l) => l.status === "Novo").length;
  const agendadosCount = leads.filter((l) => l.status === "Agendado").length;
  const presentesCount = leads.filter((l) => l.status === "Presente").length;
  const fechadosCount = leads.filter((l) => l.status === "Fechado").length;
  const canceladosCount = leads.filter((l) => l.status === "Cancelado").length;
  const fichasCount = leads.filter((l) => l.status === "Ficha" || !!l.documentacao).length;

  // Volume Financeiro Ativo
  const totalVolume = leads.reduce((acc, curr) => acc + (curr.status !== "Cancelado" ? curr.valor_desejado : 0), 0);

  // Lógica do Funil Cumulativo (Réplica do Sidebar)
  const funilTotais = leads.length;
  const funilAgendados = leads.filter((l) => ["Agendado", "Presente", "Ficha", "Fechado"].includes(l.status)).length;
  const funilPresentes = leads.filter((l) => ["Presente", "Ficha", "Fechado"].includes(l.status)).length;
  const funilFechados = leads.filter((l) => l.status === "Fechado").length;
  const funilFichas = leads.filter((l) => ["Ficha", "Fechado"].includes(l.status) || !!l.documentacao).length;

  // Porcentagens de Conversão
  const pctAgendados = funilTotais > 0 ? ((funilAgendados / funilTotais) * 100).toFixed(1) : "0.0";
  const pctPresentes = funilTotais > 0 ? ((funilPresentes / funilTotais) * 100).toFixed(1) : "0.0";
  const pctFechados = funilTotais > 0 ? ((funilFechados / funilTotais) * 100).toFixed(1) : "0.0";
  const pctFichas = funilTotais > 0 ? ((funilFichas / funilTotais) * 100).toFixed(1) : "0.0";

  // Simulação interativa local para status de análise de crédito (para a aba de Análise)
  const [creditStatus, setCreditStatus] = useState<Record<string, string>>({});

  // Estados para Transferência em Lote
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkVendedorId, setBulkVendedorId] = useState("");
  const [bulkTransferring, setBulkTransferring] = useState(false);

  // Manipuladores de Ação do Lead
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    if (!nome || !telefone || !valorDesejado) {
      setFormError("Nome, Telefone e Valor Desejado são obrigatórios.");
      setLoading(false);
      return;
    }

    const result = await createLeadAction({
      nome,
      telefone,
      email,
      tipo_consorcio: tipoConsorcio || undefined,
      valor_desejado: valorDesejado ? unmaskCurrency(valorDesejado) : undefined,
      valor_parcela: valorParcela ? Number(valorParcela) : undefined,
      valor_entrada: valorEntrada ? Number(valorEntrada) : undefined,
      status: "Novo",
      origem: origem || undefined,
      localizacao,
      observacoes,
      vendedor_id: (user.role === "ADM" || user.role === "SECRETARIA") && vendedorId ? vendedorId : undefined,
      retornar_contato: retornarContato,
      data_retorno: retornarContato && dataRetorno ? new Date(dataRetorno) : null,
    });

    if (result.success) {
      setNome("");
      setTelefone("");
      setEmail("");
      setTipoConsorcio("");
      setValorDesejado("");
      setValorParcela("");
      setValorEntrada("");
      setOrigem("");
      setLocalizacao("");
      setObservacoes("");
      setVendedorId("");
      setRetornarContato(false);
      setDataRetorno("");
      setIsModalOpen(false);
      router.refresh();
      setTimeout(() => window.location.reload(), 200);
    } else {
      setFormError(result.error || "Erro ao criar lead.");
      setLoading(false);
    }
  };

  const [agendamentoModal, setAgendamentoModal] = useState<{ leadId: string; date: string; tipo: string } | null>(null);
  
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

  const handleStatusChange = async (id: string, newStatus: string) => {
    const result = await updateLeadStatusAction(id, newStatus);
    if (result.success) {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
      );
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("leadId", id);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    const id = e.dataTransfer.getData("leadId");
    if (id) {
      if (newStatus === "Agendado") {
        const currentLead = leads.find((l) => l.id === id);
        setAgendamentoModal({
          leadId: id,
          date: currentLead?.data_agendamento ? formatToDateTimeLocal(currentLead.data_agendamento) : "",
          tipo: currentLead?.tipo_agendamento || "LIGAÇÃO"
        });
      } else {
        await handleStatusChange(id, newStatus);
      }
    }
  };

  const confirmAgendamentoDrop = async () => {
    if (!agendamentoModal?.date) return;
    const { leadId, date, tipo } = agendamentoModal;
    const dateObj = new Date(date);
    const result = await updateLeadStatusAction(leadId, "Agendado", dateObj, tipo);
    
    if (result.success) {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: "Agendado", data_agendamento: dateObj, tipo_agendamento: tipo } : l))
      );
      setAgendamentoModal(null);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este lead?")) {
      const result = await deleteLeadAction(id);
      if (result.success) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
      }
    }
  };

  const handleToggleSelectLead = (leadId: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const handleToggleSelectAll = () => {
    const allFilteredIds = filteredLeads.map((l) => l.id);
    const allSelected = allFilteredIds.every((id) => selectedLeadIds.includes(id));

    if (allSelected) {
      setSelectedLeadIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedLeadIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleBulkTransfer = async () => {
    if (selectedLeadIds.length === 0) return;
    if (!bulkVendedorId) {
      alert("Por favor, selecione o vendedor de destino.");
      return;
    }

    setBulkTransferring(true);
    const result = await bulkTransferLeadsAction(selectedLeadIds, bulkVendedorId);
    setBulkTransferring(false);

    if (result.success) {
      alert("Leads transferidos com sucesso!");
      const targetSeller = vendedores.find((v) => v.id === bulkVendedorId) || { nome: user.nome };
      setLeads((prev) =>
        prev.map((l) =>
          selectedLeadIds.includes(l.id)
            ? { ...l, vendedor_id: bulkVendedorId, vendedor: { nome: targetSeller.nome } }
            : l
        )
      );
      setSelectedLeadIds([]);
      setIsBulkMode(false);
      setBulkVendedorId("");
      router.refresh();
    } else {
      alert(result.error || "Erro ao transferir leads.");
    }
  };

  // Filtragem local dos Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.nome.toLowerCase().includes(search.toLowerCase()) ||
      lead.telefone.includes(search) ||
      (lead.email && lead.email.toLowerCase().includes(search.toLowerCase())) ||
      lead.vendedor.nome.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "" || lead.status === statusFilter;
    const matchesConsorcio = consorcioFilter === "" || lead.tipo_consorcio === consorcioFilter;
    const matchesVendedor = vendedorFilter === "" || lead.vendedor_id === vendedorFilter;
    const matchesEquipe = equipeFilter === "" || (() => {
      const v = vendedores.find(vv => vv.id === lead.vendedor_id);
      return v ? v.equipe_id === equipeFilter : false;
    })();

    const matchesDate = (() => {
      if (!dateFilter) return true;
      const leadDate = new Date(lead.criado_em);
      const now = new Date();
      
      if (dateFilter === "daily") {
        return (
          leadDate.getDate() === now.getDate() &&
          leadDate.getMonth() === now.getMonth() &&
          leadDate.getFullYear() === now.getFullYear()
        );
      }

      if (dateFilter === "yesterday") {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return (
          leadDate.getDate() === yesterday.getDate() &&
          leadDate.getMonth() === yesterday.getMonth() &&
          leadDate.getFullYear() === yesterday.getFullYear()
        );
      }
      
      if (dateFilter === "weekly") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        return leadDate >= startOfWeek && leadDate <= endOfWeek;
      }
      
      if (dateFilter === "monthly") {
        return (
          leadDate.getMonth() === now.getMonth() &&
          leadDate.getFullYear() === now.getFullYear()
        );
      }

      if (dateFilter === "custom") {
        if (!customStartDate && !customEndDate) return true;
        if (customStartDate && customEndDate) {
          const start = new Date(`${customStartDate}T00:00:00`);
          const end = new Date(`${customEndDate}T23:59:59.999`);
          return leadDate >= start && leadDate <= end;
        }
        if (customStartDate) {
          const start = new Date(`${customStartDate}T00:00:00`);
          return leadDate >= start;
        }
        if (customEndDate) {
          const end = new Date(`${customEndDate}T23:59:59.999`);
          return leadDate <= end;
        }
      }
      
      return true;
    })();

    return matchesSearch && matchesStatus && matchesConsorcio && matchesDate && matchesVendedor && matchesEquipe;
  });

  // Resetar página da tabela e do kanban apenas quando os filtros forem alterados ativamente pelo usuário
  const isInitialFilterCheck = useRef(true);
  const prevFiltersRef = useRef({ search, statusFilter, consorcioFilter, dateFilter, customStartDate, customEndDate, vendedorFilter, equipeFilter });

  useEffect(() => {
    if (!filtersLoaded) return;

    if (isInitialFilterCheck.current) {
      isInitialFilterCheck.current = false;
      prevFiltersRef.current = { search, statusFilter, consorcioFilter, dateFilter, customStartDate, customEndDate, vendedorFilter, equipeFilter };
      return;
    }

    const prev = prevFiltersRef.current;
    const hasChanged =
      prev.search !== search ||
      prev.statusFilter !== statusFilter ||
      prev.consorcioFilter !== consorcioFilter ||
      prev.dateFilter !== dateFilter ||
      prev.customStartDate !== customStartDate ||
      prev.customEndDate !== customEndDate ||
      prev.vendedorFilter !== vendedorFilter ||
      prev.equipeFilter !== equipeFilter;

    if (hasChanged) {
      setTablePage(1);
      setKanbanPages({});
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("crm_kanban_pages");
        sessionStorage.removeItem("crm_table_page");
      }
      prevFiltersRef.current = { search, statusFilter, consorcioFilter, dateFilter, customStartDate, customEndDate, vendedorFilter, equipeFilter };
    }
  }, [search, statusFilter, consorcioFilter, dateFilter, customStartDate, customEndDate, vendedorFilter, equipeFilter, filtersLoaded]);

  // Exportar leads para CSV compatível com Excel (com BOM UTF-8 e delimitador ';')
  const handleExportToExcel = () => {
    if (filteredLeads.length === 0) {
      alert("Nenhum lead disponível para exportação com os filtros atuais.");
      return;
    }

    const headers = [
      "Nome",
      "Telefone",
      "Email",
      "Tipo Consorcio",
      "Valor Desejado",
      "Valor Parcela Maxima",
      "Valor Entrada",
      "Status",
      "Origem",
      "Localizacao",
      "Vendedor Responsavel",
      "Data Cadastro"
    ];

    const rows = filteredLeads.map((lead) => [
      lead.nome,
      lead.telefone,
      lead.email || "",
      lead.tipo_consorcio,
      lead.valor_desejado,
      lead.valor_parcela || "",
      lead.valor_entrada || "",
      lead.status,
      lead.origem || "",
      lead.localizacao || "",
      lead.vendedor?.nome || "Sem Vendedor",
      lead.criado_em ? new Date(lead.criado_em).toLocaleDateString("pt-BR") : ""
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) =>
        row
          .map((value) => {
            const strVal = value != null ? String(value) : "";
            const escaped = strVal.replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(";")
      )
    ].join("\r\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho da área de leads */}
      <div className="bg-white border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Marca / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-brand-blue">
            <TrendingUp className="w-5 h-5 text-brand-blue" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 font-barlow">Leads</h3>
            <p className="text-xs text-slate-500">Acompanhe o andamento e os resultados do funil.</p>
          </div>
        </div>

        {/* Perfil Ativo e Botão + Novo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-200 rounded-md">
            <div className="w-7 h-7 rounded-full bg-brand-blue/10 border border-brand-blue/30 flex items-center justify-center text-xs font-bold text-brand-blue uppercase">
              {user.nome.substring(0, 2)}
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-700">{user.nome}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-brand-blue hover:opacity-95 text-white font-semibold text-xs rounded-md flex items-center gap-1.5 cursor-pointer transition-colors font-barlow tracking-wide"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <section aria-label="Resumo do funil" className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 sm:grid-cols-4 xl:grid-cols-8">
          <div className="col-span-2 bg-brand-blue px-4 py-4 text-white">
            <p className="text-sm">Volume financeiro ativo</p>
            <p className="my-1 font-barlow text-3xl font-bold tabular-nums">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(totalVolume)}
            </p>
            <p className="text-xs text-white/80">Leads ativos, sem cancelados</p>
          </div>
          {[
            ["Total de leads", totalLeadsCount], ["Novos", novosCount],
            ["Agendados", agendadosCount], ["Presentes", presentesCount],
            ["Fichas KYC", fichasCount], ["Fechados", fechadosCount],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col justify-between gap-2 bg-white px-4 py-4">
              <p className="text-sm text-slate-600">{label}</p>
              <p className="font-barlow text-3xl font-bold tabular-nums text-brand-blue">{value}</p>
            </div>
          ))}
        </section>

        {/* 2. Barra de Filtro e Busca — colapsável */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
          {/* Linha principal: sempre visível */}
          <div className="flex items-center gap-3 p-3">
            {/* Campo de busca */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nome, telefone ou vendedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm placeholder-slate-400 outline-none transition-all"
              />
            </div>

            {/* Botão Filtros com badge */}
            <button
              type="button"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                isFiltersOpen
                  ? "bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros</span>
              {(statusFilter || consorcioFilter || dateFilter || customStartDate || customEndDate || vendedorFilter || equipeFilter) && (
                <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs font-black flex items-center justify-center ${
                  isFiltersOpen ? "bg-white text-brand-blue" : "bg-brand-blue text-white"
                }`}>
                  {[statusFilter, consorcioFilter, dateFilter, customStartDate || customEndDate, vendedorFilter, equipeFilter].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Divisor */}
            <div className="w-px h-6 bg-slate-200 shrink-0" />

            {/* Ações rápidas (ADM/SECRETARIA) */}
            {(user.role === "ADM" || user.role === "SECRETARIA") && (
              <>
                <button
                  type="button"
                  onClick={() => { setIsBulkMode(!isBulkMode); setSelectedLeadIds([]); }}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 ${
                    isBulkMode
                      ? "bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/20"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isBulkMode ? "Sair do Lote" : "Editar Lote"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportToExcel}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-[0.98] shrink-0"
                  title="Exportar leads filtrados para Excel"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Exportar Excel</span>
                </button>
              </>
            )}

            {/* Toggle Kanban / Tabela */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-inner shrink-0">
              <button type="button" onClick={() => setView("board")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${view === "board" ? "bg-white text-brand-blue shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button type="button" onClick={() => setView("list")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${view === "list" ? "bg-white text-brand-blue shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                <List className="w-3.5 h-3.5" />
                <span>Tabela</span>
              </button>
            </div>
          </div>

          {/* Painel de filtros colapsável */}
          {isFiltersOpen && (
            <div className="border-t border-slate-100 px-3 pb-3 pt-3 flex flex-wrap items-center gap-3 bg-slate-50/60">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">Filtrar por:</p>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-xs font-bold outline-none cursor-pointer shadow-xs transition-all"
              >
                <option value="">Todos os Status</option>
                {statusList.map((st) => (
                  <option key={st.name} value={st.name}>{st.name}</option>
                ))}
              </select>

              {/* Consórcio */}
              <select
                value={consorcioFilter}
                onChange={(e) => setConsorcioFilter(e.target.value)}
                className="pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-xs font-bold outline-none cursor-pointer shadow-xs transition-all"
              >
                <option value="">Todos os Consórcios</option>
                <option value="Imóvel">Imóvel</option>
                <option value="Veículo">Veículo</option>
                <option value="Serviços">Serviços</option>
              </select>

              {/* Período */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-xs font-bold outline-none cursor-pointer shadow-xs transition-all"
                >
                  <option value="">Qualquer Período</option>
                  <option value="daily">Hoje</option>
                  <option value="yesterday">Ontem</option>
                  <option value="weekly">Esta Semana</option>
                  <option value="monthly">Este Mês</option>
                  <option value="custom"> Personalizado (De / Até)</option>
                </select>

                {dateFilter === "custom" && (
                  <div className="flex items-center gap-2 bg-white border border-brand-teal/40 rounded-xl px-3 py-1.5 shadow-xs animate-fadeIn">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-400 uppercase font-barlow tracking-wider">De:</span>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="bg-transparent text-slate-700 text-xs font-bold outline-none cursor-pointer"
                      />
                    </div>
                    <span className="text-slate-300">|</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-400 uppercase font-barlow tracking-wider">Até:</span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="bg-transparent text-slate-700 text-xs font-bold outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Vendedor */}
              <select
                value={vendedorFilter}
                onChange={(e) => setVendedorFilter(e.target.value)}
                className="pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-xs font-bold outline-none cursor-pointer shadow-xs transition-all"
              >
                <option value="">Todos os Vendedores</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>{v.nome}{v.role === "GESTOR" ? " (Gestor)" : ""}</option>
                ))}
              </select>

              {/* Equipe — só para ADM/SECRETARIA */}
              {(user.role === "ADM" || user.role === "SECRETARIA") && equipes.length > 0 && (
                <select
                  value={equipeFilter}
                  onChange={(e) => setEquipeFilter(e.target.value)}
                  className="pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-xs font-bold outline-none cursor-pointer shadow-xs transition-all"
                >
                  <option value="">Todas as Equipes</option>
                  {equipes.map((e) => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </select>
              )}

              {/* Limpar filtros */}
              {(statusFilter || consorcioFilter || dateFilter || customStartDate || customEndDate || vendedorFilter || equipeFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("");
                    setConsorcioFilter("");
                    setDateFilter("");
                    setCustomStartDate("");
                    setCustomEndDate("");
                    setVendedorFilter("");
                    setEquipeFilter("");
                    setTablePage(1);
                    setKanbanPages({});
                    if (typeof window !== "undefined") {
                      sessionStorage.removeItem("crm_kanban_pages");
                      sessionStorage.removeItem("crm_table_page");
                      sessionStorage.removeItem("crm_kanban_scroll");
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-all cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Limpar filtros</span>
                </button>
              )}

              {/* Indicador de resultados */}
              <span className="ml-auto text-xs text-slate-400 font-semibold shrink-0">
                {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""} encontrado{filteredLeads.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* 3. CONTEÚDO PRINCIPAL */}
        {view === "board" ? (
          <div className="relative">
            {/* Botão Scroll Esquerda */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-start pointer-events-none pl-2">
              <button
                onClick={scrollKanbanLeft}
                className="pointer-events-auto p-3 bg-white/90 border border-slate-200 rounded-full shadow-lg text-slate-600 hover:text-brand-blue hover:scale-105 active:scale-95 transition-all"
                title="Rolar para a esquerda"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5px]" />
              </button>
            </div>

            <div
              ref={kanbanScrollRef}
              onScroll={(e) => {
                sessionStorage.setItem("crm_kanban_scroll", String(e.currentTarget.scrollLeft));
              }}
              className="kanban-scroll flex gap-4 pb-4 select-none items-start pt-2 overflow-x-auto scroll-smooth"
              style={{ minHeight: "var(--layout-kanban-empty-height)" }}
            >
              {statusList.map((col) => {
                const colLeads = filteredLeads.filter((l) => l.status === col.name);
              const rawTotalPages = Math.ceil(colLeads.length / KANBAN_PAGE_SIZE);
              const kanbanTotalPages = Math.max(1, rawTotalPages);
              const kanbanPage = Math.min(getKanbanPage(col.name), kanbanTotalPages);
              const paginatedColLeads = colLeads.slice((kanbanPage - 1) * KANBAN_PAGE_SIZE, kanbanPage * KANBAN_PAGE_SIZE);
              const dotColorClass = col.name === "Novo" ? "bg-blue-500" : col.name === "Em Contato?" ? "bg-amber-500" : col.name === "Agendado" ? "bg-purple-500" : col.name === "Presente" ? "bg-pink-500" : col.name === "Ficha" ? "bg-cyan-500" : col.name === "Fechado" ? "bg-emerald-500" : "bg-rose-500";
              const borderLeftColorClass = col.name === "Novo" ? "border-l-blue-500" : col.name === "Em Contato?" ? "border-l-amber-500" : col.name === "Agendado" ? "border-l-purple-500" : col.name === "Presente" ? "border-l-pink-500" : col.name === "Ficha" ? "border-l-cyan-500" : col.name === "Fechado" ? "border-l-emerald-500" : "border-l-rose-500";

              return (
                <div key={col.name} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, col.name)} className="flex-1 min-w-72 max-w-[var(--layout-kanban-column)] bg-slate-50/50 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3 shrink-0 self-stretch shadow-xs hover:border-slate-350 transition-colors duration-200">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${dotColorClass} shadow-xs`} />
                      <span className="font-barlow font-bold text-sm text-slate-800 uppercase tracking-wider">{col.name}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-xs font-bold text-slate-500 rounded-lg shadow-xs">{colLeads.length}</span>
                  </div>
                  <div className="flex flex-col gap-3 flex-1">
                    {colLeads.length === 0 ? (
                      <div className="h-32 flex items-center justify-center text-center text-xs text-slate-400 italic border-2 border-dashed border-slate-200 rounded-xl bg-white/40 shadow-xs px-4">Nenhum lead nesta etapa</div>
                    ) : (
                      paginatedColLeads.map((lead) => {
                        const consorcioStyle = getConsorcioStyle(lead.tipo_consorcio);
                        return (
                          <div
                            key={lead.id}
                            draggable={!isBulkMode}
                            onDragStart={(e) => handleDragStart(e, lead.id)}
                            onClick={() => {
                              if (isBulkMode) {
                                handleToggleSelectLead(lead.id);
                              }
                            }}
                            className={`bg-white border p-4 rounded-xl shadow-xs transition-all duration-200 flex flex-col gap-3 relative group ${
                              isStale(lead.ultima_interacao) ? "ring-2 ring-red-400 border-red-200 bg-red-50/20" : `border-l-4 ${borderLeftColorClass}`
                            } ${
                              isBulkMode
                                ? selectedLeadIds.includes(lead.id)
                                  ? "ring-2 ring-brand-teal/80 border-transparent bg-slate-50/30"
                                  : "cursor-pointer hover:bg-slate-50/55 border-slate-200"
                                : "cursor-grab active:cursor-grabbing hover:shadow-md hover:translate-y-[-2px] border-slate-200/90"
                            }`}
                          >
                            {/* Cabeçalho do Card */}
                            <div className="flex justify-between items-start pr-6 gap-2">
                              {isBulkMode && (
                                <input
                                  type="checkbox"
                                  checked={selectedLeadIds.includes(lead.id)}
                                  onChange={() => handleToggleSelectLead(lead.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-4 h-4 text-brand-teal border-slate-300 rounded focus:ring-brand-teal cursor-pointer shrink-0 mt-0.5"
                                />
                              )}
                              <Link
                                href={isBulkMode ? "#" : `/dashboard/leads/${lead.id}`}
                                onClick={(e) => {
                                  if (isBulkMode) {
                                    e.preventDefault();
                                    handleToggleSelectLead(lead.id);
                                  }
                                }}
                                className="font-extrabold font-barlow text-slate-800 text-sm tracking-wide uppercase leading-tight hover:text-brand-teal transition-colors flex-1"
                              >
                                {lead.nome}
                              </Link>
                              {!isBulkMode && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteLead(lead.id);
                                  }}
                                  className="absolute right-3 top-3 p-1 bg-slate-55 hover:bg-red-50 hover:border-red-200 border border-slate-200 text-slate-400 hover:text-red-650 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-150 shadow-xs"
                                  title="Excluir Lead"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Observações / Resumo */}
                            <p className="text-xs text-slate-500 line-clamp-2 italic bg-slate-50/60 p-2 rounded-lg border border-slate-100/60">
                              {lead.observacoes || "Nenhuma observação registrada."}
                            </p>

                            {/* Etiquetas (Tags) */}
                            {lead.tags && lead.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-0.5">
                                {lead.tags.map(tag => (
                                  <span 
                                    key={tag.id} 
                                    className="px-2.5 py-0.5 rounded text-xs font-bold text-white uppercase tracking-wider shadow-sm"
                                    style={{ backgroundColor: tag.cor }}
                                    title={tag.nome}
                                  >
                                    {tag.nome}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Badges de Consórcio e Valor */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${consorcioStyle}`}>
                                {lead.tipo_consorcio}
                              </span>
                              {lead.status === "Ficha" && !lead.documentacao && (
                                <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 animate-pulse">
                                  <ShieldAlert className="w-2.5 h-2.5" />
                                  Doc Pendente
                                </span>
                              )}
                              <span className="px-2 py-0.5 bg-brand-teal/10 border border-brand-teal/20 text-brand-teal rounded text-xs font-bold uppercase font-barlow tracking-wider">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                  maximumFractionDigits: 0,
                                }).format(lead.valor_desejado)}
                              </span>
                              {lead.status === "Agendado" && lead.data_agendamento && (
                                <span className="px-2 py-0.5 bg-purple-100 border border-purple-200 text-purple-800 rounded text-xs font-bold uppercase font-barlow tracking-wider flex items-center gap-1">
                                  <CalendarDays className="w-2.5 h-2.5" />
                                  {lead.tipo_agendamento || "Agendado"}: {formatDateTimeBR(lead.data_agendamento)}
                                </span>
                              )}
                              {lead.retornar_contato && lead.data_retorno && (
                                <span className="px-2 py-0.5 bg-amber-100 border border-amber-200 text-amber-700 rounded text-xs font-bold uppercase font-barlow tracking-wider flex items-center gap-1">
                                   Retorno: {formatDateTimeBR(lead.data_retorno)}
                                </span>
                              )}
                            </div>

                            {/* Rodapé: Contato, Vendedor e Data */}
                            <div className="flex items-center justify-between text-xs text-slate-450 font-medium border-t border-slate-100 pt-2.5 mt-0.5 gap-2">
                              <div className="flex flex-col gap-0.5 truncate">
                                <span className="flex items-center gap-1 text-slate-600 truncate">
                                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenWhatsapp(lead.telefone, lead.nome);
                                    }}
                                    className="hover:text-emerald-500 hover:underline transition-colors text-left font-bold"
                                  >
                                    {lead.telefone}
                                  </button>
                                </span>
                                {lead.criado_em && (
                                  <span className="text-xs text-slate-400 mt-0.5">
                                    Cadastrado em {new Date(lead.criado_em).toLocaleDateString("pt-BR")}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1.5 shrink-0">
                                {/* Vendedor Initials Badge */}
                                <div 
                                  className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 border border-slate-200 rounded-md text-xs text-slate-650 font-bold"
                                  title={`Vendedor: ${lead.vendedor.nome}`}
                                >
                                  <div className="w-3.5 h-3.5 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                                    {getInitials(lead.vendedor.nome)}
                                  </div>
                                  <span className="truncate max-w-12 font-medium">{lead.vendedor.nome.split(" ")[0]}</span>
                                </div>
                                
                                {lead.vendedor_anterior && (
                                  <div 
                                    className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 border border-amber-200 rounded-md text-xs text-amber-700 font-bold"
                                    title={`Transferido de: ${lead.vendedor_anterior.nome}`}
                                  >
                                    <span className="truncate max-w-12 font-medium">De: {lead.vendedor_anterior.nome.split(" ")[0]}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Paginação Kanban por coluna */}
                  {rawTotalPages > 1 && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setKanbanPage(col.name, Math.max(1, kanbanPage - 1))}
                        disabled={kanbanPage <= 1}
                        className="text-xs font-bold text-slate-500 hover:text-brand-blue disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
                      >
                        ← Ant.
                      </button>
                      <span className="text-xs text-slate-400 font-semibold">
                        {kanbanPage}/{kanbanTotalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setKanbanPage(col.name, Math.min(kanbanTotalPages, kanbanPage + 1))}
                        disabled={kanbanPage >= kanbanTotalPages}
                        className="text-xs font-bold text-slate-500 hover:text-brand-blue disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
                      >
                        Próx. →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

            {/* Botão Scroll Direita */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-end pointer-events-none pr-2">
              <button
                onClick={scrollKanbanRight}
                className="pointer-events-auto p-3 bg-white/90 border border-slate-200 rounded-full shadow-lg text-slate-600 hover:text-brand-blue hover:scale-105 active:scale-95 transition-all"
                title="Rolar para a direita"
              >
                <ChevronRight className="w-6 h-6 stroke-[2.5px]" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h4 className="font-bold text-sm text-slate-500 uppercase tracking-widest font-barlow">Leads Ativos ({filteredLeads.length})</h4>
              </div>
              {/* Lógica de paginação da tabela */}
              {(() => {
                const tableLeads = filteredLeads.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE);
                const tableTotalPages = Math.ceil(filteredLeads.length / TABLE_PAGE_SIZE);
                return (<>

              {/* Tabela de Leads (Desktop) */}
              <div className="hidden md:block bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="kanban-scroll pb-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider font-barlow">
                        {isBulkMode && (
                          <th className="py-4 px-5 w-12 text-center">
                            <input
                              type="checkbox"
                              checked={filteredLeads.length > 0 && filteredLeads.every((l) => selectedLeadIds.includes(l.id))}
                              onChange={handleToggleSelectAll}
                              className="w-4 h-4 text-brand-teal border-slate-300 rounded focus:ring-brand-teal cursor-pointer"
                            />
                          </th>
                        )}
                        <th className="py-4 px-5">Cliente</th>
                        <th className="py-4 px-5">Consórcio</th>
                        <th className="py-4 px-5">Valor</th>
                        <th className="py-4 px-5">Status</th>
                        <th className="py-4 px-5">Responsável</th>
                        <th className="py-4 px-5">Data Cadastro</th>
                        {!isBulkMode && <th className="py-4 px-5 text-right">Ações</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {filteredLeads.length === 0 ? (
                        <tr>
                          <td colSpan={isBulkMode ? 8 : 7} className="py-8 text-center text-slate-400 italic bg-slate-50/20">
                            Nenhum lead encontrado com os filtros selecionados.
                          </td>
                        </tr>
                      ) : (
                        tableLeads.map((lead) => {
                          const statusStyle = statusList.find((s) => s.name === lead.status)?.color || "bg-slate-50 text-slate-700 border-slate-200";
                          const consorcioStyle = getConsorcioStyle(lead.tipo_consorcio);
                          return (
                            <tr 
                              key={lead.id} 
                              onClick={() => {
                                if (isBulkMode) {
                                  handleToggleSelectLead(lead.id);
                                }
                              }}
                              className={`hover:bg-slate-50/50 transition-colors group ${
                                isBulkMode
                                  ? selectedLeadIds.includes(lead.id)
                                    ? "bg-brand-teal/5 hover:bg-brand-teal/10"
                                    : "cursor-pointer"
                                  : ""
                              }`}
                            >
                              {isBulkMode && (
                                <td className="py-3.5 px-5 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={selectedLeadIds.includes(lead.id)}
                                    onChange={() => handleToggleSelectLead(lead.id)}
                                    className="w-4 h-4 text-brand-teal border-slate-300 rounded focus:ring-brand-teal cursor-pointer"
                                  />
                                </td>
                              )}
                              <td className="py-3.5 px-5">
                                <Link
                                  href={isBulkMode ? "#" : `/dashboard/leads/${lead.id}`}
                                  onClick={(e) => {
                                    if (isBulkMode) {
                                      e.preventDefault();
                                      handleToggleSelectLead(lead.id);
                                    }
                                  }}
                                  className="font-bold text-slate-800 hover:text-brand-teal uppercase tracking-wide font-barlow text-sm block"
                                >
                                  {lead.nome}
                                </Link>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenWhatsapp(lead.telefone, lead.nome);
                                  }}
                                  className="text-xs text-slate-500 hover:text-brand-teal hover:underline mt-0.5 block"
                                >
                                  {lead.telefone}
                                </button>
                              </td>
                              <td className="py-3.5 px-5">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${consorcioStyle}`}>
                                  {lead.tipo_consorcio}
                                </span>
                              </td>
                              <td className="py-3.5 px-5 font-extrabold text-slate-800 font-barlow">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                  maximumFractionDigits: 0,
                                }).format(lead.valor_desejado)}
                              </td>
                              <td className="py-3.5 px-5">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${statusStyle}`}>
                                  {lead.status}
                                </span>
                                    {lead.status === "Ficha" && !lead.documentacao && (
                                  <span className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 animate-pulse">
                                    <ShieldAlert className="w-2.5 h-2.5" />
                                    Doc Pendente
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-5">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5" title={lead.vendedor.nome}>
                                    <div className="w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-xs uppercase">
                                      {getInitials(lead.vendedor.nome)}
                                    </div>
                                    <span className="font-semibold text-slate-750">{lead.vendedor.nome.split(" ")[0]}</span>
                                  </div>
                                  {lead.vendedor_anterior && (
                                    <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded w-fit font-semibold" title={`Transferido de: ${lead.vendedor_anterior.nome}`}>
                                      De: {lead.vendedor_anterior.nome.split(" ")[0]}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 px-5 text-slate-550 font-medium">
                                {lead.criado_em ? new Date(lead.criado_em).toLocaleDateString("pt-BR") : "-"}
                              </td>
                              {!isBulkMode && (
                                <td className="py-3.5 px-5 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Link
                                      href={`/dashboard/leads/${lead.id}`}
                                      className="p-1.5 bg-slate-50 hover:bg-brand-blue/10 border border-slate-200 hover:border-brand-blue/20 text-slate-500 hover:text-brand-blue rounded-lg transition-colors shadow-xs"
                                      title="Ver Ficha KYC"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </Link>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteLead(lead.id);
                                      }}
                                      className="p-1.5 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-655 rounded-lg transition-colors shadow-xs"
                                      title="Excluir Lead"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Grid de Cards (Mobile) */}
              <div className="block md:hidden space-y-4">
                {tableLeads.length === 0 ? (
                  <div className="bg-white border border-slate-200/80 p-6 rounded-2xl text-center text-slate-400 italic">
                    Nenhum lead encontrado.
                  </div>
                ) : (
                  tableLeads.map((lead) => {
                    const statusStyle = statusList.find((s) => s.name === lead.status)?.color || "bg-slate-50 text-slate-700 border-slate-200";
                    const consorcioStyle = getConsorcioStyle(lead.tipo_consorcio);
                    return (
                      <div 
                        key={lead.id} 
                        onClick={() => {
                          if (isBulkMode) {
                            handleToggleSelectLead(lead.id);
                          }
                        }}
                        className={`bg-white border p-5 rounded-2xl shadow-sm space-y-4 transition-all ${
                          isBulkMode
                            ? selectedLeadIds.includes(lead.id)
                              ? "ring-2 ring-brand-teal/80 border-transparent bg-slate-50/30"
                              : "cursor-pointer hover:bg-slate-50/50 border-slate-200"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-start gap-2.5">
                            {isBulkMode && (
                              <input
                                type="checkbox"
                                checked={selectedLeadIds.includes(lead.id)}
                                onChange={() => handleToggleSelectLead(lead.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 text-brand-teal border-slate-300 rounded focus:ring-brand-teal cursor-pointer shrink-0 mt-1"
                              />
                            )}
                            <div>
                              <Link 
                                href={isBulkMode ? "#" : `/dashboard/leads/${lead.id}`} 
                                onClick={(e) => {
                                  if (isBulkMode) {
                                    e.preventDefault();
                                    handleToggleSelectLead(lead.id);
                                  }
                                }}
                                className="font-black text-base text-slate-800 font-barlow uppercase hover:text-brand-teal transition-colors"
                              >
                                {lead.nome}
                              </Link>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenWhatsapp(lead.telefone, lead.nome);
                                }}
                                className="text-xs text-slate-505 hover:text-brand-teal hover:underline mt-0.5 block text-left"
                              >
                                {lead.telefone}
                              </button>
                            </div>
                          </div>
                          {!isBulkMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLead(lead.id);
                              }}
                              className="p-1.5 bg-slate-55 border border-slate-200 text-slate-400 hover:text-red-655 rounded-lg shadow-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase font-barlow">Consórcio / Valor</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className={`px-1.5 py-0.5 rounded text-xs font-bold uppercase ${consorcioStyle}`}>
                                {lead.tipo_consorcio}
                              </span>
                              <span className="font-extrabold text-slate-850 text-xs font-barlow">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                  maximumFractionDigits: 0,
                                }).format(lead.valor_desejado)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase font-barlow">Status / Responsável</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border uppercase ${statusStyle}`}>
                                {lead.status}
                              </span>
                              <span className="text-xs text-slate-650 font-semibold truncate" title={lead.vendedor.nome}>
                                {lead.vendedor.nome.split(" ")[0]}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs text-slate-450">
                          <span>Criado em {lead.criado_em ? new Date(lead.criado_em).toLocaleDateString("pt-BR") : "-"}</span>
                          {!isBulkMode && (
                            <Link href={`/dashboard/leads/${lead.id}`} className="font-bold text-brand-teal hover:underline uppercase font-barlow tracking-wider">
                              Ver Detalhes KYC →
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Controles de paginação da tabela */}
              {tableTotalPages > 1 && (
                <div className="flex items-center justify-between py-3 px-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                  <span className="text-xs text-slate-500 font-medium">
                    Mostrando {(tablePage - 1) * TABLE_PAGE_SIZE + 1}–{Math.min(tablePage * TABLE_PAGE_SIZE, filteredLeads.length)} de {filteredLeads.length} leads
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTablePage(Math.max(1, tablePage - 1))}
                      disabled={tablePage <= 1}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Anterior
                    </button>
                    <span className="text-xs font-bold text-brand-blue px-2">
                      Página {tablePage} de {tableTotalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTablePage(Math.min(tableTotalPages, tablePage + 1))}
                      disabled={tablePage >= tableTotalPages}
                      className="px-3 py-1.5 text-xs font-bold bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-xs"
                    >
                      Próxima →
                    </button>
                  </div>
                </div>
              )}
            </>);
              })()}
            </div>

            {/* Sidebar de Métricas e Funil de Vendas */}
            <div className="space-y-6 lg:sticky lg:top-4">
              {/* Card de Volume Financeiro de Vendas */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-md text-slate-800 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider font-barlow">Volume em negociação</p>
                  <h3 className="text-2xl font-bold text-brand-blue font-barlow tracking-wide mt-1">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      maximumFractionDigits: 0,
                    }).format(totalVolume)}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 font-medium leading-relaxed">
                    Soma dos créditos desejados dos leads ativos.
                  </p>
                </div>
              </div>

              {/* Card de Funil de Vendas */}
              <div className="bg-white border border-slate-200 p-4 rounded-md space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2 font-barlow uppercase">
                    <TrendingUp className="w-4 h-4 text-brand-teal" /> Conversão do Funil
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Acompanhe a taxa de conversão cumulativa por etapa.</p>
                </div>

                <div className="space-y-5">
                  {/* Etapa 1: Novos / Total */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>1. Total de Leads</span>
                      </span>
                      <span className="font-barlow text-slate-500">{funilTotais} leads <span className="text-blue-500 ml-1 font-bold">(100%)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                      <div className="bg-brand-blue h-full w-full rounded-full transition-all duration-500" />
                    </div>
                  </div>

                  {/* Etapa 2: Agendados */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <span>2. Agendados</span>
                      </span>
                      <span className="font-barlow text-slate-500">{funilAgendados} leads <span className="text-purple-500 ml-1 font-bold">({pctAgendados}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                      <div className="bg-brand-blue   h-full rounded-full transition-all duration-500" style={{ width: `${pctAgendados}%` }} />
                    </div>
                  </div>

                  {/* Etapa 3: Presentes */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                        <span>3. Presentes</span>
                      </span>
                      <span className="font-barlow text-slate-500">{funilPresentes} leads <span className="text-pink-500 ml-1 font-bold">({pctPresentes}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                      <div className="bg-brand-blue   h-full rounded-full transition-all duration-500" style={{ width: `${pctPresentes}%` }} />
                    </div>
                  </div>

                  {/* Etapa 4: Fichas KYC */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-500" />
                        <span>4. Fichas KYC</span>
                      </span>
                      <span className="font-barlow text-slate-500">{funilFichas} leads <span className="text-cyan-500 ml-1 font-bold">({pctFichas}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                      <div className="bg-brand-blue   h-full rounded-full transition-all duration-500" style={{ width: `${pctFichas}%` }} />
                    </div>
                  </div>

                  {/* Etapa 5: Fechados (Sucesso) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>5. Fechados</span>
                      </span>
                      <span className="font-barlow text-slate-500">{funilFechados} leads <span className="text-emerald-500 ml-1 font-bold">({pctFechados}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                      <div className="bg-brand-blue   h-full rounded-full transition-all duration-500" style={{ width: `${pctFechados}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. BARRA FLUTUANTE DE AÇÕES (Apenas ADM no Modo Lote) */}
      {isBulkMode && selectedLeadIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-slate-200 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 w-[var(--layout-progress-width)] max-w-2xl animate-scaleUp">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold text-xs">
              {selectedLeadIds.length}
            </span>
            <span className="text-xs font-bold text-slate-700 font-barlow uppercase tracking-wider">
              {selectedLeadIds.length === 1 ? "Lead selecionado" : "Leads selecionados"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <select
              value={bulkVendedorId}
              onChange={(e) => setBulkVendedorId(e.target.value)}
              className="flex-1 sm:w-48 pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="">Transferir para...</option>
              {user.role === "ADM" && (
                <option value={user.id}>{user.nome} (Você / ADM)</option>
              )}
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome} (Vendedor)
                </option>
              ))}
            </select>

            <button
              onClick={handleBulkTransfer}
              disabled={bulkTransferring || !bulkVendedorId}
              className="px-4 py-2 bg-brand-blue   hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-brand-blue/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {bulkTransferring ? "Transferindo..." : "Confirmar"}
            </button>

            <button
              onClick={() => {
                setSelectedLeadIds([]);
                setIsBulkMode(false);
              }}
              className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}


      {/* MODAL RÁPIDO DE AGENDAMENTO (KANBAN) */}
      {agendamentoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40  p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-800 font-barlow uppercase tracking-wider">Novo Agendamento</h3>
                <p className="text-slate-500 text-xs">Defina a data e a hora do compromisso.</p>
              </div>
            </div>

              <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Tipo do Agendamento</label>
                <select
                  value={agendamentoModal.tipo}
                  onChange={(e) => setAgendamentoModal({ ...agendamentoModal, tipo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-slate-700 text-sm outline-none cursor-pointer"
                >
                  <option value="LIGAÇÃO">Lembrete de Ligação </option>
                  <option value="PRESENCIAL">Reunião Presencial / Visita </option>
                  <option value="ONLINE">Reunião Online </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Data e Hora</label>
                <input
                  type="datetime-local"
                  required
                  value={agendamentoModal.date}
                  onChange={(e) => setAgendamentoModal({ ...agendamentoModal, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-slate-800 text-sm outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAgendamentoModal(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider font-barlow transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmAgendamentoDrop}
                  disabled={!agendamentoModal.date}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-barlow transition-all disabled:opacity-50"
                >
                  Agendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* MODAL DE CRIAÇÃO/EDIÇÃO DE LEAD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45  animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl relative animate-scaleUp max-h-[var(--layout-dialog-max-height)] overflow-y-auto">
            {/* Fechar */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <h3 className="font-extrabold text-2xl text-slate-800 mb-1 font-barlow uppercase tracking-wide">Cadastrar Novo Lead</h3>
            <p className="text-slate-500 text-sm mb-6">Preencha as informações básicas do consorciado para iniciar.</p>

            {formError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateLead} className="space-y-4">
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                />
              </div>

              {/* Grid Telefone / Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Telefone (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(maskPhone(e.target.value))}
                    maxLength={15}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">E-mail (Opcional)</label>
                  <input
                    type="email"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Grid Consórcio / Valor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Tipo de Consórcio (Opcional)</label>
                  <select
                    value={tipoConsorcio}
                    onChange={(e) => setTipoConsorcio(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-sm outline-none cursor-pointer"
                  >
                    <option value="">Não especificado</option>
                    <option value="Imóvel">Imóvel</option>
                    <option value="Veículo">Veículo</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Agro">Agro</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Valor de Crédito Desejado (Opcional)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    value={valorDesejado}
                    onChange={(e) => setValorDesejado(maskCurrency(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Grid Parcela Máxima / Valor de Entrada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Valor Parcela Máxima (Opcional)</label>
                  <input
                    type="number"
                    placeholder="Ex: 1200"
                    value={valorParcela}
                    onChange={(e) => setValorParcela(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Valor de Entrada (Opcional)</label>
                  <input
                    type="number"
                    placeholder="Ex: 30000"
                    value={valorEntrada}
                    onChange={(e) => setValorEntrada(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Localização e Origem */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Localização / Bairro (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: São José, Pinheirinho"
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Origem do Lead (Opcional)</label>
                  <select
                    value={origem}
                    onChange={(e) => setOrigem(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-700 text-sm outline-none cursor-pointer"
                  >
                    <option value="">Não especificado</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Indicação">Indicação</option>
                    <option value="WhatsApp">WhatsApp Direto</option>
                    <option value="Passivo">Passivo (Ligou)</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              {/* Atribuição (ADM / SECRETARIA) */}
              {(user.role === "ADM" || user.role === "SECRETARIA") && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Atribuir a Vendedor</label>
                  <select
                    value={vendedorId}
                    onChange={(e) => setVendedorId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-755 text-sm outline-none cursor-pointer"
                  >
                    {user.role === "ADM" ? (
                      <option value="">Atribuir a mim mesmo</option>
                    ) : (
                      <option value="">Selecionar Vendedor...</option>
                    )}
                    {vendedores.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Observações */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-barlow">Observações Iniciais</label>
                <textarea
                  placeholder="Escreva anotações importantes sobre o contato ou perfil do lead..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-teal focus:ring-1 focus:ring-brand-teal rounded-xl text-slate-800 text-sm outline-none resize-none"
                />
              </div>

              {/* Agendar Retorno */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 font-barlow tracking-wide">Entrar em contato novamente?</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Agendar um follow-up com este lead.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={retornarContato}
                      onChange={(e) => setRetornarContato(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {retornarContato && (
                  <div className="space-y-1.5 pt-3 border-t border-slate-200">
                    <label className="text-xs font-bold text-amber-600 uppercase tracking-wider block font-barlow">Data e Hora do Retorno</label>
                    <input
                      type="datetime-local"
                      required={retornarContato}
                      value={dataRetorno}
                      onChange={(e) => setDataRetorno(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-amber-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-slate-800 text-sm outline-none cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Botões do Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-brand-blue   hover:opacity-95 text-white font-bold text-sm rounded-xl cursor-pointer flex items-center gap-2 font-barlow tracking-wider uppercase shadow-lg shadow-brand-blue/20"
                >
                  {loading ? "Cadastrando..." : "Confirmar Cadastro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
