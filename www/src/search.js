import { PSO } from "./PSO.js";
import { RK4, RK4getvalue } from "./runge-kutta.js";
import { Objective } from "./Objective.js";
import {
  monod,
  moser,
  contois,
  bergter,
  tessier,
  andrews,
  aiba,
  pirt,
} from "./conhecidos.js";
import "https://cdn.plot.ly/plotly-2.29.1.min.js";

const parameterCatalog = {
  K_S: {
    latex: "K_S",
    unitText: "g/L",
    unitLatex: "\\mathrm{g\\,L^{-1}}",
    overrides: {
      contois: {
        unitText: "g_S/g_X",
        unitLatex: "\\frac{\\mathrm{g}_{S}}{\\mathrm{g}_{X}}",
      },
    },
  },
  mu_max: {
    latex: "\\mu_{max}",
    unitText: "h⁻¹",
    unitLatex: "\\mathrm{h^{-1}}",
  },
  K_I: {
    latex: "K_I",
    unitText: "g/L",
    unitLatex: "\\mathrm{g\\,L^{-1}}",
    overrides: {
      aiba: {
        unitText: "L/g",
        unitLatex: "\\mathrm{L\\,g^{-1}}",
      },
    },
  },
  m_S: {
    latex: "m_S",
    unitText: "g_S/(g_X·h)",
    unitLatex: "\\frac{\\mathrm{g}_{S}}{\\mathrm{g}_{X}\\,\\mathrm{h}}",
  },
  Y_XS: {
    latex: "Y_{XS}",
    unitText: "g_X/g_S",
    unitLatex: "\\frac{\\mathrm{g}_{X}}{\\mathrm{g}_{S}}",
  },
  T: {
    latex: "T",
    unitText: "h",
    unitLatex: "\\mathrm{h}",
  },
  n: {
    latex: "n",
    unitText: null,
    unitLatex: null,
  },
};

const modelParameters = {
  aiba: [
    { key: "K_S", bounds: [0.005, 2] },
    { key: "mu_max", bounds: [0.05, 0.9] },
    { key: "K_I", bounds: [0.01, 1] },
    { key: "m_S", bounds: [0.0015, 0.05] },
    { key: "Y_XS", bounds: [0.3, 0.7] },
  ],
  andrews: [
    { key: "K_S", bounds: [0.005, 2] },
    { key: "mu_max", bounds: [0.05, 0.9] },
    { key: "K_I", bounds: [5, 150] },
    { key: "m_S", bounds: [0.0015, 0.05] },
    { key: "Y_XS", bounds: [0.3, 0.7] },
  ],
  bergter: [
    { key: "K_S", bounds: [0.005, 2] },
    { key: "mu_max", bounds: [0.05, 0.9] },
    { key: "T", bounds: [5, 80] },
    { key: "m_S", bounds: [0.0015, 0.05] },
    { key: "Y_XS", bounds: [0.3, 0.7] },
  ],
  contois: [
    { key: "K_S", bounds: [0.005, 2] },
    { key: "mu_max", bounds: [0.05, 0.9] },
    { key: "m_S", bounds: [0.0015, 0.05] },
    { key: "Y_XS", bounds: [0.3, 0.7] },
  ],
  monod: [
    { key: "K_S", bounds: [0.005, 2] },
    { key: "mu_max", bounds: [0.05, 0.9] },
    { key: "m_S", bounds: [0.0015, 0.05] },
    { key: "Y_XS", bounds: [0.3, 0.7] },
  ],
  moser: [
    { key: "K_S", bounds: [0.005, 2] },
    { key: "mu_max", bounds: [0.05, 0.9] },
    { key: "n", bounds: [0.8, 2.5] },
    { key: "m_S", bounds: [0.0015, 0.05] },
    { key: "Y_XS", bounds: [0.3, 0.7] },
  ],
  tessier: [
    { key: "K_S", bounds: [0.005, 2] },
    { key: "mu_max", bounds: [0.2, 0.9] },
    { key: "m_S", bounds: [0.005, 0.05] },
    { key: "Y_XS", bounds: [0.3, 0.7] },
  ],
};

function getParamDisplayInfo(paramKey, modelKey) {
  const baseInfo = parameterCatalog[paramKey];
  if (!baseInfo) {
    throw new Error(`Unknown parameter: ${paramKey}`);
  }
  const override = baseInfo.overrides?.[modelKey];
  if (!override) {
    return baseInfo;
  }
  return { ...baseInfo, ...override };
}

function getDefaultBounds(modelKey) {
  return modelParameters[modelKey].map((param) => param.bounds.slice());
}

function getParamDetails(modelKey) {
  return modelParameters[modelKey].map((param) => {
    const { latex, unitText, unitLatex } = getParamDisplayInfo(
      param.key,
      modelKey,
    );
    return {
      key: param.key,
      latex,
      unitText,
      unitLatex,
    };
  });
}

function monodPirt(_, y, params) {
  let K_S = params[0];
  let mu_max = params[1];
  //pirt:
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

function moserPirt(_, y, params) {
  let K_S = params[0];
  let mu_max = params[1];
  let n = params[2];
  //pirt:
  let m_S = params[3];
  let Y_XS = params[4];
  let X = y[0];
  let S = y[1];
  let dmu = moser(S, mu_max, K_S, n);
  let dX = X * dmu;
  const qS = pirt(dmu, Y_XS, m_S);
  let dS = -qS * X;
  return [dX, dS];
}

function contoisPirt(_, y, params) {
  let K_S = params[0];
  let mu_max = params[1];
  let m_S = params[2];
  let Y_XS = params[3];
  let X = y[0];
  let S = y[1];
  let dmu = contois(S, X, mu_max, K_S);
  let dX = X * dmu;
  const qS = pirt(dmu, Y_XS, m_S);
  let dS = -qS * X;
  return [dX, dS];
}

function bergterPirt(time, y, params) {
  let K_S = params[0];
  let mu_max = params[1];
  let T = params[2];
  // pirt:
  let m_S = params[3];
  let Y_XS = params[4];
  let X = y[0];
  let S = y[1];
  let dmu = bergter(S, time, mu_max, K_S, T);
  let dX = X * dmu;
  const qS = pirt(dmu, Y_XS, m_S);
  let dS = -qS * X;
  return [dX, dS];
}

function tessierPirt(_, y, params) {
  let K_S = params[0];
  let mu_max = params[1];
  // pirt:
  let m_S = params[2];
  let Y_XS = params[3];
  let X = y[0];
  let S = y[1];
  let dmu = tessier(S, mu_max, K_S);
  let dX = X * dmu;
  const qS = pirt(dmu, Y_XS, m_S);
  let dS = -qS * X;
  return [dX, dS];
}

function andrewsPirt(_, y, params) {
  let K_S = params[0];
  let mu_max = params[1];
  let K_I = params[2];
  // pirt:
  let m_S = params[3];
  let Y_XS = params[4];
  let X = y[0];
  let S = y[1];
  let dmu = andrews(S, mu_max, K_S, K_I);
  let dX = X * dmu;
  const qS = pirt(dmu, Y_XS, m_S);
  let dS = -qS * X;
  return [dX, dS];
}

function aibaPirt(_, y, params) {
  let K_S = params[0];
  let mu_max = params[1];
  let K_I = params[2];
  // pirt:
  let m_S = params[3];
  let Y_XS = params[4];
  let X = y[0];
  let S = y[1];
  let dmu = aiba(S, mu_max, K_S, K_I);
  let dX = X * dmu;
  const qS = pirt(dmu, Y_XS, m_S);
  let dS = -qS * X;
  return [dX, dS];
}

export async function main(input, options = {}) {
  const alg = options.alg || {
    particles: 50,
    c1: 1.49618,
    c2: 1.49618,
    w: 0.7298,
    iterations: 150,
  };
  const boundsOpt = options.bounds || {};
  const onProgress = options.onProgress || (() => {});

  const time = [];
  const subs = [];
  const cels = [];
  for (let i = 1; i < input.length; i++) {
    time[i] = input[i][0];
    subs[i] = input[i][1];
    cels[i] = input[i][2];
  }

  const basePlot = [
    {
      x: time,
      y: subs,
      name: "Experimental substrate",
      mode: "markers",
      marker: { size: 10, color: "#4a90e2" },
      type: "scatter",
    },
    {
      x: time,
      y: cels,
      name: "Experimental cells",
      mode: "markers",
      marker: { size: 10, color: "#50e3c2" },
      type: "scatter",
    },
  ];

  function calculateAIC(obj, sol, params) {
    let sse = 0;
    let count = 0;

    for (let i = 1; i < input.length; i++) {
      const timePoint = input[i][0];
      const prediction = RK4getvalue(
        sol,
        obj.timeArray,
        timePoint,
        obj.f,
        params,
      );

      const cellResidual = prediction[0] - input[i][2];
      const substrateResidual = prediction[1] - input[i][1];

      sse += cellResidual ** 2 + substrateResidual ** 2;
      count += 2;
    }

    const n = count;
    const k = params.length;
    const meanSquaredError = n > 0 ? sse / n : 0;
    const safeMSE = Math.max(meanSquaredError, Number.EPSILON);

    return {
      aic: 2 * k + n * Math.log(safeMSE),
      mse: meanSquaredError,
    };
  }

  function runModel(cfg) {
    const obj = new Objective(input, cfg.ode, 500, 2);
    const optim = new PSO(obj, alg.particles, cfg.bounds);
    optim.run(alg.c1, alg.c2, alg.w, alg.iterations);

    const sol = RK4(obj.f, obj.timeArray, obj.y0, optim.pos_best_g);
    const celsM = sol.map((row) => row[0]);
    const subsM = sol.map((row) => row[1]);

    const { aic, mse } = calculateAIC(obj, sol, optim.pos_best_g);

    let objectiveText = "MSE: N/A";
    if (Number.isFinite(mse)) {
      const absValue = Math.abs(mse);
      const formatted =
        absValue !== 0 && (absValue >= 1e3 || absValue < 1e-2)
          ? mse.toExponential(4)
          : mse.toFixed(8);
      objectiveText = `MSE: ${formatted}`;
    }

    Plotly.newPlot(
      document.getElementById(cfg.plotId),
      [
        ...basePlot,
        {
          x: obj.timeArray,
          y: subsM,
          name: "Model fit for the substrate",
          mode: "lines",
          line: { color: "#4a90e2" },
        },
        {
          x: obj.timeArray,
          y: celsM,
          name: "Model fit for the cells",
          mode: "lines",
          line: { color: "#50e3c2" },
        },
      ],
      {
        margin: { t: 10, b: 30 },
        paper_bgcolor: "#f0f4f8",
        plot_bgcolor: "#f0f4f8",
        xaxis: {
          title: { text: "Time (h)" },
        },
        yaxis: {
          title: { text: "Concentration (g/L)" },
        },
        legend: {
          orientation: "h",
          yanchor: "top",
          y: -0.2,
          xanchor: "left",
          x: 0,
          font: { size: 10 },
        },
        annotations: [
          {
            text: objectiveText,
            x: 1,
            y: 1,
            xref: "paper",
            yref: "paper",
            xanchor: "right",
            yanchor: "top",
            showarrow: false,
            font: { size: 12, color: "#1f2933" },
            bordercolor: "#d9e2ef",
            borderwidth: 1,
            borderpad: 6,
          },
        ],
      },
    );

    const params = optim.pos_best_g.map((p) => p.toFixed(3));
    const paramContainer = document.getElementById(cfg.paramDiv);
    paramContainer.classList.add("model-params");
    paramContainer.innerHTML = "";

    const label = document.createElement("div");
    label.className = "param-label";
    label.textContent = "Parameters:";
    paramContainer.appendChild(label);

    const list = document.createElement("ul");
    list.className = "param-list";

    params.forEach((value, i) => {
      const detail = cfg.paramDetails[i];
      const item = document.createElement("li");
      const mathSpan = document.createElement("span");
      const latexUnit = detail.unitLatex;
      const latexExpression = latexUnit
        ? `${detail.latex} = ${value}\\,${latexUnit}`
        : `${detail.latex} = ${value}`;

      if (typeof katex !== "undefined") {
        katex.render(latexExpression, mathSpan, { throwOnError: false });
      } else {
        mathSpan.textContent = latexUnit
          ? `${detail.latex} = ${value} ${detail.unitText || ""}`
          : `${detail.latex} = ${value}`;
      }

      item.appendChild(mathSpan);
      list.appendChild(item);
    });

    paramContainer.appendChild(list);

    return { title: cfg.title, aic, key: cfg.key };
  }

  const models = [
    {
      key: "aiba",
      ode: aibaPirt,
      bounds: boundsOpt.aiba || getDefaultBounds("aiba"),
      plotId: "Plot1",
      paramDiv: "AibaParam",
      title: "Pirt-Aiba",
      paramDetails: getParamDetails("aiba"),
      container: document.getElementById("Plot1")?.closest(".box"),
    },
    {
      key: "andrews",
      ode: andrewsPirt,
      bounds: boundsOpt.andrews || getDefaultBounds("andrews"),
      plotId: "Plot2",
      paramDiv: "AndrewsParam",
      title: "Pirt-Andrews",
      paramDetails: getParamDetails("andrews"),
      container: document.getElementById("Plot2")?.closest(".box"),
    },
    {
      key: "bergter",
      ode: bergterPirt,
      bounds: boundsOpt.bergter || getDefaultBounds("bergter"),
      plotId: "Plot3",
      paramDiv: "BergterParam",
      title: "Pirt-Bergter",
      paramDetails: getParamDetails("bergter"),
      container: document.getElementById("Plot3")?.closest(".box"),
    },
    {
      key: "contois",
      ode: contoisPirt,
      bounds: boundsOpt.contois || getDefaultBounds("contois"),
      plotId: "Plot4",
      paramDiv: "ContoisParam",
      title: "Pirt-Contois",
      paramDetails: getParamDetails("contois"),
      container: document.getElementById("Plot4")?.closest(".box"),
    },
    {
      key: "monod",
      ode: monodPirt,
      bounds: boundsOpt.monod || getDefaultBounds("monod"),
      plotId: "Plot5",
      paramDiv: "MonodParam",
      title: "Pirt-Monod",
      paramDetails: getParamDetails("monod"),
      container: document.getElementById("Plot5")?.closest(".box"),
    },
    {
      key: "moser",
      ode: moserPirt,
      bounds: boundsOpt.moser || getDefaultBounds("moser"),
      plotId: "Plot6",
      paramDiv: "MoserParam",
      title: "Pirt-Moser",
      paramDetails: getParamDetails("moser"),
      container: document.getElementById("Plot6")?.closest(".box"),
    },
    {
      key: "tessier",
      ode: tessierPirt,
      bounds: boundsOpt.tessier || getDefaultBounds("tessier"),
      plotId: "Plot7",
      paramDiv: "TessierParam",
      title: "Pirt-Tessier",
      paramDetails: getParamDetails("tessier"),
      container: document.getElementById("Plot7")?.closest(".box"),
    },
  ];

  const modelByKey = new Map(models.map((model) => [model.key, model]));

  const results = [];
  for (let idx = 0; idx < models.length; idx++) {
    const cfg = models[idx];
    const res = runModel(cfg);
    results.push(res);
    onProgress(idx + 1, models.length);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  results.sort((a, b) => a.aic - b.aic);
  const comparisonBox = document.getElementById("comparison");
  const chartParent = models[0]?.container?.parentElement;

  if (comparisonBox && chartParent) {
    results.forEach((result) => {
      const modelCfg = modelByKey.get(result.key);
      if (!modelCfg?.container) {
        return;
      }
      chartParent.insertBefore(modelCfg.container, comparisonBox);
    });
  }

  const compDiv = document.getElementById("comparison");
  compDiv.innerHTML =
    `<h2>Model comparison</h2>
    <table class="abnt-table table-numbered">
      <thead>
        <tr>
          <th>#</th>
          <th>Model</th>
          <th>Akaike Information Criterion</th>
        </tr>
      </thead>
      <tbody>` +
    results
      .map((r, index) => {
        return `<tr><td>${index + 1}</td><td>${r.title}</td><td>${r.aic.toFixed(
          2,
        )}</td></tr>`;
      })
      .join("") +
    "</tbody></table>";
}
