"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

export async function getEquipesAction() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADM") return { success: false, error: "Acesso negado." };

    const equipes = await db.equipe.findMany({
      orderBy: { criado_em: "desc" },
      include: {
        _count: {
          select: { users: true }
        }
      }
    });
    return { success: true, equipes };
  } catch (error) {
    console.error("Erro ao listar equipes:", error);
    return { success: false, error: "Erro ao listar equipes." };
  }
}

export async function createEquipeAction(nome: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADM") return { success: false, error: "Acesso negado." };

    const equipe = await db.equipe.create({
      data: { nome }
    });

    revalidatePath("/admin/equipes");
    revalidatePath("/admin/vendedores");
    return { success: true, equipe };
  } catch (error) {
    console.error("Erro ao criar equipe:", error);
    return { success: false, error: "Erro ao criar equipe." };
  }
}

export async function updateEquipeAction(id: string, nome: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADM") return { success: false, error: "Acesso negado." };

    const equipe = await db.equipe.update({
      where: { id },
      data: { nome }
    });

    revalidatePath("/admin/equipes");
    revalidatePath("/admin/vendedores");
    return { success: true, equipe };
  } catch (error) {
    console.error("Erro ao atualizar equipe:", error);
    return { success: false, error: "Erro ao atualizar equipe." };
  }
}

export async function deleteEquipeAction(id: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADM") return { success: false, error: "Acesso negado." };

    // Check if team has users
    const equipe = await db.equipe.findUnique({ where: { id }, include: { users: true } });
    if (equipe && equipe.users.length > 0) {
      return { success: false, error: "Não é possível excluir uma equipe que possui vendedores vinculados." };
    }

    await db.equipe.delete({
      where: { id }
    });

    revalidatePath("/admin/equipes");
    revalidatePath("/admin/vendedores");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir equipe:", error);
    return { success: false, error: "Erro ao excluir equipe." };
  }
}
