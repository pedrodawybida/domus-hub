"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "./auth";
import { revalidatePath } from "next/cache";
import path from "path";
import { uploadsRoot } from "@/lib/uploads";
import fs from "fs/promises";

// ─── XP Constants ─────────────────────────────────────────────────────────────
const XP_AULA_CONCLUIDA = 10;
const XP_MODULO_COMPLETO = 50;
const XP_TAREFA_CONCLUIDA = 15;

// ─── READ ──────────────────────────────────────────────────────────────────────

export async function getAcademyDataAction() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return null;
    const isAdm = currentUser.role === "ADM";

    const modulos = await db.academyModulo.findMany({
      where: isAdm ? undefined : { publicado: true },
      orderBy: { ordem: "asc" },
      include: {
        aulas: {
          orderBy: { ordem: "asc" },
          include: { progressos: { where: { user_id: currentUser.id } } },
        },
      },
    });

    const tarefas = isAdm
      ? await db.academyTarefa.findMany({
          orderBy: { criado_em: "desc" },
          include: {
            user: { select: { id: true, nome: true } },
            criador: { select: { id: true, nome: true } },
          },
        })
      : await db.academyTarefa.findMany({
          where: { user_id: currentUser.id },
          orderBy: { criado_em: "desc" },
          include: {
            user: { select: { id: true, nome: true } },
            criador: { select: { id: true, nome: true } },
          },
        });

    const agendamentos = isAdm
      ? await db.academyAgendamento.findMany({
          orderBy: { data_hora: "asc" },
          include: { user: { select: { id: true, nome: true } } },
        })
      : await db.academyAgendamento.findMany({
          where: { user_id: currentUser.id },
          orderBy: { data_hora: "asc" },
          include: { user: { select: { id: true, nome: true } } },
        });

    const lives = await db.academyLive.findMany({
      where: isAdm ? undefined : { publicado: true },
      orderBy: { criado_em: "desc" },
    });

    const ranking = await db.academyProgresso.groupBy({
      by: ["user_id"],
      _sum: { xp_ganho: true },
      orderBy: { _sum: { xp_ganho: "desc" } },
      take: 10,
    });

    const rankingComNomes = await Promise.all(
      ranking.map(async (r) => {
        const user = await db.user.findUnique({
          where: { id: r.user_id },
          select: { id: true, nome: true },
        });
        return { user_id: r.user_id, nome: user?.nome || "Usuário", xp: r._sum.xp_ganho || 0 };
      })
    );

    const meuXP = await db.academyProgresso.aggregate({
      where: { user_id: currentUser.id },
      _sum: { xp_ganho: true },
    });

    const streak = await calcularStreak(currentUser.id);

    return { modulos, tarefas, agendamentos, lives, ranking: rankingComNomes, meuXP: meuXP._sum.xp_ganho || 0, streak };
  } catch (error) {
    console.error("Erro ao buscar dados da Academy:", error);
    return null;
  }
}

async function calcularStreak(userId: string): Promise<number> {
  try {
    const progressos = await db.academyProgresso.findMany({
      where: { user_id: userId, concluido: true, concluido_em: { not: null } },
      orderBy: { concluido_em: "desc" },
      select: { concluido_em: true },
    });
    if (progressos.length === 0) return 0;
    const diasUnicos = Array.from(
      new Set(
        progressos.filter((p) => p.concluido_em).map((p) => new Date(p.concluido_em!).toISOString().split("T")[0])
      )
    ).sort((a, b) => b.localeCompare(a));
    let streak = 0;
    const hoje = new Date().toISOString().split("T")[0];
    let diaEsperado = hoje;
    for (const dia of diasUnicos) {
      if (dia === diaEsperado) {
        streak++;
        const d = new Date(diaEsperado);
        d.setDate(d.getDate() - 1);
        diaEsperado = d.toISOString().split("T")[0];
      } else break;
    }
    return streak;
  } catch { return 0; }
}

// ─── MODULO (ADM) ──────────────────────────────────────────────────────────────

export async function criarModuloAction(data: { titulo: string; descricao: string; ordem: number; icone?: string; publicado?: boolean }) {
  try {
    const cu = await getCurrentUser();
    if (!cu || cu.role !== "ADM") return { success: false, error: "Acesso negado." };
    await db.academyModulo.create({ data });
    revalidatePath("/dashboard/academy");
    return { success: true };
  } catch { return { success: false, error: "Erro ao criar módulo." }; }
}

export async function atualizarModuloAction(id: string, data: { titulo?: string; descricao?: string; ordem?: number; icone?: string; publicado?: boolean }) {
  try {
    const cu = await getCurrentUser();
    if (!cu || cu.role !== "ADM") return { success: false, error: "Acesso negado." };
    await db.academyModulo.update({ where: { id }, data });
    revalidatePath("/dashboard/academy");
    return { success: true };
  } catch { return { success: false, error: "Erro ao atualizar módulo." }; }
}

export async function deletarModuloAction(id: string) {
  try {
    const cu = await getCurrentUser();
    if (!cu || cu.role !== "ADM") return { success: false, error: "Acesso negado." };
    await db.academyModulo.delete({ where: { id } });
    revalidatePath("/dashboard/academy");
    return { success: true };
  } catch { return { success: false, error: "Erro ao deletar módulo." }; }
}

// ─── AULA (ADM) ─────────────────────────────────────────────────────────────────

export async function criarAulaAction(data: { modulo_id: string; titulo: string; tipo: string; conteudo: string; ordem: number; duracao_min?: number }) {
  try {
    const cu = await getCurrentUser();
    if (!cu || cu.role !== "ADM") return { success: false, error: "Acesso negado." };
    await db.academyAula.create({ data });
    revalidatePath("/dashboard/academy");
    return { success: true };
  } catch { return { success: false, error: "Erro ao criar aula." }; }
}

export async function uploadAcademyFileAction(formData: FormData) {
  try {
    const cu = await getCurrentUser();
    if (!cu || cu.role !== "ADM") return { success: false, error: "Acesso negado." };

    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "Nenhum arquivo enviado." };

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(uploadsRoot, "academy");
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);
    return { success: true, url: `/uploads/academy/${filename}` };
  } catch (error) {
    console.error("Erro no upload do arquivo:", error);
    return { success: false, error: "Falha ao fazer upload do arquivo." };
  }
}

export async function atualizarAulaAction(id: string, data: { titulo?: string; tipo?: string; conteudo?: string; ordem?: number; duracao_min?: number }) {
  try {
    const cu = await getCurrentUser();
    if (!cu || cu.role !== "ADM") return { success: false, error: "Acesso negado." };
    await db.academyAula.update({ where: { id }, data });
    revalidatePath("/dashboard/academy");
    return { success: true };
  } catch { return { success: false, error: "Erro ao atualizar aula." }; }
}

export async function reordenarAulasAction(reorders: { id: string; ordem: number }[]) {
  try {
    const cu = await getCurrentUser();
    if (!cu || cu.role !== "ADM") return { success: false, error: "Acesso negado." };

    // Transaction to update all orders
    await db.$transaction(
      reorders.map((item) =>
        db.academyAula.update({
          where: { id: item.id },
          data: { ordem: item.ordem },
        })
      )
    );
    
    revalidatePath("/dashboard/academy");
    return { success: true };
  } catch (error) {
    console.error("Erro ao reordenar aulas:", error);
    return { success: false, error: "Erro ao reordenar aulas." };
  }
}

export async function deletarAulaAction(id: string) {
  try {
    const cu = await getCurrentUser();
    if (!cu || cu.role !== "ADM") return { success: false, error: "Acesso negado." };
    await db.academyAula.delete({ where: { id } });
    revalidatePath("/dashboard/academy");
    return { success: true };
  } catch { return { success: false, error: "Erro ao deletar aula." }; }
}

// ─── PROGRESSO / XP ───────────────────────────────────────────────────────────

export async function concluirAulaAction(aulaId: string) {
  try {
    const cu = await getCurrentUser();
    if (!cu) return { success: false, error: "Não autenticado." };
    const aula = await db.academyAula.findUnique({ where: { id: aulaId }, include: { modulo: { include: { aulas: true } } } });
    if (!aula) return { success: false, error: "Aula não encontrada." };

    const progresso = await db.academyProgresso.upsert({
      where: { user_id_aula_id: { user_id: cu.id, aula_id: aulaId } },
      update: { concluido: true, concluido_em: new Date(), xp_ganho: XP_AULA_CONCLUIDA },
      create: { user_id: cu.id, aula_id: aulaId, concluido: true, concluido_em: new Date(), xp_ganho: XP_AULA_CONCLUIDA },
    });

    let xpTotal = XP_AULA_CONCLUIDA;
    const todasAulasModulo = aula.modulo.aulas.map((a) => a.id);
    const progressosModulo = await db.academyProgresso.findMany({ where: { user_id: cu.id, aula_id: { in: todasAulasModulo }, concluido: true } });
    if (progressosModulo.length === todasAulasModulo.length) {
      await db.academyProgresso.update({ where: { id: progresso.id }, data: { xp_ganho: XP_AULA_CONCLUIDA + XP_MODULO_COMPLETO } });
      xpTotal += XP_MODULO_COMPLETO;
    }

    revalidatePath("/dashboard/academy");
    return { success: true, xpGanho: xpTotal };
  } catch { return { success: false, error: "Erro ao concluir aula." }; }
}

export async function salvarPaginaPdfAction(aulaId: string, pagina: number) {
  try {
    const cu = await getCurrentUser();
    if (!cu) return { success: false, error: "Não autenticado." };
    const pag = Math.max(1, Math.floor(pagina));

    await db.academyProgresso.upsert({
      where: { user_id_aula_id: { user_id: cu.id, aula_id: aulaId } },
      update: { pagina_atual: pag },
      create: { user_id: cu.id, aula_id: aulaId, pagina_atual: pag, concluido: false },
    });

    revalidatePath("/dashboard/academy");
    return { success: true, pagina: pag };
  } catch (error) {
    console.error("Erro ao salvar página do PDF:", error);
    return { success: false, error: "Erro ao salvar página do PDF." };
  }
}

// ─── TAREFAS ──────────────────────────────────────────────────────────────────

export async function criarTarefaAction(data: { user_id: string; titulo: string; descricao: string; aula_id?: string; prazo?: Date }) {
  try {
    const cu = await getCurrentUser();
    if (!cu || cu.role !== "ADM") return { success: false, error: "Acesso negado." };
    await db.academyTarefa.create({ data: { ...data, atribuida_por: cu.id, xp_ganho: XP_TAREFA_CONCLUIDA } });
    revalidatePath("/dashboard/academy");
    return { success: true };
  } catch { return { success: false, error: "Erro ao criar tarefa." }; }
}

export async function concluirTarefaAction(tarefaId: string) {
  try {
    const cu = await getCurrentUser();
    if (!cu) return { success: false, error: "Não autenticado." };
    const tarefa = await db.academyTarefa.findUnique({ where: { id: tarefaId } });
    if (!tarefa) return { success: false, error: "Tarefa não encontrada." };
    if (tarefa.user_id !== cu.id && cu.role !== "ADM") return { success: false, error: "Acesso negado." };
    await db.academyTarefa.update({ where: { id: tarefaId }, data: { concluida: true, concluida_em: new Date() } });
    if (tarefa.aula_id) {
      await db.academyProgresso.upsert({
        where: { user_id_aula_id: { user_id: tarefa.user_id, aula_id: tarefa.aula_id } },
        update: { concluido: true, concluido_em: new Date(), xp_ganho: XP_TAREFA_CONCLUIDA },
        create: { user_id: tarefa.user_id, aula_id: tarefa.aula_id, concluido: true, concluido_em: new Date(), xp_ganho: XP_TAREFA_CONCLUIDA },
      });
    }
    revalidatePath("/dashboard/academy");
    return { success: true };
  } catch { return { success: false, error: "Erro ao concluir tarefa." }; }
}

export async function deletarTarefaAction(id: string) {
  try {
    const cu = await getCurrentUser();
    if (!cu || cu.role !== "ADM") return { success: false, error: "Acesso negado." };
    await db.academyTarefa.delete({ where: { id } });
    revalidatePath("/dashboard/academy");
    return { success: true };
  } catch { return { success: false, error: "Erro ao deletar tarefa." }; }
}

// ─── AGENDAMENTOS ─────────────────────────────────────────────────────────────

export async function criarAgendamentoAction(data: { user_id: string; titulo: string; descricao?: string; data_hora: Date }) {
  try {
    const cu = await getCurrentUser();
    if (!cu) return { success: false, error: "Não autenticado." };
    if (cu.role !== "ADM" && data.user_id !== cu.id) return { success: false, error: "Acesso negado." };
    await db.academyAgendamento.create({ data: { ...data, criado_por: cu.id } });
    revalidatePath("/dashboard/academy");
    return { success: true };
  } catch { return { success: false, error: "Erro ao criar agendamento." }; }
}

export async function deletarAgendamentoAction(id: string) {
  try {
    const cu = await getCurrentUser();
    if (!cu) return { success: false, error: "Não autenticado." };
    const a = await db.academyAgendamento.findUnique({ where: { id } });
    if (!a) return { success: false, error: "Não encontrado." };
    if (a.user_id !== cu.id && cu.role !== "ADM") return { success: false, error: "Acesso negado." };
    await db.academyAgendamento.delete({ where: { id } });
    revalidatePath("/dashboard/academy");
    return { success: true };
  } catch { return { success: false, error: "Erro ao deletar agendamento." }; }
}

// ─── LIVES (ADM) ──────────────────────────────────────────────────────────────

export async function criarLiveAction(data: { titulo: string; descricao?: string; url: string; data_live?: Date; thumbnail?: string; publicado?: boolean }) {
  try {
    const cu = await getCurrentUser();
    if (!cu || cu.role !== "ADM") return { success: false, error: "Acesso negado." };
    await db.academyLive.create({ data });
    revalidatePath("/dashboard/academy");
    return { success: true };
  } catch { return { success: false, error: "Erro ao criar live." }; }
}

export async function deletarLiveAction(id: string) {
  try {
    const cu = await getCurrentUser();
    if (!cu || cu.role !== "ADM") return { success: false, error: "Acesso negado." };
    await db.academyLive.delete({ where: { id } });
    revalidatePath("/dashboard/academy");
    return { success: true };
  } catch { return { success: false, error: "Erro ao deletar live." }; }
}

// ─── VENDEDORES (para ADM atribuir tarefas) ────────────────────────────────────

export async function getVendedoresParaAcademyAction() {
  try {
    const cu = await getCurrentUser();
    if (!cu || cu.role !== "ADM") return [];
    return await db.user.findMany({
      where: { role: { in: ["VENDEDOR", "GESTOR"] }, ativo: true },
      select: { id: true, nome: true, role: true },
      orderBy: { nome: "asc" },
    });
  } catch { return []; }
}
