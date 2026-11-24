"use server";

import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { verifyPassword, signJWT, hashPassword, verifyJWT } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface AuthState {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    nome: string;
    email: string;
    role: string;
  };
}

// Login
export async function loginAction(emailOrUsername: string, password: string): Promise<AuthState> {
  try {
    if (!emailOrUsername || !password) {
      return { success: false, error: "Preencha todos os campos." };
    }

    // Procura por email (ou login simples 'carlos')
    const user = await db.user.findUnique({
      where: { email: emailOrUsername.trim() },
    });

    if (!user) {
      return { success: false, error: "Usuário ou senha incorretos." };
    }

    const isValidPassword = verifyPassword(password, user.senha_hash);
    if (!isValidPassword) {
      return { success: false, error: "Usuário ou senha incorretos." };
    }

    if (!user.ativo) {
      return { success: false, error: "Esta conta foi desativada pelo administrador." };
    }

    // Assina o JWT
    const token = await signJWT({
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      equipe_id: user.equipe_id,
    });

    // Salva o token em cookie seguro httpOnly
    const cookieStore = await cookies();
    cookieStore.set("crm_token", token, {
      httpOnly: true,
      secure: false, // Permitir login por rede local HTTP sem HTTPS
      maxAge: 60 * 60 * 24, // 24 horas
      path: "/",
      sameSite: "lax", // Lax permite melhor compatibilidade em redes locais
    });

    // Registrar log de login
    try {
      const reqHeaders = await headers();
      const userAgent = reqHeaders.get("user-agent");
      const ipAddress = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip");
      await db.loginLog.create({
        data: {
          user_id: user.id,
          user_agent: userAgent,
          ip_address: ipAddress ? ipAddress.split(",")[0].trim() : null
        }
      });
    } catch (logError) {
      console.error("Falha ao registrar log de login:", logError);
    }

    return {
      success: true,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Erro no login:", error);
    return { success: false, error: "Erro interno do servidor." };
  }
}

// Logout
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("crm_token");
}

// Obter Usuário Atual
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crm_token")?.value;
    if (!token) return null;

    return await verifyJWT(token);
  } catch {
    return null;
  }
}

// Criar Vendedor/Colaborador (Apenas ADM)
export async function createVendedorAction(nome: string, email: string, password: string, role: string, equipe_id?: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADM") {
      return { success: false, error: "Acesso não autorizado." };
    }

    if (!nome || !email || !password || !role) {
      return { success: false, error: "Todos os campos são obrigatórios." };
    }

    const existingUser = await db.user.findUnique({
      where: { email: email.trim() },
    });

    if (existingUser) {
      return { success: false, error: "Este email/login já está cadastrado." };
    }

    const senhaHash = hashPassword(password);

    await db.user.create({
      data: {
        nome: nome.trim(),
        email: email.trim(),
        senha_hash: senhaHash,
        role: role,
        equipe_id: equipe_id || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar vendedor:", error);
    return { success: false, error: "Erro ao criar vendedor." };
  }
}

// Listar Vendedores (Para todos os corretores autenticados)
export async function getVendedoresAction() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return [];
    }

    let whereClause: any = { role: { in: ["VENDEDOR", "GESTOR"] } };
    
    if (currentUser.role === "GESTOR" && currentUser.equipe_id) {
      whereClause.equipe_id = currentUser.equipe_id;
    } else if (currentUser.role === "VENDEDOR") {
      whereClause.id = currentUser.id;
    }

    return await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        equipe_id: true,
        criado_em: true,
      },
      orderBy: { nome: "asc" },
    });
  } catch {
    return [];
  }
}

// Listar Todos os Colaboradores (Vendedores e Secretárias) para o ADM
export async function getColaboradoresAction() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADM") {
      return [];
    }

    return await db.user.findMany({
      where: {
        role: { in: ["VENDEDOR", "SECRETARIA", "GESTOR"] }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        pode_apresentar: true,
        equipe_id: true,
        criado_em: true,
      },
      orderBy: { nome: "asc" },
    });
  } catch {
    return [];
  }
}

// Obter Histórico de Logins Recentes (Apenas ADM)
export async function getLoginLogsAction() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADM") {
      return [];
    }

    return await db.loginLog.findMany({
      include: {
        user: {
          select: { nome: true, email: true, role: true }
        }
      },
      orderBy: { criado_em: "desc" },
      take: 100 // Limita aos 100 mais recentes
    });
  } catch (error) {
    console.error("Erro ao obter logs de login:", error);
    return [];
  }
}

// Atualizar Colaborador (Apenas ADM)
export async function updateColaboradorAction(
  id: string,
  nome: string,
  email: string,
  role: string,
  ativo: boolean,
  password?: string,
  equipe_id?: string,
  pode_apresentar?: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !await db.user.findFirst({ where: { id: currentUser.id, ativo: true, role: "ADM" } })) {
      return { success: false, error: "Acesso não autorizado." };
    }

    if (!id || !nome || !email || !role) {
      return { success: false, error: "Os campos de nome, login e cargo são obrigatórios." };
    }

    // Verifica se o email/login novo já pertence a OUTRO usuário
    const existingUser = await db.user.findUnique({
      where: { email: email.trim() },
    });

    if (existingUser && existingUser.id !== id) {
      return { success: false, error: "Este login já está em uso por outro colaborador." };
    }

    const updateData: any = {
      nome: nome.trim(),
      email: email.trim(),
      role: role,
      ativo: ativo,
      pode_apresentar,
      equipe_id: equipe_id || null,
    };

    if (password && password.trim() !== "") {
      updateData.senha_hash = hashPassword(password);
    }

    await db.user.update({
      where: { id },
      data: updateData,
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar colaborador:", error);
    return { success: false, error: "Erro interno ao atualizar colaborador." };
  }
}

export async function deleteColaboradorAction(id: string): Promise<{ success: boolean; error?: string; totalLeads?: number }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADM") {
      return { success: false, error: "Acesso não autorizado." };
    }

    if (currentUser.id === id) {
      return { success: false, error: "Você não pode excluir sua própria conta." };
    }

    // Verifica se o colaborador tem leads vinculados
    const totalLeads = await db.lead.count({ where: { vendedor_id: id } });
    if (totalLeads > 0) {
      return {
        success: false,
        error: `Este colaborador possui ${totalLeads} lead(s) vinculado(s). Reatribua os leads antes de excluir.`,
        totalLeads,
      };
    }

    // Exclui registros relacionados antes de deletar o usuário
    await db.loginLog.deleteMany({ where: { user_id: id } });
    await db.academyProgresso.deleteMany({ where: { user_id: id } });
    await db.academyAgendamento.deleteMany({ where: { user_id: id } });
    await db.academyTarefa.deleteMany({ where: { OR: [{ user_id: id }, { atribuida_por: id }] } });
    await db.campanha.deleteMany({ where: { user_id: id } });

    await db.user.delete({ where: { id } });

    revalidatePath("/admin/vendedores");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir colaborador:", error);
    return { success: false, error: "Erro interno ao excluir colaborador." };
  }
}
