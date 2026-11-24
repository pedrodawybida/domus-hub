/**
 * Utilitários para formatação e manipulação de datas no fuso horário local.
 * Evita o bug de conversão UTC (ex: .toISOString().slice(0, 16)) que adianta ou atrasa horas em fusos como o do Brasil (UTC-3).
 */

/**
 * Converte um objeto Date, timestamp ou string ISO para o formato padrão do <input type="datetime-local" />:
 * "YYYY-MM-DDTHH:mm" no FUSO HORÁRIO LOCAL do usuário (não UTC).
 */
export function formatToDateTimeLocal(date: Date | string | number | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Converte um objeto Date, timestamp ou string ISO para o formato aceito por <input type="date" />:
 * "YYYY-MM-DD" no FUSO HORÁRIO LOCAL do usuário.
 */
export function formatToDateLocal(date: Date | string | number | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Formata data e hora para exibição amigável em Português (pt-BR):
 * Ex: "20/10/2026 às 14:30"
 */
export function formatDateTimeBR(date: Date | string | number | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  const hora = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${dia}/${mes}/${ano} às ${hora}:${min}`;
}

/**
 * Formata apenas a data para exibição em Português (pt-BR):
 * Ex: "20/10/2026"
 */
export function formatDateBR(date: Date | string | number | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();

  return `${dia}/${mes}/${ano}`;
}

/**
 * Formata apenas o horário para exibição em Português (pt-BR):
 * Ex: "14:30"
 */
export function formatTimeBR(date: Date | string | number | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const hora = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${hora}:${min}`;
}
