"use server";

import fs from "fs/promises";
import path from "path";
import { uploadsRoot } from "@/lib/uploads";
import { db } from "@/lib/db";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

// Helper para salvar arquivos recebidos via FormData
async function saveFile(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = uploadsRoot;
    await fs.mkdir(uploadDir, { recursive: true });

    // Nome único seguro
    const fileExtension = path.extname(file.name) || ".pdf";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExtension}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);
    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Erro ao salvar arquivo:", error);
    return null;
  }
}

// Helper para salvar imagem de assinatura em Base64
async function saveBase64Signature(base64Str: string | null): Promise<string | null> {
  if (!base64Str || !base64Str.startsWith("data:image")) return null;

  try {
    const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const uploadDir = uploadsRoot;
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `signature-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.png`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);
    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Erro ao salvar assinatura:", error);
    return null;
  }
}

// Listar Leads (Filtrado por Role)
export async function getLeadsAction() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return [];

    if (currentUser.role === "ADM" || currentUser.role === "SECRETARIA") {
      return await db.lead.findMany({
        include: {
          vendedor: {
            select: { nome: true },
          },
          vendedor_anterior: {
            select: { nome: true },
          },
          documentacao: true,
          tags: true,
        },
        orderBy: { criado_em: "desc" },
      });
    } else if (currentUser.role === "GESTOR" && currentUser.equipe_id) {
      return await db.lead.findMany({
        where: {
          vendedor: {
            equipe_id: currentUser.equipe_id
          }
        },
        include: {
          vendedor: {
            select: { nome: true },
          },
          vendedor_anterior: {
            select: { nome: true },
          },
          documentacao: true,
          tags: true,
        },
        orderBy: { criado_em: "desc" },
      });
    } else {
      return await db.lead.findMany({
        where: { vendedor_id: currentUser.id },
        include: {
          vendedor: {
            select: { nome: true },
          },
          vendedor_anterior: {
            select: { nome: true },
          },
          documentacao: true,
          tags: true,
        },
        orderBy: { criado_em: "desc" },
      });
    }
  } catch (error) {
    console.error("Erro ao obter leads:", error);
    return [];
  }
}

// Obter Único Lead
export async function getLeadByIdAction(id: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return null;

    const lead = await db.lead.findUnique({
      where: { id },
      include: {
        documentacao: true,
        tags: true,
        vendedor: { select: { id: true, nome: true } },
        vendedor_anterior: { select: { id: true, nome: true } },
      },
    });

    if (!lead) return null;

    // Regra de segurança
    if (currentUser.role === "ADM" || currentUser.role === "SECRETARIA") {
      return lead;
    }

    if (currentUser.role === "GESTOR" && currentUser.equipe_id) {
      const vendedorDoLead = await db.user.findUnique({ where: { id: lead.vendedor_id } });
      if (vendedorDoLead && vendedorDoLead.equipe_id === currentUser.equipe_id) {
        return lead;
      }
    }

    if (lead.vendedor_id === currentUser.id) {
      return lead;
    }

    return null;
  } catch {
    return null;
  }
}

// Criar Lead
export async function createLeadAction(data: {
  nome: string;
  telefone: string;
  email?: string;
  tipo_consorcio?: string;
  valor_desejado?: number;
  valor_parcela?: number;
  valor_entrada?: number;
  status: string;
  origem?: string;
  localizacao?: string;
  observacoes: string;
  vendedor_id?: string;
  retornar_contato?: boolean;
  data_retorno?: Date | null;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Não autenticado." };
    }

    let targetVendedorId = currentUser.id;

    if ((currentUser.role === "ADM" || currentUser.role === "SECRETARIA" || currentUser.role === "GESTOR") && data.vendedor_id) {
      targetVendedorId = data.vendedor_id;
    }

    const lead = await db.lead.create({
      data: {
        nome: data.nome.trim(),
        telefone: data.telefone.trim(),
        email: data.email?.trim() || null,
        tipo_consorcio: data.tipo_consorcio || null,
        valor_desejado: data.valor_desejado ? Number(data.valor_desejado) : null,
        valor_parcela: data.valor_parcela ? Number(data.valor_parcela) : null,
        valor_entrada: data.valor_entrada ? Number(data.valor_entrada) : null,
        status: data.status,
        origem: data.origem?.trim() || null,
        localizacao: data.localizacao?.trim() || null,
        observacoes: data.observacoes.trim(),
        vendedor_id: targetVendedorId,
        retornar_contato: data.retornar_contato || false,
        data_retorno: data.data_retorno || null,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, leadId: lead.id };
  } catch (error) {
    console.error("Erro ao criar lead:", error);
    return { success: false, error: "Erro ao criar lead." };
  }
}

// Atualizar Lead (Detalhes Básicos)
export async function updateLeadAction(
  id: string,
  data: {
    nome: string;
    telefone: string;
    email?: string;
    tipo_consorcio: string;
    valor_desejado: number;
    valor_parcela?: number;
    valor_entrada?: number;
    status: string;
    origem?: string;
    localizacao?: string;
    observacoes: string;
    vendedor_id?: string;
    correspondente_id?: string;
    data_agendamento?: Date | null;
    tipo_agendamento?: string | null;
    retornar_contato?: boolean;
    data_retorno?: Date | null;
  }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: "Não autenticado." };

    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) return { success: false, error: "Lead não encontrado." };

    // Segurança
    if (currentUser.role !== "ADM" && currentUser.role !== "SECRETARIA" && lead.vendedor_id !== currentUser.id) {
      return { success: false, error: "Acesso negado." };
    }

    let updateData: any = {
      nome: data.nome.trim(),
      telefone: data.telefone.trim(),
      email: data.email?.trim() || null,
      tipo_consorcio: data.tipo_consorcio,
      valor_desejado: Number(data.valor_desejado),
      valor_parcela: data.valor_parcela ? Number(data.valor_parcela) : null,
      valor_entrada: data.valor_entrada ? Number(data.valor_entrada) : null,
      status: data.status,
      origem: data.origem?.trim() || null,
      localizacao: data.localizacao?.trim() || null,
      observacoes: data.observacoes.trim(),
      correspondente_id: data.correspondente_id || null,
      data_agendamento: data.data_agendamento,
      tipo_agendamento: data.tipo_agendamento,
      retornar_contato: data.retornar_contato !== undefined ? data.retornar_contato : undefined,
      data_retorno: data.data_retorno !== undefined ? data.data_retorno : undefined,
      ultima_interacao: new Date(),
    };

    if ((currentUser.role === "ADM" || currentUser.role === "SECRETARIA") && data.vendedor_id) {
      if (data.vendedor_id !== lead.vendedor_id) {
        updateData.vendedor_id = data.vendedor_id;
        updateData.vendedor_anterior_id = lead.vendedor_id;
      }
    }

    await db.lead.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/agenda");
    revalidatePath(`/dashboard/leads/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar lead:", error);
    return { success: false, error: "Erro ao atualizar lead." };
  }
}

// Atualizar Apenas Status (Rápido via Dashboard)
export async function updateLeadStatusAction(id: string, status: string, dataAgendamento?: Date | string | null, tipoAgendamento?: string | null) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: "Não autenticado." };

    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) return { success: false, error: "Lead não encontrado." };

    // Segurança
    if (currentUser.role !== "ADM" && currentUser.role !== "SECRETARIA" && lead.vendedor_id !== currentUser.id) {
      return { success: false, error: "Acesso negado." };
    }

    const dataToUpdate: any = { status, ultima_interacao: new Date() };
    if (dataAgendamento !== undefined) {
      dataToUpdate.data_agendamento = dataAgendamento ? new Date(dataAgendamento) : null;
    }
    if (tipoAgendamento !== undefined) {
      dataToUpdate.tipo_agendamento = tipoAgendamento;
    }

    await db.lead.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/agenda");
    revalidatePath(`/dashboard/leads/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return { success: false, error: "Erro ao atualizar status." };
  }
}

// Deletar Lead
export async function deleteLeadAction(id: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: "Não autenticado." };

    const lead = await db.lead.findUnique({ where: { id } });
    if (!lead) return { success: false, error: "Lead não encontrado." };

    if (currentUser.role !== "ADM" && currentUser.role !== "SECRETARIA" && lead.vendedor_id !== currentUser.id) {
      return { success: false, error: "Acesso negado." };
    }

    await db.lead.delete({ where: { id } });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar lead:", error);
    return { success: false, error: "Erro ao deletar lead." };
  }
}

// Salvar Documentação do Cliente (KYC/Proposta) via FormData
export async function saveLeadDocumentationAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: "Não autenticado." };

    const leadId = formData.get("lead_id") as string;
    if (!leadId) return { success: false, error: "ID do Lead é obrigatório." };

    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: { documentacao: true, tags: true },
    });
    if (!lead) return { success: false, error: "Lead não encontrado." };

    // Segurança
    if (currentUser.role !== "ADM" && currentUser.role !== "SECRETARIA" && lead.vendedor_id !== currentUser.id) {
      return { success: false, error: "Acesso negado." };
    }

    // Processamento de dados textuais
    const nome = formData.get("nome") as string;
    const cpf = formData.get("cpf") as string;
    const dataNascimentoStr = formData.get("data_nascimento") as string;
    const email = formData.get("email") as string;
    const celular = formData.get("celular") as string;
    const melhorHorario = formData.get("melhor_horario_comunicacao") as string;

    if (!nome || !cpf || !dataNascimentoStr || !email || !celular) {
      return { success: false, error: "Todos os dados pessoais do cliente são obrigatórios." };
    }

    // Processamento de arquivos
    const selfieFile = formData.get("selfie") as File | null;
    const assinaturaBase64 = formData.get("assinatura_base64") as string | null;
    const documentoIdentidadeFile = formData.get("documento_identidade") as File | null;
    const comprovanteEnderecoFile = formData.get("comprovante_endereco") as File | null;
    const comprovanteRendaFile = formData.get("comprovante_renda") as File | null;
    const documentoIdentidadeConjugeFile = formData.get("documento_identidade_conjuge") as File | null;
    const certidaoEstadoCivilFile = formData.get("certidao_estado_civil") as File | null;
    const anexoPropostaFile = formData.get("anexo_proposta") as File | null;

    // Salvar novos uploads
    const selfieUrl = await saveFile(selfieFile);
    const assinaturaUrl = await saveBase64Signature(assinaturaBase64);
    const documentoIdentidadeUrl = await saveFile(documentoIdentidadeFile);
    const comprovanteEnderecoUrl = await saveFile(comprovanteEnderecoFile);
    const comprovanteRendaUrl = await saveFile(comprovanteRendaFile);
    const documentoIdentidadeConjugeUrl = await saveFile(documentoIdentidadeConjugeFile);
    const certidaoEstadoCivilUrl = await saveFile(certidaoEstadoCivilFile);
    const anexoPropostaUrl = await saveFile(anexoPropostaFile);

    // Validação de documentos mínimos obrigatórios na criação inicial
    if (!lead.documentacao) {
      if (!selfieUrl || !assinaturaUrl || !documentoIdentidadeUrl || !comprovanteEnderecoUrl || !comprovanteRendaUrl) {
        return {
          success: false,
          error: "Selfie, assinatura, documento de identidade, comprovante de endereço e comprovante de renda são obrigatórios.",
        };
      }
    }

    // Relação final de campos
    const docData: any = {
      nome: nome.trim(),
      cpf: cpf.trim(),
      data_nascimento: new Date(dataNascimentoStr),
      email: email.trim(),
      celular: celular.trim(),
      melhor_horario_comunicacao: melhorHorario.trim(),
    };

    // Apenas atualiza a URL se um novo arquivo foi enviado
    if (selfieUrl) docData.selfie_url = selfieUrl;
    if (assinaturaUrl) docData.assinatura_url = assinaturaUrl;
    if (documentoIdentidadeUrl) docData.documento_identidade_url = documentoIdentidadeUrl;
    if (comprovanteEnderecoUrl) docData.comprovante_endereco_url = comprovanteEnderecoUrl;
    if (comprovanteRendaUrl) docData.comprovante_renda_url = comprovanteRendaUrl;
    if (documentoIdentidadeConjugeUrl) docData.documento_identidade_conjuge_url = documentoIdentidadeConjugeUrl;
    if (certidaoEstadoCivilUrl) docData.certidao_estado_civil_url = certidaoEstadoCivilUrl;
    if (anexoPropostaUrl) docData.anexo_proposta_url = anexoPropostaUrl;

    if (lead.documentacao) {
      // Atualizar existente
      await db.documentacaoCliente.update({
        where: { id: lead.documentacao.id },
        data: docData,
      });
    } else {
      // Criar nova
      await db.documentacaoCliente.create({
        data: {
          lead_id: leadId,
          ...docData,
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/leads/${leadId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar documentação:", error);
    return { success: false, error: "Erro ao salvar documentação do cliente." };
  }
}

// Obter Dados de Ranking Gerais de Forma Segura e Anonimizada
export async function getRankingAction() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return [];

    // Busca todos os vendedores
    const vendedores = await db.user.findMany({
      where: { role: "VENDEDOR" },
      select: { id: true, nome: true }
    });

    // Para cada vendedor, busca agregados de leads com status 'Fechado'
    const ranking = await Promise.all(
      vendedores.map(async (v) => {
        const stats = await db.lead.aggregate({
          where: {
            vendedor_id: v.id,
            status: "Fechado"
          },
          _count: true,
          _sum: {
            valor_desejado: true
          }
        });

        const totalLeads = await db.lead.count({
          where: { vendedor_id: v.id }
        });

        const fichas = await db.lead.count({
          where: {
            vendedor_id: v.id,
            OR: [
              { status: "Ficha" },
              { status: "Fechado" },
              { documentacao: { isNot: null } }
            ]
          }
        });

        return {
          id: v.id,
          nome: v.nome,
          leadsGeridos: totalLeads,
          fichasGeradas: fichas,
          contratosGanhos: stats._count || 0,
          volumeConsolidado: stats._sum.valor_desejado || 0
        };
      })
    );

    // Ordena por volume fechado (decrescente)
    return ranking.sort((a, b) => b.volumeConsolidado - a.volumeConsolidado);
  } catch (error) {
    console.error("Erro ao buscar ranking:", error);
    return [];
  }
}

// Criar Análise de Crédito Completa com Onboarding integrado
export async function createCreditAnalysisAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: "Não autenticado." };

    const nome = formData.get("nome") as string;
    const cpf = formData.get("cpf") as string;
    const dataNascimentoStr = formData.get("data_nascimento") as string;
    const email = formData.get("email") as string;
    const celular = formData.get("celular") as string;
    const melhorHorario = formData.get("melhor_horario_comunicacao") as string;
    const correspondente = formData.get("correspondente_bancario") as string || "CAIXA";
    
    const valorDesejadoStr = formData.get("valor_desejado") as string || "100000";
    const valorDesejado = parseFloat(valorDesejadoStr) || 100000;
    const tipoConsorcio = formData.get("tipo_consorcio") as string || "Imóvel";

    if (!nome || !cpf || !dataNascimentoStr || !email || !celular) {
      return { success: false, error: "Todos os dados pessoais do cliente são obrigatórios." };
    }

    // Processamento de arquivos
    const selfieFile = formData.get("selfie") as File | null;
    const assinaturaBase64 = formData.get("assinatura_base64") as string | null;
    const documentoIdentidadeFile = formData.get("documento_identidade") as File | null;
    const comprovanteEnderecoFile = formData.get("comprovante_endereco") as File | null;
    const comprovanteRendaFile = formData.get("comprovante_renda") as File | null;
    const documentoIdentidadeConjugeFile = formData.get("documento_identidade_conjuge") as File | null;
    const certidaoEstadoCivilFile = formData.get("certidao_estado_civil") as File | null;
    const anexoPropostaFile = formData.get("anexo_proposta") as File | null;

    const selfieUrl = await saveFile(selfieFile);
    const assinaturaUrl = await saveBase64Signature(assinaturaBase64);
    const documentoIdentidadeUrl = await saveFile(documentoIdentidadeFile);
    const comprovanteEnderecoUrl = await saveFile(comprovanteEnderecoFile);
    const comprovanteRendaUrl = await saveFile(comprovanteRendaFile);
    const documentoIdentidadeConjugeUrl = await saveFile(documentoIdentidadeConjugeFile);
    const certidaoEstadoCivilUrl = await saveFile(certidaoEstadoCivilFile);
    const anexoPropostaUrl = await saveFile(anexoPropostaFile);

    if (!selfieUrl || !assinaturaUrl || !documentoIdentidadeUrl || !comprovanteEnderecoUrl || !comprovanteRendaUrl) {
      return {
        success: false,
        error: "Selfie, assinatura, documento de identidade, comprovante de endereço e comprovante de renda são obrigatórios para a criação.",
      };
    }

    // 1. Criar o Lead primeiro
    const lead = await db.lead.create({
      data: {
        nome: nome.trim(),
        telefone: celular.trim(),
        email: email.trim(),
        tipo_consorcio: tipoConsorcio,
        valor_desejado: valorDesejado,
        status: "Ficha",
        observacoes: `Análise de Crédito iniciada via formulário Corretor. Correspondente Bancário: ${correspondente}`,
        vendedor_id: currentUser.id,
      }
    });

    // 2. Criar a Documentação associada
    await db.documentacaoCliente.create({
      data: {
        lead_id: lead.id,
        nome: nome.trim(),
        cpf: cpf.trim(),
        data_nascimento: new Date(dataNascimentoStr),
        email: email.trim(),
        celular: celular.trim(),
        melhor_horario_comunicacao: melhorHorario.trim(),
        selfie_url: selfieUrl,
        assinatura_url: assinaturaUrl,
        documento_identidade_url: documentoIdentidadeUrl,
        comprovante_endereco_url: comprovanteEnderecoUrl,
        comprovante_renda_url: comprovanteRendaUrl,
        documento_identidade_conjuge_url: documentoIdentidadeConjugeUrl,
        certidao_estado_civil_url: certidaoEstadoCivilUrl,
        anexo_proposta_url: anexoPropostaUrl,
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/analise");
    revalidatePath("/dashboard/fichas");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar análise de crédito:", error);
    return { success: false, error: "Erro ao criar análise de crédito." };
  }
}

// Transferência de Leads em Lote (Apenas ADM ou SECRETARIA)
export async function bulkTransferLeadsAction(leadIds: string[], targetVendedorId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADM" && currentUser.role !== "SECRETARIA")) {
      return { success: false, error: "Acesso não autorizado." };
    }

    if (!leadIds || leadIds.length === 0 || !targetVendedorId) {
      return { success: false, error: "Parâmetros inválidos para transferência." };
    }

    // Verifica se o vendedor de destino existe
    const targetVendedor = await db.user.findUnique({
      where: { id: targetVendedorId }
    });
    if (!targetVendedor) {
      return { success: false, error: "Vendedor de destino não encontrado." };
    }

    const leadsToTransfer = await db.lead.findMany({
      where: { id: { in: leadIds } },
      select: { id: true, vendedor_id: true }
    });

    const updates = leadsToTransfer.map(l => 
      db.lead.update({
        where: { id: l.id },
        data: {
          vendedor_id: targetVendedorId,
          vendedor_anterior_id: l.vendedor_id === targetVendedorId ? undefined : l.vendedor_id
        }
      })
    );

    await db.$transaction(updates);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro na transferência em lote:", error);
    return { success: false, error: "Erro ao transferir leads." };
  }
}

