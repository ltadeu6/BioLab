function solve(tf, Ks, mu_max, m_S, Y_XS, X0, S0) {
  let res = 5000;
  let timeArray = [];
  for (let i = 0; i <= res; i++) {
    timeArray[i] = (i * tf) / res;
  }

  let sol = RK4(model, timeArray, [X0, S0], [Ks, mu_max, m_S, Y_XS]);
  let cels = [];
  let subs = [];
  for (let i = 0; i < sol.length; i++) {
    cels[i] = sol[i][0];
    subs[i] = sol[i][1];
  }

  TESTER = document.getElementById("tester");
  Plotly.newPlot(
    TESTER,
    [
      {
        x: timeArray,
        y: subs,
        name: "Calculated substrate",
        line: { color: "#4a90e2" },
      },
      {
        x: timeArray,
        y: cels,
        name: "Calculated cells",
        line: { color: "#50e3c2" },
      },
    ],
    {
      margin: { t: 10, b: 30 },
      paper_bgcolor: "#f0f4f8",
      plot_bgcolor: "#f0f4f8",
      legend: {
        orientation: "h",
        yanchor: "top",
        y: -0.2,
        font: { size: 10 },
      },
    },
  );
}
