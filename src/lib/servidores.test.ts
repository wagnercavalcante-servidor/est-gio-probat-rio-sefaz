import { describe, expect, it } from "vitest";
import { dataAvaliacaoServidor, linhaServidor, periodoAvaliacaoServidor } from "./servidores";

const alexandre = {
  data_inicio_exercicio: "2026-08-24",
  datas_avaliacoes: ["2027-02-23", "2027-08-23", "2028-02-23", "2028-08-23", "2029-02-23", "2029-08-23"],
};

describe("Períodos da avaliação conforme a base", () => {
  it("inicia a primeira avaliação na admissão e termina na primeira data importada", () => {
    expect(periodoAvaliacaoServidor(alexandre, "1")).toEqual({ periodoInicio: "24/08/2026", periodoFim: "23/02/2027" });
  });
  it.each([
    ["2", "24/02/2027", "23/08/2027"],
    ["3", "24/08/2027", "23/02/2028"],
    ["4", "24/02/2028", "23/08/2028"],
    ["5", "24/08/2028", "23/02/2029"],
    ["6", "24/02/2029", "23/08/2029"],
  ])("inicia a %sª no dia seguinte ao fim anterior e preserva o fim da fonte", (numero, periodoInicio, periodoFim) => {
    expect(periodoAvaliacaoServidor(alexandre, numero)).toEqual({ periodoInicio, periodoFim });
  });
  it("avança um dia corrido atravessando mês, ano e ano bissexto", () => {
    for (const [anterior, seguinte] of [["2026-12-31", "01/01/2027"], ["2028-02-29", "01/03/2028"], ["2027-01-31", "01/02/2027"]] as const) {
      expect(periodoAvaliacaoServidor({ data_inicio_exercicio: null, datas_avaliacoes: [anterior, "2029-08-23"] }, "2").periodoInicio).toBe(seguinte);
    }
  });
  it("não estima datas ausentes, inválidas ou sem servidor/número válido", () => {
    expect(periodoAvaliacaoServidor(null, "1")).toEqual({ periodoInicio: "", periodoFim: "" });
    expect(periodoAvaliacaoServidor(alexandre, "7")).toEqual({ periodoInicio: "", periodoFim: "" });
    expect(periodoAvaliacaoServidor(alexandre, "")).toEqual({ periodoInicio: "", periodoFim: "" });
    expect(periodoAvaliacaoServidor({ data_inicio_exercicio: null, datas_avaliacoes: [null, "2027-08-23"] }, "2")).toEqual({ periodoInicio: "", periodoFim: "23/08/2027" });
    expect(periodoAvaliacaoServidor({ data_inicio_exercicio: "2026-08-24", datas_avaliacoes: ["2027-02-30"] }, "1")).toEqual({ periodoInicio: "24/08/2026", periodoFim: "" });
  });
});

describe("Base importada de servidores", () => {
  it.each([
    ["1", "23/02/2027"], ["2", "23/08/2027"], ["3", "23/02/2028"],
    ["4", "23/08/2028"], ["5", "23/02/2029"], ["6", "23/08/2029"],
  ])("seleciona a data literal da %sª avaliação de Alexandre", (numero, esperado) => {
    expect(dataAvaliacaoServidor([
      "2027-02-23", "2027-08-23", "2028-02-23", "2028-08-23", "2029-02-23", "2029-08-23",
    ], numero)).toBe(esperado);
  });
  it("não inventa data para avaliação ausente ou número fora de 1 a 6", () => {
    expect(dataAvaliacaoServidor([], "1")).toBe("");
    expect(dataAvaliacaoServidor(["2027-02-23"], "7")).toBe("");
    expect(dataAvaliacaoServidor(["2027-02-23"], "")).toBe("");
  });
  it("preserva a matrícula, admissão e seis datas de Alexandre sem recalcular as datas da fonte", () => {
    expect(linhaServidor({ orgao: "SEFAZ", nome: "ALEXANDRE PINHEIRO E SILVA", matricula: "30005058",
      cargo: "AUDITOR-FISCAL DA FAZENDA ESTADUAL", data_inicio_exercicio: "2026-08-24",
      datas_avaliacoes: ["2027-02-23", "2027-08-23", "2028-02-23", "2028-08-23", "2029-02-23", "2029-08-23"]
    })).toEqual(["SEFAZ", "ALEXANDRE PINHEIRO E SILVA", "30005058", "24/08/2026",
      "AUDITOR-FISCAL DA FAZENDA ESTADUAL", "23/02/2027", "23/08/2027", "23/02/2028", "23/08/2028", "23/02/2029", "23/08/2029"]);
  });
  it("mantém vazias datas ausentes em vez de inventar prazos", () => {
    expect(linhaServidor({ orgao: "SEFAZ", nome: "Servidor", matricula: "123", cargo: null,
      data_inicio_exercicio: null, datas_avaliacoes: [] }).slice(3)).toEqual(["", "", "", "", "", "", "", ""]);
  });
});