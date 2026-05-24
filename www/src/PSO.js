import { rrandom } from "./rrandom.js";
export class PSO {
  constructor(obj, n, bounds) {
    /*
    obj: função objetivo a ser minimizada
    n: numero de iterações a serem performadas
    bounds: vetor com os mínimos e maximos dos parametros da busca
    */
    this.obj = obj;
    this.n = n;
    this.bounds = bounds;
    this.pos = [];
    this.vel = [];
    this.err = [];
    this.pos_best = [];
    this.err_best = [];

    this.dimensions = bounds.length; // número de dimensões da busca (parâmetros)

    for (var i = 0; i < this.n; i++) {
      /*
      inicia o vetor vel com valores aleatórios entre -1 e 1
      inicia o vetor pos com posições aleatórias dentro dos limites especificados
      */
      var v = [];
      var x = [];
      for (var j = 0; j < this.dimensions; j++) {
        v.push(rrandom(-1, 1));
        x.push(rrandom(bounds[j][0], bounds[j][1]));
      }

      this.vel.push(v.slice());
      this.pos.push(x.slice());
      this.pos_best.push(x.slice()); // inicia a melhor posição como a posiçaõ atual (aleatória)
      this.err_best.push(Infinity);
    }

    this.err_best_g = Infinity;
    // inicia o melhor erro global como infinito (quanto menor melhor)
    this.pos_best_g = this.pos[0].slice();
    // inicia a melhor posição global como a posição da particula 0
  }

  run(c1, c2, w, iteration) {
    for (let i = 0; i < iteration; i++) {
      this.update(c1, c2, w);
    }
  }

  update(c1, c2, w) {
    for (let i = 0; i < this.n; i++) {
      for (let j = 0; j < this.dimensions; j++) {
        let r1 = rrandom(0, 1);
        let r2 = rrandom(0, 1);

        let vel_cognitive = c1 * r1 * (this.pos_best[i][j] - this.pos[i][j]);
        let vel_social = c2 * r2 * (this.pos_best_g[j] - this.pos[i][j]);
        const updatedVelocity = w * this.vel[i][j] + vel_cognitive + vel_social;
        let candidatePosition = this.pos[i][j] + updatedVelocity;

        if (candidatePosition > this.bounds[j][1]) {
          candidatePosition = this.bounds[j][1];
          this.vel[i][j] = 0;
        } else if (candidatePosition < this.bounds[j][0]) {
          candidatePosition = this.bounds[j][0];
          this.vel[i][j] = 0;
        } else {
          this.vel[i][j] = updatedVelocity;
        }

        this.pos[i][j] = candidatePosition;
      }

      // Update error value
      this.err[i] = this.obj.objective(this.pos[i]);

      // Update global values
      if (this.err[i] < this.err_best[i]) {
        this.pos_best[i] = this.pos[i].slice();
        this.err_best[i] = this.err[i];
        if (this.err[i] < this.err_best_g) {
          this.pos_best_g = this.pos[i].slice();
          this.err_best_g = this.err[i];
        }
      }
    }
  }
}
