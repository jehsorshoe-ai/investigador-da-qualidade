const MAX_QUESTIONS = 14;
const MIN_QUESTIONS = 7;

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

const areaKeywords = {
  commercial: [
    "venda",
    "vendas",
    "comercial",
    "cliente",
    "clientes",
    "lead",
    "leads",
    "orcamento",
    "proposta",
    "conversao",
    "faturamento",
    "receita",
    "meta",
    "ticket",
  ],
  service: ["atendimento", "reclamacao", "nps", "satisfacao", "suporte", "pos-venda", "espera"],
  operations: ["entrega", "atraso", "producao", "estoque", "pedido", "logistica", "prazo", "retrabalho"],
  people: ["equipe", "lideranca", "turnover", "treinamento", "desempenho", "motivacao", "absenteismo"],
  product: ["produto", "defeito", "qualidade", "garantia", "servico", "falha", "devolucao"],
  finance: ["custo", "margem", "inadimplencia", "preco", "caixa", "lucro", "despesa"],
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
    text: "A queda aparece mais em uma etapa especifica do funil de vendas?",
    category: "funnel",
    areas: ["commercial"],
    evidence: "A perda parece concentrada em uma etapa do funil.",
  },
  {
    text: "A quantidade de leads ou oportunidades diminuiu recentemente?",
    category: "market",
    areas: ["commercial"],
    evidence: "A demanda ou volume de oportunidades pode ter caido.",
  },
  {
    text: "Os leads atuais parecem menos qualificados que antes?",
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
    text: "Existe uma rotina clara de follow-up para oportunidades abertas?",
    category: "method",
    areas: ["commercial"],
    reverse: true,
    evidence: "A rotina de follow-up pode estar pouco padronizada.",
  },
  {
    text: "A proposta comercial mostra claramente o valor antes do preco?",
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
    text: "A equipe domina bem os diferenciais do produto ou servico?",
    category: "people",
    areas: ["commercial", "product", "service"],
    reverse: true,
    evidence: "Pode faltar dominio sobre diferenciais e argumentos.",
  },
  {
    text: "O CRM ou controle atual mostra as proximas acoes de cada oportunidade?",
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
    reverse: true,
    evidence: "Pode haver desalinhamento entre promessa e entrega.",
  },
  {
    text: "O problema aparece mais em uma etapa especifica da operacao?",
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
    text: "Existe criterio claro para dizer que a atividade foi bem feita?",
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
    text: "O problema aumenta quando entra gente nova ou substituta?",
    category: "people",
    areas: ["operations", "service", "people", "commercial"],
    evidence: "O problema aumenta com troca ou entrada de pessoas.",
  },
  {
    text: "Existe indicador acompanhando esse problema toda semana?",
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
    text: "O problema aparece depois de receber informacao, pedido ou material de fora?",
    category: "input",
    areas: ["operations", "product", "service", "finance"],
    evidence: "A falha pode vir de uma entrada externa.",
  },
  {
    text: "O problema acontece mais com um fornecedor, canal ou tipo de pedido?",
    category: "input",
    areas: ["operations", "product", "service", "commercial"],
    evidence: "Existe concentracao em fornecedor, canal ou tipo de entrada.",
  },
  {
    text: "Alguma ferramenta, sistema ou equipamento falha durante a rotina?",
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
    text: "As reclamacoes se repetem mesmo quando a entrega segue o padrao interno?",
    category: "customer",
    areas: ["service", "operations", "product"],
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

const segmentQuestionBoost = {
  retail: ["O desempenho muda conforme loja, vendedor, horario ou vitrine?", "O cliente compara preco com facilidade antes de decidir?"],
  services: ["A percepcao de valor depende muito da explicacao feita antes da venda?", "A entrega real varia conforme agenda ou profissional?"],
  industry: ["A variacao aparece mais por lote, turno, maquina ou materia-prima?", "Existe controle de qualidade antes da proxima etapa receber o item?"],
  restaurant: ["O problema muda conforme horario de pico, equipe ou canal de pedido?", "A experiencia percebida pelo cliente muda entre salao, retirada e delivery?"],
  ecommerce: ["A perda aparece mais em trafego, carrinho, checkout ou pos-compra?", "O cliente recebe informacoes suficientes antes de comprar online?"],
  health: ["O problema envolve expectativa, espera, agenda ou orientacao ao paciente?", "Existe padrao claro para registrar e acompanhar cada atendimento?"],
  education: ["O problema muda conforme turma, professor, canal ou perfil do aluno?", "O aluno ou responsavel entende claramente a evolucao esperada?"],
};

function makeSegmentQuestions(segment, area) {
  return (segmentQuestionBoost[segment] || []).map((text, index) => ({
    text,
    category: index % 2 === 0 ? (area === "commercial" ? "market" : "method") : "customer",
    areas: [area],
    evidence: `O segmento ${segmentLabels[segment]} pode influenciar o padrao do problema.`,
    segmentOnly: true,
  }));
}

const state = {
  profile: "",
  problem: "",
  segment: "generic",
  area: "operations",
  selectedArea: "auto",
  audience: "mixed",
  index: 0,
  asked: [],
  scores: {},
  questions: [],
};

const screens = document.querySelectorAll(".screen");
const startForm = document.querySelector("#startForm");
const profileInput = document.querySelector("#profile");
const segmentInput = document.querySelector("#segment");
const areaInput = document.querySelector("#area");
const audienceInput = document.querySelector("#audience");
const problemInput = document.querySelector("#problem");
const stepLabel = document.querySelector("#stepLabel");
const progressBar = document.querySelector("#progressBar");
const questionText = document.querySelector("#questionText");
const questionCategory = document.querySelector("#questionCategory");
const contextLine = document.querySelector("#contextLine");
const historyList = document.querySelector("#historyList");
const answerButtons = document.querySelectorAll("[data-answer]");

function stripAccents(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function detectArea(problem, selectedArea) {
  if (selectedArea !== "auto") return selectedArea;
  const text = stripAccents(problem);
  const ranked = Object.entries(areaKeywords)
    .map(([area, keywords]) => ({
      area,
      score: keywords.reduce((sum, keyword) => sum + (text.includes(keyword) ? 1 : 0), 0),
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
  if (state.area === "commercial") {
    state.scores.funnel += 2;
    state.scores.offer += 1.5;
    state.scores.market += 1.5;
    state.scores.input += 1;
    state.scores.measurement += 1;
  }

  if (state.area === "service") {
    state.scores.customer += 2;
    state.scores.method += 1.5;
    state.scores.people += 1;
  }

  if (state.area === "operations" || state.area === "product") {
    state.scores.method += 1.5;
    state.scores.input += 1.5;
    state.scores.measurement += 1;
  }

  if (state.audience === "b2b") {
    state.scores.offer += 0.5;
    state.scores.customer += 0.5;
  }

  const text = stripAccents(state.problem);
  if (text.includes("venda") || text.includes("performance") || text.includes("meta")) {
    state.scores.funnel += 1;
    state.scores.offer += 1;
    state.scores.market += 1;
  }
  if (text.includes("reclam") || text.includes("cliente")) state.scores.customer += 1;
  if (text.includes("atras") || text.includes("entrega")) state.scores.method += 1;
  if (text.includes("defeito") || text.includes("falha")) state.scores.input += 1;
}

function buildQuestionSet() {
  const base = questionBank.filter((question) => question.areas.includes(state.area));
  const generic = questionBank.filter(
    (question) =>
      !question.areas.includes(state.area) &&
      ["measurement", "tools", "people", "method"].includes(question.category),
  );
  const segmentSpecific = makeSegmentQuestions(state.segment, state.area);
  const unique = [...segmentSpecific, ...base, ...generic].filter(
    (question, index, all) => all.findIndex((candidate) => candidate.text === question.text) === index,
  );
  return unique;
}

function currentQuestion() {
  return state.questions[state.index];
}

function answerWeight(answer, reverse) {
  const base = {
    yes: 3,
    partial: 1.5,
    no: -1,
    unknown: 0,
  }[answer];
  return reverse ? -base : base;
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

function recentlyAskedSameCategory(category) {
  const recent = state.asked.slice(-2);
  return recent.length >= 2 && recent.every((item) => item.category === category);
}

function nextQuestionIndex() {
  const askedIndexes = new Set(state.asked.map((item) => item.index));
  const rankedCategories = Object.entries(state.scores)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);

  for (const category of rankedCategories) {
    if (categoryAskedCount(category) >= 3 || recentlyAskedSameCategory(category)) continue;
    const targeted = state.questions.findIndex(
      (question, index) => !askedIndexes.has(index) && question.category === category,
    );
    if (targeted !== -1) return targeted;
  }

  return state.questions.findIndex((question, index) => {
    return !askedIndexes.has(index) && !recentlyAskedSameCategory(question.category);
  });
}

function renderQuestion() {
  const question = currentQuestion();
  stepLabel.textContent = `Pergunta ${state.asked.length + 1}`;
  questionText.textContent = question.text;
  questionCategory.textContent = `${categories[question.category].fishbone}: ${categories[question.category].title}`;
  contextLine.textContent = `${areaLabels[state.area]} | ${segmentLabels[state.segment]} | ${audienceLabels[state.audience]}`;
  progressBar.style.width = `${Math.min(100, (state.asked.length / MAX_QUESTIONS) * 100)}%`;
  renderHistory();
}

function renderHistory() {
  const recent = state.asked.slice(-4);
  historyList.innerHTML = recent
    .map((item) => `<li><strong>${labelAnswer(item.answer)}:</strong> ${item.text}</li>`)
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
    state.scores[category] += 0.35;
  });
}

function handleAnswer(answer) {
  const question = currentQuestion();
  const primaryWeight = answerWeight(answer, question.reverse);
  state.scores[question.category] += primaryWeight;
  applyRelatedScore(question, answer, primaryWeight);

  state.asked.push({
    index: state.index,
    text: question.text,
    answer,
    category: question.category,
    evidence: question.evidence,
    positive: primaryWeight > 0,
  });

  if (shouldFinish()) {
    renderResult();
    showScreen("result");
    return;
  }

  const nextIndex = nextQuestionIndex();
  state.index = nextIndex === -1 ? 0 : nextIndex;
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
  const fallback = state.asked.filter((item) => item.positive);
  return (positives.length ? positives : fallback).slice(0, 5).map((item) => item.evidence);
}

function resultIntro(diagnosis, secondary) {
  if (state.area === "commercial") {
    return `${diagnosis.summary} Tambem vale verificar: ${secondary.join(" e ")}. Para este caso comercial, o plano deve olhar para entrada de oportunidades, rotina de acompanhamento, clareza da oferta, canais e comportamento do cliente.`;
  }
  return `${diagnosis.summary} Tambem vale verificar: ${secondary.join(" e ")}. O plano deve priorizar evidencias observaveis, responsavel claro e acompanhamento ate confirmar a causa real.`;
}

function renderResult() {
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
  const categoryKey = topCategoryKey();
  const diagnosis = categories[categoryKey];
  const secondary = secondaryCategories(categoryKey);
  const evidence = buildEvidence(categoryKey).map((item) => `- ${item}`).join("\n");
  const plan = diagnosis.plan;
  const strength = hypothesisStrength();

  return `O Investigador da Qualidade

Perfil: ${state.profile}
Segmento: ${segmentLabels[state.segment]}
Area: ${areaLabels[state.area]}
Publico afetado: ${audienceLabels[state.audience]}
Problema: ${state.problem}

Causa raiz provavel: ${diagnosis.title}
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

function resetApp() {
  state.profile = "";
  state.problem = "";
  state.segment = "generic";
  state.area = "operations";
  state.selectedArea = "auto";
  state.audience = "mixed";
  state.index = 0;
  state.asked = [];
  state.questions = [];
  resetScores();
  startForm.reset();
  showScreen("home");
}

startForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.profile = profileInput.value;
  state.segment = segmentInput.value;
  state.selectedArea = areaInput.value;
  state.audience = audienceInput.value;
  state.problem = problemInput.value.trim();
  if (!state.problem) return;

  resetScores();
  state.area = detectArea(state.problem, state.selectedArea);
  state.questions = buildQuestionSet();
  seedScores();
  state.index = nextQuestionIndex();
  if (state.index === -1) state.index = 0;
  renderQuestion();
  showScreen("investigation");
});

answerButtons.forEach((button) => {
  button.addEventListener("click", () => handleAnswer(button.dataset.answer));
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

resetScores();
