// MONOD, 1942
export function monod(S, mu_max, K_S) {
  return (mu_max * S) / (K_S + S);
}

// MOSER, 1958
export function moser(S, mu_max, K_S, n) {
  return (mu_max * S ** n) / (K_S + S ** n);
}

// CONTOIS, 1959
export function contois(S, X, mu_max, K_S) {
  return (mu_max * S) / (K_S * X + S);
}

// BERGTER, 1983
export function bergter(S, t, mu_max, K_S, T) {
  return ((mu_max * S) / (K_S + S)) * (1 - Math.exp(-t / T));
}

// TESSIER, 1942
export function tessier(S, mu_max, K_S) {
  return mu_max * (1 - Math.exp(-S / K_S));
}

// ANDREWS, 1968
export function andrews(S, mu_max, K_S, K_I) {
  return (mu_max * S) / (K_S + S + (S ** 2) / K_I);
}

// AIBA; SHODA; NAGATANI, 1968
export function aiba(S, mu_max, K_S, K_I) {
  return ((mu_max * S) / (K_S + S)) * Math.exp(-K_I * S);
}

// Morte celular

// SINCLAIR; KRISTIANSEN, 1987
export function death(K_d) {
  return -K_d;
}

// Consumo do substrato limitante para manutenção

// PIRT, 1965

export function pirt(mu, Y_XS, m_S) {
  return (1 / Y_XS) * mu + m_S;
}
