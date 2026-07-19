(function initQuestionSelector(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.CausaRealEngineV2Parts = root.CausaRealEngineV2Parts || {};
  root.CausaRealEngineV2Parts.questionSelector = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function questionSelectorFactory() {
  function isQuestionApplicable(question, session, weights) {
    if (session.askedQuestionIds.includes(question.id)) return false;
    if (question.applicablePhenomena?.length) {
      const phenomenon = session.phenomenon;
      const macro = session.macroPhenomenon;
      if (!question.applicablePhenomena.includes(phenomenon) && !question.applicablePhenomena.includes(macro)) return false;
    }
    if (question.minTopWeight) {
      const top = Object.entries(weights).sort((a, b) => b[1] - a[1])[0];
      if (!top || top[1] < question.minTopWeight) return false;
      if (!question.separatesHypotheses?.includes(top[0])) return false;
    }
    return true;
  }

  function selectQuestion(session, knowledge, calculateInformationGain) {
    if (session.classification.needsFraming && !session.askedQuestionIds.includes(knowledge.framingQuestion.id)) {
      return {
        question: knowledge.framingQuestion,
        informationGain: 1,
        reason: "Primeiro enquadrar o efeito industrial observado antes de reduzir hipoteses causais.",
      };
    }

    const usingSubspace = Boolean(session.subspace);
    const weights = usingSubspace ? session.subspace.weights : session.hypothesisWeights;
    const asked = usingSubspace ? session.subspace.askedQuestionIds : session.askedQuestionIds;
    const questions = usingSubspace ? session.subspace.questions : knowledge.questions;
    const candidates = questions
      .filter((question) => !asked.includes(question.id))
      .filter((question) => isQuestionApplicable(question, session, weights))
      .map((question) => ({
        question,
        informationGain: calculateInformationGain(question, weights),
      }))
      .sort((a, b) => b.informationGain - a.informationGain);

    const evidenceCandidate = candidates.find((candidate) => candidate.question.evidenceQuestion);
    if (evidenceCandidate) {
      return {
        ...evidenceCandidate,
        reason: "Hipotese principal forte o suficiente; agora a pergunta busca evidencia causal antes de concluir.",
        candidates: candidates.slice(0, 5).map((candidate) => ({
          id: candidate.question.id,
          text: candidate.question.text,
          informationGain: Number(candidate.informationGain.toFixed(4)),
        })),
      };
    }

    const selected = candidates[0] || null;
    if (!selected) return null;
    return {
      ...selected,
      reason: usingSubspace
        ? "Pergunta escolhida para separar sub-hipoteses dentro da hipotese dominante."
        : "Pergunta escolhida pelo maior ganho de informacao entre as hipoteses ainda plausiveis.",
      candidates: candidates.slice(0, 5).map((candidate) => ({
        id: candidate.question.id,
        text: candidate.question.text,
        informationGain: Number(candidate.informationGain.toFixed(4)),
      })),
    };
  }

  return { selectQuestion, isQuestionApplicable };
});
