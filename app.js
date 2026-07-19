const MAX_QUESTIONS = 14;
const MIN_QUESTIONS = 7;
const engineV2 =
  typeof require === "function"
    ? require("./engine-v2")
    : typeof window !== "undefined"
      ? window.CausaRealEngineV2
      : null;
const INVESTIGATION_ENGINE_V2 =
  typeof process !== "undefined" && process.env
    ? process.env.INVESTIGATION_ENGINE_V2 !== "false"
    : typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("engine") !== "v1"
      : true;

const segmentLabels = {
  generic: "Geral",
  retail: "Comercio / varejo",
  services: "Servicos",
  industry: "Industria",
  restaurant: "Restaurante / alimentacao",
  ecommerce: "E-commerce",
  health: "Clinica / saude",
  education: "Educacao",
};

const areaLabels = {
  auto: "Detectar automaticamente",
  commercial: "Vendas / comercial",
  service: "Atendimento / experiencia",
  operations: "Operacao / entrega",
  people: "Pessoas / lideranca",
  product: "Produto / servico",
  finance: "Financeiro",
};

const audienceLabels = {
  mixed: "Misto / nao sei",
  b2c: "Consumidor final",
  b2b: "Empresas / clientes corporativos",
  internal: "Equipe interna",
};

const qualityPillars = {
  people: {
    label: "Pessoas",
    summary: "habilidade tecnica, comportamento, comunicacao, lideranca, treinamento e rotina individual",
  },
  product: {
    label: "Produto",
    summary: "desenvolvimento, materia-prima, oferta, promessa, publico-alvo e uso real",
  },
  process: {
    label: "Processo",
    summary: "padrao, fluxo real, medicao, estabilidade, desperdicios, controles e rotina de gestao",
  },
};

const categoryPillars = {
  market: "product",
  offer: "product",
  funnel: "process",
  people: "people",
  method: "process",
  measurement: "process",
  tools: "process",
  input: "product",
  customer: "product",
};

const questionTypes = {
  boolean: "BOOLEAN",
  multipleChoice: "MULTIPLE_CHOICE",
  text: "TEXT",
  evidenceRequest: "EVIDENCE_REQUEST",
  confirmation: "CONFIRMATION",
};

const investigationLineLabels = {
  SERVICE_FAILURE: "Falha de atendimento",
  CUSTOMER_COMPLAINT: "Reclamacao de cliente",
  VALUE_PROPOSITION_MISMATCH: "Proposta de valor desalinhada",
  HYPOTHESIS_SPACE_ENGINE: "Diagnostico causal industrial",
  FUNNEL_COMMERCIAL: "Funil comercial",
  COMMERCIAL_CONVERSION: "Conversao comercial",
  TECHNICAL_REWORK: "Retrabalho tecnico",
  DOCUMENT_PROCESS: "Processo documental",
  DELAY: "Atraso",
  GENERAL_CAUSAL_INVESTIGATION: "Investigacao causal geral",
};

const classificationTargets = {
  serviceFailure: {
    phenomenon: "insatisfacao_cliente",
    domain: "atendimento",
    line: "SERVICE_FAILURE",
    area: "service",
    categories: ["customer", "method", "people", "measurement", "tools"],
  },
  valueProposition: {
    phenomenon: "delivery_expectation_gap",
    domain: "atendimento",
    line: "VALUE_PROPOSITION_MISMATCH",
    area: "service",
    categories: ["customer", "offer", "method", "measurement", "people"],
  },
  salesFunnel: {
    phenomenon: "queda_vendas",
    domain: "comercial",
    line: "FUNNEL_COMMERCIAL",
    area: "commercial",
    categories: ["funnel", "offer", "market", "input", "people", "measurement", "method", "tools"],
  },
  conversion: {
    phenomenon: "baixa_conversao",
    domain: "comercial",
    line: "FUNNEL_COMMERCIAL",
    area: "commercial",
    categories: ["funnel", "offer", "market", "people", "measurement", "method"],
  },
  technicalRework: {
    phenomenon: "retrabalho_falha_tecnica",
    domain: "operacao",
    line: "TECHNICAL_REWORK",
    area: "operations",
    categories: ["method", "input", "tools", "measurement", "people"],
  },
  documentProcess: {
    phenomenon: "erro_documental",
    domain: "processo_documental",
    line: "DOCUMENT_PROCESS",
    area: "operations",
    categories: ["method", "people", "tools", "measurement", "input"],
  },
  delay: {
    phenomenon: "atraso",
    domain: "operacao",
    line: "DELAY",
    area: "operations",
    categories: ["method", "measurement", "people", "input", "tools"],
  },
  productFailure: {
    phenomenon: "falha_produto",
    domain: "produto",
    line: "GENERAL_CAUSAL_INVESTIGATION",
    area: "product",
    categories: ["input", "method", "measurement", "tools", "customer", "people"],
  },
  general: {
    phenomenon: "indefinido",
    domain: "geral",
    line: "GENERAL_CAUSAL_INVESTIGATION",
    area: "operations",
    categories: ["method", "people", "measurement", "input", "tools", "customer"],
  },
};

const areaKeywords = {
  commercial: {
    venda: 3,
    vendas: 3,
    comercial: 3,
    lead: 2,
    leads: 2,
    orcamento: 2,
    proposta: 2,
    conversao: 2,
    faturamento: 2,
    receita: 2,
    meta: 2,
    ticket: 1,
  },
  service: {
    atendimento: 4,
    atende: 3,
    atendente: 3,
    reclamacao: 4,
    reclama: 4,
    insatisfacao: 3,
    satisfacao: 2,
    experiencia: 3,
    suporte: 3,
    "pos-venda": 2,
    espera: 2,
    demora: 2,
  },
  operations: {
    entrega: 3,
    atraso: 3,
    producao: 2,
    estoque: 2,
    pedido: 2,
    logistica: 2,
    prazo: 2,
    retrabalho: 2,
  },
  people: {
    equipe: 2,
    lideranca: 2,
    turnover: 2,
    treinamento: 2,
    desempenho: 2,
    motivacao: 2,
    absenteismo: 2,
  },
  product: {
    produto: 2,
    defeito: 3,
    qualidade: 2,
    garantia: 2,
    servico: 1,
    falha: 2,
    devolucao: 2,
  },
  finance: {
    custo: 2,
    margem: 2,
    inadimplencia: 2,
    preco: 2,
    caixa: 2,
    lucro: 2,
    despesa: 2,
  },
};

const categories = {
  market: {
    title: "Mercado e demanda",
    fishbone: "Ambiente / Mercado",
    summary:
      "A causa pode estar no contexto externo: demanda mais fraca, concorrencia, sazonalidade, posicionamento ou mudanca no comportamento do publico.",
    metrics: ["Volume de demanda", "Taxa de procura", "Participacao por canal", "Comparativo com concorrentes"],
    plan: {
      what: "Revalidar mercado, publico prioritario e proposta por segmento.",
      why: "Separar queda de demanda real de falhas internas de execucao.",
      where: "Nos canais, regioes ou segmentos com maior perda.",
      when: "Rodar analise rapida nos proximos 7 dias.",
      who: "Gestor comercial, marketing e pessoas proximas do cliente.",
      how: "Comparar historico, concorrencia, origem dos contatos e motivos de perda.",
      howMuch: "Baixo custo; exige analise de dados e entrevistas curtas com clientes.",
    },
  },
  offer: {
    title: "Proposta de valor desalinhada",
    fishbone: "Metodo / Oferta",
    summary:
      "O publico pode nao perceber valor suficiente na oferta, no preco, na promessa ou no diferencial apresentado.",
    metrics: ["Taxa de conversao", "Motivos de perda", "Ticket medio", "Objeções por etapa"],
    plan: {
      what: "Revisar oferta, promessa, diferenciais e argumentos de venda.",
      why: "Aumentar clareza de valor antes de culpar equipe ou processo.",
      where: "Na abordagem, proposta, pagina, vitrine, catalogo ou apresentacao comercial.",
      when: "Testar uma nova mensagem em ate 7 dias.",
      who: "Comercial, marketing e decisor do produto ou servico.",
      how: "Coletar objeções, ajustar prova de valor, simplificar oferta e testar discurso.",
      howMuch: "Baixo a medio custo; depende de criacao de materiais e testes comerciais.",
    },
  },
  funnel: {
    title: "Funil comercial com gargalo",
    fishbone: "Processo adaptado",
    summary:
      "A perda parece concentrada em uma etapa do funil: geracao de leads, contato, qualificacao, proposta, follow-up ou fechamento.",
    metrics: ["Leads por origem", "Conversao por etapa", "Tempo de resposta", "Taxa de follow-up"],
    plan: {
      what: "Mapear o funil e atacar a etapa com maior perda.",
      why: "Baixa performance comercial quase sempre tem um ponto de vazamento mensuravel.",
      where: "Na etapa do funil com maior queda ou maior atraso.",
      when: "Medir por 14 dias e corrigir o gargalo principal.",
      who: "Lider comercial e equipe responsavel pelas etapas do funil.",
      how: "Registrar etapas, motivos de perda, tempo de resposta e proximas acoes por oportunidade.",
      howMuch: "Baixo custo se usar planilha ou CRM atual; medio se exigir nova ferramenta.",
    },
  },
  people: {
    title: "Capacidade, comportamento ou treinamento",
    fishbone: "Mao de obra / Pessoas",
    summary:
      "A causa pode estar em preparo, rotina, lideranca, carga, postura, conhecimento do produto ou disciplina de execucao.",
    metrics: ["Conversao por pessoa", "Atividades por vendedor", "Treinamentos realizados", "Aderencia a rotina"],
    plan: {
      what: "Padronizar rotina critica e treinar pelo comportamento esperado.",
      why: "Reduzir variacao entre pessoas sem transformar causa raiz em culpa individual.",
      where: "Na atividade que mais influencia o resultado: abordagem, atendimento, execucao ou follow-up.",
      when: "Aplicar treinamento pratico nesta semana e acompanhar diariamente.",
      who: "Lider da area com apoio de pessoas de alta performance.",
      how: "Observar execucao real, criar roteiro simples, treinar com casos reais e medir evolucao.",
      howMuch: "Baixo custo; exige tempo de lideranca e acompanhamento.",
    },
  },
  method: {
    title: "Metodo ou rotina pouco padronizada",
    fishbone: "Metodo / Processo",
    summary:
      "A rotina existe, mas pode estar pouco clara, sem padrao minimo, sem criterio de passagem ou sem cadencia de verificacao.",
    metrics: ["Cumprimento da rotina", "Erros por etapa", "Tempo de ciclo", "Reincidencia"],
    plan: {
      what: "Definir padrao minimo para a rotina que influencia o problema.",
      why: "Evitar variacao desnecessaria e tornar a execucao verificavel.",
      where: "Na etapa onde a decisao, passagem ou entrega perde qualidade.",
      when: "Criar piloto em 48 horas e revisar apos uma semana.",
      who: "Responsavel da area e pessoas que executam a rotina.",
      how: "Mapear fluxo real, definir criterio de qualidade, checklist e reuniao curta de acompanhamento.",
      howMuch: "Baixo custo inicial; depende de disciplina de gestao.",
    },
  },
  measurement: {
    title: "Medição insuficiente",
    fishbone: "Medicao",
    summary:
      "O problema pode estar sendo discutido por percepcao, sem dados suficientes para localizar frequencia, etapa, publico e causa provavel.",
    metrics: ["Indicador lider", "Indicador de resultado", "Motivos classificados", "Tempo ate detectar desvio"],
    plan: {
      what: "Criar medicao simples para separar sintomas, causas e impacto.",
      why: "Sem medicao, a investigacao fica vulneravel a opiniao e vies.",
      where: "No ponto mais proximo da origem do problema.",
      when: "Medir diariamente por 14 dias.",
      who: "Dono do processo com apoio de quem registra a ocorrencia.",
      how: "Classificar motivo, origem, etapa, responsavel pela proxima acao e impacto financeiro.",
      howMuch: "Baixo custo; planilha ou formulario ja resolvem o piloto.",
    },
  },
  tools: {
    title: "Ferramenta ou recurso inadequado",
    fishbone: "Maquina / Tecnologia",
    summary:
      "Sistema, ferramenta, canal, material, acesso, equipamento ou recurso pode estar dificultando a execucao correta.",
    metrics: ["Falhas de sistema", "Tempo perdido", "Uso do CRM/ferramenta", "Chamados ou bloqueios"],
    plan: {
      what: "Remover bloqueios de ferramenta ou criar contencao enquanto a solucao definitiva nao vem.",
      why: "Um recurso ruim aumenta improviso, atraso e perda de qualidade.",
      where: "No sistema, canal, posto ou equipamento que sustenta a rotina.",
      when: "Contencao imediata e decisao definitiva em ate 15 dias.",
      who: "Gestor da area, usuarios da ferramenta e responsavel tecnico.",
      how: "Registrar bloqueios, priorizar impacto, ajustar acesso, automatizar ou substituir o recurso.",
      howMuch: "Varia de baixo a alto conforme tecnologia ou compra necessaria.",
    },
  },
  input: {
    title: "Entrada ruim ou publico mal qualificado",
    fishbone: "Material / Entrada",
    summary:
      "A causa pode vir antes da execucao: leads, pedidos, briefings, materiais, cadastros ou informacoes chegam com baixa qualidade.",
    metrics: ["Qualidade da entrada", "Leads qualificados", "Pedidos incompletos", "Retrabalho por origem"],
    plan: {
      what: "Definir criterio de entrada e bloquear casos sem informacao minima.",
      why: "Entrada ruim gera perda mesmo quando a equipe executa bem.",
      where: "Na captacao, recebimento, briefing, cadastro ou qualificacao.",
      when: "Aplicar criterio minimo a partir da proxima demanda.",
      who: "Responsavel pela entrada e area que sofre o impacto.",
      how: "Criar campos obrigatorios, checklist de aceite, regra de qualificacao e feedback para a origem.",
      howMuch: "Baixo custo; pode exigir ajuste em formulario, CRM ou rotina.",
    },
  },
  customer: {
    title: "Expectativa do cliente desalinhada",
    fishbone: "Cliente / Uso",
    summary:
      "Pode haver distancia entre o que o cliente espera, entende, valoriza ou consegue usar e aquilo que a empresa entrega.",
    metrics: ["Motivos de reclamacao", "NPS ou satisfacao", "Duvidas recorrentes", "Cancelamentos"],
    plan: {
      what: "Alinhar promessa, comunicacao e confirmacao de expectativa.",
      why: "Problemas de qualidade tambem nascem quando a expectativa nao foi bem definida.",
      where: "Venda, atendimento, contrato, onboarding, entrega ou pos-venda.",
      when: "Ajustar mensagens criticas imediatamente e revisar em 7 dias.",
      who: "Comercial, atendimento, operacao e responsavel pela experiencia.",
      how: "Reescrever promessa, confirmar entendimento, registrar duvidas e fechar loop com o cliente.",
      howMuch: "Baixo custo inicial; exige clareza de comunicacao e disciplina.",
    },
  },
};

const questionBank = [
  {
    text: "A equipe demonstra dificuldade tecnica para executar essa atividade corretamente?",
    id: "technical_execution_difficulty",
    category: "people",
    areas: ["service", "commercial", "operations", "product", "people"],
    path: "SERVICE_FAILURE",
    questionPurpose: "confirmar_dificuldade_tecnica",
    targetHypothesis: "technical_skill_gap",
    factsOnPositive: ["technical_execution_difficulty"],
    factsOnNegative: ["technical_execution_not_difficult"],
    hypothesisDelta: {
      yes: { technical_skill_gap: 2.4, knowledge_gap: 1.1, training_gap: 0.9, procedure_usability: 0.7, system_support: 0.5 },
      partial: { technical_skill_gap: 1.2, knowledge_gap: 0.6, training_gap: 0.5 },
      no: { technical_skill_gap: -1.5, individual_behavior_problem: -0.5 },
      unknown: { technical_skill_gap: 0.2 },
    },
    expectedInformationGain: 0.82,
    evidence: "O problema pode envolver habilidade tecnica insuficiente.",
  },
  {
    text: "O cliente recebe informacoes claras durante o atendimento?",
    category: "people",
    areas: ["service", "commercial", "product", "people"],
    evidence: "O problema pode envolver comunicacao, postura ou habilidade comportamental.",
  },
  {
    text: "A equipe sabe como deve agir nessa situacao?",
    category: "people",
    areas: ["service", "commercial", "operations", "product", "people"],
    reverse: true,
    evidence: "Pode faltar clareza sobre o comportamento esperado.",
  },
  {
    text: "O cliente esperava algo diferente do que recebeu?",
    category: "customer",
    areas: ["service", "commercial", "product"],
    path: "VALUE_PROPOSITION_MISMATCH",
    hypothesis: "value_proposition_mismatch",
    targetHypothesis: "expectation_mismatch",
    requiresAnyFacts: ["promise_exists", "expectation_mismatch", "delivery_vs_promise_gap", "broken_promise"],
    allowedPhenomena: ["delivery_expectation_gap", "commercial_complaint"],
    allowedDomains: ["atendimento", "comercial", "produto"],
    causalDepth: 1,
    informationTarget: "expectation_gap",
    questionPurpose: "confirmar_expectativa_diferente",
    expectedInformationGain: 0.7,
    evidence: "Pode haver diferenca entre a expectativa criada e a experiencia entregue.",
  },
  {
    text: "A promessa feita ao cliente mudou antes do problema comecar?",
    category: "offer",
    areas: ["operations", "product", "service", "commercial"],
    path: "VALUE_PROPOSITION_MISMATCH",
    hypothesis: "value_proposition_mismatch",
    targetHypothesis: "value_proposition_mismatch",
    requiresAnyFacts: ["promise_exists", "promise_changed", "expectation_mismatch", "commercial_commitment", "delivery_vs_promise_gap"],
    allowedPhenomena: ["commercial_complaint", "delivery_expectation_gap", "insatisfacao_cliente"],
    allowedDomains: ["comercial", "atendimento", "produto"],
    causalDepth: 2,
    informationTarget: "promise_change",
    questionPurpose: "testar_mudanca_de_promessa",
    expectedInformationGain: 0.72,
    evidence: "Mudanca na promessa, pacote ou condicao vendida pode ter iniciado o problema.",
  },
  {
    text: "O problema comecou depois que mudaram as informacoes, materiais e pedidos recebidos?",
    category: "input",
    areas: ["operations", "product"],
    evidence: "Mudanca em fornecedor ou insumo pode ter iniciado o problema.",
  },
  {
    text: "O jeito real de executar hoje e diferente do padrao que foi desenhado?",
    category: "method",
    areas: ["service", "commercial", "operations", "product", "people", "finance"],
    evidence: "Ha diferenca entre processo projetado e rotina real.",
  },
  {
    text: "A equipe consegue perceber rapidamente quando a rotina saiu do normal?",
    category: "measurement",
    areas: ["service", "commercial", "operations", "product", "people", "finance"],
    id: "service_deviation_detection",
    questionPurpose: "testar_deteccao_de_desvios",
    targetHypothesis: "lack_of_monitoring",
    factsOnPositive: ["deviation_detection_available"],
    factsOnNegative: ["low_deviation_detection"],
    hypothesisDelta: {
      yes: { lack_of_monitoring: -1 },
      partial: { lack_of_monitoring: 1 },
      no: { lack_of_monitoring: 2, missing_alert: 1, reactive_process: 1 },
      unknown: { lack_of_monitoring: 0.5 },
    },
    expectedInformationGain: 0.8,
    reverse: true,
    evidence: "Pode faltar controle visual ou sinal claro de desvio.",
  },
  {
    text: "O problema envolve espera excessiva para o cliente?",
    category: "method",
    areas: ["service", "commercial", "operations", "product", "finance"],
    evidence: "O fluxo pode ter espera excessiva.",
  },
  {
    text: "O problema gera retrabalho para corrigir algo que deveria sair certo da primeira vez?",
    category: "method",
    areas: ["service", "commercial", "operations", "product", "finance"],
    evidence: "O fluxo pode estar gerando retrabalho.",
  },
  {
    text: "A reclamação acontece mais em um canal específico de atendimento?",
    category: "customer",
    areas: ["service"],
    id: "service_channel_concentration",
    questionPurpose: "testar_concentracao_por_canal",
    targetHypothesis: "channel_specific_failure",
    factsOnPositive: ["service_channel_concentration"],
    factsOnNegative: ["no_channel_concentration"],
    expectedInformationGain: 0.62,
    evidence: "A reclamação pode estar concentrada em um canal de atendimento.",
  },
  {
    text: "O cliente reclama do tempo de resposta?",
    category: "customer",
    areas: ["service"],
    id: "service_response_time_symptom",
    questionPurpose: "confirmar_sintoma_de_tempo",
    targetHypothesis: "response_time_symptom",
    factsOnPositive: ["response_time_symptom_confirmed"],
    hypothesisDelta: {
      yes: { response_time_symptom: 2, missing_service_sla: 0.8, lack_of_monitoring: 0.6 },
      partial: { response_time_symptom: 1 },
      no: { response_time_symptom: -1 },
    },
    expectedInformationGain: 0.78,
    evidence: "A reclamação pode estar ligada ao tempo de resposta.",
  },
  {
    text: "O cliente reclama da forma como foi tratado?",
    category: "people",
    areas: ["service"],
    evidence: "A reclamação pode estar ligada a postura ou abordagem no atendimento.",
  },
  {
    text: "Existe um padrão claro de como a equipe deve conduzir esse atendimento?",
    id: "service_clear_standard",
    category: "method",
    areas: ["service"],
    reverse: true,
    questionPurpose: "testar_padrao_de_atendimento",
    targetHypothesis: "service_standard_gap",
    factsOnPositive: ["service_standard_defined"],
    factsOnNegative: ["service_standard_missing"],
    hypothesisDelta: {
      yes: { service_standard_gap: -1, procedure_usability: 0.3 },
      partial: { service_standard_gap: 1, procedure_usability: 0.6 },
      no: { service_standard_gap: 2, procedure_usability: 0.8 },
      unknown: { service_standard_gap: 0.4 },
    },
    expectedInformationGain: 0.74,
    evidence: "O padrão de atendimento pode não estar claro para a equipe.",
  },
  {
    text: "A equipe registra o motivo real de cada reclamação de atendimento?",
    category: "measurement",
    areas: ["service"],
    id: "service_complaint_reason_recorded",
    questionPurpose: "testar_qualidade_do_registro",
    targetHypothesis: "complaint_measurement_quality",
    factsOnPositive: ["complaint_reason_registered"],
    factsOnNegative: ["complaint_reason_not_registered"],
    hypothesisDelta: {
      yes: { poor_complaint_classification: -1, complaint_measurement_quality: -0.5 },
      no: { poor_complaint_classification: 2 },
      partial: { poor_complaint_classification: 1 },
    },
    expectedInformationGain: 0.68,
    reverse: true,
    evidence: "Os motivos das reclamações podem não estar classificados de forma útil.",
  },
  {
    text: "As reclamações se concentram em algumas pessoas?",
    id: "service_people_concentration",
    category: "people",
    areas: ["service"],
    questionPurpose: "testar_variacao_por_pessoa",
    targetHypothesis: "individual_behavior_problem",
    factsOnPositive: ["people_concentration"],
    factsOnNegative: ["no_people_concentration"],
    hypothesisDelta: {
      yes: { individual_behavior_problem: 1.8, communication_skill_gap: 0.7 },
      partial: { individual_behavior_problem: 0.8 },
      no: { individual_behavior_problem: -1.2, process_or_training_systemic: 1 },
      unknown: { individual_behavior_problem: 0.2 },
    },
    expectedInformationGain: 0.64,
    evidence: "A variação pode estar relacionada a pessoas específicas.",
  },
  {
    text: "As reclamações se concentram em algum horário?",
    category: "method",
    areas: ["service"],
    evidence: "A variação pode estar relacionada a turno, horário ou escala.",
  },
  {
    text: "A queda acontece mais em alguma fase da venda?",
    category: "funnel",
    areas: ["commercial"],
    evidence: "A perda parece concentrada em uma etapa do funil.",
  },
  {
    text: "O volume de oportunidades diminuiu recentemente?",
    category: "market",
    areas: ["commercial"],
    evidence: "A demanda ou volume de oportunidades pode ter caido.",
  },
  {
    text: "As pessoas que chegam hoje tem menos chance de comprar do que antes?",
    category: "input",
    areas: ["commercial"],
    evidence: "A entrada comercial pode estar chegando com baixa qualidade.",
  },
  {
    text: "A equipe registra claramente o motivo de cada venda perdida?",
    category: "measurement",
    areas: ["commercial"],
    reverse: true,
    evidence: "Os motivos de perda podem nao estar medidos de forma confiavel.",
  },
  {
    text: "As principais objeções dos clientes se repetem?",
    category: "offer",
    areas: ["commercial"],
    evidence: "As objeções recorrentes podem indicar problema de oferta, preco ou mensagem.",
  },
  {
    text: "O tempo de resposta ao cliente aumentou?",
    category: "funnel",
    areas: ["commercial", "service"],
    evidence: "Tempo de resposta pode estar afetando conversao ou experiencia.",
  },
  {
    text: "Existe uma rotina clara para voltar a falar com clientes interessados?",
    category: "method",
    areas: ["commercial"],
    reverse: true,
    evidence: "A rotina de follow-up pode estar pouco padronizada.",
  },
  {
    text: "O cliente entende o beneficio antes de comparar o preco?",
    category: "offer",
    areas: ["commercial"],
    reverse: true,
    evidence: "A proposta pode estar comunicando preco antes de valor.",
  },
  {
    text: "Algum canal de venda perdeu desempenho mais que os outros?",
    category: "market",
    areas: ["commercial"],
    evidence: "A perda pode estar concentrada em um canal de venda.",
  },
  {
    text: "Os vendedores de melhor resultado usam uma abordagem diferente dos demais?",
    category: "people",
    areas: ["commercial"],
    evidence: "Ha variacao relevante de abordagem entre pessoas.",
  },
  {
    text: "A equipe domina bem os diferenciais da oferta?",
    category: "people",
    areas: ["commercial", "product"],
    reverse: true,
    evidence: "Pode faltar dominio sobre diferenciais e argumentos.",
  },
  {
    text: "O sistema atual mostra o proximo passo de cada cliente interessado?",
    category: "tools",
    areas: ["commercial"],
    reverse: true,
    evidence: "A ferramenta pode nao dar visibilidade das proximas acoes.",
  },
  {
    text: "O preco passou a ser citado com mais frequencia como barreira?",
    category: "offer",
    areas: ["commercial", "finance"],
    evidence: "Preco, valor percebido ou condicao comercial pode estar afetando fechamento.",
  },
  {
    text: "A concorrencia ficou mais agressiva para esse publico?",
    category: "market",
    areas: ["commercial"],
    evidence: "Concorrencia pode ter mudado a percepcao de valor.",
  },
  {
    text: "O problema acontece mais com um tipo especifico de cliente?",
    category: "customer",
    areas: ["commercial", "service", "product"],
    evidence: "A causa pode variar por perfil de cliente.",
  },
  {
    text: "A promessa feita antes da entrega esta alinhada com o que o cliente recebe?",
    category: "customer",
    areas: ["service", "operations", "product", "commercial"],
    path: "VALUE_PROPOSITION_MISMATCH",
    hypothesis: "value_proposition_mismatch",
    targetHypothesis: "value_proposition_mismatch",
    requiresAnyFacts: ["promise_exists", "expectation_mismatch", "commercial_commitment", "delivery_vs_promise_gap", "broken_promise"],
    allowedPhenomena: ["commercial_complaint", "delivery_expectation_gap", "insatisfacao_cliente"],
    allowedDomains: ["comercial", "atendimento", "produto"],
    causalDepth: 2,
    informationTarget: "promise_delivery_alignment",
    questionPurpose: "testar_alinhamento_promessa_entrega",
    expectedInformationGain: 0.76,
    reverse: true,
    evidence: "Pode haver desalinhamento entre promessa e entrega.",
  },
  {
    text: "O problema acontece mais em uma parte especifica do trabalho?",
    category: "method",
    areas: ["operations", "product", "service", "finance", "people"],
    evidence: "A falha se concentra em uma etapa da rotina.",
  },
  {
    text: "Pessoas diferentes executam essa atividade de formas diferentes?",
    category: "method",
    areas: ["operations", "product", "service", "finance", "people"],
    evidence: "Ha variacao na forma de executar a rotina.",
  },
  {
    text: "Esta claro como saber se a atividade foi feita corretamente?",
    category: "measurement",
    areas: ["operations", "product", "service", "people", "finance"],
    reverse: true,
    evidence: "O criterio de qualidade pode nao estar claro.",
  },
  {
    text: "A equipe recebeu treinamento pratico sobre esse problema?",
    category: "people",
    areas: ["operations", "product", "service", "people", "commercial"],
    reverse: true,
    evidence: "O treinamento pratico pode nao ter sido suficiente.",
  },
  {
    text: "O problema aumenta quando entra gente nova?",
    category: "people",
    areas: ["operations", "service", "people", "commercial"],
    evidence: "O problema aumenta com troca ou entrada de pessoas.",
  },
  {
    text: "Existe algum numero acompanhado toda semana para medir esse problema?",
    category: "measurement",
    areas: ["operations", "product", "service", "finance", "people", "commercial"],
    reverse: true,
    evidence: "Falta acompanhamento frequente do problema.",
  },
  {
    text: "Voces conseguem identificar quando o problema comecou?",
    category: "measurement",
    areas: ["operations", "product", "service", "finance", "people", "commercial"],
    reverse: true,
    evidence: "A origem temporal do problema ainda e pouco visivel.",
  },
  {
    text: "O problema acontece quando chegam informacoes incompletas?",
    category: "input",
    areas: ["operations", "product", "service", "finance"],
    evidence: "A falha pode vir de uma entrada externa.",
  },
  {
    text: "Existe um lugar de origem onde o problema aparece mais?",
    category: "input",
    areas: ["operations", "product", "service", "commercial"],
    evidence: "Existe concentracao em fornecedor, canal ou tipo de entrada.",
  },
  {
    text: "Alguma ferramenta de trabalho falha durante a rotina?",
    category: "tools",
    areas: ["operations", "product", "service", "finance", "people", "commercial"],
    evidence: "Ferramenta, sistema ou equipamento pode estar prejudicando a execucao.",
  },
  {
    text: "A equipe precisa improvisar porque falta recurso para fazer certo?",
    category: "tools",
    areas: ["operations", "product", "service", "people"],
    evidence: "A execucao correta depende de improviso ou recurso insuficiente.",
  },
  {
    text: "Mesmo fazendo do jeito combinado pela empresa, o cliente continua reclamando?",
    category: "customer",
    areas: ["service", "operations", "product"],
    path: "SERVICE_FAILURE",
    targetHypothesis: "standard_customer_expectation_gap",
    triggerFacts: ["service_standard_defined"],
    excludesFacts: ["technical_execution_difficulty"],
    questionPurpose: "testar_adequacao_do_padrao_a_expectativa",
    expectedInformationGain: 0.64,
    evidence: "A expectativa externa pode estar diferente do padrao interno.",
  },
  {
    text: "O problema e percebido tarde demais para corrigir antes de afetar o cliente?",
    category: "measurement",
    areas: ["operations", "product", "service", "commercial"],
    evidence: "A deteccao acontece tarde demais.",
  },
  {
    text: "A mesma falha ja voltou depois de uma correcao anterior?",
    category: "method",
    areas: ["operations", "product", "service", "finance", "people", "commercial"],
    evidence: "A correcao anterior pode ter tratado sintoma, nao causa raiz.",
  },
];

const investigationRouteQuestions = {
  SERVICE_FAILURE: [
    {
      id: "service_manifestation",
      text: "O que especificamente foi percebido pelo cliente como falha no atendimento?",
      type: questionTypes.multipleChoice,
      category: "customer",
      questionPurpose: "identificar_manifestacao",
      targetHypothesis: "manifestacao_da_reclamacao",
      expectedInformationGain: 0.95,
      evidence: "A manifestacao inicial da reclamacao foi identificada.",
      options: [
        {
          value: "delay",
          label: "Demora para ser atendido",
          facts: ["service_delay"],
          scores: { method: 2, measurement: 1 },
          evidence: "O cliente percebeu demora no atendimento.",
        },
        {
          value: "no_return",
          label: "Falta de retorno",
          facts: ["no_return"],
          scores: { method: 2, tools: 1, measurement: 1 },
          evidence: "O cliente percebeu ausencia de retorno.",
        },
        {
          value: "attitude",
          label: "Postura ou cordialidade",
          facts: ["attitude_issue"],
          scores: { people: 2.5, method: 1 },
          evidence: "O cliente percebeu falha de postura ou cordialidade.",
        },
        {
          value: "wrong_info",
          label: "Informacao incorreta",
          facts: ["wrong_information"],
          scores: { method: 1.5, people: 1, tools: 1 },
          evidence: "O cliente recebeu informacao incorreta.",
        },
        {
          value: "no_solution",
          label: "Falta de solucao",
          facts: ["no_solution"],
          scores: { method: 2, people: 1, measurement: 1 },
          evidence: "O cliente percebeu falta de solucao para a necessidade.",
        },
        {
          value: "broken_promise",
          label: "Promessa nao cumprida",
          facts: ["broken_promise"],
          scores: { customer: 2, method: 1, offer: 1 },
          evidence: "A reclamacao envolve promessa nao cumprida.",
        },
        {
          value: "contact_difficulty",
          label: "Dificuldade de contato",
          facts: ["contact_difficulty"],
          scores: { tools: 2, method: 1, measurement: 1 },
          evidence: "O cliente teve dificuldade para falar com a empresa.",
        },
        {
          value: "other",
          label: "Outro ponto do atendimento",
          facts: ["service_other"],
          scores: { customer: 1, measurement: 1 },
          evidence: "A reclamacao exige detalhamento adicional sobre o atendimento.",
        },
      ],
    },
    {
      id: "return_owner",
      text: "Havia uma pessoa responsavel por retornar ao cliente?",
      type: questionTypes.boolean,
      category: "method",
      reverse: true,
      triggerFacts: ["no_return"],
      questionPurpose: "testar_responsabilidade",
      targetHypothesis: "responsabilidade_indefinida",
      expectedInformationGain: 0.86,
      evidence: "Pode faltar responsavel claro pelo retorno ao cliente.",
    },
    {
      id: "request_received",
      text: "O responsavel recebeu a solicitacao do cliente?",
      type: questionTypes.boolean,
      category: "tools",
      reverse: true,
      triggerFacts: ["no_return"],
      requiredAsked: ["return_owner"],
      questionPurpose: "testar_fluxo_de_comunicacao",
      targetHypothesis: "falha_registro_comunicacao",
      expectedInformationGain: 0.8,
      evidence: "A solicitacao pode nao ter chegado ao responsavel pelo retorno.",
    },
    {
      id: "return_deadline",
      text: "Existia prazo claro para o retorno ao cliente?",
      type: questionTypes.boolean,
      category: "method",
      reverse: true,
      triggerFacts: ["no_return"],
      requiredAsked: ["request_received"],
      questionPurpose: "testar_prazo",
      targetHypothesis: "prazo_de_retorno_inexistente",
      expectedInformationGain: 0.78,
      evidence: "Pode faltar prazo definido para retorno ao cliente.",
    },
    {
      id: "attitude_standard",
      text: "A equipe tem um padrao claro de postura nesse atendimento?",
      type: questionTypes.boolean,
      category: "people",
      reverse: true,
      triggerFacts: ["attitude_issue"],
      questionPurpose: "testar_comportamento_esperado",
      targetHypothesis: "padrao_comportamental_indefinido",
      expectedInformationGain: 0.82,
      evidence: "Pode faltar padrao claro de postura no atendimento.",
    },
    {
      id: "information_source",
      text: "A informacao correta estava facil de consultar no momento do atendimento?",
      type: questionTypes.boolean,
      category: "tools",
      reverse: true,
      triggerFacts: ["wrong_information"],
      questionPurpose: "testar_fonte_de_informacao",
      targetHypothesis: "base_de_informacao_fragil",
      expectedInformationGain: 0.84,
      evidence: "A informacao correta pode nao estar acessivel para quem atende.",
    },
    {
      id: "promise_registered",
      text: "A promessa feita ao cliente ficou registrada?",
      type: questionTypes.boolean,
      category: "method",
      reverse: true,
      triggerFacts: ["broken_promise"],
      questionPurpose: "testar_registro_da_promessa",
      targetHypothesis: "promessa_sem_controle",
      expectedInformationGain: 0.82,
      evidence: "A promessa ao cliente pode nao estar registrada de forma verificavel.",
    },
    {
      id: "late_service_alert",
      text: "Existe algum controle visual que alerte quando o prazo de atendimento esta sendo ultrapassado?",
      type: questionTypes.boolean,
      category: "measurement",
      reverse: true,
      triggerAllFacts: ["response_time_symptom_confirmed", "low_deviation_detection"],
      questionPurpose: "testar_monitoramento_de_prazo",
      targetHypothesis: "lack_of_monitoring",
      expectedInformationGain: 0.92,
      parentQuestionId: "service_deviation_detection",
      triggerAnswer: "no",
      reasonForQuestion:
        "Usuario confirmou reclamacao por tempo de resposta e informou que a equipe nao percebe rapidamente quando a rotina sai do normal.",
      evidence: "Pode faltar alerta, indicador ou controle para atendimento fora do prazo.",
    },
    {
      id: "service_sla",
      text: "Existe prazo definido para cada tipo de atendimento?",
      type: questionTypes.boolean,
      category: "method",
      reverse: true,
      triggerFacts: ["response_time_symptom_confirmed"],
      questionPurpose: "testar_sla_de_atendimento",
      targetHypothesis: "missing_service_sla",
      expectedInformationGain: 0.86,
      parentQuestionId: "service_response_time_symptom",
      triggerAnswer: "yes",
      reasonForQuestion: "Usuario confirmou que o cliente reclama do tempo de resposta.",
      evidence: "Pode faltar prazo definido para orientar e cobrar o atendimento.",
    },
    {
      id: "delayed_service_owner",
      text: "Existe responsavel definido para acompanhar atendimentos atrasados?",
      type: questionTypes.boolean,
      category: "method",
      reverse: true,
      triggerFacts: ["response_time_symptom_confirmed", "low_deviation_detection"],
      questionPurpose: "testar_responsavel_por_atrasos",
      targetHypothesis: "unclear_delay_owner",
      expectedInformationGain: 0.84,
      reasonForQuestion: "Tempo de resposta foi confirmado como sintoma; agora e preciso checar responsabilidade de acompanhamento.",
      evidence: "Pode faltar responsavel claro para acompanhar atendimentos atrasados.",
    },
    {
      id: "service_capacity_peak",
      text: "Os atrasos aumentam quando a demanda de atendimento cresce?",
      type: questionTypes.boolean,
      category: "method",
      triggerFacts: ["response_time_symptom_confirmed"],
      questionPurpose: "testar_capacidade",
      targetHypothesis: "capacity_overload",
      expectedInformationGain: 0.78,
      reasonForQuestion: "Tempo de resposta foi confirmado; a investigacao precisa separar falha de controle de falta de capacidade.",
      evidence: "A demora pode estar ligada a carga, fila ou capacidade insuficiente.",
    },
    {
      id: "technical_gap_location",
      text: "Em qual parte do atendimento a dificuldade tecnica aparece com mais frequencia?",
      type: questionTypes.multipleChoice,
      path: "SERVICE_FAILURE",
      category: "people",
      triggerFacts: ["technical_execution_difficulty"],
      questionPurpose: "decompor_dificuldade_tecnica",
      targetHypothesis: "technical_skill_gap",
      expectedInformationGain: 0.94,
      parentQuestionId: "technical_execution_difficulty",
      triggerAnswer: "yes",
      reasonForQuestion: "Usuario confirmou dificuldade tecnica mesmo com padrao definido; a investigacao precisa localizar onde a dificuldade ocorre.",
      evidence: "A dificuldade tecnica precisa ser localizada na rotina de atendimento.",
      options: [
        {
          value: "diagnosis",
          label: "Entender a necessidade do cliente",
          facts: ["technical_gap_diagnosis"],
          scores: { people: 1.5, method: 0.8 },
          evidence: "A dificuldade tecnica aparece ao entender a necessidade do cliente.",
        },
        {
          value: "information",
          label: "Encontrar a informacao correta",
          facts: ["knowledge_gap", "information_access_gap"],
          scores: { people: 1, tools: 1.2, method: 0.6 },
          evidence: "A dificuldade tecnica envolve encontrar a informacao correta.",
        },
        {
          value: "system",
          label: "Usar sistema ou ferramenta",
          facts: ["system_support_gap"],
          scores: { tools: 1.8, people: 0.6 },
          evidence: "A dificuldade tecnica envolve sistema ou ferramenta.",
        },
        {
          value: "procedure",
          label: "Seguir o procedimento",
          facts: ["procedure_usability_gap"],
          scores: { method: 1.5, people: 0.6 },
          evidence: "A dificuldade tecnica envolve aplicar o procedimento.",
        },
        {
          value: "communication",
          label: "Explicar a solucao ao cliente",
          facts: ["communication_skill_gap"],
          scores: { people: 1.5, method: 0.5 },
          evidence: "A dificuldade tecnica envolve explicar a solucao ao cliente.",
        },
      ],
    },
    {
      id: "formal_training_for_activity",
      text: "Existe treinamento formal para essa atividade de atendimento?",
      type: questionTypes.boolean,
      path: "SERVICE_FAILURE",
      category: "people",
      reverse: true,
      triggerFacts: ["technical_execution_difficulty"],
      questionPurpose: "testar_treinamento",
      targetHypothesis: "training_gap",
      expectedInformationGain: 0.84,
      parentQuestionId: "technical_execution_difficulty",
      triggerAnswer: "yes",
      reasonForQuestion: "Dificuldade tecnica foi confirmada; agora e preciso verificar se existe treinamento formal para a atividade.",
      evidence: "Pode faltar treinamento formal para executar corretamente o atendimento.",
    },
    {
      id: "procedure_information_sufficient",
      text: "O procedimento traz informacao suficiente para executar corretamente?",
      type: questionTypes.boolean,
      path: "SERVICE_FAILURE",
      category: "method",
      reverse: true,
      triggerFacts: ["technical_execution_difficulty", "procedure_usability_gap"],
      questionPurpose: "testar_usabilidade_do_procedimento",
      targetHypothesis: "procedure_usability",
      expectedInformationGain: 0.78,
      reasonForQuestion: "Dificuldade tecnica foi confirmada; a investigacao precisa separar falha de habilidade de falha no procedimento.",
      evidence: "O procedimento pode nao orientar bem a execucao correta.",
    },
  ],
  FUNNEL_COMMERCIAL: [
    {
      id: "sales_stage",
      text: "Em qual fase da venda a perda aparece mais?",
      type: questionTypes.multipleChoice,
      category: "funnel",
      questionPurpose: "localizar_gargalo",
      targetHypothesis: "gargalo_do_funil",
      expectedInformationGain: 0.9,
      evidence: "A fase mais critica da venda foi localizada.",
      options: [
        { value: "lead_generation", label: "Chegada de interessados", facts: ["sales_lead_generation"], scores: { market: 2, input: 1 } },
        { value: "qualification", label: "Entender se o cliente tem perfil", facts: ["sales_qualification"], scores: { input: 2, method: 1 } },
        { value: "proposal", label: "Virar proposta", facts: ["sales_proposal"], scores: { funnel: 2, method: 1 } },
        { value: "closing", label: "Fechamento", facts: ["sales_closing"], scores: { offer: 2, market: 1 } },
        { value: "follow_up", label: "Retomar contato", facts: ["sales_follow_up"], scores: { method: 2, tools: 1 } },
        { value: "unknown", label: "Nao sei", facts: ["sales_unknown_stage"], scores: { measurement: 2 } },
      ],
    },
  ],
  GENERAL_CAUSAL_INVESTIGATION: [
    {
      id: "general_effect",
      text: "Para eu investigar corretamente, qual e o principal efeito observado?",
      type: questionTypes.multipleChoice,
      category: "measurement",
      questionPurpose: "desambiguar_fenomeno",
      targetHypothesis: "fenomeno_indefinido",
      expectedInformationGain: 0.9,
      evidence: "O efeito principal foi escolhido para orientar a investigacao.",
      options: [
        { value: "service", label: "Qualidade do atendimento", facts: ["route_service"], scores: { customer: 2, method: 1 } },
        { value: "delay", label: "Demora ou atraso", facts: ["route_delay"], scores: { method: 2, measurement: 1 } },
        { value: "return", label: "Falta de retorno", facts: ["no_return", "route_service"], scores: { method: 2, tools: 1 } },
        { value: "product", label: "Produto ou servico entregue", facts: ["route_product"], scores: { input: 1, customer: 1 } },
        { value: "document", label: "Cobranca ou documentacao", facts: ["route_document"], scores: { method: 2, tools: 1 } },
        { value: "sales", label: "Venda ou negociacao", facts: ["route_sales"], scores: { funnel: 2, offer: 1 } },
        { value: "other", label: "Outro efeito", facts: ["route_general"], scores: { measurement: 1 } },
      ],
    },
  ],
};

const segmentQuestionBoost = {
  retail: {
    commercial: [
      {
        text: "O desempenho muda conforme a loja?",
        category: "market",
        evidence: "A perda pode estar concentrada por loja, ponto ou regiao.",
      },
      {
        text: "O cliente compara preco com facilidade antes de decidir?",
        category: "offer",
        evidence: "O valor percebido pode estar fragil quando a decisao vira comparacao de preco.",
      },
    ],
    service: [
      {
        text: "A reclamacao se concentra em um canal de atendimento especifico?",
        category: "measurement",
        evidence: "A reclamacao pode estar concentrada em um canal especifico.",
      },
      {
        text: "O cliente recebe orientacoes diferentes dependendo de quem atende?",
        category: "method",
        evidence: "A orientacao ao cliente pode variar entre atendentes.",
      },
    ],
  },
  services: {
    commercial: [
      {
        text: "O cliente entende claramente por que vale a pena comprar?",
        category: "offer",
        reverse: true,
        evidence: "A percepcao de valor pode nao estar clara antes da decisao.",
      },
      {
        text: "A entrega real varia conforme o profissional?",
        category: "people",
        evidence: "A experiencia pode depender demais de quem executa o servico.",
      },
    ],
    service: [
      {
        text: "A reclamacao aparece antes de o servico ser realizado?",
        category: "customer",
        evidence: "A expectativa pode estar desalinhada antes da execucao.",
      },
      {
        text: "A expectativa combinada com o cliente fica registrada antes do atendimento?",
        category: "method",
        reverse: true,
        evidence: "A expectativa combinada pode nao estar registrada de forma verificavel.",
      },
    ],
  },
  industry: {
    operations: [
      {
        text: "A variacao aparece mais em alguns lotes?",
        category: "input",
        evidence: "A variacao pode estar ligada a lote, material ou entrada do processo.",
      },
      {
        text: "Alguem confere a qualidade antes de passar para a proxima etapa?",
        category: "measurement",
        reverse: true,
        evidence: "Pode faltar verificacao antes da proxima etapa receber o problema.",
      },
    ],
  },
  restaurant: {
    service: [
      {
        text: "A reclamacao acontece mais no delivery?",
        category: "customer",
        evidence: "A experiencia no delivery pode concentrar a reclamacao.",
      },
      {
        text: "O problema aumenta em horario de pico?",
        category: "method",
        evidence: "A rotina pode perder estabilidade em horario de pico.",
      },
    ],
    operations: [
      {
        text: "O problema aumenta em horario de pico?",
        category: "method",
        evidence: "A rotina pode perder estabilidade em horario de pico.",
      },
      {
        text: "A experiencia percebida pelo cliente piora no delivery?",
        category: "customer",
        evidence: "O delivery pode estar entregando uma experiencia abaixo da expectativa.",
      },
    ],
  },
  ecommerce: {
    commercial: [
      {
        text: "A perda aparece mais antes de finalizar a compra?",
        category: "funnel",
        evidence: "A perda pode estar concentrada antes da finalizacao da compra.",
      },
      {
        text: "O cliente recebe informacoes suficientes antes de comprar online?",
        category: "offer",
        reverse: true,
        evidence: "Pode faltar informacao para o cliente decidir com seguranca.",
      },
    ],
    service: [
      {
        text: "A reclamacao acontece mais depois da entrega?",
        category: "customer",
        evidence: "A expectativa pode quebrar depois que o cliente recebe o pedido.",
      },
      {
        text: "O cliente consegue acompanhar o status do pedido sem chamar o atendimento?",
        category: "tools",
        reverse: true,
        evidence: "Pode faltar visibilidade do status do pedido para o cliente.",
      },
    ],
  },
  health: {
    service: [
      {
        text: "O problema envolve tempo de espera?",
        category: "method",
        evidence: "Tempo de espera pode ser parte relevante da experiencia percebida.",
      },
      {
        text: "Existe padrao claro para registrar e acompanhar cada atendimento?",
        category: "method",
        reverse: true,
        evidence: "Pode faltar padrao para registrar e acompanhar o atendimento.",
      },
    ],
  },
  education: {
    service: [
      {
        text: "Acontece mais em uma turma especifica?",
        category: "measurement",
        evidence: "O problema pode estar concentrado em uma turma ou grupo.",
      },
      {
        text: "Responsaveis sabem qual evolucao devem esperar?",
        category: "customer",
        reverse: true,
        evidence: "A expectativa dos responsaveis pode nao estar clara.",
      },
    ],
  },
};

function makeSegmentQuestions(segment, area) {
  const segmentQuestions = segmentQuestionBoost[segment] || {};
  const questions = segmentQuestions[area] || segmentQuestions.operations || segmentQuestions.service || [];
  return questions.map((question) => ({
    ...question,
    areas: [area],
    evidence: question.evidence || `O segmento ${segmentLabels[segment]} pode influenciar o padrao do problema.`,
    segmentOnly: true,
  }));
}

const state = {
  profile: "",
  problem: "",
  normalizedProblem: {},
  engineVersion: "v1",
  v2Session: null,
  classification: null,
  route: null,
  primaryInvestigationPath: null,
  allowedInvestigationPaths: [],
  pathLock: false,
  segment: "generic",
  area: "operations",
  selectedArea: "auto",
  audience: "mixed",
  index: 0,
  asked: [],
  evidence: [],
  activeHypotheses: [],
  rejectedHypotheses: [],
  confirmedFacts: [],
  confirmedFactDetails: {},
  unresolvedQuestions: [],
  hypothesisScores: {},
  lastAnswerContext: null,
  currentDepth: 0,
  investigationPath: [],
  debugEvents: [],
  scores: {},
  questions: [],
  aiAdaptation: null,
  aiRequestId: 0,
  aiRequestedQuestionId: null,
};

const isBrowser = typeof document !== "undefined";
const screens = isBrowser ? document.querySelectorAll(".screen") : [];
const startForm = isBrowser ? document.querySelector("#startForm") : null;
const profileInput = isBrowser ? document.querySelector("#profile") : null;
const segmentInput = isBrowser ? document.querySelector("#segment") : null;
const areaInput = isBrowser ? document.querySelector("#area") : null;
const audienceInput = isBrowser ? document.querySelector("#audience") : null;
const problemInput = isBrowser ? document.querySelector("#problem") : null;
const stepLabel = isBrowser ? document.querySelector("#stepLabel") : null;
const progressBar = isBrowser ? document.querySelector("#progressBar") : null;
const questionText = isBrowser ? document.querySelector("#questionText") : null;
const questionCategory = isBrowser ? document.querySelector("#questionCategory") : null;
const contextLine = isBrowser ? document.querySelector("#contextLine") : null;
const historyList = isBrowser ? document.querySelector("#historyList") : null;
const answerGrid = isBrowser ? document.querySelector("#answerGrid") : null;
const debugInvestigation =
  isBrowser && new URLSearchParams(window.location.search).get("debugInvestigation") === "true";
const debugPanel = ensureDebugPanel();

function stripAccents(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function hasPattern(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function scoreClassification(score) {
  return Math.max(0.1, Math.min(0.96, score));
}

function createClassification(target, details) {
  const possibleLines = details.possibleLines || [target.line];
  return {
    fenomeno: target.phenomenon,
    dominio: target.domain,
    subdominio: details.subdomain || target.domain,
    objeto_afetado: details.object || "nao_identificado",
    sintoma: details.symptom || "sintoma_a_confirmar",
    evento: details.event || "evento_a_confirmar",
    impacto: details.impact || "impacto_a_confirmar",
    contexto: details.context || "contexto_a_confirmar",
    confianca_classificacao: scoreClassification(details.confidence),
    possiveis_linhas: possibleLines,
    route: target.line,
    area: target.area,
    reason: details.reason,
    initialFacts: details.initialFacts || [],
    initialHypotheses: details.initialHypotheses || {},
  };
}

function classifyProblem(problem, selectedArea = "auto") {
  const text = stripAccents(problem || "");
  const selectedAreaContext = selectedArea !== "auto" ? selectedArea : null;
  const commercialImpact = hasPattern(text, [
    /\b(deixou de comprar|nao comprou|perdemos a venda|perda comercial|cancelou a compra)\b/,
  ]);
  const serviceManifestation = hasPattern(text, [
    /\b(mau atendimento|mal atendido|mal atendida|atendente|consultor|cordialidade|grosseiro|grosseria)\b/,
    /\b(ninguem retornou|sem retorno|falta de retorno|nao retornou|ligacao|suporte|pos-venda)\b/,
    /\b(reclamou|reclama|reclamacao|insatisfacao).*\b(atendimento|atendido|atendida|retorno|suporte|consultor)\b/,
  ]);
  const complaintSignal = hasPattern(text, [/\b(reclamou|reclama|reclamacao|insatisfacao|cliente insatisfeito)\b/]);
  const commercialFunnel = hasPattern(text, [
    /\b(baixa performance em vendas|queda de vendas|perda de vendas|meta de vendas)\b/,
    /\b(leads?|interessados).*\b(poucos|nao|nao viram|viram poucas).*\b(propostas?|orcamentos?)\b/,
    /\b(muitas propostas|vendemos muitas propostas|propostas).*\b(poucos|nao).*\b(fecham|fechamento|compram)\b/,
    /\b(conversao|funil|taxa de fechamento|vendas)\b/,
  ]);
  const conversionSignal = hasPattern(text, [
    /\b(leads?|interessados).*\b(propostas?|orcamentos?)\b/,
    /\b(propostas?).*\b(fecham|fechamento|compram)\b/,
    /\b(conversao|taxa de fechamento)\b/,
  ]);
  const technicalRework = hasPattern(text, [
    /\b(mesma falha|voltou para oficina|retornou para oficina|retrabalho)\b/,
    /\b(caminhao|equipamento|maquina|veiculo).*\b(falha|defeito|oficina|manutencao)\b/,
  ]);
  const documentError = hasPattern(text, [
    /\b(nota fiscal|documento|contrato|boleto|cadastro|pedido).*\b(incorreto|incorretos|errado|errados|erro|dados)\b/,
    /\b(dados).*\b(incorreto|incorretos|errado|errados)\b/,
  ]);
  const productFailure = hasPattern(text, [/\b(produto|servico|item|peca).*\b(defeito|falha|quebrado|nao funciona)\b/]);
  const delaySignal = hasPattern(text, [/\b(atraso|demora|prazo vencido|espera excessiva)\b/]);
  const promiseSignal = hasPattern(text, [
    /\b(prometeu|prometeram|promessa|prometido|garantiu|garantiram|combinou|combinado)\b/,
    /\b(vendedor|consultor|comercial).*\b(entrega|prazo|condicao|valor|resultado|beneficio)\b/,
    /\b(entrega|prazo|condicao|valor|resultado|beneficio).*\b(diferente|mudou|nao cumpriu|descumpriu|nao entregou)\b/,
  ]);
  const ambiguousComplaint = complaintSignal && hasPattern(text, [/\b(proposta|preco|valor|produto|servico|entrega)\b/]);

  if (promiseSignal) {
    return createClassification(classificationTargets.valueProposition, {
      subdomain: "expectativa_promessa_entrega",
      object: hasPattern(text, [/\b(produto|servico|entrega)\b/]) ? "produto_ou_servico" : "cliente",
      symptom: "expectativa combinada diferente da experiencia entregue",
      event: "quebra_de_expectativa",
      impact: commercialImpact ? "perda_comercial" : "insatisfacao_cliente",
      context: selectedAreaContext || "atendimento_ao_cliente",
      confidence: 0.88,
      possibleLines: ["VALUE_PROPOSITION_MISMATCH", "SERVICE_FAILURE", "GENERAL_CAUSAL_INVESTIGATION"],
      initialFacts: ["promise_exists", "expectation_mismatch", "delivery_vs_promise_gap", "commercial_commitment"],
      initialHypotheses: { value_proposition_mismatch: 2.4, broken_promise: 1.5 },
      reason:
        "O relato indica promessa, condicao ou expectativa combinada que ficou diferente da experiencia entregue ao cliente.",
    });
  }

  if (serviceManifestation) {
    return createClassification(classificationTargets.serviceFailure, {
      subdomain: hasPattern(text, [/\b(retorno|retornou|ligacao)\b/])
        ? "retorno_cliente"
        : "relacionamento_cliente",
      object: "cliente",
      symptom: hasPattern(text, [/\b(retorno|retornou|ligacao)\b/])
        ? "mau atendimento e ausencia de retorno"
        : "mau atendimento percebido",
      event: "reclamacao_cliente",
      impact: commercialImpact ? "perda_comercial" : "insatisfacao_cliente",
      context: selectedAreaContext || "atendimento_ao_cliente",
      confidence: commercialImpact ? 0.9 : 0.92,
      possibleLines: ["SERVICE_FAILURE", "CUSTOMER_COMPLAINT", "GENERAL_CAUSAL_INVESTIGATION"],
      reason: commercialImpact
        ? "O relato indica falha percebida no atendimento; a perda comercial aparece como impacto, nao como fenomeno principal."
        : "O relato contem manifestacao explicita de insatisfacao com atendimento, retorno, postura ou suporte.",
    });
  }

  if (ambiguousComplaint) {
    return createClassification(classificationTargets.general, {
      subdomain: "reclamacao_ambigua",
      object: "cliente",
      symptom: "reclamacao sem mecanismo principal claro",
      event: "reclamacao_cliente",
      impact: commercialImpact ? "perda_comercial" : "impacto_a_confirmar",
      context: selectedAreaContext || "cliente",
      confidence: 0.62,
      possibleLines: ["SERVICE_FAILURE", "FUNNEL_COMMERCIAL", "DOCUMENT_PROCESS", "GENERAL_CAUSAL_INVESTIGATION"],
      reason: "O relato mostra reclamacao de cliente, mas ainda nao separa atendimento, venda, produto, cobranca ou entrega.",
    });
  }

  if (commercialFunnel && !serviceManifestation) {
    return createClassification(conversionSignal ? classificationTargets.conversion : classificationTargets.salesFunnel, {
      subdomain: conversionSignal
        ? hasPattern(text, [/\b(propostas?).*\b(fecham|fechamento|compram)\b/])
          ? "fechamento"
          : "qualificacao_ou_proposta"
        : "desempenho_comercial",
      object: "oportunidades_comerciais",
      symptom: conversionSignal ? "baixa conversao entre etapas comerciais" : "queda de desempenho em vendas",
      event: "perda_comercial",
      impact: "perda_de_receita",
      context: selectedAreaContext || "comercial",
      confidence: conversionSignal ? 0.9 : 0.84,
      possibleLines: ["FUNNEL_COMMERCIAL", "conversao", "COMMERCIAL_CONVERSION"],
      reason: "O relato descreve perda entre etapas comerciais, propostas, fechamento, leads ou conversao.",
    });
  }

  if (technicalRework) {
    return createClassification(classificationTargets.technicalRework, {
      subdomain: "falha_tecnica",
      object: hasPattern(text, [/\b(caminhao|veiculo)\b/]) ? "veiculo" : "equipamento",
      symptom: "retorno pela mesma falha",
      event: "retrabalho",
      impact: "tempo_e_custo",
      context: selectedAreaContext || "operacao",
      confidence: 0.88,
      possibleLines: ["TECHNICAL_REWORK", "GENERAL_CAUSAL_INVESTIGATION"],
      reason: "O relato indica reincidencia da mesma falha, sugerindo retrabalho tecnico ou processo de correcao incompleto.",
    });
  }

  if (documentError) {
    return createClassification(classificationTargets.documentProcess, {
      subdomain: "processo_documental",
      object: hasPattern(text, [/\b(nota fiscal)\b/]) ? "nota_fiscal" : "documento",
      symptom: "dados incorretos",
      event: "erro_documental",
      impact: "retrabalho_e_risco",
      context: selectedAreaContext || "processo_administrativo",
      confidence: 0.9,
      possibleLines: ["DOCUMENT_PROCESS", "GENERAL_CAUSAL_INVESTIGATION"],
      reason: "O relato descreve documento ou cadastro emitido com dados incorretos.",
    });
  }

  if (productFailure) {
    return createClassification(classificationTargets.productFailure, {
      subdomain: "defeito_ou_uso",
      object: "produto",
      symptom: "defeito percebido",
      event: "falha_produto",
      impact: "insatisfacao_e_retrabalho",
      context: selectedAreaContext || "produto",
      confidence: 0.74,
      possibleLines: ["GENERAL_CAUSAL_INVESTIGATION"],
      reason: "O relato indica falha percebida no produto ou servico, mas ainda precisa separar uso, entrada, metodo e medicao.",
    });
  }

  if (delaySignal && !serviceManifestation) {
    return createClassification(classificationTargets.delay, {
      subdomain: "prazo",
      object: "entrega_ou_atendimento",
      symptom: "demora ou atraso",
      event: "atraso",
      impact: "espera_e_insatisfacao",
      context: selectedAreaContext || "operacao",
      confidence: 0.76,
      possibleLines: ["DELAY", "SERVICE_FAILURE", "GENERAL_CAUSAL_INVESTIGATION"],
      reason: "O relato indica demora ou atraso, mas ainda precisa localizar origem e mecanismo.",
    });
  }

  const fallbackTarget = selectedAreaContext && classificationTargets[selectedAreaContext] ? classificationTargets[selectedAreaContext] : classificationTargets.general;
  return createClassification(fallbackTarget.line ? fallbackTarget : classificationTargets.general, {
    subdomain: selectedAreaContext || "indefinido",
    object: "nao_identificado",
    symptom: "efeito_principal_indefinido",
    event: "evento_a_confirmar",
    impact: "impacto_a_confirmar",
    context: selectedAreaContext || "geral",
    confidence: 0.42,
    possibleLines: ["GENERAL_CAUSAL_INVESTIGATION"],
    reason: "Nao ha sinais suficientes para escolher uma arvore especializada com seguranca.",
  });
}

function routeInvestigation(classification) {
  if (classification.confianca_classificacao >= 0.8) {
    return {
      selectedLine: classification.route,
      area: classification.area,
      routeLocked: true,
      gate: "high_confidence",
      reason: classification.reason,
    };
  }

  return {
    selectedLine: "GENERAL_CAUSAL_INVESTIGATION",
    area: classification.area || "operations",
    routeLocked: false,
    gate: classification.confianca_classificacao >= 0.5 ? "needs_disambiguation" : "safe_fallback",
    reason:
      classification.confianca_classificacao >= 0.5
        ? "Confianca intermediaria; a investigacao precisa desambiguar o efeito principal antes de escolher arvore especializada."
        : "Confianca baixa; usando fallback seguro para nao improvisar uma arvore especializada.",
  };
}

function detectArea(problem, selectedArea) {
  const classification = classifyProblem(problem, selectedArea);
  const route = routeInvestigation(classification);
  if (route.selectedLine !== "GENERAL_CAUSAL_INVESTIGATION" || selectedArea === "auto") return route.area;
  if (selectedArea !== "auto") return selectedArea;
  const text = stripAccents(problem);
  const ranked = Object.entries(areaKeywords)
    .map(([area, keywordWeights]) => ({
      area,
      score: Object.entries(keywordWeights).reduce((sum, [keyword, weight]) => {
        return sum + (text.includes(keyword) ? weight : 0);
      }, 0),
    }))
    .sort((a, b) => b.score - a.score);
  return ranked[0].score > 0 ? ranked[0].area : "operations";
}

function showScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });
}

function resetScores() {
  state.scores = Object.fromEntries(Object.keys(categories).map((key) => [key, 0]));
}

function seedScores() {
  if (state.route?.selectedLine === "FUNNEL_COMMERCIAL" || state.route?.selectedLine === "COMMERCIAL_CONVERSION") {
    state.scores.funnel += 2;
    state.scores.offer += 1.5;
    state.scores.market += 1.5;
    state.scores.input += 1;
    state.scores.measurement += 1;
  }

  if (state.route?.selectedLine === "SERVICE_FAILURE" || state.route?.selectedLine === "CUSTOMER_COMPLAINT") {
    state.scores.customer += 2;
    state.scores.method += 1.5;
    state.scores.people += 1;
    state.scores.measurement += 0.5;
  }

  if (
    state.route?.selectedLine === "TECHNICAL_REWORK" ||
    state.route?.selectedLine === "DOCUMENT_PROCESS" ||
    state.route?.selectedLine === "DELAY" ||
    state.area === "operations" ||
    state.area === "product"
  ) {
    state.scores.method += 1.5;
    state.scores.input += 1.5;
    state.scores.measurement += 1;
  }

  if (state.audience === "b2b") {
    state.scores.offer += 0.5;
    state.scores.customer += 0.5;
  }

  state.classification?.possiveis_linhas?.forEach((line) => {
    if (line === "SERVICE_FAILURE" || line === "CUSTOMER_COMPLAINT") state.scores.customer += 0.5;
    if (line === "FUNNEL_COMMERCIAL" || line === "COMMERCIAL_CONVERSION") state.scores.funnel += 0.5;
    if (line === "DOCUMENT_PROCESS" || line === "TECHNICAL_REWORK") state.scores.method += 0.5;
  });
}

function buildQuestionSet() {
  const routeQuestions = investigationRouteQuestions[state.route?.selectedLine] || [];
  const routeCategories =
    Object.values(classificationTargets).find((target) => target.line === state.route?.selectedLine)?.categories ||
    classificationTargets.general.categories;
  const base = questionBank
    .filter((question) => question.areas.includes(state.area) && routeCategories.includes(question.category))
    .sort((a, b) => {
      const aSpecific = a.areas.length === 1 && a.areas[0] === state.area ? 1 : 0;
      const bSpecific = b.areas.length === 1 && b.areas[0] === state.area ? 1 : 0;
      return bSpecific - aSpecific;
    });
  const generic = questionBank.filter(
    (question) =>
      !question.areas.includes(state.area) &&
      ["measurement", "tools", "people", "method"].includes(question.category) &&
      routeCategories.includes(question.category),
  );
  const segmentSpecific = makeSegmentQuestions(state.segment, state.area);
  const unique = [...routeQuestions, ...segmentSpecific, ...base, ...generic].filter(
    (question, index, all) => all.findIndex((candidate) => candidate.text === question.text) === index,
  );
  return unique;
}

function currentQuestion() {
  return state.questions[state.index];
}

function shouldUseEngineV2() {
  return Boolean(INVESTIGATION_ENGINE_V2 && engineV2?.beginInvestigation);
}

function syncV2State(session) {
  const trace = engineV2.trace(session);
  state.v2Session = session;
  state.area = session.context?.area || "operations";
  state.classification = {
    fenomeno: session.phenomenon,
    dominio: "producao_industrial",
    subdominio: session.classification?.context || "industrial",
    objeto_afetado: "processo_produtivo",
    sintoma: session.phenomenon,
    evento: session.macroPhenomenon,
    impacto: "impacto_a_confirmar",
    contexto: "industrial",
    confianca_classificacao: session.classification?.confidence || 0,
    possiveis_linhas: ["HYPOTHESIS_SPACE_ENGINE"],
    route: "HYPOTHESIS_SPACE_ENGINE",
    area: "operations",
    reason: session.classification?.reason,
  };
  state.route = {
    selectedLine: "HYPOTHESIS_SPACE_ENGINE",
    area: "operations",
    routeLocked: false,
    gate: "hypothesis_space",
    reason: session.classification?.reason,
  };
  state.primaryInvestigationPath = "HYPOTHESIS_SPACE_ENGINE";
  state.allowedInvestigationPaths = ["HYPOTHESIS_SPACE_ENGINE"];
  state.pathLock = false;
  state.questions = session.currentQuestion ? [session.currentQuestion] : [];
  state.index = 0;
  state.activeHypotheses = trace.topHypotheses.map((hypothesis) => ({
    id: hypothesis.id,
    label: hypothesis.label,
    score: hypothesis.weight,
    supportingEvidence: [],
    contradictingEvidence: [],
  }));
  state.hypothesisScores = Object.fromEntries(trace.topHypotheses.map((hypothesis) => [hypothesis.id, hypothesis.weight]));
  state.debugEvents = session.debugEvents;
}

function beginInvestigation({ profile, segment, selectedArea, audience, problem }) {
  state.profile = profile || "";
  state.segment = segment || "generic";
  state.selectedArea = selectedArea || "auto";
  state.audience = audience || "mixed";
  state.problem = (problem || "").trim();
  state.normalizedProblem = {};
  state.engineVersion = "v1";
  state.v2Session = null;
  state.classification = null;
  state.route = null;
  state.primaryInvestigationPath = null;
  state.allowedInvestigationPaths = [];
  state.pathLock = false;
  state.index = 0;
  state.asked = [];
  state.evidence = [];
  state.activeHypotheses = [];
  state.rejectedHypotheses = [];
  state.confirmedFacts = [];
  state.confirmedFactDetails = {};
  state.unresolvedQuestions = [];
  state.hypothesisScores = {};
  state.lastAnswerContext = null;
  state.currentDepth = 0;
  state.investigationPath = [];
  state.debugEvents = [];
  state.questions = [];
  state.aiAdaptation = null;
  state.aiRequestedQuestionId = null;
  state.aiRequestId += 1;

  resetScores();
  if (shouldUseEngineV2()) {
    const v2Session = engineV2.beginInvestigation({
      profile: state.profile,
      segment: state.segment,
      selectedArea: state.selectedArea,
      audience: state.audience,
      problem: state.problem,
    });
    if (v2Session.supported) {
      state.engineVersion = "v2";
      syncV2State(v2Session);
      state.normalizedProblem = {
        originalProblem: state.problem,
        normalizedText: stripAccents(state.problem),
        classification: state.classification,
      };
      return currentQuestion();
    }
  }

  state.classification = classifyProblem(state.problem, state.selectedArea);
  state.route = routeInvestigation(state.classification);
  state.primaryInvestigationPath = state.route.selectedLine;
  state.allowedInvestigationPaths = [state.route.selectedLine, ...(state.classification.possiveis_linhas || [])].filter(
    (line, index, all) => line && all.indexOf(line) === index,
  );
  state.pathLock = state.route.routeLocked;
  state.normalizedProblem = {
    originalProblem: state.problem,
    normalizedText: stripAccents(state.problem),
    classification: state.classification,
  };
  state.area = state.route.area;
  state.activeHypotheses = state.classification.possiveis_linhas.map((line) => ({
    id: line,
    label: investigationLineLabels[line] || line,
    score: line === state.route.selectedLine ? 2 : 1,
    supportingEvidence: [state.classification.reason],
    contradictingEvidence: [],
  }));
  state.hypothesisScores = Object.fromEntries(state.activeHypotheses.map((hypothesis) => [hypothesis.id, hypothesis.score]));
  registerFacts(state.classification.initialFacts, {
    questionId: "classification",
    answer: "classified",
    evidence: state.classification.reason,
  });
  Object.entries(state.classification.initialHypotheses || {}).forEach(([hypothesis, score]) => {
    registerHypothesis(hypothesis, score, state.classification.reason);
  });
  state.debugEvents.push({
    type: "classification",
    classification: state.classification,
    selectedRoute: state.route.selectedLine,
    routeGate: state.route.gate,
    reason: state.route.reason,
  });
  state.questions = buildQuestionSet();
  seedScores();
  state.index = nextQuestionIndex();
  if (state.index === -1) state.index = 0;
  return currentQuestion();
}

function answerWeight(answer, reverse) {
  const regular = {
    yes: 3,
    partial: 1.5,
    no: -1,
    unknown: 0,
  };
  const reversed = {
    yes: -1,
    partial: 1.5,
    no: 3,
    unknown: 0,
  };
  return (reverse ? reversed : regular)[answer];
}

function labelAnswer(answer) {
  return {
    yes: "Sim",
    no: "Nao",
    partial: "Parcialmente",
    unknown: "Nao sei",
  }[answer];
}

function confidence() {
  const values = Object.values(state.scores);
  const top = Math.max(...values, 0);
  const total = values.reduce((sum, value) => sum + Math.max(value, 0), 0) || 1;
  return Math.min(92, Math.round((top / total) * 100));
}

function questionPillar(question) {
  return categoryPillars[question.category] || "process";
}

function pillarScores() {
  return Object.keys(qualityPillars).reduce((scores, pillar) => {
    scores[pillar] = Object.entries(state.scores).reduce((sum, [category, score]) => {
      return sum + (categoryPillars[category] === pillar ? Math.max(score, 0) : 0);
    }, 0);
    return scores;
  }, {});
}

function topPillarKey() {
  return Object.entries(pillarScores()).sort((a, b) => b[1] - a[1])[0][0];
}

function hypothesisStrength() {
  const score = confidence();
  if (score >= 70) {
    return {
      label: "Hipotese forte",
      note: "As respostas convergiram bem para uma causa principal.",
    };
  }
  if (score >= 45) {
    return {
      label: "Hipotese moderada",
      note: "Ha bons sinais, mas ainda existem causas secundarias relevantes.",
    };
  }
  return {
    label: "Hipotese inicial",
    note: "As respostas ainda estao divididas; use este resultado como primeira direcao de investigacao.",
  };
}

function shouldFinish() {
  const askedCategories = new Set(state.asked.map((item) => item.category));
  return (
    state.asked.length >= MAX_QUESTIONS ||
    (state.asked.length >= MIN_QUESTIONS && confidence() >= 70 && askedCategories.size >= 4)
  );
}

function categoryAskedCount(category) {
  return state.asked.filter((item) => item.category === category).length;
}

function pillarAskedCount(pillar) {
  return state.asked.filter((item) => categoryPillars[item.category] === pillar).length;
}

function recentlyAskedSameCategory(category) {
  const recent = state.asked.slice(-2);
  return recent.length >= 2 && recent.every((item) => item.category === category);
}

function questionType(question) {
  return question.type || questionTypes.boolean;
}

function askedQuestionIds() {
  return new Set(state.asked.map((item) => item.questionId).filter(Boolean));
}

function questionPath(question) {
  return question.path || state.primaryInvestigationPath || state.route?.selectedLine;
}

function questionHypothesis(question) {
  return question.hypothesis || question.targetHypothesis || question.category;
}

function matchingFacts(facts = []) {
  return facts.filter((fact) => state.confirmedFacts.includes(fact));
}

function pathTransitionEvidenceCount(question) {
  return new Set([...matchingFacts(question.requiresFacts), ...matchingFacts(question.requiresAnyFacts)]).size;
}

function isQuestionEligible(question, index, askedIndexes) {
  const hardBlocks = [];
  if (askedIndexes.has(index)) hardBlocks.push("already_asked");
  const askedIds = askedQuestionIds();
  if (question.requiredAsked?.some((id) => !askedIds.has(id))) hardBlocks.push("missing_required_question");
  if (question.requiresFacts?.some((fact) => !state.confirmedFacts.includes(fact))) hardBlocks.push("missing_required_fact");
  if (question.requiresAnyFacts?.length && !question.requiresAnyFacts.some((fact) => state.confirmedFacts.includes(fact))) {
    hardBlocks.push("missing_any_required_fact");
  }
  if (question.excludesFacts?.some((fact) => state.confirmedFacts.includes(fact))) hardBlocks.push("excluded_by_fact");
  if (question.allowedPhenomena?.length && !question.allowedPhenomena.includes(state.classification?.fenomeno)) {
    hardBlocks.push("phenomenon_not_allowed");
  }
  if (question.allowedDomains?.length && !question.allowedDomains.includes(state.classification?.dominio)) {
    hardBlocks.push("domain_not_allowed");
  }
  if (question.triggerAllFacts?.length && !question.triggerAllFacts.every((fact) => state.confirmedFacts.includes(fact))) {
    hardBlocks.push("missing_all_trigger_facts");
  }
  if (question.triggerFacts?.length && !question.triggerFacts.some((fact) => state.confirmedFacts.includes(fact))) {
    hardBlocks.push("missing_trigger_fact");
  }
  const path = questionPath(question);
  if (state.pathLock && path && path !== state.primaryInvestigationPath && pathTransitionEvidenceCount(question) < 2) {
    hardBlocks.push("path_locked_without_transition_evidence");
  }
  return {
    eligible: hardBlocks.length === 0,
    hardBlocks,
    path,
    hypothesis: questionHypothesis(question),
  };
}

function canAskQuestion(question, askedIndexes) {
  return isQuestionEligible(question, state.questions.indexOf(question), askedIndexes).eligible;
}

function continuityScoreForQuestion(question) {
  const last = state.lastAnswerContext;
  if (!last) return 0;
  let score = 0;
  const triggerFacts = [...(question.triggerFacts || []), ...(question.triggerAllFacts || [])];
  if (triggerFacts.some((fact) => last.facts.includes(fact))) score += 2.4;
  if (question.triggerAllFacts?.length && question.triggerAllFacts.every((fact) => state.confirmedFacts.includes(fact))) score += 1.8;
  if (question.parentQuestionId && question.parentQuestionId === last.questionId) score += 2;
  if (last.raisedHypotheses.includes(questionHypothesis(question))) score += 2;
  if (question.category === last.category) score += 0.4;
  if (!triggerFacts.length && state.currentDepth > 0) score -= 0.4;
  return score;
}

function evaluateQuestionCandidate(question, index, askedIndexes) {
  const eligibility = isQuestionEligible(question, index, askedIndexes);
  const categoryScore = state.scores[question.category] || 0;
  const causalScore = state.hypothesisScores[eligibility.hypothesis] || 0;
  const continuityScore = continuityScoreForQuestion(question);
  const informationGain = question.expectedInformationGain || 0.45;
  const penalties = [];
  if (categoryAskedCount(question.category) >= 3) penalties.push({ reason: "category_saturated", value: 2 });
  if (recentlyAskedSameCategory(question.category)) penalties.push({ reason: "recent_same_category", value: 1.2 });
  if (state.rejectedHypotheses.includes(eligibility.hypothesis)) penalties.push({ reason: "hypothesis_rejected", value: 2 });
  if (state.pathLock && eligibility.path !== state.primaryInvestigationPath) penalties.push({ reason: "secondary_path", value: 1.5 });
  const penaltyTotal = penalties.reduce((sum, penalty) => sum + penalty.value, 0);
  const score = eligibility.eligible
    ? categoryScore + causalScore * 1.6 + continuityScore + informationGain * 3 - penaltyTotal
    : Number.NEGATIVE_INFINITY;
  return {
    index,
    id: question.id,
    text: question.text,
    path: eligibility.path,
    category: question.category,
    hypothesis: eligibility.hypothesis,
    eligible: eligibility.eligible,
    hardBlocks: eligibility.hardBlocks,
    categoryScore,
    causalScore,
    continuityScore,
    informationGain,
    penalties,
    finalScore: score,
    reasonForQuestion: deriveReasonForQuestion(question),
  };
}

function evaluateQuestionCandidates(askedIndexes = new Set(state.asked.map((item) => item.index))) {
  return state.questions.map((question, index) => evaluateQuestionCandidate(question, index, askedIndexes));
}

function traceQuestionSelection() {
  const askedIndexes = new Set(state.asked.map((item) => item.index));
  const candidates = evaluateQuestionCandidates(askedIndexes);
  const routeQuestionIds = new Set((investigationRouteQuestions[state.route?.selectedLine] || []).map((question) => question.id));
  const eligible = candidates
    .filter((candidate) => candidate.eligible)
    .sort((a, b) => b.finalScore - a.finalScore);
  const triggeredRoute = eligible
    .filter((candidate) => routeQuestionIds.has(candidate.id) && isSpecificTriggeredRouteQuestion(state.questions[candidate.index]))
    .sort((a, b) => b.finalScore - a.finalScore);
  const openingRoute = eligible
    .filter((candidate) => routeQuestionIds.has(candidate.id))
    .sort((a, b) => b.informationGain - a.informationGain || b.finalScore - a.finalScore);
  const selected = triggeredRoute[0] || (!state.asked.length && openingRoute[0]) || eligible[0] || null;
  return {
    activeInvestigationPath: state.primaryInvestigationPath,
    allowedInvestigationPaths: state.allowedInvestigationPaths,
    pathLock: state.pathLock,
    candidateQuestions: candidates,
    candidateHypotheses: state.activeHypotheses,
    hypothesisScores: state.hypothesisScores,
    categoryScores: state.scores,
    selected,
    blocked: candidates.filter((candidate) => !candidate.eligible),
  };
}

function isSpecificTriggeredRouteQuestion(question) {
  return Boolean(question.id && (question.triggerFacts?.length || question.triggerAllFacts?.length || question.requiredAsked?.length));
}

function selectNextQuestionIndex(askedIndexes) {
  const candidates = evaluateQuestionCandidates(askedIndexes);
  const routeQuestionIds = new Set((investigationRouteQuestions[state.route?.selectedLine] || []).map((question) => question.id));
  const eligible = candidates.filter((candidate) => candidate.eligible);
  const triggeredRoute = eligible
    .filter((candidate) => routeQuestionIds.has(candidate.id) && isSpecificTriggeredRouteQuestion(state.questions[candidate.index]))
    .sort((a, b) => b.finalScore - a.finalScore);
  if (triggeredRoute.length) return triggeredRoute[0].index;

  const openingRoute = eligible
    .filter((candidate) => routeQuestionIds.has(candidate.id))
    .sort((a, b) => b.informationGain - a.informationGain || b.finalScore - a.finalScore);
  if (!state.asked.length && openingRoute.length) return openingRoute[0].index;

  const ranked = eligible.sort((a, b) => b.finalScore - a.finalScore);
  if (ranked.length) return ranked[0].index;

  const fallback = candidates.find((candidate) => candidate.hardBlocks.length === 1 && candidate.hardBlocks[0] === "path_locked_without_transition_evidence");
  if (fallback) return fallback.index;
  return -1;
}

function hasPathTransitionSupport(nextPath) {
  if (!nextPath || nextPath === state.primaryInvestigationPath) return true;
  const transitionFacts = {
    VALUE_PROPOSITION_MISMATCH: ["promise_exists", "promise_changed", "expectation_mismatch", "commercial_commitment", "delivery_vs_promise_gap", "broken_promise"],
    FUNNEL_COMMERCIAL: ["route_sales", "sales_proposal", "sales_closing", "sales_lead_generation"],
  }[nextPath] || [];
  const factCount = transitionFacts.filter((fact) => state.confirmedFacts.includes(fact)).length;
  const nextScore = state.hypothesisScores[nextPath] || state.hypothesisScores.value_proposition_mismatch || 0;
  const currentScore = state.hypothesisScores[state.primaryInvestigationPath] || 0;
  return factCount >= 2 && nextScore > currentScore + 2;
}

function maybeTransitionPrimaryPath(nextQuestion) {
  const nextPath = questionPath(nextQuestion);
  if (!state.pathLock || !nextPath || nextPath === state.primaryInvestigationPath) return null;
  if (!hasPathTransitionSupport(nextPath)) return null;
  const transition = {
    type: "PATH_TRANSITION",
    from: state.primaryInvestigationPath,
    to: nextPath,
    reasonForTransition: `Hipotese ${questionHypothesis(nextQuestion)} possui fatos suficientes e score superior para mudar a rota primaria.`,
  };
  state.primaryInvestigationPath = nextPath;
  state.debugEvents.push(transition);
  return transition;
}

function topHypotheses(limit = 5) {
  return [...state.activeHypotheses]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function questionDisplayPath(question) {
  return investigationLineLabels[state.primaryInvestigationPath] || investigationLineLabels[questionPath(question)] || categories[question.category].title;
}

function questionContextPath() {
  return investigationLineLabels[state.primaryInvestigationPath] || investigationLineLabels[state.route?.selectedLine] || areaLabels[state.area];
}

function updateDebugPanel() {
  if (!isBrowser || !debugInvestigation || !debugPanel) return;
  if (state.engineVersion === "v2" && state.v2Session) {
    const trace = engineV2.trace(state.v2Session);
    debugPanel.innerHTML = `
      <strong>DEBUG INVESTIGATION V2</strong>
      <span>PHENOMENON: ${trace.phenomenon}</span>
      <span>QUESTION: ${trace.selectedQuestion?.id || "-"}</span>
      <span>INFORMATION GAIN: ${trace.selectedQuestion?.informationGain || 0}</span>
      <span>WHY: ${trace.selectedQuestion?.reason || "-"}</span>
      <span>TOP HYPOTHESES: ${trace.topHypotheses
        .slice(0, 4)
        .map((item) => `${item.id} ${item.percent}%`)
        .join(" | ")}</span>
      <details><summary>Candidates</summary><pre>${JSON.stringify(trace.candidates, null, 2)}</pre></details>
    `;
    return;
  }
  const question = currentQuestion();
  const trace = traceQuestionSelection();
  debugPanel.innerHTML = `
    <strong>DEBUG INVESTIGATION</strong>
    <span>PRIMARY PATH: ${state.primaryInvestigationPath || "-"}</span>
    <span>PATH LOCK: ${state.pathLock ? "ON" : "OFF"}</span>
    <span>LAST FACT: ${state.lastAnswerContext?.facts?.join(", ") || "-"}</span>
    <span>NEXT TARGET: ${question?.targetHypothesis || question?.category || "-"}</span>
    <span>WHY: ${question?.reasonForQuestion || deriveReasonForQuestion(question)}</span>
    <span>TOP HYPOTHESES: ${topHypotheses(3)
      .map((hypothesis) => `${hypothesis.id} ${hypothesis.score.toFixed(2)}`)
      .join(" | ")}</span>
    <details><summary>Candidates</summary><pre>${JSON.stringify(trace.selected, null, 2)}</pre></details>
  `;
}

function ensureDebugPanel() {
  if (!isBrowser || !debugInvestigation) return null;
  let panel = document.querySelector("#debugInvestigationPanel");
  if (!panel) {
    panel = document.createElement("aside");
    panel.id = "debugInvestigationPanel";
    panel.className = "debug-investigation";
    document.body.appendChild(panel);
  }
  return panel;
}

function findHighGainRouteQuestion(askedIndexes) {
  const routeQuestionIds = new Set((investigationRouteQuestions[state.route?.selectedLine] || []).map((question) => question.id));
  return state.questions.findIndex((question, index) => {
    if (!routeQuestionIds.has(question.id)) return false;
    if (askedIndexes.has(index)) return false;
    return canAskQuestion(question, askedIndexes);
  });
}

function findQuestionByPillar(pillar, askedIndexes) {
  const rankedCategories = Object.entries(state.scores)
    .filter(([category]) => categoryPillars[category] === pillar)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);

  for (const category of rankedCategories) {
    if (categoryAskedCount(category) >= 3 || recentlyAskedSameCategory(category)) continue;
    const found = state.questions.findIndex(
      (question, index) => !askedIndexes.has(index) && question.category === category && canAskQuestion(question, askedIndexes),
    );
    if (found !== -1) return found;
  }

  return state.questions.findIndex((question, index) => {
    return !askedIndexes.has(index) && questionPillar(question) === pillar && canAskQuestion(question, askedIndexes);
  });
}

function nextQuestionIndex() {
  const askedIndexes = new Set(state.asked.map((item) => item.index));
  return selectNextQuestionIndex(askedIndexes);
}

function answerOptionsFor(question) {
  return questionType(question) === questionTypes.multipleChoice ? question.options : booleanOptions();
}

function currentAiAdaptation(question) {
  return state.aiAdaptation?.questionId === question.id ? state.aiAdaptation : null;
}

function aiContextForQuestion() {
  return {
    problem: state.problem,
    profile: state.profile,
    segment: segmentLabels[state.segment] || state.segment,
    area: areaLabels[state.area] || state.area,
    audience: audienceLabels[state.audience] || state.audience,
    classification: {
      phenomenon: state.classification?.fenomeno,
      domain: state.classification?.dominio,
      symptom: state.classification?.sintoma,
      impact: state.classification?.impacto,
    },
    history: state.asked,
  };
}

async function adaptCurrentQuestionWithAI(question) {
  if (!isBrowser || !window.CausaRealAI?.isConfigured?.() || state.aiRequestedQuestionId === question.id) return;

  const requestId = state.aiRequestId + 1;
  state.aiRequestId = requestId;
  state.aiRequestedQuestionId = question.id;

  try {
    const adaptation = await window.CausaRealAI.adaptQuestion({
      canonicalQuestion: {
        id: question.id,
        text: question.text,
        category: question.category,
        targetHypothesis: question.targetHypothesis,
        options: answerOptionsFor(question),
      },
      context: aiContextForQuestion(),
    });
    const stillCurrent = currentQuestion()?.id === question.id && requestId === state.aiRequestId;
    if (!adaptation || !stillCurrent) return;
    state.aiAdaptation = { questionId: question.id, ...adaptation };
    renderQuestion({ skipAI: true });
  } catch (_error) {
    // The deterministic question remains available whenever the provider is unavailable.
  }
}

function renderQuestion({ skipAI = false } = {}) {
  const question = currentQuestion();
  const adaptation = currentAiAdaptation(question);
  stepLabel.textContent = `Pergunta ${state.asked.length + 1}`;
  questionText.textContent = adaptation?.question || question.text;
  if (state.engineVersion === "v2") {
    questionCategory.textContent = "Investigacao probabilistica: producao industrial";
    contextLine.textContent = `Engine V2 | ${segmentLabels[state.segment]} | ${audienceLabels[state.audience]}`;
  } else {
    questionCategory.textContent = `Linha de investigacao: ${questionDisplayPath(question)}`;
    contextLine.textContent = `${questionContextPath()} | ${segmentLabels[state.segment]} | ${audienceLabels[state.audience]}`;
  }
  progressBar.style.width = `${Math.min(100, (state.asked.length / MAX_QUESTIONS) * 100)}%`;
  renderAnswerControls(question, adaptation?.options);
  renderHistory();
  updateDebugPanel();
  if (!skipAI) adaptCurrentQuestionWithAI(question);
}

function booleanOptions() {
  return [
    { value: "yes", label: "Sim" },
    { value: "no", label: "Nao" },
    { value: "partial", label: "Parcialmente" },
    { value: "unknown", label: "Nao sei" },
  ];
}

function renderAnswerControls(question, adaptedOptions = null) {
  const options = adaptedOptions || answerOptionsFor(question);
  answerGrid.innerHTML = options
    .map((option) => `<button type="button" data-answer="${option.value}">${option.label}</button>`)
    .join("");
  answerGrid.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => handleAnswer(button.dataset.answer));
  });
}

function renderHistory() {
  const recent = state.asked.slice(-4);
  historyList.innerHTML = recent
    .map((item) => `<li><strong>${item.answerLabel || labelAnswer(item.answer)}:</strong> ${item.text}</li>`)
    .join("");
}

function applyRelatedScore(question, answer, primaryWeight) {
  if (answer === "unknown") {
    state.scores.measurement += 0.5;
    return;
  }

  if (primaryWeight <= 0) return;

  const related = {
    funnel: ["measurement", "method"],
    offer: ["customer", "market"],
    market: ["offer", "customer"],
    input: ["method", "measurement"],
    people: ["method", "measurement"],
    method: ["measurement", "people"],
    measurement: ["method"],
    tools: ["method", "people"],
    customer: ["offer", "market"],
  }[question.category];

  (related || []).forEach((category) => {
    if (state.route?.selectedLine === "SERVICE_FAILURE" && ["offer", "market", "funnel"].includes(category)) return;
    state.scores[category] += 0.35;
  });
}

function registerFacts(facts = [], source = {}) {
  facts.forEach((fact) => {
    if (!state.confirmedFacts.includes(fact)) state.confirmedFacts.push(fact);
    state.confirmedFactDetails[fact] = {
      questionId: source.questionId,
      answer: source.answer,
      evidence: source.evidence,
    };
  });
}

function registerEvidence(evidence) {
  if (evidence) state.evidence.push(evidence);
}

function registerHypothesis(id, score = 1, evidence, contradicting = false) {
  if (!id) return;
  state.hypothesisScores[id] = (state.hypothesisScores[id] || 0) + score;
  const existing = state.activeHypotheses.find((hypothesis) => hypothesis.id === id);
  if (existing) {
    existing.score += score;
    if (evidence) {
      const list = contradicting ? existing.contradictingEvidence : existing.supportingEvidence;
      if (!list.includes(evidence)) list.push(evidence);
    }
    return;
  }
  state.activeHypotheses.push({
    id,
    label: investigationLineLabels[id] || categories[id]?.title || id,
    score,
    supportingEvidence: evidence && !contradicting ? [evidence] : [],
    contradictingEvidence: evidence && contradicting ? [evidence] : [],
  });
}

function pruneContradictedHypotheses() {
  const contradictionRules = {
    individual_behavior_problem: ["no_people_concentration"],
    service_standard_gap: ["service_standard_defined"],
    technical_skill_gap: ["technical_execution_not_difficult"],
    value_proposition_mismatch: ["technical_execution_difficulty", "no_people_concentration", "service_standard_defined"],
    broken_promise: ["technical_execution_difficulty"],
  };

  Object.entries(contradictionRules).forEach(([hypothesis, contradictingFacts]) => {
    const hits = contradictingFacts.filter((fact) => state.confirmedFacts.includes(fact));
    const hasRequiredFacts = ["value_proposition_mismatch", "broken_promise"].includes(hypothesis)
      ? ["promise_exists", "expectation_mismatch", "delivery_vs_promise_gap", "broken_promise"].some((fact) =>
          state.confirmedFacts.includes(fact),
        )
      : true;
    if (!hits.length || hasRequiredFacts) return;
    state.hypothesisScores[hypothesis] = Math.min(state.hypothesisScores[hypothesis] || 0, -0.5);
    if (!state.rejectedHypotheses.includes(hypothesis)) state.rejectedHypotheses.push(hypothesis);
    const existing = state.activeHypotheses.find((candidate) => candidate.id === hypothesis);
    if (existing) {
      existing.score = Math.min(existing.score, -0.5);
      hits.forEach((fact) => {
        if (!existing.contradictingEvidence.includes(fact)) existing.contradictingEvidence.push(fact);
      });
    }
  });

  Object.entries(state.hypothesisScores).forEach(([hypothesis, score]) => {
    if (score <= -1 && !state.rejectedHypotheses.includes(hypothesis)) state.rejectedHypotheses.push(hypothesis);
  });
}

function hypothesisScoreSnapshot() {
  return { ...state.hypothesisScores };
}

function scoreDelta(before, after) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return Object.fromEntries([...keys].map((key) => [key, (after[key] || 0) - (before[key] || 0)]));
}

function factsForAnswer(question, answer) {
  if (answer === "yes") return question.factsOnPositive || [];
  if (answer === "no") return question.factsOnNegative || [];
  if (answer === "partial") return question.factsOnPartial || [];
  return question.factsOnUnknown || [];
}

function applyHypothesisDelta(question, answer, evidence) {
  const deltas = question.hypothesisDelta?.[answer] || {};
  Object.entries(deltas).forEach(([hypothesis, delta]) => {
    registerHypothesis(hypothesis, delta, evidence, delta < 0);
  });
}

function supportingEvidenceForFacts(facts) {
  return facts.map((fact) => state.confirmedFactDetails[fact]?.evidence || fact);
}

function deriveReasonForQuestion(question) {
  if (!question) return "";
  if (question.reasonForQuestion) return question.reasonForQuestion;
  if (question.triggerAllFacts?.length) {
    return `Pergunta feita agora porque os fatos confirmados (${question.triggerAllFacts.join(", ")}) aumentaram a hipotese ${question.targetHypothesis}.`;
  }
  if (question.triggerFacts?.length) {
    return `Pergunta feita agora porque um dos fatos (${question.triggerFacts.join(", ")}) esta ativo na investigacao.`;
  }
  if (question.targetHypothesis) {
    return `Pergunta feita para reduzir incerteza sobre a hipotese ${question.targetHypothesis}.`;
  }
  return "Pergunta feita para reduzir incerteza dentro da rota causal atual.";
}

function parentQuestionFor(question) {
  if (question.parentQuestionId) return question.parentQuestionId;
  const fact = [...(question.triggerAllFacts || []), ...(question.triggerFacts || [])].find(
    (candidate) => state.confirmedFactDetails[candidate],
  );
  return fact ? state.confirmedFactDetails[fact].questionId : state.asked.at(-1)?.questionId;
}

function triggerAnswerFor(question) {
  if (question.triggerAnswer) return question.triggerAnswer;
  const fact = [...(question.triggerAllFacts || []), ...(question.triggerFacts || [])].find(
    (candidate) => state.confirmedFactDetails[candidate],
  );
  return fact ? state.confirmedFactDetails[fact].answer : state.asked.at(-1)?.answer;
}

function applyOptionAnswer(question, answer) {
  const option = question.options.find((candidate) => candidate.value === answer) || question.options[0];
  Object.entries(option.scores || { [question.category]: 1 }).forEach(([category, score]) => {
    if (state.scores[category] !== undefined) state.scores[category] += score;
  });
  registerFacts(option.facts || [], { questionId: question.id, answer, evidence: option.evidence || question.evidence });
  registerEvidence(option.evidence || question.evidence);
  registerHypothesis(question.targetHypothesis, option.scores ? 1 : 0.5, option.evidence || question.evidence);
  return option;
}

function recordAnswerV2(answer) {
  const question = currentQuestion();
  if (!question) {
    return {
      done: true,
      question: null,
      diagnosis: state.v2Session?.diagnosis || engineV2.buildDiagnosis(state.v2Session),
    };
  }
  const option = question.options?.find((candidate) => candidate.value === answer);
  const result = engineV2.answer(state.v2Session, answer);
  syncV2State(result.session);
  state.currentDepth += 1;
  state.investigationPath.push(question.id);
  state.asked.push({
    index: 0,
    questionId: question.id,
    text: question.text,
    answer,
    answerLabel: option?.label || labelAnswer(answer),
    category: question.category || "hypothesis",
    evidence: result.session.answers.at(-1)?.evidence,
    questionPurpose: "reducao_de_hipoteses",
    targetHypothesis: result.transition?.topHypotheses?.[0]?.id,
    reasonForQuestion: question.reasonForQuestion,
    positive: answer === "yes" || Boolean(option),
  });
  state.debugEvents = result.session.debugEvents;
  if (result.done) {
    state.v2Session.diagnosis = result.diagnosis || engineV2.buildDiagnosis(result.session);
    return { done: true, question, diagnosis: state.v2Session.diagnosis, transition: result.transition };
  }
  return { done: false, question, nextQuestion: result.nextQuestion, transition: result.transition };
}

function recordAnswer(answer) {
  if (state.engineVersion === "v2") return recordAnswerV2(answer);

  const question = currentQuestion();
  const beforeHypothesisScores = hypothesisScoreSnapshot();
  const isChoiceQuestion = questionType(question) === questionTypes.multipleChoice;
  const option = isChoiceQuestion ? applyOptionAnswer(question, answer) : null;
  const primaryWeight = isChoiceQuestion ? 2 : answerWeight(answer, question.reverse);
  const directFacts = !isChoiceQuestion ? factsForAnswer(question, answer) : [];

  if (!isChoiceQuestion) {
    state.scores[question.category] += primaryWeight;
    applyRelatedScore(question, answer, primaryWeight);
    registerFacts(directFacts, { questionId: question.id, answer, evidence: question.evidence });
    applyHypothesisDelta(question, answer, question.evidence);
    if (primaryWeight > 0) {
      registerEvidence(question.evidence);
      registerHypothesis(question.targetHypothesis || question.category, primaryWeight / 2, question.evidence);
    } else if (primaryWeight < 0 && question.targetHypothesis) {
      state.rejectedHypotheses.push(question.targetHypothesis);
      registerHypothesis(question.targetHypothesis, primaryWeight / 2, question.evidence, true);
    }
  }

  state.currentDepth += 1;
  state.investigationPath.push(question.id || question.category);

  state.asked.push({
    index: state.index,
    questionId: question.id,
    text: question.text,
    answer,
    answerLabel: option?.label,
    category: question.category,
    evidence: question.evidence,
    questionPurpose: question.questionPurpose,
    targetHypothesis: question.targetHypothesis,
    parentQuestionId: question.parentQuestionId,
    triggerAnswer: question.triggerAnswer,
    reasonForQuestion: deriveReasonForQuestion(question),
    positive: primaryWeight > 0,
  });

  const afterAnswerScores = hypothesisScoreSnapshot();
  const transitionScoreDelta = scoreDelta(beforeHypothesisScores, afterAnswerScores);
  const supportingEvidence = [
    ...(option?.facts ? supportingEvidenceForFacts(option.facts) : []),
    ...supportingEvidenceForFacts(directFacts),
  ];
  const raisedHypotheses = Object.entries(transitionScoreDelta)
    .filter(([, delta]) => delta > 0)
    .map(([hypothesis]) => hypothesis);
  state.lastAnswerContext = {
    questionId: question.id,
    answer,
    facts: [...(option?.facts || []), ...directFacts],
    category: question.category,
    targetHypothesis: question.targetHypothesis,
    raisedHypotheses,
    scoreDelta: transitionScoreDelta,
  };
  pruneContradictedHypotheses();

  if (shouldFinish()) {
    return { done: true, question };
  }

  const nextIndex = nextQuestionIndex();
  state.index = nextIndex === -1 ? 0 : nextIndex;
  const nextQuestion = currentQuestion();
  maybeTransitionPrimaryPath(nextQuestion);
  const nextTriggerFacts = [...(nextQuestion?.triggerAllFacts || []), ...(nextQuestion?.triggerFacts || [])];
  const nextSupportingEvidence = supportingEvidenceForFacts(nextTriggerFacts);
  const transition = {
    type: "causal_transition",
    parentQuestionId: question.id,
    triggerAnswer: answer,
    answeredQuestionId: question.id,
    nextQuestionId: nextQuestion?.id,
    targetHypothesis: nextQuestion?.targetHypothesis,
    reasonForQuestion: deriveReasonForQuestion(nextQuestion),
    supportingEvidence: [...new Set([...supportingEvidence, ...nextSupportingEvidence])],
    scoreDelta: transitionScoreDelta,
    investigationPath: state.primaryInvestigationPath,
  };
  state.debugEvents.push(transition);
  if (nextQuestion) {
    nextQuestion.parentQuestionId = nextQuestion.parentQuestionId || parentQuestionFor(nextQuestion);
    nextQuestion.triggerAnswer = nextQuestion.triggerAnswer || triggerAnswerFor(nextQuestion);
    nextQuestion.reasonForQuestion = deriveReasonForQuestion(nextQuestion);
    nextQuestion.investigationPath = state.primaryInvestigationPath;
  }
  return { done: false, question, nextQuestion, transition };
}

function handleAnswer(answer) {
  state.aiAdaptation = null;
  state.aiRequestedQuestionId = null;
  state.aiRequestId += 1;
  const result = recordAnswer(answer);
  if (result.done) {
    renderResult();
    showScreen("result");
    return;
  }

  renderQuestion();
}

function topCategoryKey() {
  return Object.entries(state.scores).sort((a, b) => b[1] - a[1])[0][0];
}

function secondaryCategories(primary) {
  return Object.entries(state.scores)
    .filter(([category]) => category !== primary)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([category]) => categories[category].title);
}

function buildEvidence(categoryKey) {
  const positives = state.asked.filter((item) => item.category === categoryKey && item.positive);
  if (!positives.length) {
    return ["Ainda nao houve evidencia direta suficiente para esta linha; trate como hipotese inicial e valide com dados reais."];
  }
  return positives.slice(0, 5).map((item) => item.evidence);
}

function resultIntro(diagnosis, secondary) {
  const pillar = qualityPillars[categoryPillars[topCategoryKey()]];
  if (state.area === "commercial") {
    return `Pilar principal: ${pillar.label}. ${diagnosis.summary} Tambem vale verificar: ${secondary.join(" e ")}. Para este caso comercial, o plano deve olhar para entrada de oportunidades, rotina de acompanhamento, clareza da oferta, canais e comportamento do cliente.`;
  }
  return `Pilar principal: ${pillar.label}. ${diagnosis.summary} Tambem vale verificar: ${secondary.join(" e ")}. O plano deve priorizar evidencias observaveis, responsavel claro e acompanhamento ate confirmar a causa real.`;
}

function renderResultV2() {
  const diagnosis = state.v2Session?.diagnosis || engineV2.buildDiagnosis(state.v2Session);
  document.querySelector("#confidenceLabel").textContent = diagnosis.strengthLabel;
  document.querySelector("#rootCauseTitle").textContent = diagnosis.title;
  document.querySelector("#rootCauseText").textContent = diagnosis.summary;
  document.querySelector("#evidenceList").innerHTML = diagnosis.evidence.map((item) => `<li>${item}</li>`).join("");
  document.querySelector("#metricList").innerHTML = diagnosis.metrics.map((metric) => `<li>${metric}</li>`).join("");
  document.querySelector("#actionPlan").innerHTML = [
    ["O que", diagnosis.plan.what],
    ["Por que", diagnosis.plan.why],
    ["Onde", diagnosis.plan.where],
    ["Quando", diagnosis.plan.when],
    ["Quem", diagnosis.plan.who],
    ["Como", diagnosis.plan.how],
    ["Quanto", diagnosis.plan.howMuch],
  ]
    .map(([label, value]) => `<div class="action-row"><strong>${label}</strong><span>${value}</span></div>`)
    .join("");
}

function renderResult() {
  if (state.engineVersion === "v2") {
    renderResultV2();
    return;
  }

  const categoryKey = topCategoryKey();
  const diagnosis = categories[categoryKey];
  const secondary = secondaryCategories(categoryKey);
  const evidence = buildEvidence(categoryKey);
  const plan = diagnosis.plan;
  const strength = hypothesisStrength();

  document.querySelector("#confidenceLabel").textContent = strength.label;
  document.querySelector("#rootCauseTitle").textContent = diagnosis.title;
  document.querySelector("#rootCauseText").textContent = `${strength.note} ${resultIntro(diagnosis, secondary)}`;
  document.querySelector("#evidenceList").innerHTML = evidence.map((item) => `<li>${item}</li>`).join("");
  document.querySelector("#metricList").innerHTML = diagnosis.metrics
    .map((metric) => `<li>${metric}</li>`)
    .join("");
  document.querySelector("#actionPlan").innerHTML = [
    ["O que", plan.what],
    ["Por que", plan.why],
    ["Onde", plan.where],
    ["Quando", plan.when],
    ["Quem", plan.who],
    ["Como", plan.how],
    ["Quanto", plan.howMuch],
  ]
    .map(([label, value]) => `<div class="action-row"><strong>${label}</strong><span>${value}</span></div>`)
    .join("");
}

function buildReport() {
  if (state.engineVersion === "v2") {
    const diagnosis = state.v2Session?.diagnosis || engineV2.buildDiagnosis(state.v2Session);
    const trace = engineV2.trace(state.v2Session);
    return `O Investigador da Qualidade

Perfil: ${state.profile}
Segmento: ${segmentLabels[state.segment]}
Area: Producao industrial
Publico afetado: ${audienceLabels[state.audience]}
Problema: ${state.problem}

Motor: Engine V2 - espaco de hipoteses
Fenomeno: ${trace.phenomenon}

Causa raiz provavel: ${diagnosis.title}
Grau da hipotese: ${diagnosis.strengthLabel}

Resumo:
${diagnosis.summary}

Evidencias:
${diagnosis.evidence.map((item) => `- ${item}`).join("\n")}

Hipoteses principais:
${trace.topHypotheses.map((item) => `- ${item.label}: ${item.percent}%`).join("\n")}

Plano 5W2H:
O que: ${diagnosis.plan.what}
Por que: ${diagnosis.plan.why}
Onde: ${diagnosis.plan.where}
Quando: ${diagnosis.plan.when}
Quem: ${diagnosis.plan.who}
Como: ${diagnosis.plan.how}
Quanto: ${diagnosis.plan.howMuch}

Indicadores:
${diagnosis.metrics.map((metric) => `- ${metric}`).join("\n")}
`;
  }

  const categoryKey = topCategoryKey();
  const diagnosis = categories[categoryKey];
  const secondary = secondaryCategories(categoryKey);
  const evidence = buildEvidence(categoryKey).map((item) => `- ${item}`).join("\n");
  const plan = diagnosis.plan;
  const strength = hypothesisStrength();
  const pillar = qualityPillars[categoryPillars[categoryKey]];

  return `O Investigador da Qualidade

Perfil: ${state.profile}
Segmento: ${segmentLabels[state.segment]}
Area: ${areaLabels[state.area]}
Publico afetado: ${audienceLabels[state.audience]}
Problema: ${state.problem}

Causa raiz provavel: ${diagnosis.title}
Pilar principal: ${pillar.label}
Grau da hipotese: ${strength.label}
Observacao: ${strength.note}
Pontos para verificar: ${secondary.join(", ")}

Resumo:
${resultIntro(diagnosis, secondary)}

Evidencias:
${evidence}

Plano 5W2H:
O que: ${plan.what}
Por que: ${plan.why}
Onde: ${plan.where}
Quando: ${plan.when}
Quem: ${plan.who}
Como: ${plan.how}
Quanto: ${plan.howMuch}

Indicadores:
${diagnosis.metrics.map((metric) => `- ${metric}`).join("\n")}
`;
}

function getDebugRoute() {
  if (state.engineVersion === "v2" && state.v2Session) {
    const trace = engineV2.trace(state.v2Session);
    return {
      engineVersion: "v2",
      classification: state.classification,
      selectedRoute: state.route?.selectedLine,
      routeGate: state.route?.gate,
      confidence: state.classification?.confianca_classificacao,
      reason: state.route?.reason,
      activeHypotheses: trace.topHypotheses,
      confirmedFacts: state.v2Session.answers.map((answer) => answer.answerLabel),
      confirmedFactDetails: {},
      hypothesisScores: Object.fromEntries(trace.topHypotheses.map((item) => [item.id, item.weight])),
      investigationPath: state.investigationPath,
      transitions: state.v2Session.debugEvents.filter((event) => event.type === "probability_update"),
      trace,
    };
  }

  return {
    classification: state.classification,
    selectedRoute: state.route?.selectedLine,
    routeGate: state.route?.gate,
    confidence: state.classification?.confianca_classificacao,
    reason: state.route?.reason,
    activeHypotheses: state.activeHypotheses,
    confirmedFacts: state.confirmedFacts,
    confirmedFactDetails: state.confirmedFactDetails,
    hypothesisScores: state.hypothesisScores,
    investigationPath: state.investigationPath,
    transitions: state.debugEvents.filter((event) => event.type === "causal_transition"),
  };
}

function resetApp() {
  state.profile = "";
  state.problem = "";
  state.normalizedProblem = {};
  state.engineVersion = "v1";
  state.v2Session = null;
  state.classification = null;
  state.route = null;
  state.primaryInvestigationPath = null;
  state.allowedInvestigationPaths = [];
  state.pathLock = false;
  state.segment = "generic";
  state.area = "operations";
  state.selectedArea = "auto";
  state.audience = "mixed";
  state.index = 0;
  state.asked = [];
  state.evidence = [];
  state.activeHypotheses = [];
  state.rejectedHypotheses = [];
  state.confirmedFacts = [];
  state.confirmedFactDetails = {};
  state.unresolvedQuestions = [];
  state.hypothesisScores = {};
  state.lastAnswerContext = null;
  state.currentDepth = 0;
  state.investigationPath = [];
  state.debugEvents = [];
  state.questions = [];
  state.aiAdaptation = null;
  state.aiRequestedQuestionId = null;
  state.aiRequestId += 1;
  resetScores();
  startForm.reset();
  showScreen("home");
}

function initBrowserApp() {
  startForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const problem = problemInput.value.trim();
    if (!problem) return;

    beginInvestigation({
      profile: profileInput.value,
      segment: segmentInput.value,
      selectedArea: areaInput.value,
      audience: audienceInput.value,
      problem,
    });
    renderQuestion();
    showScreen("investigation");
  });

  document.querySelector("#backHome").addEventListener("click", resetApp);
  document.querySelector("#restart").addEventListener("click", resetApp);
  document.querySelector("#restartTop").addEventListener("click", resetApp);

  document.querySelector("#copyReport").addEventListener("click", async () => {
    await navigator.clipboard.writeText(buildReport());
    document.querySelector("#copyReport").textContent = "Diagnostico copiado";
  });

  document.querySelector("#downloadReport").addEventListener("click", () => {
    const blob = new Blob([buildReport()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "diagnostico-qualidade.txt";
    link.click();
    URL.revokeObjectURL(url);
  });
}

resetScores();
if (isBrowser) initBrowserApp();

if (typeof module !== "undefined") {
  module.exports = {
    state,
    questionBank,
    investigationRouteQuestions,
    segmentQuestionBoost,
    makeSegmentQuestions,
    classifyProblem,
    routeInvestigation,
    detectArea,
    beginInvestigation,
    recordAnswer,
    answerWeight,
    questionTypes,
    investigationLineLabels,
    categoryPillars,
    qualityPillars,
    categories,
    topCategoryKey,
    buildReport,
    getDebugRoute,
    engineV2,
    INVESTIGATION_ENGINE_V2,
    traceQuestionSelection,
    evaluateQuestionCandidates,
    isQuestionEligible,
    questionPath,
    questionHypothesis,
  };
}
