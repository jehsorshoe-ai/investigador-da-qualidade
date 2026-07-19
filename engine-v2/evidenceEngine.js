(function initEvidenceEngine(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.CausaRealEngineV2Parts = root.CausaRealEngineV2Parts || {};
  root.CausaRealEngineV2Parts.evidenceEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function evidenceEngineFactory() {
  function evidenceForAnswer(question, answer, option) {
    if (option?.evidence) return option.evidence;
    return question.evidenceByAnswer?.[answer] || "";
  }

  function supportingEvidenceForAnswer(question, answer, option) {
    if (option?.supportingEvidence) return option.supportingEvidence;
    return question.supportingEvidenceByAnswer?.[answer] || "";
  }

  function registerEvidence(session, question, answer, option) {
    const evidence = evidenceForAnswer(question, answer, option);
    const supportingEvidence = supportingEvidenceForAnswer(question, answer, option);
    if (evidence) {
      session.debugEvents.push({
        type: "evidence_observed",
        questionId: question.id,
        answer,
        evidence,
      });
    }
    if (supportingEvidence) {
      session.supportingEvidence.push({
        questionId: question.id,
        answer,
        evidence: supportingEvidence,
      });
    }
    return { evidence, supportingEvidence };
  }

  return { registerEvidence, evidenceForAnswer, supportingEvidenceForAnswer };
});
