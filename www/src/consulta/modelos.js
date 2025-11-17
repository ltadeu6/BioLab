// Crescimento num único substrato limitante:

// MONOD, 1942

class monod {
  constructor() {
    this.nPar = 2;
    this.parName = ["mu_max", "K_S"]
    this.varName = ["Substrato"]
    this.varUsed = [1, 0, 0, 0, 0] // sub1, sub2, cel, prod, tempo
    this.equation = "\\mu_{X} = \\frac{\\mu_{max} S}{Ks + S}"
    this.name = "MONOD, 1942"
  }
  model(variavel, parametros) {
    return (parametros[0] * variavel[0]) / (parametros[1] + variavel[0])
  }
}

// MOSER, 1958
class moser {
  constructor() {
    this.nPar = 3;
    this.parName = ["mu_max", "K_S", "n"]
    this.varName = ["Substrato"]
    this.varUsed = [1, 0, 0, 0, 0] // sub1, sub2, cel, prod, tempo
    this.equation = "\\mu_{X} = \\frac{\\mu_{max} S^n}{Ks + S^n}"
    this.name = "MOSER, 1958"
  }
  model(variavel, parametros) {
    // moser(S, mu_max, K_S, n) {
    return (parametros[0] * variavel[0] ** parametros[2]) / (parametros[1] + variavel[0] ** parametros[2])
  }
}

// CONTOIS, 1959
class contois {
  constructor() {
    this.nPar = 2;
    this.parName = ["mu_max", "K_S"]
    this.varName = ["Substrato", "Células"]
    this.varUsed = [1, 0, 1, 0, 0] // sub1, sub2, cel, prod, tempo
  }
  model(variavel, parametros) {
    // model(S, X, mu_max, K_S) {
    return (parametros[0] * variavel[0]) / (parametros[1] * variavel[1] + variavel[0])
  }
}

// BERGTER, 1983
class bergter {
  constructor() {
    this.nPar = 3;
    this.parName = ["mu_max", "K_S", "T"]
    this.varName = ["Substrato", "tempo"]
    this.varUsed = [1, 0, 0, 0, 1] // sub1, sub2, cel, prod, tempo
  }
  model(variavel, parametros) {
    // (S, t, mu_max, K_S, T) {
    return ((parametros[0] * variavel[0]) / (parametros[1] + variavel[0])) * (1 - Math.exp(-variavel[1] / parametros[2]))
  }
}

// Morte celular

// SINCLAIR; KRISTIANSEN, 1987
class death {
  constructor() {
    this.nPar = 1;
    this.parName = ["k_d"]
    this.varName = []
    this.varUsed = [0, 0, 0, 0, 0] // sub1, sub2, cel, prod, tempo
  }
  model(parametros) {
    return -parametros[0]
  }
}

// Crescimento em um único substrato limitante e inibidor

// AIBA; SHODA; NAGATANI; 1968
class asn {
  constructor() {
    this.nPar = 3
    this.parName = ["mu_max", "K_S", "K_i"]
    this.varName = ["Substrato"]
    this.varUsed = [1, 0, 0, 0, 0] // sub1, sub2, cel, prod, tempo
  }
  model(variavel, parametros) {
    return ((parametros[0] * variavel[0]) / (parametros[1] + variavel[0])) * Math.exp(-variavel[0] / parametros[2])
  }
}

// HALDANE, 1930
class haldane {
  constructor() {
    this.nPar = 3
    this.parName = ["mu_xa", "K_S", "K_i"]
    this.varName = ["Substrato"]
    this.varUsed = [1, 0, 0, 0, 0] // sub1, sub2, cel, prod, tempo
  }
  model(variavel, parametros) {
    return (parametros[0] * variavel[0]) / (1 + parametros[1] / variavel[0] + variavel[0] / parametros[2])
  }
}

// ANDREWS, 1968
class andrews {
  constructor() {
    this.nPar = 3
    this.parName = ["mu_xa", "K_S", "K_i"]
    this.varName = ["Substrato"]
    this.varUsed = [1, 0, 0, 0, 0] // sub1, sub2, cel, prod, tempo
  }
  model(variavel, parametros) {
    return (parametros[0] * variavel[0]) / (variavel[0] + parametros[1] + (variavel[0] ** 2 / parametros[2]))
  }
}

// EDWARDS, 1970
class edwards {
  constructor() {
    this.nPar = 3
    this.parName = ["mu_xa", "K_S", "K_i"]
    this.varName = ["Substrato"]
    this.varUsed = [1, 0, 0, 0, 0] // sub1, sub2, cel, prod, tempo
  }
  model(variavel, parametros) {
    return (parametros[0] * variavel[0]) / (variavel[0] + parametros[1] + (variavel[0] ** 2 / parametros[2]) + (1 + variavel[0] / parametros[1]))
  }
}

// WEBB, 1963
class webb {
  constructor() {
    this.nPar = 3
    this.parName = ["mu_xa", "K_S", "K_i"]
    this.varName = ["Substrato"]
    this.varUsed = [1, 0, 0, 0, 0] // sub1, sub2, cel, prod, tempo
  }
  model(variavel, parametros) {
    return (parametros[0] * variavel[0] * (1 + variavel[0] / parametros[2])) / (variavel[0] + parametros[1] + (variavel[0] ** 2 / parametros[2]))
  }
}

// TEISSIER, 1942
class teissier {
  constructor() {
    this.nPar = 3
    this.parName = ["mu_max", "K_S", "K_i"]
    this.varName = ["Substrato"]
    this.varUsed = [1, 0, 0, 0, 0] // sub1, sub2, cel, prod, tempo
  }
  model(variavel, parametros) {
    return parametros[0] * (Math.exp(-variavel[0] / parametros[1]) - Math.exp(-variavel[0] / parametros[2]))
  }
}

// WU et al., 1988
class wu {
  constructor() {
    this.nPar = 4
    this.parName = ["mu_xa", "K_S", "K_i", "n"]
    this.varName = ["Substrato"]
    this.varUsed = [1, 0, 0, 0, 0] // sub1, sub2, cel, prod, tempo
  }
  model(variavel, parametros) {
    // return mu_xa / (1 + K_S / S + (S / K_i) ** n)
    return parametros[0] / (1 + parametros[1] / variavel[0] + (variavel[0] / parametros[2]) ** parametros[3])
  }
}
