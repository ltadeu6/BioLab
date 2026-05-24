# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is BioLab

BioLab Parameter Explorer is a scientific web application that estimates kinetic parameters for microbial growth and substrate consumption models. Given time-series measurements of biomass (cells, g/L) and residual substrate (g/L), it runs Particle Swarm Optimization (PSO) over seven built-in kinetic models and ranks them by the Akaike Information Criterion (AIC).

The app is packaged with Apache Cordova and targets Electron (desktop), Android, and Browser.

## Commands

### Tests (run from `www/`)

```sh
cd www && node tests/demo.mjs
cd www && node tests/synthetic-search.mjs
# or both at once:
cd www && npm test
```

Tests use Node.js directly — no test runner or build step needed.

### Run / build (Electron)

```sh
cordova run electron           # dev run
cordova build electron --release --verbose   # release build
```

### Run on Android

```sh
# Set up environment first (or source env.sh):
source env.sh
# env.sh sets ANDROID_HOME, ANDROID_SDK_ROOT, PATH entries for the SDK,
# and isolates Gradle cache to ./.gradle, then calls `cordova run android`.
```

### Serve in browser

```sh
cordova run browser
# or just open www/index.html via any static file server
```

## Architecture

```
www/
  index.html        — single-page app; all UI logic is an inline <script type="module">
  src/
    conhecidos.js   — pure functions: the seven kinetic µ(S) equations + Pirt
    runge-kutta.js  — RK4 solver (RK4) and point interpolator (RK4getvalue)
    Objective.js    — Objective class: wraps experimental data + ODE, computes normalized SSR
    PSO.js          — PSO class: initializes swarm, runs iterations, exposes pos_best_g / err_best_g
    search.js       — orchestrates everything: builds ODE functions (model × Pirt coupling),
                       runs PSO per model, renders Plotly charts, computes AIC, sorts results
    rrandom.js      — Math.random wrapper used by PSO
    solve.js        — standalone legacy helper (not imported by search.js)
  tests/
    demo.mjs              — smoke test: PSO converges to a finite error
    synthetic-search.mjs  — accuracy test: PSO recovers known Monod params from synthetic data
  assets/
    dados.json      — default experimental dataset loaded on page start
```

### Data flow

1. `index.html` collects experimental data, PSO hyperparameters, and per-model parameter bounds from the form.
2. It calls `main(data, { alg, bounds, onProgress })` exported from `search.js`.
3. For each of the seven models, `search.js` constructs an ODE function (`<model>Pirt`) that couples a growth-rate formula from `conhecidos.js` with the Pirt substrate consumption equation.
4. An `Objective` instance wraps the ODE and experimental data. It normalizes residuals by column mean before summing squared errors — this makes SSR dimensionless and comparable across variables with different scales.
5. `PSO` minimizes the objective over the parameter bounds, producing `pos_best_g` (best parameter vector).
6. RK4 integrates the ODE at 500 internal steps; `RK4getvalue` interpolates from that solution to exact experimental time points.
7. After all models complete, results are sorted by AIC and a comparison table is rendered.

### Key design constraints

- The frontend is **no-build**: ES modules loaded directly in the browser; no bundler.
- `www/package.json` has `"type": "module"` so Node can run the tests with native ESM imports.
- External CDN dependencies: KaTeX (math rendering), Plotly (charts). Both are loaded in `index.html`; `search.js` assumes `Plotly` and `katex` are globals.
- The `Objective` constructor detects column order from header keywords (Portuguese and English), so column order in the data table matters only when headers are absent or unrecognized.
- `PSO` uses `Math.random` directly — `synthetic-search.mjs` patches it with a deterministic LCG for reproducible test results.
- `solve.js` is a legacy standalone function that references globals (`RK4`, `Plotly`, `document`) and is not imported anywhere in the current codebase.
