import assert from 'assert';
import { Objective } from '../src/Objective.js';
import { PSO } from '../src/PSO.js';
import { monod, pirt } from '../src/conhecidos.js';
import { RK4, RK4getvalue } from '../src/runge-kutta.js';

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

function generateDataset(params, options) {
  const {
    initialCells,
    initialSubstrate,
    timeFinal,
    sampleCount,
    resolution,
  } = options;

  const y0 = [initialCells, initialSubstrate];
  const timeArray = Array.from({ length: resolution + 1 }, (_, i) => (i * timeFinal) / resolution);
  const solution = RK4(monodPirt, timeArray, y0, params);

  const rows = [['tempo', 'substrato', 'celulas']];
  for (let i = 0; i <= sampleCount; i++) {
    const timePoint = (i * timeFinal) / sampleCount;
    const [cells, substrate] = RK4getvalue(solution, timeArray, timePoint, monodPirt, params);
    rows.push([timePoint, substrate, cells]);
  }

  return rows;
}

function createDeterministicRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

const trueParams = [160, 0.45, 1.5, 0.5];
const dataset = generateDataset(trueParams, {
  initialCells: 1.2,
  initialSubstrate: 120,
  timeFinal: 12,
  sampleCount: 12,
  resolution: 240,
});

const bounds = [
  [140, 200],
  [0.3, 0.6],
  [1.0, 2.5],
  [0.3, 0.7],
];

const objective = new Objective(dataset, monodPirt, 240, 2);
const originalRandom = Math.random;
Math.random = createDeterministicRandom(12345);

let optim;
try {
  optim = new PSO(objective, 50, bounds);
  optim.run(1.49618, 1.49618, 0.7298, 150);
} finally {
  Math.random = originalRandom;
}

const defaultGuess = bounds.map(([min, max]) => (min + max) / 2);
const defaultError = objective.objective(defaultGuess);

assert(
  optim.err_best_g < defaultError,
  'Swarm should reduce the error compared to the midpoint default parameters',
);

const bestError = optim.err_best_g;
assert(
  bestError < 1e-3,
  `Best error ${bestError} should approach the synthetic optimum with the default hyperparameters`,
);

const boundaryMargin = optim.pos_best_g.map((value, index) => {
  const [min, max] = bounds[index];
  const distanceToEdge = Math.min(value - min, max - value);
  return distanceToEdge;
});

boundaryMargin.forEach((margin, index) => {
  assert(
    margin > 1e-3,
    `Parameter ${index} is clamped to the boundary, default configuration should explore the interior`,
  );
});

console.log('Synthetic dataset best parameters', optim.pos_best_g);
