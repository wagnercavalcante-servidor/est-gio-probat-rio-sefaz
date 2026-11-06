import type { Database } from "@/integrations/supabase/types";

export type ServidorBase = Pick<Database["public"]["Tables"]["servidores"]["Row"],
  "orgao" | "nome" | "matricula" | "data_inicio_exercicio" | "cargo" | "datas_avaliacoes">;

export const colunasServidores = ["ÓRGÃO", "SERVIDOR", "MATRÍCULA", "ADMISSÃO", "CARGO",
  ...[6, 12, 18, 24, 30, 36].map((meses, i) => `${i + 1}ª AVALIAÇÃO (${meses} MESES)`)];

export function dataServidorBr(data: string | null) {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
}

export function dataAvaliacaoServidor(datas: ServidorBase["datas_avaliacoes"], numero: string): string {
  if (!/^[1-6]$/.test(numero) || !Array.isArray(datas)) return "";
  const data = datas[Number(numero) - 1];
  return dataServidorBr(typeof data === "string" ? data : null);
}

function dataIsoValida(valor: unknown): string | null {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const data = new Date(`${valor}T00:00:00Z`);
  return Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== valor ? null : valor;
}

export function periodoAvaliacaoServidor(
  servidor: Pick<ServidorBase, "data_inicio_exercicio" | "datas_avaliacoes"> | null,
  numero: string,
): { periodoInicio: string; periodoFim: string } {
  if (!servidor || !/^[1-6]$/.test(numero)) return { periodoInicio: "", periodoFim: "" };
  const datas = Array.isArray(servidor.datas_avaliacoes) ? servidor.datas_avaliacoes : [];
  const indice = Number(numero) - 1;
  const fim = dataIsoValida(datas[indice]);
  let inicio = dataIsoValida(indice === 0 ? servidor.data_inicio_exercicio : datas[indice - 1]);
  if (inicio && indice > 0) {
    const seguinte = new Date(`${inicio}T00:00:00Z`);
    seguinte.setUTCDate(seguinte.getUTCDate() + 1);
    inicio = seguinte.toISOString().slice(0, 10);
  }
  return { periodoInicio: dataServidorBr(inicio), periodoFim: dataServidorBr(fim) };
}

export function linhaServidor(s: ServidorBase): string[] {
  const datas = Array.isArray(s.datas_avaliacoes) ? s.datas_avaliacoes : [];
  return [s.orgao, s.nome, s.matricula, dataServidorBr(s.data_inicio_exercicio), s.cargo ?? "",
    ...Array.from({ length: 6 }, (_, i) => dataServidorBr(typeof datas[i] === "string" ? datas[i] : null))];
}