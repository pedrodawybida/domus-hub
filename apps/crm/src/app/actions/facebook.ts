"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContaFacebookPayload {
  apelido: string;
  email: string;
  senha: string;
  observacoes?: string;
}

// ─── Listar contas ────────────────────────────────────────────────────────────
export async function listarContasFacebookAction() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Não autenticado.", contas: [] };

  try {
    let contas;
    if (user.role === "ADM" || user.role === "SECRETARIA") {
      contas = await db.contaFacebook.findMany({
        include: {
          dono: { select: { id: true, nome: true } },
        },
        orderBy: [{ dono: { nome: "asc" } }, { apelido: "asc" }],
      });
    } else {
      contas = await db.contaFacebook.findMany({
        where: {
          OR: [
            { dono_id: user.id },
            { visivel_para_todos: true },
          ],
        },
        include: {
          dono: { select: { id: true, nome: true } },
        },
        orderBy: [{ dono: { nome: "asc" } }, { apelido: "asc" }],
      });
    }
    return { success: true, contas };
  } catch (error) {
    console.error("Erro ao listar contas Facebook:", error);
    return { success: false, error: "Erro interno.", contas: [] };
  }
}

// ─── Cadastrar conta ──────────────────────────────────────────────────────────
export async function criarContaFacebookAction(payload: ContaFacebookPayload) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Não autenticado." };

  const { apelido, email, senha, observacoes } = payload;
  if (!apelido?.trim() || !email?.trim() || !senha?.trim()) {
    return { success: false, error: "Apelido, e-mail e senha são obrigatórios." };
  }

  try {
    await db.contaFacebook.create({
      data: {
        apelido: apelido.trim(),
        email: email.trim(),
        senha: senha.trim(),
        observacoes: observacoes?.trim() || null,
        dono_id: user.id,
      },
    });
    revalidatePath("/dashboard/contas-facebook");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar conta Facebook:", error);
    return { success: false, error: "Erro ao salvar a conta." };
  }
}

// ─── Atualizar conta ──────────────────────────────────────────────────────────
export async function atualizarContaFacebookAction(
  id: string,
  payload: ContaFacebookPayload
) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Não autenticado." };

  try {
    const conta = await db.contaFacebook.findUnique({ where: { id } });
    if (!conta) return { success: false, error: "Conta não encontrada." };

    if (conta.dono_id !== user.id && user.role !== "ADM") {
      return { success: false, error: "Sem permissão para editar esta conta." };
    }

    const { apelido, email, senha, observacoes } = payload;
    if (!apelido?.trim() || !email?.trim() || !senha?.trim()) {
      return { success: false, error: "Apelido, e-mail e senha são obrigatórios." };
    }

    await db.contaFacebook.update({
      where: { id },
      data: {
        apelido: apelido.trim(),
        email: email.trim(),
        senha: senha.trim(),
        observacoes: observacoes?.trim() || null,
      },
    });
    revalidatePath("/dashboard/contas-facebook");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar conta Facebook:", error);
    return { success: false, error: "Erro ao atualizar a conta." };
  }
}

// ─── Excluir conta ────────────────────────────────────────────────────────────
export async function deletarContaFacebookAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Não autenticado." };

  try {
    const conta = await db.contaFacebook.findUnique({ where: { id } });
    if (!conta) return { success: false, error: "Conta não encontrada." };

    if (conta.dono_id !== user.id && user.role !== "ADM") {
      return { success: false, error: "Sem permissão para excluir esta conta." };
    }

    await db.contaFacebook.delete({ where: { id } });
    revalidatePath("/dashboard/contas-facebook");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir conta Facebook:", error);
    return { success: false, error: "Erro ao excluir a conta." };
  }
}

// ─── Toggle visibilidade (apenas ADM) ────────────────────────────────────────
export async function toggleVisibilidadeContaFacebookAction(id: string, visivel: boolean) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADM") {
    return { success: false, error: "Apenas o ADM pode alterar a visibilidade." };
  }

  try {
    await db.contaFacebook.update({
      where: { id },
      data: { visivel_para_todos: visivel },
    });
    revalidatePath("/dashboard/contas-facebook");
    return { success: true };
  } catch (error) {
    console.error("Erro ao alterar visibilidade:", error);
    return { success: false, error: "Erro ao alterar visibilidade." };
  }
}
