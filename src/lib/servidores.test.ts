import { describe, expect, it } from "vitest";
import { dataAvaliacaoServidor, linhaServidor } from "./servidores";

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