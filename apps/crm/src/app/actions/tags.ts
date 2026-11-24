"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

export async function getTagsAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    return await db.tag.findMany({
      orderBy: { nome: "asc" }
    });
  } catch (error) {
    console.error("Erro ao listar tags:", error);
    return [];
  }
}

export async function createTagAction(nome: string, cor: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Não autorizado" };

    if (!nome.trim() || !cor.trim()) {
      return { success: false, error: "Nome e cor são obrigatórios" };
    }

    const tag = await db.tag.create({
      data: { nome: nome.trim(), cor }
    });

    revalidatePath("/dashboard");
    return { success: true, tag };
  } catch (error) {
    console.error("Erro ao criar tag:", error);
    return { success: false, error: "Erro ao criar etiqueta" };
  }
}

export async function addTagToLeadAction(leadId: string, tagId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Não autorizado" };

    await db.lead.update({
      where: { id: leadId },
      data: {
        tags: {
          connect: { id: tagId }
        }
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao adicionar tag:", error);
    return { success: false, error: "Erro ao vincular etiqueta" };
  }
}

export async function removeTagFromLeadAction(leadId: string, tagId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Não autorizado" };

    await db.lead.update({
      where: { id: leadId },
      data: {
        tags: {
          disconnect: { id: tagId }
        }
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao remover tag:", error);
    return { success: false, error: "Erro ao desvincular etiqueta" };
  }
}
