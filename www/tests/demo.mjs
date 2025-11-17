import assert from 'assert';
import { Objective } from '../src/Objective.js';
import { PSO } from '../src/PSO.js';
import { monod, pirt } from '../src/conhecidos.js';

function monodPirt(_, y, params) {
  const K_S = params[0];
  const mu_max = params[1];
  const m_S = params[2];
  const Y_XS = params[3];
  const X = y[0];
  const S = y[1];
  const dmu = monod(S, mu_max, K_S);
  const dX = X * dmu;
  const qS = pirt(dmu, Y_XS, m_S);
  const dS = -qS * X;
  return [dX, dS];
}

const demoData = [
  ['tempo', 'substrato', 'celulas'],
  [0, 3.0, 0.05],
  [1, 2.9835, 0.0595],
  [2, 2.964, 0.0708],
  [3, 2.9406, 0.0843],
  [4, 2.9129, 0.1003],
  [5, 2.8799, 0.1194],
  [6, 2.8407, 0.1421],
  [7, 2.794, 0.1691],
  [8, 2.7385, 0.2011],
  [9, 2.6725, 0.2393],
  [10, 2.5942, 0.2846],
  [11, 2.501, 0.3384],
  [12, 2.3905, 0.4023],
  [13, 2.2594, 0.478],
  [14, 2.104, 0.5678],
  [15, 1.9202, 0.674],
];

const obj = new Objective(demoData, monodPirt, 100, 2);
const optim = new PSO(obj, 30, [
  [0.005, 2],
  [0.05, 0.9],
  [0.0015, 0.05],
  [0.3, 0.7],
]);
optim.run(1.49618, 1.49618, 0.7298, 30);

assert(Number.isFinite(optim.err_best_g));
console.log('Final error', optim.err_best_g);
