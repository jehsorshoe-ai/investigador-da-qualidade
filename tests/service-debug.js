const engine = require("../app.js");

engine.beginInvestigation({
  profile: "Empresario / gestor",
  segment: "generic",
  selectedArea: "auto",
  audience: "mixed",
  problem: "Cliente reclamou de mau atendimento.",
});

function snapshot(label) {
  const question = engine.state.questions[engine.state.index];
  console.log(`\n${label}`);
  console.log(
    JSON.stringify(
      {
        normalizedProblem: engine.state.normalizedProblem,
        classification: engine.state.classification,
        selectedRoute: engine.state.route.selectedLine,
        routeGate: engine.state.route.gate,
        confidence: engine.state.classification.confianca_classificacao,
        currentQuestion: question
          ? {
              id: question.id,
              type: question.type || engine.questionTypes.boolean,
              text: question.text,
              options: question.options?.map((option) => option.label),
            }
          : null,
        confirmedFacts: engine.state.confirmedFacts,
        activeHypotheses: engine.state.activeHypotheses,
      },
      null,
      2,
    ),
  );
}

snapshot("1. Interpretacao inicial");
engine.recordAnswer("attitude");
snapshot("2. Depois da resposta simulada: Postura ou cordialidade");
engine.recordAnswer("no");
snapshot("3. Depois da segunda resposta simulada: Nao");
