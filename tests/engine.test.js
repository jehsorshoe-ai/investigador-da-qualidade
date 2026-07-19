const assert = require("node:assert/strict");

const engine = require("../app.js");

const answers = ["yes", "partial", "no", "unknown"];

function collectQuestions() {
  const segmentQuestions = Object.values(engine.segmentQuestionBoost)
    .flatMap((byArea) => Object.values(byArea))
    .flat();
  return [...engine.questionBank, ...segmentQuestions];
}

function startScenario(problem, selectedArea = "auto", segment = "generic") {
  engine.beginInvestigation({
    profile: "Empresario / gestor",
    segment,
    selectedArea,
    audience: "mixed",
    problem,
  });
}

function runScenario(problem, sequence, selectedArea = "auto", segment = "generic") {
  startScenario(problem, selectedArea, segment);
  const seen = new Set();

  for (const answer of sequence) {
    const question = engine.state.questions[engine.state.index];
    assert.ok(question, "scenario should always have a current question");
    assert.equal(seen.has(question.text), false, `question repeated: ${question.text}`);
    seen.add(question.text);

    const result = engine.recordAnswer(answer);
    if (result.done) break;
  }

  return {
    asked: engine.state.asked,
    report: engine.buildReport(),
    topCategory: engine.topCategoryKey(),
  };
}

function testQuestionContract() {
  const questions = collectQuestions();
  assert.ok(questions.length > 20, "question library should be populated");

  for (const question of questions) {
    assert.ok(question.text.endsWith("?"), `question must end with ?: ${question.text}`);
    assert.equal(/\bou\b/i.test(question.text), false, `question should not contain options with 'ou': ${question.text}`);
    assert.ok(engine.categories[question.category], `question has unknown category: ${question.text}`);
  }
}

function testAreaDetection() {
  assert.equal(engine.detectArea("Cliente reclama do atendimento", "auto"), "service");
  assert.equal(engine.detectArea("baixa performance em vendas", "auto"), "commercial");
  assert.equal(engine.detectArea("produto com defeito", "auto"), "product");
  assert.equal(engine.detectArea("cliente reclama da proposta comercial", "commercial"), "commercial");
}

function testReverseScoring() {
  assert.equal(engine.answerWeight("yes", true), -1);
  assert.equal(engine.answerWeight("partial", true), 1.5);
  assert.equal(engine.answerWeight("no", true), 3);
  assert.equal(engine.answerWeight("unknown", true), 0);

  for (const answer of answers) {
    assert.equal(Number.isFinite(engine.answerWeight(answer, false)), true);
  }
}

function testPillarCoverage() {
  startScenario("Cliente reclama do atendimento", "auto", "retail");
  for (let index = 0; index < 6; index += 1) {
    engine.recordAnswer(index % 2 === 0 ? "yes" : "partial");
  }

  const pillars = new Set(engine.state.asked.map((item) => engine.categoryPillars[item.category]));
  assert.ok(pillars.has("people"), "early investigation should cover Pessoas");
  assert.ok(pillars.has("product"), "early investigation should cover Produto");
  assert.ok(pillars.has("process"), "early investigation should cover Processo");
}

function testCompleteFlows() {
  const service = runScenario(
    "Cliente reclama do atendimento",
    ["yes", "partial", "yes", "no", "yes", "partial", "no", "yes", "unknown", "partial", "yes", "no"],
    "auto",
    "retail",
  );
  assert.ok(service.asked.length >= 7, "service flow should ask enough questions");
  assert.ok(service.report.includes("Causa raiz provavel:"), "service flow should generate diagnosis");
  assert.equal(/Ishikawa|5 Por|% de confianca|% de confiança/i.test(service.report), false);

  const commercial = runScenario(
    "baixa performance em vendas",
    ["yes", "yes", "partial", "no", "yes", "partial", "yes", "no", "partial", "unknown", "yes", "yes"],
    "auto",
    "services",
  );
  assert.ok(commercial.asked.length >= 7, "commercial flow should ask enough questions");
  assert.ok(["funnel", "offer", "market", "people", "measurement", "method"].includes(commercial.topCategory));
  assert.equal(/Ishikawa|5 Por|% de confianca|% de confiança/i.test(commercial.report), false);

  for (const flow of [service, commercial]) {
    for (let index = 2; index < flow.asked.length; index += 1) {
      const lastThree = flow.asked.slice(index - 2, index + 1);
      assert.equal(
        lastThree.every((item) => item.category === lastThree[0].category),
        false,
        `too many repeated categories: ${lastThree[0].category}`,
      );
    }
  }
}

const tests = [
  testQuestionContract,
  testAreaDetection,
  testReverseScoring,
  testPillarCoverage,
  testCompleteFlows,
];

for (const test of tests) {
  test();
  console.log(`ok - ${test.name}`);
}
