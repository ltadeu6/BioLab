export function RK4(f, t, Y0, params) {
  /*
   * f: trata-se da função f(t)  ser integrada
   * t: trata-se do vetor de pontos no tempo
   * Y0: trata-se do vetor de condições iniciais
   * params: paremetros passados para o modelo de crescimento
   */

  let resolution = t.length; // resolução é o numero de pontos amostrados
  let h = t[1]; // h é o tamanho do passo de integração

  let y = []; // inicializa o vetor que será devolvido como eixo y

  y[0] = Y0; //inicializa o vetor com as condições iniciais

  for (let i = 0; i < resolution; i++) {
    y[i + 1] = RK4step(f, t[i], y[i], h, params);
  }

  return y;
}

function RK4step(f, t, y0, h, params) {
  // Algorítimo Runge-kutta 4

  let s = [];
  let y = [];
  let nVar = y0.length;

  const k1 = f(t, y0, params);
  for (let i = 0; i < nVar; i++) {
    s[i] = y0[i] + (k1[i] * h) / 2;
  }
  const k2 = f(t + h / 2, s, params);

  for (let i = 0; i < nVar; i++) {
    s[i] = y0[i] + (k2[i] * h) / 2;
  }
  const k3 = f(t + h / 2, s, params);

  for (let i = 0; i < nVar; i++) {
    s[i] = y0[i] + k3[i] * h;
  }
  const k4 = f(t + h, s, params);

  for (let i = 0; i < nVar; i++) {
    s[i] = y0[i] + k3[i] * h;
    y[i] = y0[i] + (k1[i] / 6 + k2[i] / 3 + k3[i] / 3 + k4[i] / 6) * h;
  }

  return y;
}

export function RK4getvalue(sol, timearray, time, f, params) {
  /* A partir de uma solução gerada pela função RK4,
   * esta função permite pegar o valor de y para um ponto arbitrário de tempo,
   * para tal, é pego o valor mais próximo do ponto desejado
   * e calculado com um passo de Runge-kutta para o valor exato de tempo desejado
   */

  let stepsize = timearray[1];
  // o tamanho do passo é igual o ponto 1 do vetor tempo (ponto 0 é igual a 0)
  let h = time % stepsize;
  // o passo dado é igual ao modulo entre o tempo arbitrário e o passo na resolução original
  let y0 = sol[Math.floor(time / stepsize)];
  // inicia-se no ponto da curva imediatamente anterior ao ponto desejado
  let y = RK4step(f, time, y0, h, params);
  // calcula-se o y com um único passo RK4 a partir do ponto anterior
  return y;
}
