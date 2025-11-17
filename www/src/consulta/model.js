function model(time, y, params) {
  let K_S = params[0];
  let mu_max = params[1];
  let m_S = params[2];
  let Y_XS = params[3];
  let X = y[0];
  let S = y[1];
  let dmu = monod(S, mu_max, K_S);
  let dX = X * dmu;
  const qS = pirt(dmu, Y_XS, m_S);
  let dS = -qS * X;
  return [dX, dS];
}
