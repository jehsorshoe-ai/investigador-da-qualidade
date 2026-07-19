(function initCausaRealAI(root) {
  const MAX_HISTORY = 6;

  function endpoint() {
    const configured = root.CAUSA_REAL_AI_CONFIG?.endpoint?.trim();
    if (configured) return configured;
    return root.location?.hostname?.endsWith(".vercel.app") ? "/api/investigate" : "";
  }

  function normalizeText(value, maxLength) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
  }

  function normalizeOptions(options, expectedOptions) {
    if (!Array.isArray(options) || options.length !== expectedOptions.length) return null;
    const expectedValues = expectedOptions.map((option) => option.value).sort();
    const receivedValues = options.map((option) => option?.value).sort();
    if (expectedValues.join("|") !== receivedValues.join("|")) return null;

    const seenLabels = new Set();
    const byValue = new Map(options.map((option) => [option.value, normalizeText(option.label, 80)]));
    const normalized = expectedOptions.map((option) => ({
      value: option.value,
      label: byValue.get(option.value),
    }));

    if (normalized.some((option) => option.label.length < 2)) return null;
    if (normalized.some((option) => {
      const key = option.label.toLocaleLowerCase("pt-BR");
      if (seenLabels.has(key)) return true;
      seenLabels.add(key);
      return false;
    })) return null;
    return normalized;
  }

  function validateAdaptation(payload, canonicalQuestion) {
    const question = normalizeText(payload?.question, 240);
    const options = normalizeOptions(payload?.options, canonicalQuestion.options || []);
    if (question.length < 12 || !options) return null;
    return { question, options };
  }

  async function adaptQuestion({ canonicalQuestion, context }) {
    const target = endpoint();
    if (!target || !canonicalQuestion?.id || !Array.isArray(canonicalQuestion.options)) return null;

    const response = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation: "adapt_question",
        canonicalQuestion: {
          id: canonicalQuestion.id,
          text: normalizeText(canonicalQuestion.text, 240),
          category: canonicalQuestion.category,
          targetHypothesis: canonicalQuestion.targetHypothesis,
          options: canonicalQuestion.options.map((option) => ({
            value: option.value,
            label: normalizeText(option.label, 80),
          })),
        },
        context: {
          problem: normalizeText(context?.problem, 500),
          profile: normalizeText(context?.profile, 80),
          segment: normalizeText(context?.segment, 80),
          area: normalizeText(context?.area, 80),
          audience: normalizeText(context?.audience, 80),
          classification: context?.classification || {},
          history: (context?.history || []).slice(-MAX_HISTORY).map((item) => ({
            question: normalizeText(item.text, 240),
            answer: normalizeText(item.answerLabel, 80),
          })),
        },
      }),
    });

    if (!response.ok) return null;
    const payload = await response.json();
    return validateAdaptation(payload?.adaptation, canonicalQuestion);
  }

  root.CausaRealAI = {
    isConfigured: () => Boolean(endpoint()),
    adaptQuestion,
    validateAdaptation,
  };
})(window);
