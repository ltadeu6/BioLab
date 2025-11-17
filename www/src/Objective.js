import { RK4, RK4getvalue } from "./runge-kutta.js";
export class Objective {
  constructor(exper, f, res, mSize) {
    /*
     * res: a resolução utilizada para a resolução com RK4
     * mSize: numero de variáveis do modelo atual
     * exper: tabela de valores obtidos experimentalmente
     */
    this.exper = exper;
    this.sampleSize = exper.length;
    // Tamanho da amostra obtida experimentalmente (número de pontos)
    this.f = f;
    // Função f(t) a ser utilizada para o ajuste
    // Vetor de tempos para resolução numérica
    let tf = exper[this.sampleSize - 1][0];
    this.timeArray = [];
    for (let i = 0; i <= res; i++) {
      this.timeArray[i] = (i * tf) / res;
    }
    // valor inicial é o primeiro ponto experimental
    this.y0 = [exper[1][2], exper[1][1]];

    // Se o número de variaveis na tabela (descontando a coluna tempo)
    // for maior que o numero de variáveis do modelo,
    // a função objetivo é calculada com o número de variáveis do modelo.
    // Caso contrário, ela é calculada com o numero de variáveis da tabela.
    if (exper[1].length - 1 >= mSize) {
      this.nVar = mSize;
    } else {
      this.nVar = exper[1].length - 1;
    }

    const headerRow = Array.isArray(exper[0]) ? exper[0] : [];
    const normalizedHeaders = headerRow.map((value) => {
      if (typeof value !== "string") {
        return "";
      }
      return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    });

    const dataColumns = exper[1] ? exper[1].length : 0;
    const maxValidIndex = Math.max(1, dataColumns - 1);
    const clampColumnIndex = (candidate) => {
      if (!Number.isFinite(candidate) || candidate < 1 || candidate >= dataColumns) {
        return Math.min(Math.max(1, candidate || 1), maxValidIndex);
      }
      return candidate;
    };

    const findColumnIndex = (keywords, fallback) => {
      const idx = normalizedHeaders.findIndex((name, columnIndex) => {
        if (columnIndex === 0) {
          return false;
        }
        return keywords.some((keyword) => name.includes(keyword));
      });
      const candidate = idx > 0 ? idx : fallback;
      return clampColumnIndex(candidate);
    };

    this.stateColumnIndex = [];
    if (this.nVar >= 1) {
      const fallbackCells = Math.min(2, maxValidIndex);
      this.stateColumnIndex[0] = findColumnIndex(
        ["celula", "celulas", "celula", "cell", "cells", "biomassa", "biomass", "x"],
        fallbackCells,
      );
    }
    if (this.nVar >= 2) {
      this.stateColumnIndex[1] = findColumnIndex([
        "substrato",
        "substrate",
        "substrat",
        "s",
      ], 1);
    }
    for (let j = 2; j < this.nVar; j++) {
      this.stateColumnIndex[j] = clampColumnIndex(Math.min(j + 1, maxValidIndex));
    }

    // Média das colunas para normalização
    this.mean = new Array(this.nVar).fill(0);
    for (let i = 1; i < this.sampleSize; i++) {
      for (let j = 0; j < this.nVar; j++) {
        const columnIndex = this.stateColumnIndex[j];
        if (columnIndex < exper[i].length) {
          this.mean[j] += exper[i][columnIndex];
        }
      }
    }
    for (let j = 0; j < this.nVar; j++) {
      this.mean[j] /= this.sampleSize - 1;
    }
  }
  objective(params) {
    // Resolve o modelo pelo método RK4
    let sol = RK4(this.f, this.timeArray, this.y0, params);

    // Pega predições pontuais do modelo
    let pSol = [];
    for (let i = 1; i < this.sampleSize; i++) {
      pSol[i - 1] = RK4getvalue(
        sol,
        this.timeArray,
        this.exper[i][0],
        this.f,
        params,
      );
    }

    // Cálculo da função objetivo
    let obj = 0;
    for (let i = 2; i < this.sampleSize; i++) {
      for (let j = 0; j < this.nVar; j++) {
        const columnIndex = this.stateColumnIndex[j];
        if (columnIndex >= this.exper[i].length) {
          continue;
        }
        const observed = this.exper[i][columnIndex];
        const predicted = pSol[i - 1][j];
        const denom = this.mean[j] !== 0 ? this.mean[j] : 1;
        obj += ((predicted - observed) / denom) ** 2;
      }
    }
    // console.log(obj)
    return obj;
  }
}
