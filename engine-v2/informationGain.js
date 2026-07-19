(function initInformationGain(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.CausaRealEngineV2Parts = root.CausaRealEngineV2Parts || {};
  root.CausaRealEngineV2Parts.informationGain = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function informationGainFactory() {
  const defaultAnswerLikelihood = {
    yes: 0.42,
    no: 0.38,
    partial: 0.14,
    unknown: 0.06,
  };

  function entropy(weights) {
    return Object.values(weights).reduce((sum, weight) => {
      if (weight <= 0) return sum;
      return sum - weight * Math.log2(weight);
    }, 0);
  }

  function normalize(weights) {
    const clamped = Object.fromEntries(Object.entries(weights).map(([id, value]) => [id, Math.max(0.01, value)]));
    const total = Object.values(clamped).reduce((sum, value) => sum + value, 0) || 1;
    return Object.fromEntries(Object.entries(clamped).map(([id, value]) => [id, value / total]));
  }

  function applyEffects(weights, effects = {}) {
    const next = { ...weights };
    Object.entries(effects).forEach(([id, delta]) => {
      if (next[id] === undefined) return;
      next[id] = Math.max(0.01, next[id] + delta);
    });
    return normalize(next);
  }

  function calculateInformationGain(question, hypothesisWeights) {
    if (question.informationGainHint) return question.informationGainHint;
    const before = entropy(hypothesisWeights);
    const likelihood = question.answerLikelihood || defaultAnswerLikelihood;
    const expectedAfter = Object.entries(likelihood).reduce((sum, [answer, probability]) => {
      const effects = question.answerEffects?.[answer] || {};
      return sum + probability * entropy(applyEffects(hypothesisWeights, effects));
    }, 0);
    const separatedWeight = (question.separatesHypotheses || []).reduce((sum, id) => sum + (hypothesisWeights[id] || 0), 0);
    return Math.max(0, before - expectedAfter) + separatedWeight * 0.08;
  }

  return { calculateInformationGain, entropy, applyEffects };
});
