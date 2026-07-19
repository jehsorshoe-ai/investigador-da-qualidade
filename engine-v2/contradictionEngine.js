(function initContradictionEngine(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.CausaRealEngineV2Parts = root.CausaRealEngineV2Parts || {};
  root.CausaRealEngineV2Parts.contradictionEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function contradictionEngineFactory() {
  const contradictionRules = [
    {
      hypothesis: "MANPOWER",
      questionId: "different_operators",
      answer: "yes",
      note: "A falha continua com operadores diferentes, enfraquecendo causa individual.",
    },
    {
      hypothesis: "MACHINE",
      questionId: "same_equipment",
      answer: "no",
      note: "A falha nao depende de um unico equipamento.",
    },
    {
      hypothesis: "MATERIAL",
      questionId: "same_material_batch",
      answer: "no",
      note: "Nao ha concentracao por lote, fornecedor ou materia-prima.",
    },
    {
      hypothesis: "ENVIRONMENT",
      questionId: "environment_shift",
      answer: "no",
      note: "A falha nao muda com turno ou ambiente.",
    },
  ];

  function registerContradictions(session, question, answer) {
    contradictionRules
      .filter((rule) => rule.questionId === question.id && rule.answer === answer)
      .forEach((rule) => {
        session.contradictions.push({
          hypothesis: rule.hypothesis,
          questionId: question.id,
          answer,
          note: rule.note,
        });
      });
  }

  return { registerContradictions };
});
