const assert = require("node:assert/strict");

const engine = require("../app.js");

function begin(problem) {
  return engine.beginInvestigation({
    profile: "Gestor de qualidade",
    segment: "industry",
    selectedArea: "auto",
    audience: "internal",
    problem,
  });
}

function currentQuestion() {
  return engine.state.questions[engine.state.index];
}

function answer(value) {
  const before = engine.getDebugRoute().trace.topHypotheses.map((item) => `${item.id}:${item.percent}%`);
  const question = currentQuestion();
  const result = engine.recordAnswer(value);
  const after = engine.getDebugRoute().trace.topHypotheses.map((item) => `${item.id}:${item.percent}%`);
  return { question, result, before, after };
}

function testProductionFailureStartsWithIndustrialFraming() {
  const question = begin("Falhas na produção.");
  assert.equal(engine.state.engineVersion, "v2");
  assert.equal(engine.state.route.selectedLine, "HYPOTHESIS_SPACE_ENGINE");
  assert.equal(question.id, "production_effect_framing");
  assert.equal(question.type, engine.questionTypes.multipleChoice);
  assert.match(question.text, /principal efeito observado na producao/i);
  const optionLabels = question.options.map((option) => option.label).join(" | ");
  assert.match(optionLabels, /Defeito no produto/i);
  assert.match(optionLabels, /Retrabalho/i);
  assert.match(optionLabels, /Refugo/i);
  assert.match(optionLabels, /Parada de equipamento/i);
  assert.doesNotMatch(optionLabels, /atendimento|retorno|cobranca|venda|negociacao/i);
}

function testProductionFailureReducesHypothesesByInformationGain() {
  begin("Falhas na produção.");
  const evolution = [];

  evolution.push(answer("defect"));
  assert.equal(currentQuestion().id, "same_equipment");
  assert.ok(currentQuestion().informationGain > 0);

  evolution.push(answer("no"));
  assert.equal(currentQuestion().id, "different_operators");

  evolution.push(answer("yes"));
  assert.equal(currentQuestion().id, "same_material_batch");

  evolution.push(answer("no"));
  assert.ok(currentQuestion().informationGain > 0);
  assert.doesNotMatch(currentQuestion().text, /atendimento|retorno|cobranca|venda|negociacao/i);

  const result = answer("yes");
  const trace = engine.getDebugRoute().trace;
  assert.equal(trace.engineVersion, "v2");
  assert.ok(trace.topHypotheses[0].weight > trace.topHypotheses[1].weight);
  assert.ok(["METHOD", "SYSTEM_INFORMATION", "TOOLING", "MACHINE"].includes(trace.topHypotheses[0].id));
  assert.ok(
    engine.state.v2Session.debugEvents.some((event) => event.type === "probability_update"),
    "V2 should record probability updates after each answer",
  );
  assert.ok(result.after.length > 0);
  assert.ok(evolution.every((step) => step.before.join(",") !== step.after.join(",")));
}

function testProductionEquipmentPathFindsEvidenceAndDiagnosis() {
  begin("Falhas na produção.");
  answer("defect");
  answer("yes");
  assert.equal(currentQuestion().id, "equipment_adjustment_evidence");
  answer("yes");
  assert.equal(currentQuestion().id, "machine_recent_adjustment");
  answer("yes");
  assert.equal(currentQuestion().id, "machine_preventive_overdue");
  const diagnosisStep = answer("yes");

  assert.equal(diagnosisStep.question.id, "machine_preventive_overdue");
  assert.equal(diagnosisStep.result.done, true);
  const report = engine.buildReport();
  assert.match(report, /Engine V2 - espaco de hipoteses/);
  assert.match(report, /equipamento|dispositivo|manutencao/i);
  assert.match(report, /Hipoteses principais:/);
}

testProductionFailureStartsWithIndustrialFraming();
console.log("ok - testProductionFailureStartsWithIndustrialFraming");
testProductionFailureReducesHypothesesByInformationGain();
console.log("ok - testProductionFailureReducesHypothesesByInformationGain");
testProductionEquipmentPathFindsEvidenceAndDiagnosis();
console.log("ok - testProductionEquipmentPathFindsEvidenceAndDiagnosis");
