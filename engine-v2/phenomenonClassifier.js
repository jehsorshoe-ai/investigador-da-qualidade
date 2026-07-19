(function initPhenomenonClassifier(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.CausaRealEngineV2Parts = root.CausaRealEngineV2Parts || {};
  root.CausaRealEngineV2Parts.phenomenonClassifier = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function phenomenonClassifierFactory() {
  function stripAccents(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function hasAny(text, patterns) {
    return patterns.some((pattern) => pattern.test(text));
  }

  function classifyPhenomenon(problem, context = {}) {
    const text = stripAccents(problem);
    const selectedSegment = context.segment || "generic";
    const selectedArea = context.selectedArea || "auto";
    const industrialContext =
      selectedSegment === "industry" ||
      selectedArea === "operations" ||
      hasAny(text, [
        /\b(producao|industrial|industria|linha|fabrica|chao de fabrica|operador|maquina|equipamento|turno)\b/,
        /\b(refugo|retrabalho|setup|lote|materia prima|dispositivo|ferramenta|calibracao|manutencao)\b/,
      ]);

    if (!industrialContext) {
      return {
        supported: false,
        phenomenon: "OTHER",
        context: "unknown",
        confidence: 0,
        needsFraming: false,
        reason: "O MVP do Engine V2 cobre apenas producao industrial.",
      };
    }

    if (hasAny(text, [/\b(parada|parou|quebrou|indisponivel|downtime)\b.*\b(maquina|equipamento|linha)\b/])) {
      return {
        supported: true,
        phenomenon: "MACHINE_DOWNTIME",
        macroPhenomenon: "PRODUCTION_FAILURE",
        context: "industrial",
        confidence: 0.86,
        needsFraming: false,
        reason: "O relato indica parada ou indisponibilidade de equipamento/linha.",
      };
    }

    if (hasAny(text, [/\b(defeito|defeitos|nao conforme|fora da especificacao|falha de qualidade)\b/])) {
      return {
        supported: true,
        phenomenon: "QUALITY_DEFECT",
        macroPhenomenon: "PRODUCTION_FAILURE",
        context: "industrial",
        confidence: 0.82,
        needsFraming: false,
        reason: "O relato indica defeito ou nao conformidade no produto/processo produtivo.",
      };
    }

    if (hasAny(text, [/\b(retrabalho|refazer|corrigir novamente|volta para processo)\b/])) {
      return {
        supported: true,
        phenomenon: "REWORK",
        macroPhenomenon: "PRODUCTION_FAILURE",
        context: "industrial",
        confidence: 0.82,
        needsFraming: false,
        reason: "O relato indica retrabalho na producao.",
      };
    }

    if (hasAny(text, [/\b(refugo|sucata|perda de material|descartando|descartar)\b/])) {
      return {
        supported: true,
        phenomenon: "SCRAP",
        macroPhenomenon: "PRODUCTION_FAILURE",
        context: "industrial",
        confidence: 0.82,
        needsFraming: false,
        reason: "O relato indica refugo ou perda de material.",
      };
    }

    if (hasAny(text, [/\b(produtividade baixa|baixa produtividade|rendimento baixo|produzindo menos)\b/])) {
      return {
        supported: true,
        phenomenon: "PRODUCTIVITY_LOSS",
        macroPhenomenon: "PRODUCTION_FAILURE",
        context: "industrial",
        confidence: 0.8,
        needsFraming: false,
        reason: "O relato indica perda de produtividade.",
      };
    }

    if (hasAny(text, [/\b(falha|falhas|problema|problemas)\b.*\b(producao|linha|processo produtivo|fabrica)\b/])) {
      return {
        supported: true,
        phenomenon: "PRODUCTION_FAILURE",
        macroPhenomenon: "PRODUCTION_FAILURE",
        context: "industrial",
        confidence: 0.72,
        needsFraming: true,
        reason: "O relato indica problema de producao, mas ainda precisa enquadrar o efeito observado.",
      };
    }

    return {
      supported: false,
      phenomenon: "OTHER",
      context: industrialContext ? "industrial" : "unknown",
      confidence: industrialContext ? 0.35 : 0,
      needsFraming: industrialContext,
      reason: "Nao ha sinais suficientes para o MVP industrial do Engine V2 assumir a investigacao.",
    };
  }

  return { classifyPhenomenon, stripAccents };
});
