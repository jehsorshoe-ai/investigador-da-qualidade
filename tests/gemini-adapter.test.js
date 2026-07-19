const assert = require("assert");
const { validateAdaptation } = require("../api/investigate");

const canonicalQuestion = {
  id: "service_manifestation",
  options: [
    { value: "delay", label: "Demora" },
    { value: "return", label: "Falta de retorno" },
    { value: "other", label: "Outro ponto" },
  ],
};

function testAcceptsAdaptationThatPreservesAnswerValues() {
  const adaptation = validateAdaptation(
    {
      question: "Qual desses pontos mais incomoda o cliente no atendimento?",
      options: [
        { value: "return", label: "Não recebeu retorno" },
        { value: "other", label: "Outro problema percebido" },
        { value: "delay", label: "Esperou mais do que o esperado" },
      ],
    },
    canonicalQuestion,
  );

  assert.deepStrictEqual(adaptation.options.map((option) => option.value), ["delay", "return", "other"]);
  assert.strictEqual(adaptation.question, "Qual desses pontos mais incomoda o cliente no atendimento?");
}

function testRejectsChangedAnswerContract() {
  const adaptation = validateAdaptation(
    {
      question: "Qual falha o cliente percebe?",
      options: [
        { value: "delay", label: "Demora" },
        { value: "new_value", label: "Novo caminho" },
        { value: "other", label: "Outro" },
      ],
    },
    canonicalQuestion,
  );

  assert.strictEqual(adaptation, null);
}

function testRejectsMethodologyInUserFacingQuestion() {
  const adaptation = validateAdaptation(
    {
      question: "Usando Ishikawa, qual falha o cliente percebe?",
      options: [
        { value: "delay", label: "Demora" },
        { value: "return", label: "Falta de retorno" },
        { value: "other", label: "Outro ponto" },
      ],
    },
    canonicalQuestion,
  );

  assert.strictEqual(adaptation, null);
}

function testRejectsMethodologyInAnswerLabel() {
  const adaptation = validateAdaptation(
    {
      question: "Qual falha o cliente percebe?",
      options: [
        { value: "delay", label: "Demora" },
        { value: "return", label: "Aplicar 5 Porquês" },
        { value: "other", label: "Outro ponto" },
      ],
    },
    canonicalQuestion,
  );

  assert.strictEqual(adaptation, null);
}

[
  testAcceptsAdaptationThatPreservesAnswerValues,
  testRejectsChangedAnswerContract,
  testRejectsMethodologyInUserFacingQuestion,
  testRejectsMethodologyInAnswerLabel,
].forEach((test) => {
  test();
  console.log(`ok - ${test.name}`);
});
