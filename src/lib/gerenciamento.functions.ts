import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { colunasServidores, linhaServidor } from "@/lib/servidores";

export const listarOrgaosBase = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("servidores").select("orgao").order("orgao");
    if (error) throw new Error("Não foi possível carregar os órgãos da base de servidores.");
    return [...new Set((data ?? []).map((s) => s.orgao))];
  });

export const detalharOrgao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ orgao: z.string().min(1).max(100) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: servidores, error } = await context.supabase
      .from("servidores")
      .select("orgao,nome,matricula,data_inicio_exercicio,cargo,datas_avaliacoes")
      .eq("orgao", data.orgao)
      .order("nome");
    if (error) throw new Error("Não foi possível carregar os servidores deste órgão.");
    return { colunas: colunasServidores, linhas: (servidores ?? []).map(linhaServidor) };
  });
