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

export function linhaServidor(s: ServidorBase): string[] {
  const datas = Array.isArray(s.datas_avaliacoes) ? s.datas_avaliacoes : [];
  return [s.orgao, s.nome, s.matricula, dataServidorBr(s.data_inicio_exercicio), s.cargo ?? "",
    ...Array.from({ length: 6 }, (_, i) => dataServidorBr(typeof datas[i] === "string" ? datas[i] : null))];
}