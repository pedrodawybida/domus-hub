"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "./auth";

export async function getCampanhasAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Não autorizado");
    }

    // Retorna todos os usuários
    let whereClause: any = { role: { in: ["VENDEDOR", "GESTOR", "ADM"] } };
    
    // GESTOR vê apenas sua equipe
    if (user.role === "GESTOR" && user.equipe_id) {
      whereClause.equipe_id = user.equipe_id;
    } else if (user.role === "VENDEDOR") {
      whereClause.id = user.id;
    }

    // ADM vê todos.

    return await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        url_campanha: true,
        campanhas: {
          select: { id: true, nome: true, url: true }
        }
      },
      orderBy: { nome: "asc" },
    });
  } catch (error) {
    console.error("Erro ao obter campanhas:", error);
    return [];
  }
}

export async function addCampanhaAction(userId: string, nome: string, url: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: "Acesso não autorizado." };

    if (currentUser.role !== "ADM" && currentUser.id !== userId) {
      return { success: false, error: "Você não tem permissão para adicionar campanha para este usuário." };
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl) return { success: false, error: "URL não pode ser vazia." };

    try {
      new URL(trimmedUrl);
    } catch {
      return { success: false, error: "A URL informada é inválida. Inclua http:// ou https://" };
    }

    await db.campanha.create({
      data: {
        nome: nome.trim() || "Nova Campanha",
        url: trimmedUrl,
        user_id: userId,
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao adicionar campanha:", error);
    return { success: false, error: "Erro ao salvar a campanha." };
  }
}

export async function deleteCampanhaAction(campanhaId: string, userId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: "Acesso não autorizado." };

    if (currentUser.role !== "ADM" && currentUser.id !== userId) {
      return { success: false, error: "Sem permissão para deletar esta campanha." };
    }

    await db.campanha.deleteMany({
      where: {
        id: campanhaId,
        user_id: userId // garante que só deleta se pertencer ao usuário esperado
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar campanha:", error);
    return { success: false, error: "Erro ao deletar a campanha." };
  }
}
