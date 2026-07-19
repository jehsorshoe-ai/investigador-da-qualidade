(function initHypothesisEngine(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.CausaRealEngineV2Parts = root.CausaRealEngineV2Parts || {};
  root.CausaRealEngineV2Parts.hypothesisEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function hypothesisEngineFactory() {
  const MIN_WEIGHT = 0.01;

  function normalize(weights) {
    const positive = Object.fromEntries(
      Object.entries(weights).map(([id, value]) => [id, Math.max(MIN_WEIGHT, Number(value) || MIN_WEIGHT)]),
    );
    const total = Object.values(positive).reduce((sum, value) => sum + value, 0) || 1;
    return Object.fromEntries(Object.entries(positive).map(([id, value]) => [id, value / total]));
  }

  function createWeights(hypotheses) {
    return normalize(Object.fromEntries(hypotheses.map((hypothesis) => [hypothesis.id, hypothesis.prior])));
  }

  function applyEffects(weights, effects = {}) {
    const next = { ...weights };
    Object.entries(effects).forEach(([id, delta]) => {
      if (next[id] === undefined) return;
      next[id] = Math.max(MIN_WEIGHT, next[id] + delta);
    });
    return normalize(next);
  }

  function topHypotheses(weights, labels = {}, limit = 5) {
    return Object.entries(weights)
      .map(([id, weight]) => ({
        id,
        weight,
        percent: Math.round(weight * 100),
        label: labels[id] || id,
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);
  }

  function entropy(weights) {
    return Object.values(weights).reduce((sum, weight) => {
      if (weight <= 0) return sum;
      return sum - weight * Math.log2(weight);
    }, 0);
  }

  function createSession({ problem, profile, segment, selectedArea, audience, classification, knowledge }) {
    const labels = Object.fromEntries(knowledge.hypotheses.map((hypothesis) => [hypothesis.id, hypothesis.label]));
    const actionableLabels = Object.fromEntries(
      knowledge.hypotheses.map((hypothesis) => [hypothesis.id, hypothesis.actionableLabel || hypothesis.label]),
    );
    const weights = createWeights(knowledge.hypotheses);
    return {
      engineVersion: "v2",
      supported: true,
      profile,
      segment,
      selectedArea,
      audience,
      problem,
      context: {
        area: "operations",
        segment: segment || "industry",
        domain: "industrial",
      },
      classification,
      phenomenon: classification.phenomenon,
      macroPhenomenon: classification.macroPhenomenon || classification.phenomenon,
      hypothesisLabels: labels,
      actionableLabels,
      hypothesisWeights: weights,
      subspace: null,
      askedQuestionIds: [],
      answers: [],
      supportingEvidence: [],
      contradictions: [],
      debugEvents: [
        {
          type: "classification",
          phenomenon: classification.phenomenon,
          confidence: classification.confidence,
          reason: classification.reason,
          weights,
        },
      ],
      currentQuestion: null,
      currentSelection: null,
      diagnosis: null,
      done: false,
    };
  }

  function enterSubspace(session, topId, drillDownConfig) {
    if (!drillDownConfig || session.subspace) return session;
    session.subspace = {
      parentHypothesis: topId,
      labels: Object.fromEntries(drillDownConfig.hypotheses.map((hypothesis) => [hypothesis.id, hypothesis.label])),
      weights: createWeights(drillDownConfig.hypotheses),
      askedQuestionIds: [],
      questions: drillDownConfig.questions,
    };
    session.debugEvents.push({
      type: "drill_down_started",
      parentHypothesis: topId,
      weights: session.subspace.weights,
    });
    return session;
  }

  return {
    normalize,
    createWeights,
    applyEffects,
    topHypotheses,
    entropy,
    createSession,
    enterSubspace,
  };
});
