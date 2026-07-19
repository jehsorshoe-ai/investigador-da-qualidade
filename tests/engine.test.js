const assert = require("node:assert/strict");

const engine = require("../app.js");

function allQuestions() {
  const routeQuestions = Object.values(engine.investigationRouteQuestions).flat();
  const segmentQuestions = Object.values(engine.segmentQuestionBoost)
    .flatMap((byArea) => Object.values(byArea))
    .flat();
  return [...engine.questionBank, ...routeQuestions, ...segmentQuestions];
}

function classify(problem, selectedArea = "auto") {
  const classification = engine.classifyProblem(problem, selectedArea);
  const route = engine.routeInvestigation(classification);
  return { classification, route };
}

function begin(problem, selectedArea = "auto", segment = "generic") {
  return engine.beginInvestigation({
    profile: "Empresario / gestor",
    segment,
    selectedArea,
    audience: "mixed",
    problem,
  });
}

function currentQuestion() {
  return engine.state.questions[engine.state.index];
}

function answerSequence(problem, answers, selectedArea = "auto", segment = "generic") {
  begin(problem, selectedArea, segment);
  const asked = [];

  for (const answer of answers) {
    const question = currentQuestion();
    assert.ok(question, "current question should exist");
    asked.push(question);
    const result = engine.recordAnswer(answer);
    if (result.done) break;
  }

  return {
    asked,
    report: engine.buildReport(),
    debug: engine.getDebugRoute(),
  };
}

function assertNoCommercialFunnelQuestions(questions) {
  const forbidden = /funil|fase da venda|convers[aã]o|proposta comercial|venda perdida/i;
  assert.equal(
    questions.some((question) => forbidden.test(question.text)),
    false,
    "service investigation should not ask commercial funnel questions",
  );
}

function testQuestionContract() {
  for (const question of allQuestions()) {
    assert.ok(question.text.endsWith("?"), `question must end with ?: ${question.text}`);
    assert.ok(engine.categories[question.category], `unknown category: ${question.text}`);
    assert.ok(question.questionPurpose || !question.id, `route question should explain purpose: ${question.text}`);

    if (!question.type || question.type === engine.questionTypes.boolean) {
      assert.equal(/\bou\b/i.test(question.text), false, `boolean question should not embed options: ${question.text}`);
    }

    if (question.type === engine.questionTypes.multipleChoice) {
      assert.ok(Array.isArray(question.options), `multiple-choice needs options: ${question.text}`);
      assert.ok(question.options.length >= 2, `multiple-choice needs at least 2 options: ${question.text}`);
    }
  }
}

function testClassificationRoutes() {
  let result = classify("Cliente reclamou de mau atendimento.");
  assert.equal(result.classification.fenomeno, "insatisfacao_cliente");
  assert.equal(result.classification.dominio, "atendimento");
  assert.equal(result.route.selectedLine, "SERVICE_FAILURE");
  assert.notEqual(result.route.selectedLine, "FUNNEL_COMMERCIAL");
  assert.ok(result.classification.confianca_classificacao >= 0.8);

  result = classify("Cliente deixou de comprar porque foi mal atendido.");
  assert.equal(result.classification.fenomeno, "insatisfacao_cliente");
  assert.equal(result.classification.dominio, "atendimento");
  assert.equal(result.classification.impacto, "perda_comercial");
  assert.equal(result.route.selectedLine, "SERVICE_FAILURE");

  result = classify("Estamos recebendo muitos leads, mas poucos viram propostas.");
  assert.equal(result.classification.fenomeno, "baixa_conversao");
  assert.equal(result.classification.dominio, "comercial");
  assert.equal(result.classification.subdominio, "qualificacao_ou_proposta");
  assert.equal(result.route.selectedLine, "FUNNEL_COMMERCIAL");

  result = classify("Vendemos muitas propostas, mas poucos clientes fecham.");
  assert.equal(result.classification.dominio, "comercial");
  assert.equal(result.classification.subdominio, "fechamento");
  assert.equal(result.route.selectedLine, "FUNNEL_COMMERCIAL");
  assert.ok(result.classification.possiveis_linhas.includes("conversao"));

  result = classify("O caminhao voltou para oficina pela mesma falha.");
  assert.equal(result.classification.fenomeno, "retrabalho_falha_tecnica");
  assert.equal(result.classification.dominio, "operacao");
  assert.equal(result.route.selectedLine, "TECHNICAL_REWORK");

  result = classify("A nota fiscal saiu com dados incorretos.");
  assert.equal(result.classification.fenomeno, "erro_documental");
  assert.equal(result.classification.subdominio, "processo_documental");
  assert.equal(result.route.selectedLine, "DOCUMENT_PROCESS");
}

function testConfidenceGating() {
  let question = begin("Cliente reclamou que o atendente foi grosseiro e nao resolveu o problema.");
  assert.ok(engine.state.classification.confianca_classificacao >= 0.8);
  assert.equal(engine.state.route.selectedLine, "SERVICE_FAILURE");
  assert.equal(question.type, engine.questionTypes.multipleChoice);
  assert.equal(question.questionPurpose, "identificar_manifestacao");
  assertNoCommercialFunnelQuestions([question]);

  question = begin("Cliente reclamou da proposta.");
  assert.ok(engine.state.classification.confianca_classificacao >= 0.5);
  assert.ok(engine.state.classification.confianca_classificacao < 0.8);
  assert.equal(engine.state.route.selectedLine, "GENERAL_CAUSAL_INVESTIGATION");
  assert.equal(engine.state.route.routeLocked, false);
  assert.equal(question.type, engine.questionTypes.multipleChoice);
  assert.ok(question.options.some((option) => option.label.includes("Qualidade do atendimento")));
  assert.ok(question.options.some((option) => option.label.includes("Venda")));

  question = begin("Esta tudo confuso e os resultados pioraram.");
  assert.ok(engine.state.classification.confianca_classificacao < 0.5);
  assert.equal(engine.state.route.selectedLine, "GENERAL_CAUSAL_INVESTIGATION");
  assert.equal(question.type, engine.questionTypes.multipleChoice);
  assert.match(question.text, /principal efeito observado/i);
  assertNoCommercialFunnelQuestions([question]);
}

function testQuestionTypesAndProgression() {
  let question = begin("Cliente reclamou de mau atendimento.");
  assert.equal(question.type, engine.questionTypes.multipleChoice);
  assert.ok(question.options.length >= 7);
  assert.notDeepEqual(
    question.options.map((option) => option.label),
    ["Sim", "Nao", "Parcialmente", "Nao sei"],
  );

  engine.recordAnswer("no_return");
  question = currentQuestion();
  assert.equal(question.type || engine.questionTypes.boolean, engine.questionTypes.boolean);
  assert.match(question.text, /responsavel|prazo|retorno|solicitacao/i);
}

function testEndToEndServiceDoesNotAskFunnel() {
  const flow = answerSequence(
    "Cliente reclamou de mau atendimento.",
    ["attitude", "no", "partial", "yes", "no", "partial", "yes", "unknown"],
  );
  assert.equal(flow.debug.selectedRoute, "SERVICE_FAILURE");
  assertNoCommercialFunnelQuestions(flow.asked);
  assert.match(flow.report, /Causa raiz provavel:/);
  assert.equal(/Ishikawa|5 Por|% de confianca|% de confiança/i.test(flow.report), false);
}

function testNoReturnFindsProcessBeforeBlame() {
  const flow = answerSequence("Cliente reclamou que ninguem retornou sua ligacao.", ["no_return", "no", "no", "no", "partial"]);
  assert.equal(flow.debug.selectedRoute, "SERVICE_FAILURE");
  assert.ok(flow.debug.confirmedFacts.includes("no_return"));
  assertNoCommercialFunnelQuestions(flow.asked);
  assert.equal(/falha humana/i.test(flow.report), false);
  assert.match(flow.report, /controle|responsavel|prazo|retorno|processo|rotina/i);
}

function testCommercialRouteStaysCommercial() {
  const flow = answerSequence(
    "Estamos recebendo muitos leads, mas poucos viram propostas.",
    ["proposal", "yes", "no", "partial", "yes", "unknown"],
  );
  assert.equal(flow.debug.selectedRoute, "FUNNEL_COMMERCIAL");
  assert.ok(flow.asked.some((question) => /fase da venda|proposta|cliente interessado/i.test(question.text)));
  assert.equal(flow.asked.some((question) => /mau atendimento|cordialidade/i.test(question.text)), false);
}

function testDebugRouteExplanation() {
  begin("Cliente reclamou de mau atendimento.");
  const debug = engine.getDebugRoute();
  assert.equal(debug.classification.fenomeno, "insatisfacao_cliente");
  assert.equal(debug.selectedRoute, "SERVICE_FAILURE");
  assert.ok(debug.confidence >= 0.8);
  assert.match(debug.reason, /atendimento|insatisfacao|retorno|suporte/i);
  assert.doesNotMatch(debug.reason, /cliente.*funil/i);
}

const tests = [
  testQuestionContract,
  testClassificationRoutes,
  testConfidenceGating,
  testQuestionTypesAndProgression,
  testEndToEndServiceDoesNotAskFunnel,
  testNoReturnFindsProcessBeforeBlame,
  testCommercialRouteStaysCommercial,
  testDebugRouteExplanation,
];

for (const test of tests) {
  test();
  console.log(`ok - ${test.name}`);
}
