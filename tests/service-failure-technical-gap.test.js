const assert = require("node:assert/strict");

const engine = require("../app.js");

function begin(problem) {
  return engine.beginInvestigation({
    profile: "Gestor de qualidade",
    segment: "retail",
    selectedArea: "auto",
    audience: "mixed",
    problem,
  });
}

function answerQuestionById(id, answer) {
  const index = engine.state.questions.findIndex((question) => question.id === id);
  assert.notEqual(index, -1, `missing question id: ${id}`);
  engine.state.index = index;
  return engine.recordAnswer(answer);
}

function candidateByText(pattern) {
  return engine.traceQuestionSelection().candidateQuestions.filter((candidate) => pattern.test(candidate.text));
}

function testServiceFailureTechnicalGapKeepsPrimaryPath() {
  begin("Cliente reclamou de mau atendimento.");

  answerQuestionById("service_response_time_symptom", "yes");
  answerQuestionById("service_people_concentration", "no");
  answerQuestionById("service_clear_standard", "yes");
  const result = answerQuestionById("technical_execution_difficulty", "yes");
  const next = result.nextQuestion;
  const trace = engine.traceQuestionSelection();

  assert.equal(engine.state.primaryInvestigationPath, "SERVICE_FAILURE");
  assert.equal(engine.state.pathLock, true);
  assert.equal(next.id, "technical_gap_location");
  assert.equal(next.path, "SERVICE_FAILURE");
  assert.equal(next.targetHypothesis, "technical_skill_gap");
  assert.equal(next.type, engine.questionTypes.multipleChoice);
  assert.doesNotMatch(next.text, /promessa|proposta|pre[cç]o|funil|convers[aã]o|venda|oferta/i);
  assert.match(next.reasonForQuestion, /dificuldade tecnica|localizar/i);

  assert.ok(engine.state.hypothesisScores.technical_skill_gap > 3);
  assert.ok(engine.state.hypothesisScores.knowledge_gap > 0);
  assert.ok(engine.state.hypothesisScores.training_gap > 0);
  assert.ok(engine.state.hypothesisScores.procedure_usability > 0);
  assert.ok(engine.state.hypothesisScores.system_support > 0);
  assert.ok((engine.state.hypothesisScores.value_proposition_mismatch || 0) <= 0);

  assert.equal(trace.selected.id, "technical_gap_location");
  assert.ok(trace.selected.continuityScore > 0);

  const blockedPromiseQuestions = trace.blocked.filter((candidate) =>
    /promessa|esperava algo diferente/i.test(candidate.text),
  );
  assert.ok(blockedPromiseQuestions.length >= 2, "promise/expectation questions should be visible in blocked audit");
  assert.ok(
    blockedPromiseQuestions.every((candidate) =>
      candidate.hardBlocks.some((block) =>
        ["missing_any_required_fact", "missing_trigger_fact", "path_locked_without_transition_evidence"].includes(block),
      ),
    ),
    "promise/expectation questions must be blocked by hard eligibility rules",
  );
}

function testValuePropositionQuestionOnlyEligibleWithPromiseFacts() {
  begin("Cliente reclamou de mau atendimento.");
  answerQuestionById("service_response_time_symptom", "yes");
  answerQuestionById("service_people_concentration", "no");
  answerQuestionById("service_clear_standard", "yes");
  answerQuestionById("technical_execution_difficulty", "yes");

  const servicePromiseCandidates = candidateByText(/promessa feita|esperava algo diferente/i);
  assert.ok(servicePromiseCandidates.length >= 1);
  assert.ok(
    servicePromiseCandidates.every((candidate) => !candidate.eligible),
    "promise questions should not be eligible in technical service path without promise facts",
  );

  begin("Cliente reclamou que o vendedor prometeu entrega em 3 dias, mas depois disseram que seriam 15.");
  assert.equal(engine.state.primaryInvestigationPath, "VALUE_PROPOSITION_MISMATCH");
  assert.ok(engine.state.confirmedFacts.includes("promise_exists"));
  assert.ok(engine.state.confirmedFacts.includes("expectation_mismatch"));
  assert.ok(engine.state.confirmedFacts.includes("delivery_vs_promise_gap"));

  const valuePromiseCandidates = candidateByText(/promessa feita|esperava algo diferente/i);
  assert.ok(
    valuePromiseCandidates.some((candidate) => candidate.eligible),
    "promise questions should be eligible when the input contains promise/expectation facts",
  );
}

testServiceFailureTechnicalGapKeepsPrimaryPath();
console.log("ok - testServiceFailureTechnicalGapKeepsPrimaryPath");
testValuePropositionQuestionOnlyEligibleWithPromiseFacts();
console.log("ok - testValuePropositionQuestionOnlyEligibleWithPromiseFacts");
