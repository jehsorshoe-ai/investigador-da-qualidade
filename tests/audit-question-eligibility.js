const engine = require("../app.js");

function allQuestions() {
  const routeQuestions = Object.values(engine.investigationRouteQuestions).flat();
  const segmentQuestions = Object.entries(engine.segmentQuestionBoost).flatMap(([segment, byArea]) =>
    Object.entries(byArea).flatMap(([area, questions]) => questions.map((question) => ({ ...question, segment, sourceArea: area }))),
  );
  return [
    ...engine.questionBank.map((question) => ({ ...question, source: "questionBank" })),
    ...routeQuestions.map((question) => ({ ...question, source: "routeQuestions" })),
    ...segmentQuestions.map((question) => ({ ...question, source: "segmentQuestions" })),
  ];
}

function hasGuard(question) {
  return Boolean(
    question.path ||
      question.requiresFacts?.length ||
      question.requiresAnyFacts?.length ||
      question.excludesFacts?.length ||
      question.allowedDomains?.length ||
      question.allowedPhenomena?.length ||
      question.triggerFacts?.length ||
      question.triggerAllFacts?.length ||
      question.requiredAsked?.length,
  );
}

function auditStaticMetadata() {
  const sensitive = /promessa|proposta|pre[cç]o|oferta|funil|convers[aã]o|venda|fechamento|cliente interessado|expectativa|p[úu]blico/i;
  const findings = allQuestions()
    .filter((question) => sensitive.test(question.text) || sensitive.test(question.evidence || ""))
    .map((question) => ({
      text: question.text,
      source: question.source || "segmentQuestions",
      areas: question.areas || [question.sourceArea],
      path: question.path || null,
      targetHypothesis: question.targetHypothesis || question.hypothesis || null,
      guarded: hasGuard(question),
    }));

  return {
    inspectedQuestions: allQuestions().length,
    sensitiveQuestions: findings.length,
    guardedSensitiveQuestions: findings.filter((finding) => finding.guarded).length,
    unguardedSensitiveQuestions: findings.filter((finding) => !finding.guarded),
  };
}

function auditServiceTechnicalScenario() {
  engine.beginInvestigation({
    profile: "Gestor de qualidade",
    segment: "retail",
    selectedArea: "auto",
    audience: "mixed",
    problem: "Cliente reclamou de mau atendimento.",
  });

  for (const [id, answer] of [
    ["service_response_time_symptom", "yes"],
    ["service_people_concentration", "no"],
    ["service_clear_standard", "yes"],
    ["technical_execution_difficulty", "yes"],
  ]) {
    const index = engine.state.questions.findIndex((question) => question.id === id);
    if (index === -1) throw new Error(`missing question id: ${id}`);
    engine.state.index = index;
    engine.recordAnswer(answer);
  }

  const trace = engine.traceQuestionSelection();
  const relevantBlocked = trace.blocked
    .filter((candidate) => /promessa|proposta|pre[cç]o|funil|convers[aã]o|venda|oferta|expectativa/i.test(candidate.text))
    .map((candidate) => ({
      text: candidate.text,
      path: candidate.path,
      hypothesis: candidate.hypothesis,
      hardBlocks: candidate.hardBlocks,
    }));

  return {
    primaryPath: engine.state.primaryInvestigationPath,
    pathLock: engine.state.pathLock,
    confirmedFacts: engine.state.confirmedFacts,
    selectedQuestion: trace.selected,
    blockedCommercialOrPromiseQuestions: relevantBlocked,
  };
}

const report = {
  staticMetadata: auditStaticMetadata(),
  serviceTechnicalScenario: auditServiceTechnicalScenario(),
};

console.log(JSON.stringify(report, null, 2));

if (report.serviceTechnicalScenario.primaryPath !== "SERVICE_FAILURE") {
  throw new Error("service technical scenario left SERVICE_FAILURE primary path");
}

if (/promessa|proposta|pre[cç]o|funil|convers[aã]o|venda|oferta/i.test(report.serviceTechnicalScenario.selectedQuestion?.text || "")) {
  throw new Error("selected question is commercial/promise/offering question in service technical scenario");
}
