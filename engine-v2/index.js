(function initEngineV2(root, factory) {
  let deps;
  if (typeof module !== "undefined" && module.exports) {
    deps = {
      classifier: require("./phenomenonClassifier"),
      hypothesis: require("./hypothesisEngine"),
      infoGain: require("./informationGain"),
      selector: require("./questionSelector"),
      evidence: require("./evidenceEngine"),
      contradiction: require("./contradictionEngine"),
      stopping: require("./stoppingRules"),
      productionKnowledge: require("./knowledgeBase/productionFailure"),
    };
    module.exports = factory(deps);
    return;
  }
  deps = {
    classifier: root.CausaRealEngineV2Parts.phenomenonClassifier,
    hypothesis: root.CausaRealEngineV2Parts.hypothesisEngine,
    infoGain: root.CausaRealEngineV2Parts.informationGain,
    selector: root.CausaRealEngineV2Parts.questionSelector,
    evidence: root.CausaRealEngineV2Parts.evidenceEngine,
    contradiction: root.CausaRealEngineV2Parts.contradictionEngine,
    stopping: root.CausaRealEngineV2Parts.stoppingRules,
    productionKnowledge: root.CausaRealEngineV2Parts.productionKnowledge,
  };
  root.CausaRealEngineV2 = factory(deps);
})(typeof globalThis !== "undefined" ? globalThis : window, function engineV2Factory({
  classifier,
  hypothesis,
  infoGain,
  selector,
  evidence,
  contradiction,
  stopping,
  productionKnowledge,
}) {
  const ANSWER_LABELS = {
    yes: "Sim",
    no: "Nao",
    partial: "Parcialmente",
    unknown: "Nao sei",
  };

  function cloneQuestion(question) {
    return JSON.parse(JSON.stringify(question));
  }

  function labelsFor(session) {
    return session.subspace?.labels || session.hypothesisLabels;
  }

  function weightsFor(session) {
    return session.subspace?.weights || session.hypothesisWeights;
  }

  function topHypotheses(session, limit = 5) {
    return hypothesis.topHypotheses(weightsFor(session), labelsFor(session), limit);
  }

  function selectAndAttachQuestion(session) {
    const drillTarget = stopping.shouldEnterDrillDown(session);
    if (drillTarget && productionKnowledge.drillDown[drillTarget]) {
      hypothesis.enterSubspace(session, drillTarget, productionKnowledge.drillDown[drillTarget]);
    }

    const selected = selector.selectQuestion(session, productionKnowledge, infoGain.calculateInformationGain);
    session.currentSelection = selected;
    session.currentQuestion = selected ? cloneQuestion(selected.question) : null;
    if (session.currentQuestion) {
      session.currentQuestion.reasonForQuestion = selected.reason;
      session.currentQuestion.informationGain = Number(selected.informationGain.toFixed(4));
    }
    return session.currentQuestion;
  }

  function beginInvestigation({ problem, profile, segment, selectedArea, audience }) {
    const classification = classifier.classifyPhenomenon(problem, { segment, selectedArea, audience });
    if (!classification.supported) {
      return {
        supported: false,
        classification,
        reason: classification.reason,
      };
    }

    const session = hypothesis.createSession({
      problem,
      profile,
      segment,
      selectedArea,
      audience,
      classification,
      knowledge: productionKnowledge,
    });
    selectAndAttachQuestion(session);
    return session;
  }

  function optionFor(question, answer) {
    if (!question.options) return null;
    return question.options.find((option) => option.value === answer) || question.options[0] || null;
  }

  function effectsFor(question, answer, option) {
    if (option?.effects) return option.effects;
    return question.answerEffects?.[answer] || {};
  }

  function applyQuestionAnswer(session, question, answer) {
    const option = optionFor(question, answer);
    const effects = effectsFor(question, answer, option);
    const before = { ...weightsFor(session) };
    if (session.subspace) {
      session.subspace.weights = hypothesis.applyEffects(session.subspace.weights, effects);
      session.subspace.askedQuestionIds.push(question.id);
    } else {
      session.hypothesisWeights = hypothesis.applyEffects(session.hypothesisWeights, effects);
    }
    session.askedQuestionIds.push(question.id);
    const evidenceResult = evidence.registerEvidence(session, question, answer, option);
    contradiction.registerContradictions(session, question, answer);
    if (option?.phenomenon) {
      session.phenomenon = option.phenomenon;
      session.classification.needsFraming = false;
    }
    const after = { ...weightsFor(session) };
    session.answers.push({
      questionId: question.id,
      questionText: question.text,
      answer,
      answerLabel: option?.label || ANSWER_LABELS[answer] || answer,
      effects,
      evidence: evidenceResult.evidence,
      supportingEvidence: evidenceResult.supportingEvidence,
      before,
      after,
    });
    session.debugEvents.push({
      type: "probability_update",
      questionId: question.id,
      answer,
      answerLabel: option?.label || ANSWER_LABELS[answer] || answer,
      before,
      after,
      topHypotheses: topHypotheses(session, 5),
    });
    return { option, effects, evidenceResult, before, after };
  }

  function answer(session, answerValue) {
    if (!session?.supported || session.done) {
      return { done: true, session, question: session?.currentQuestion || null };
    }
    const question = session.currentQuestion;
    const update = applyQuestionAnswer(session, question, answerValue);
    const stop = stopping.shouldStop(session);
    if (stop.stop) {
      session.done = true;
      session.diagnosis = buildDiagnosis(session, stop);
      session.currentQuestion = null;
      return {
        done: true,
        session,
        question,
        diagnosis: session.diagnosis,
        transition: buildTransition(session, question, answerValue, null, update, stop),
      };
    }
    const nextQuestion = selectAndAttachQuestion(session);
    if (!nextQuestion) {
      session.done = true;
      session.diagnosis = buildDiagnosis(session, stop);
      return {
        done: true,
        session,
        question,
        diagnosis: session.diagnosis,
        transition: buildTransition(session, question, answerValue, null, update, stop),
      };
    }
    return {
      done: false,
      session,
      question,
      nextQuestion,
      transition: buildTransition(session, question, answerValue, nextQuestion, update, stop),
    };
  }

  function buildTransition(session, question, answerValue, nextQuestion, update, stop) {
    return {
      type: "hypothesis_space_update",
      answeredQuestionId: question.id,
      triggerAnswer: answerValue,
      nextQuestionId: nextQuestion?.id,
      reasonForQuestion: nextQuestion?.reasonForQuestion || "",
      informationGain: nextQuestion?.informationGain || 0,
      before: update.before,
      after: update.after,
      topHypotheses: topHypotheses(session, 5),
      stop,
    };
  }

  function trace(session) {
    return {
      engineVersion: "v2",
      phenomenon: session.phenomenon,
      macroPhenomenon: session.macroPhenomenon,
      currentQuestion: session.currentQuestion,
      selectedQuestion: session.currentSelection
        ? {
            id: session.currentSelection.question.id,
            text: session.currentSelection.question.text,
            informationGain: Number(session.currentSelection.informationGain.toFixed(4)),
            reason: session.currentSelection.reason,
          }
        : null,
      topHypotheses: topHypotheses(session, 8),
      supportingEvidence: session.supportingEvidence,
      contradictions: session.contradictions,
      candidates: session.currentSelection?.candidates || [],
      debugEvents: session.debugEvents,
    };
  }

  function buildDiagnosis(session, stop = stopping.shouldStop(session)) {
    const top = topHypotheses(session, 1)[0];
    const parentTop = hypothesis.topHypotheses(session.hypothesisWeights, session.hypothesisLabels, 1)[0];
    const parentId = session.subspace ? session.subspace.parentHypothesis : top.id;
    const parentLabel = session.hypothesisLabels[parentId] || parentId;
    const actionable = session.subspace
      ? `${top.label} ligada a ${parentLabel.toLowerCase()}`
      : session.actionableLabels[top.id] || top.label;
    const evidenceItems = session.supportingEvidence.map((item) => item.evidence);
    if (!evidenceItems.length) {
      evidenceItems.push("Hipotese ainda precisa de validacao com teste de evidencia no processo real.");
    }
    return {
      title: actionable,
      strengthLabel: stop.topWeight >= 0.7 ? "Hipotese forte" : "Hipotese em validacao",
      summary:
        `A investigacao reduziu o espaco de hipoteses e apontou ${parentLabel} como linha principal. ` +
        `A causa esta em nivel mais acionavel: ${actionable}.`,
      evidence: evidenceItems.slice(0, 5),
      metrics: [
        "Defeitos por etapa/processo",
        "Ocorrencias por equipamento/dispositivo",
        "Reincidencia apos ajuste ou manutencao",
        "Tempo ate deteccao da falha",
      ],
      plan: {
        what: `Validar e corrigir ${actionable}.`,
        why: "A hipotese venceu perguntas discriminatorias e recebeu evidencia causal inicial.",
        where: "Na etapa, equipamento ou dispositivo onde a falha se concentra.",
        when: "Iniciar na proxima rodada de producao e revisar em ate 7 dias.",
        who: "Qualidade, producao, manutencao e responsavel tecnico da etapa.",
        how: "Comparar antes/depois, registrar parametro real, testar ajuste/troca e padronizar a condicao aprovada.",
        howMuch: "Baixo a medio custo inicialmente; pode crescer se exigir manutencao, dispositivo ou sensor novo.",
      },
      topHypotheses: topHypotheses(session, 5),
      parentTop,
    };
  }

  return {
    beginInvestigation,
    answer,
    trace,
    buildDiagnosis,
    topHypotheses,
    classifyPhenomenon: classifier.classifyPhenomenon,
  };
});
