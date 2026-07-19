(function initProductionKnowledge(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.CausaRealEngineV2Parts = root.CausaRealEngineV2Parts || {};
  root.CausaRealEngineV2Parts.productionKnowledge = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function productionKnowledgeFactory() {
  const hypotheses = [
    {
      id: "METHOD",
      label: "Metodo / processo",
      prior: 0.1,
      actionableLabel: "padrao, parametro ou sequencia de processo inadequada",
    },
    {
      id: "MACHINE",
      label: "Maquina / equipamento",
      prior: 0.1,
      actionableLabel: "equipamento, regulagem, sensor ou condicao mecanica instavel",
    },
    {
      id: "MANPOWER",
      label: "Pessoas / execucao",
      prior: 0.1,
      actionableLabel: "treinamento, interpretacao ou variacao de execucao",
    },
    {
      id: "MATERIAL",
      label: "Material / insumo",
      prior: 0.1,
      actionableLabel: "lote, materia-prima ou caracteristica do material fora do esperado",
    },
    {
      id: "MEASUREMENT",
      label: "Medicao / controle",
      prior: 0.1,
      actionableLabel: "criterio, medicao ou deteccao insuficiente",
    },
    {
      id: "ENVIRONMENT",
      label: "Ambiente",
      prior: 0.08,
      actionableLabel: "temperatura, umidade, organizacao ou condicao ambiental",
    },
    {
      id: "MAINTENANCE",
      label: "Manutencao",
      prior: 0.09,
      actionableLabel: "manutencao preventiva, corretiva ou ajuste inadequado",
    },
    {
      id: "PLANNING",
      label: "Planejamento",
      prior: 0.08,
      actionableLabel: "sequenciamento, carga, setup ou planejamento de producao",
    },
    {
      id: "TOOLING",
      label: "Ferramental / dispositivo",
      prior: 0.09,
      actionableLabel: "ferramenta, gabarito ou dispositivo desgastado/incorreto",
    },
    {
      id: "SYSTEM_INFORMATION",
      label: "Sistema / informacao",
      prior: 0.08,
      actionableLabel: "informacao tecnica, ordem, desenho ou instrucao incorreta",
    },
    {
      id: "SUPPLIER",
      label: "Fornecedor",
      prior: 0.09,
      actionableLabel: "variacao de fornecedor, lote ou especificacao recebida",
    },
    {
      id: "DESIGN",
      label: "Projeto / desenvolvimento",
      prior: 0.09,
      actionableLabel: "desenho, tolerancia ou especificacao de produto inadequada",
    },
  ];

  const framingQuestion = {
    id: "production_effect_framing",
    text: "Qual e o principal efeito observado na producao?",
    type: "MULTIPLE_CHOICE",
    category: "phenomenon",
    informationGainHint: 1,
    options: [
      {
        value: "defect",
        label: "Defeito no produto",
        phenomenon: "QUALITY_DEFECT",
        effects: { METHOD: 0.05, MACHINE: 0.05, MATERIAL: 0.05, MEASUREMENT: 0.03, DESIGN: 0.03 },
        evidence: "O efeito principal observado e defeito no produto.",
      },
      {
        value: "rework",
        label: "Retrabalho",
        phenomenon: "REWORK",
        effects: { METHOD: 0.08, MANPOWER: 0.04, MEASUREMENT: 0.05, SYSTEM_INFORMATION: 0.03 },
        evidence: "O efeito principal observado e retrabalho.",
      },
      {
        value: "scrap",
        label: "Refugo",
        phenomenon: "SCRAP",
        effects: { MATERIAL: 0.07, MACHINE: 0.05, METHOD: 0.04, TOOLING: 0.04 },
        evidence: "O efeito principal observado e refugo.",
      },
      {
        value: "downtime",
        label: "Parada de equipamento",
        phenomenon: "MACHINE_DOWNTIME",
        effects: { MACHINE: 0.16, MAINTENANCE: 0.14, TOOLING: 0.04 },
        evidence: "O efeito principal observado e parada de equipamento.",
      },
      {
        value: "productivity",
        label: "Baixa produtividade",
        phenomenon: "PRODUCTIVITY_LOSS",
        effects: { METHOD: 0.06, PLANNING: 0.07, MACHINE: 0.04, MANPOWER: 0.03 },
        evidence: "O efeito principal observado e baixa produtividade.",
      },
      {
        value: "delay",
        label: "Atraso de producao",
        phenomenon: "DELAY",
        effects: { PLANNING: 0.1, MACHINE: 0.04, MATERIAL: 0.04, METHOD: 0.04 },
        evidence: "O efeito principal observado e atraso de producao.",
      },
      {
        value: "process_error",
        label: "Erro de processo",
        phenomenon: "PRODUCTION_FAILURE",
        effects: { METHOD: 0.11, SYSTEM_INFORMATION: 0.06, MANPOWER: 0.04, MEASUREMENT: 0.03 },
        evidence: "O efeito principal observado e erro de processo.",
      },
      {
        value: "other",
        label: "Outro efeito de producao",
        phenomenon: "PRODUCTION_FAILURE",
        effects: { MEASUREMENT: 0.08, METHOD: 0.04 },
        evidence: "O efeito ainda precisa ser localizado com dados de producao.",
      },
    ],
  };

  const questions = [
    {
      id: "same_process_stage",
      text: "O problema acontece sempre no mesmo processo ou etapa?",
      type: "BOOLEAN",
      applicablePhenomena: ["PRODUCTION_FAILURE", "QUALITY_DEFECT", "REWORK", "SCRAP", "PRODUCTIVITY_LOSS"],
      separatesHypotheses: ["METHOD", "MACHINE", "TOOLING", "MATERIAL", "MANPOWER"],
      answerEffects: {
        yes: { METHOD: 0.18, MACHINE: 0.11, TOOLING: 0.09, MEASUREMENT: 0.04, MANPOWER: -0.06 },
        no: { METHOD: -0.11, MACHINE: -0.08, MATERIAL: 0.08, MANPOWER: 0.07, MEASUREMENT: 0.04 },
        partial: { METHOD: 0.07, MATERIAL: 0.04, MANPOWER: 0.03 },
        unknown: { MEASUREMENT: 0.06 },
      },
      evidenceByAnswer: {
        yes: "A falha se concentra em uma etapa do processo.",
        no: "A falha nao se concentra em uma unica etapa.",
      },
    },
    {
      id: "different_operators",
      text: "O problema continua ocorrendo quando operadores diferentes executam a mesma atividade?",
      type: "BOOLEAN",
      applicablePhenomena: ["PRODUCTION_FAILURE", "QUALITY_DEFECT", "REWORK", "SCRAP", "PRODUCTIVITY_LOSS"],
      separatesHypotheses: ["MANPOWER", "METHOD", "MACHINE", "MATERIAL"],
      answerEffects: {
        yes: { MANPOWER: -0.26, METHOD: 0.13, MACHINE: 0.13, MATERIAL: 0.08, TOOLING: 0.05 },
        no: { MANPOWER: 0.34, METHOD: -0.05, MACHINE: -0.05 },
        partial: { MANPOWER: 0.12, METHOD: 0.04 },
        unknown: { MEASUREMENT: 0.05 },
      },
      evidenceByAnswer: {
        yes: "A falha permanece mesmo com operadores diferentes, reduzindo a hipotese de execucao individual.",
        no: "A falha muda conforme o operador, fortalecendo a hipotese de habilidade, interpretacao ou execucao.",
      },
    },
    {
      id: "same_equipment",
      text: "O defeito acontece sempre no mesmo equipamento ou dispositivo?",
      type: "BOOLEAN",
      applicablePhenomena: ["PRODUCTION_FAILURE", "QUALITY_DEFECT", "REWORK", "SCRAP", "MACHINE_DOWNTIME"],
      separatesHypotheses: ["MACHINE", "TOOLING", "MAINTENANCE", "METHOD", "MATERIAL"],
      answerEffects: {
        yes: { MACHINE: 0.31, TOOLING: 0.18, MAINTENANCE: 0.14, METHOD: 0.04, MANPOWER: -0.08 },
        no: { MACHINE: -0.19, TOOLING: -0.12, MATERIAL: 0.1, METHOD: 0.08, MANPOWER: 0.03 },
        partial: { MACHINE: 0.12, TOOLING: 0.08, METHOD: 0.04 },
        unknown: { MEASUREMENT: 0.05 },
      },
      evidenceByAnswer: {
        yes: "A falha esta concentrada no mesmo equipamento ou dispositivo.",
        no: "A falha nao depende de um unico equipamento.",
      },
    },
    {
      id: "same_material_batch",
      text: "A falha aparece mais em um lote, fornecedor ou tipo de materia-prima?",
      type: "BOOLEAN",
      applicablePhenomena: ["PRODUCTION_FAILURE", "QUALITY_DEFECT", "REWORK", "SCRAP"],
      separatesHypotheses: ["MATERIAL", "SUPPLIER", "METHOD", "MACHINE"],
      answerEffects: {
        yes: { MATERIAL: 0.27, SUPPLIER: 0.22, METHOD: -0.06, MACHINE: -0.05 },
        no: { MATERIAL: -0.16, SUPPLIER: -0.13, METHOD: 0.06, MACHINE: 0.05 },
        partial: { MATERIAL: 0.1, SUPPLIER: 0.08, MEASUREMENT: 0.03 },
        unknown: { MEASUREMENT: 0.06 },
      },
      evidenceByAnswer: {
        yes: "A falha se concentra por lote, fornecedor ou materia-prima.",
        no: "Nao ha concentracao clara por material ou fornecedor.",
      },
    },
    {
      id: "after_setup_or_parameter_change",
      text: "O problema aumenta apos setup, troca de parametro ou mudanca de modelo?",
      type: "BOOLEAN",
      applicablePhenomena: ["PRODUCTION_FAILURE", "QUALITY_DEFECT", "REWORK", "SCRAP", "PRODUCTIVITY_LOSS"],
      separatesHypotheses: ["METHOD", "MACHINE", "TOOLING", "SYSTEM_INFORMATION", "PLANNING"],
      answerEffects: {
        yes: { METHOD: 0.2, MACHINE: 0.08, TOOLING: 0.1, SYSTEM_INFORMATION: 0.12, PLANNING: 0.05 },
        no: { METHOD: -0.08, SYSTEM_INFORMATION: -0.06, MATERIAL: 0.05, MACHINE: 0.04 },
        partial: { METHOD: 0.08, SYSTEM_INFORMATION: 0.05 },
        unknown: { MEASUREMENT: 0.05 },
      },
      evidenceByAnswer: {
        yes: "A falha aumenta apos setup, troca de parametro ou mudanca de modelo.",
      },
    },
    {
      id: "measurement_detects_before_escape",
      text: "Existe medicao capaz de perceber a falha antes de ela seguir para a proxima etapa?",
      type: "BOOLEAN",
      applicablePhenomena: ["PRODUCTION_FAILURE", "QUALITY_DEFECT", "REWORK", "SCRAP"],
      separatesHypotheses: ["MEASUREMENT", "METHOD", "MANPOWER"],
      answerEffects: {
        yes: { MEASUREMENT: -0.1, METHOD: 0.04, MACHINE: 0.04 },
        no: { MEASUREMENT: 0.3, METHOD: 0.05 },
        partial: { MEASUREMENT: 0.12, METHOD: 0.03 },
        unknown: { MEASUREMENT: 0.08 },
      },
      evidenceByAnswer: {
        no: "A falha pode seguir adiante sem deteccao suficiente.",
      },
    },
    {
      id: "environment_shift",
      text: "A falha muda conforme turno, temperatura, umidade ou condicao do ambiente?",
      type: "BOOLEAN",
      applicablePhenomena: ["PRODUCTION_FAILURE", "QUALITY_DEFECT", "REWORK", "SCRAP", "PRODUCTIVITY_LOSS"],
      separatesHypotheses: ["ENVIRONMENT", "MANPOWER", "MACHINE", "MATERIAL"],
      answerEffects: {
        yes: { ENVIRONMENT: 0.28, MANPOWER: 0.07, MATERIAL: 0.05, MACHINE: 0.04 },
        no: { ENVIRONMENT: -0.16, METHOD: 0.04, MACHINE: 0.04 },
        partial: { ENVIRONMENT: 0.1, MEASUREMENT: 0.03 },
        unknown: { MEASUREMENT: 0.05 },
      },
      evidenceByAnswer: {
        yes: "A falha varia com turno ou condicao ambiental.",
      },
    },
    {
      id: "equipment_adjustment_evidence",
      text: "O problema diminui ou desaparece apos ajuste, manutencao ou troca do equipamento/dispositivo?",
      type: "BOOLEAN",
      evidenceQuestion: true,
      minTopWeight: 0.24,
      applicablePhenomena: ["PRODUCTION_FAILURE", "QUALITY_DEFECT", "REWORK", "SCRAP", "MACHINE_DOWNTIME"],
      separatesHypotheses: ["MACHINE", "TOOLING", "MAINTENANCE"],
      answerEffects: {
        yes: { MACHINE: 0.24, TOOLING: 0.18, MAINTENANCE: 0.16, METHOD: -0.06, MANPOWER: -0.06 },
        no: { MACHINE: -0.14, TOOLING: -0.1, METHOD: 0.08, MATERIAL: 0.06 },
        partial: { MACHINE: 0.08, TOOLING: 0.08, MAINTENANCE: 0.05 },
        unknown: { MEASUREMENT: 0.04 },
      },
      supportingEvidenceByAnswer: {
        yes: "A falha diminui ou desaparece apos ajuste/troca do equipamento ou dispositivo.",
      },
      evidenceByAnswer: {
        yes: "Ha evidencia causal ligada a equipamento, dispositivo ou manutencao.",
      },
    },
  ];

  const drillDown = {
    MACHINE: {
      hypotheses: [
        { id: "MACHINE_ADJUSTMENT", label: "Regulagem incorreta", prior: 0.22 },
        { id: "MACHINE_WEAR", label: "Desgaste mecanico", prior: 0.18 },
        { id: "MACHINE_CALIBRATION", label: "Calibracao fora do esperado", prior: 0.18 },
        { id: "MACHINE_SENSOR", label: "Sensor ou leitura instavel", prior: 0.16 },
        { id: "MACHINE_INTERMITTENT_FAILURE", label: "Falha intermitente", prior: 0.14 },
        { id: "MACHINE_MAINTENANCE_GAP", label: "Manutencao inadequada", prior: 0.12 },
      ],
      questions: [
        {
          id: "machine_recent_adjustment",
          text: "Houve ajuste recente de regulagem, pressao, velocidade ou temperatura nesse equipamento?",
          type: "BOOLEAN",
          separatesHypotheses: ["MACHINE_ADJUSTMENT", "MACHINE_CALIBRATION", "MACHINE_WEAR"],
          answerEffects: {
            yes: { MACHINE_ADJUSTMENT: 0.3, MACHINE_CALIBRATION: 0.12 },
            no: { MACHINE_ADJUSTMENT: -0.14, MACHINE_WEAR: 0.08, MACHINE_SENSOR: 0.06 },
            partial: { MACHINE_ADJUSTMENT: 0.12 },
            unknown: {},
          },
        },
        {
          id: "machine_preventive_overdue",
          text: "A manutencao preventiva ou calibracao desse equipamento esta atrasada ou sem registro confiavel?",
          type: "BOOLEAN",
          separatesHypotheses: ["MACHINE_MAINTENANCE_GAP", "MACHINE_CALIBRATION", "MACHINE_WEAR"],
          answerEffects: {
            yes: { MACHINE_MAINTENANCE_GAP: 0.3, MACHINE_CALIBRATION: 0.16, MACHINE_WEAR: 0.1 },
            no: { MACHINE_MAINTENANCE_GAP: -0.16, MACHINE_SENSOR: 0.05, MACHINE_INTERMITTENT_FAILURE: 0.05 },
            partial: { MACHINE_MAINTENANCE_GAP: 0.1, MACHINE_CALIBRATION: 0.08 },
            unknown: {},
          },
        },
      ],
    },
    TOOLING: {
      hypotheses: [
        { id: "TOOLING_WEAR", label: "Desgaste do ferramental", prior: 0.28 },
        { id: "TOOLING_WRONG_DEVICE", label: "Dispositivo incorreto", prior: 0.2 },
        { id: "TOOLING_FIXTURE_PLAY", label: "Folga ou fixacao instavel", prior: 0.2 },
        { id: "TOOLING_SETUP", label: "Setup do dispositivo", prior: 0.18 },
        { id: "TOOLING_CLEANING", label: "Limpeza/contaminacao do dispositivo", prior: 0.14 },
      ],
      questions: [
        {
          id: "tooling_replacement_confirms",
          text: "Ao trocar ferramenta, gabarito ou dispositivo, a falha reduz claramente?",
          type: "BOOLEAN",
          separatesHypotheses: ["TOOLING_WEAR", "TOOLING_WRONG_DEVICE", "TOOLING_FIXTURE_PLAY"],
          answerEffects: {
            yes: { TOOLING_WEAR: 0.24, TOOLING_FIXTURE_PLAY: 0.16, TOOLING_WRONG_DEVICE: 0.1 },
            no: { TOOLING_WEAR: -0.12, TOOLING_WRONG_DEVICE: -0.08 },
            partial: { TOOLING_WEAR: 0.08, TOOLING_FIXTURE_PLAY: 0.08 },
            unknown: {},
          },
          supportingEvidenceByAnswer: {
            yes: "A troca de ferramenta/dispositivo reduz a falha.",
          },
        },
      ],
    },
  };

  const phenomenonLabels = {
    PRODUCTION_FAILURE: "Falha de producao",
    QUALITY_DEFECT: "Defeito no produto",
    REWORK: "Retrabalho",
    SCRAP: "Refugo",
    MACHINE_DOWNTIME: "Parada de equipamento",
    PRODUCTIVITY_LOSS: "Baixa produtividade",
    DELAY: "Atraso de producao",
  };

  return {
    hypotheses,
    framingQuestion,
    questions,
    drillDown,
    phenomenonLabels,
  };
});
