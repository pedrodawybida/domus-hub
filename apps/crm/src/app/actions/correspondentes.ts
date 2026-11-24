"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

export async function getCorrespondentesAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    return await db.correspondenteBancario.findMany({
      orderBy: { nome: "asc" }
    });
  } catch (error) {
    console.error("Erro ao obter correspondentes:", error);
    return [];
  }
}

export async function createCorrespondenteAction(nome: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADM") {
      return { success: false, error: "Acesso negado." };
    }

    if (!nome.trim()) {
      return { success: false, error: "Nome é obrigatório." };
    }

    await db.correspondenteBancario.create({
      data: { nome: nome.trim() }
    });

    revalidatePath("/admin/correspondentes");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar correspondente:", error);
    return { success: false, error: "Erro ao criar correspondente." };
  }
}

export async function updateCorrespondenteAction(id: string, nome: string, ativo: boolean) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADM") {
      return { success: false, error: "Acesso negado." };
    }

    if (!nome.trim()) {
      return { success: false, error: "Nome é obrigatório." };
    }

    await db.correspondenteBancario.update({
      where: { id },
      data: { nome: nome.trim(), ativo }
    });

    revalidatePath("/admin/correspondentes");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar correspondente:", error);
    return { success: false, error: "Erro ao atualizar correspondente." };
  }
}
