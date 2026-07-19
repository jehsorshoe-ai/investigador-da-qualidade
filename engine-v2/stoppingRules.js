(function initStoppingRules(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.CausaRealEngineV2Parts = root.CausaRealEngineV2Parts || {};
  root.CausaRealEngineV2Parts.stoppingRules = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function stoppingRulesFactory() {
  function topEntry(weights) {
    return Object.entries(weights).sort((a, b) => b[1] - a[1])[0] || ["UNKNOWN", 0];
  }

  function shouldEnterDrillDown(session) {
    if (session.subspace) return null;
    const [id, weight] = topEntry(session.hypothesisWeights);
    if (weight >= 0.55) return id;
    const equipmentCluster =
      (session.hypothesisWeights.MACHINE || 0) +
      (session.hypothesisWeights.TOOLING || 0) +
      (session.hypothesisWeights.MAINTENANCE || 0);
    if (equipmentCluster >= 0.58) {
      return (session.hypothesisWeights.MACHINE || 0) >= (session.hypothesisWeights.TOOLING || 0) ? "MACHINE" : "TOOLING";
    }
    return null;
  }

  function shouldStop(session) {
    const weights = session.subspace?.weights || session.hypothesisWeights;
    const [id, weight] = topEntry(weights);
    const enoughQuestions = session.answers.length >= 5;
    const enoughEvidence = session.supportingEvidence.length >= 1;
    const acceptableContradictions = session.contradictions.length <= 2;
    const actionableLevel = Boolean(session.subspace) || weight >= 0.72;
    return {
      stop: enoughQuestions && enoughEvidence && acceptableContradictions && actionableLevel && weight >= 0.58,
      topId: id,
      topWeight: weight,
      enoughQuestions,
      enoughEvidence,
      acceptableContradictions,
      actionableLevel,
    };
  }

  return { shouldEnterDrillDown, shouldStop, topEntry };
});
