# BioLab Parameter Explorer

Ferramenta web para estimativa de parâmetros cinéticos de crescimento microbiano e consumo de substrato.

Acesse em: **[biolab.tadix.dev](https://biolab.tadix.dev)** — ou baixe o app para desktop/Android:

| Plataforma | Download |
|---|---|
| Linux (AppImage) | [BioLab-1.0.0.AppImage](https://git.tadix.dev/ltadeu6/BioLab/releases/tag/v1.0.0) |
| Windows (instalador) | [BioLab-Setup-1.0.0.exe](https://git.tadix.dev/ltadeu6/BioLab/releases/tag/v1.0.0) |
| Android (APK) | [BioLab-1.0.0.apk](https://git.tadix.dev/ltadeu6/BioLab/releases/tag/v1.0.0) |

## Como funciona

Você fornece medições experimentais ao longo do tempo — concentração de células (g/L) e substrato residual (g/L) — e o BioLab encontra automaticamente os parâmetros cinéticos que melhor descrevem o seu experimento.

Internamente, o processo ocorre em três etapas:

1. **Modelagem diferencial** — cada modelo cinético (Monod, Andrews, Aiba, etc.) é combinado com o balanço de substrato de Pirt (1965), formando um sistema de equações diferenciais ordinárias que descreve a dinâmica de crescimento.

2. **Integração numérica** — o sistema é resolvido pelo método de Runge-Kutta de 4ª ordem (RK4), produzindo curvas simuladas de células e substrato ao longo do tempo.

3. **Otimização por enxame de partículas (PSO)** — um algoritmo populacional busca os valores dos parâmetros (como µ_max, K_S e Y_XS) que minimizam a diferença entre a curva simulada e os dados experimentais.

Os sete modelos são avaliados simultaneamente e ranqueados pelo Critério de Informação de Akaike (AIC), permitindo comparar qual formulação representa melhor o seu processo sem sair da página.

## Modelos cinéticos suportados

| Modelo | Característica principal |
|---|---|
| Monod (1949) | Modelo clássico de limitação por substrato |
| Moser (1958) | Generalização do Monod com expoente n |
| Contois (1959) | Limitação dependente da densidade celular |
| Andrews (1968) | Inibição pelo próprio substrato |
| Aiba et al. (1968) | Inibição exponencial pelo substrato |
| Bergter (1978) | Crescimento com adaptação temporal |
| Tessier (1936) | Saturação exponencial |

## Registro

O BioLab Parameter Explorer foi registrado no **Instituto Nacional da Propriedade Industrial (INPI)** em março de 2026, constituindo o primeiro registro de software do curso de Engenharia de Bioprocessos e Biotecnologia da **Universidade Tecnológica Federal do Paraná — Campus Dois Vizinhos (UTFPR-DV)**, sob orientação do Prof. Pedro Suzaki.

> "O software permite ajustar modelos matemáticos a dados experimentais de forma intuitiva, automatizando a solução de equações diferenciais e aplicando algoritmos de otimização."
>
> — [Curso de Bioprocessos da UTFPR-DV conquista primeiro registro de software](https://educadoradv.com.br/noticia/25434-curso-de-bioprocessos-da-utfpr-dv-conquista-primeiro-registro-de-software), Educador ADV, abr. 2026

## Licença

MIT © Lucas Tadeu Marculino
