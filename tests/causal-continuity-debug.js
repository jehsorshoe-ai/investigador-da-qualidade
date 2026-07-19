const engine = require("../app.js");

engine.beginInvestigation({
  profile: "Empresario / gestor",
  segment: "retail",
  selectedArea: "auto",
  audience: "mixed",
  problem: "Cliente reclamou de mau atendimento.",
});

function answerQuestionById(id, answer) {
  const index = engine.state.questions.findIndex((question) => question.id === id);
  if (index === -1) throw new Error(`Pergunta nao encontrada: ${id}`);
  engine.state.index = index;
  const question = engine.state.questions[index];
  const result = engine.recordAnswer(answer);
  const transition = result.transition;

  console.log(
    JSON.stringify(
      {
        pergunta: question.text,
        resposta: answer,
        hipoteseInvestigada: question.targetHypothesis || question.category,
        motivoDaPergunta: question.reasonForQuestion || engine.getDebugRoute().transitions.at(-1)?.reasonForQuestion,
        proximaPergunta: result.nextQuestion?.text,
        proximaHipotese: result.nextQuestion?.targetHypothesis,
        motivoDaTransicao: transition?.reasonForQuestion,
        scoreDelta: transition?.scoreDelta,
      },
      null,
      2,
    ),
  );
}

console.log("Classificacao inicial");
console.log(
  JSON.stringify(
    {
      classificacao: engine.state.classification,
      rota: engine.state.route,
    },
    null,
    2,
  ),
);

answerQuestionById("service_manifestation", "delay");
answerQuestionById("service_channel_concentration", "no");
answerQuestionById("service_response_time_symptom", "yes");
answerQuestionById("service_complaint_reason_recorded", "yes");
answerQuestionById("service_deviation_detection", "no");

console.log("Estado final da sequencia");
console.log(
  JSON.stringify(
    {
      fatosConfirmados: engine.state.confirmedFacts,
      hipoteses: engine.state.activeHypotheses,
      proximaPergunta: engine.state.questions[engine.state.index],
    },
    null,
    2,
  ),
);
