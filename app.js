const MAX_QUESTIONS = 12;
const MIN_QUESTIONS = 6;

const categories = {
  process: {
    title: "Processo instável",
    summary:
      "O problema parece nascer de etapas pouco padronizadas, responsabilidades pouco claras ou variação na execução.",
    metrics: ["Taxa de retrabalho", "Tempo de ciclo", "Erros por etapa", "Cumprimento do procedimento"],
    plan: {
      what: "Mapear o fluxo real do problema e padronizar a etapa crítica.",
      why: "Reduzir variação e impedir que cada pessoa execute de um jeito diferente.",
      where: "Na etapa onde o erro, atraso ou reclamação aparece com mais frequência.",
      when: "Começar em até 48 horas e revisar depois de 7 dias.",
      who: "Responsável da área com participação de quem executa a rotina.",
      how: "Desenhar o processo, remover ambiguidades, criar checklist simples e treinar a equipe.",
      howMuch: "Baixo custo inicial; exige tempo de observação, reunião curta e acompanhamento diário.",
    },
  },
  training: {
    title: "Falha de treinamento ou orientação",
    summary:
      "As respostas indicam que as pessoas podem não ter recebido instrução clara, prática suficiente ou critérios objetivos de qualidade.",
    metrics: ["Erros por pessoa ou turno", "Horas de treinamento", "Dúvidas registradas", "Aderência ao checklist"],
    plan: {
      what: "Criar orientação prática para a tarefa crítica.",
      why: "Diminuir erros causados por interpretação, improviso ou falta de domínio.",
      where: "Na rotina onde a pessoa toma a decisão ou executa a atividade.",
      when: "Treinar imediatamente novos envolvidos e reciclar a equipe atual nesta semana.",
      who: "Líder da área, apoio da Qualidade e pessoas experientes do processo.",
      how: "Usar exemplos reais, checklist visual, simulação rápida e validação por observação.",
      howMuch: "Baixo a médio custo, dependendo do tempo de equipe parado para treinamento.",
    },
  },
  measurement: {
    title: "Falta de medição e controle",
    summary:
      "O problema pode estar crescendo porque não há dados suficientes para detectar desvio cedo e agir antes da reclamação.",
    metrics: ["Ocorrências por semana", "Tempo até detectar o problema", "Reincidência", "Custo da não qualidade"],
    plan: {
      what: "Definir indicadores simples e rotina de verificação.",
      why: "Tornar o problema visível e permitir ação antes que vire perda ou reclamação.",
      where: "No ponto de controle mais próximo da origem provável.",
      when: "Implantar medição piloto por 14 dias.",
      who: "Gestor da área com dono claro para registrar e revisar os dados.",
      how: "Criar formulário curto, classificar causas, revisar diariamente e atacar os maiores ofensores.",
      howMuch: "Baixo custo; pode começar com planilha ou formulário simples.",
    },
  },
  supplier: {
    title: "Variação de fornecedor ou entrada",
    summary:
      "Há indícios de que o problema chega antes da execução interna, vindo de material, informação, pedido ou fornecedor.",
    metrics: ["Defeitos por fornecedor", "Atrasos de entrada", "Lotes reprovados", "Divergências no recebimento"],
    plan: {
      what: "Controlar entradas críticas e alinhar critérios com fornecedores ou origem da demanda.",
      why: "Evitar que uma entrada ruim contamine o processo inteiro.",
      where: "Recebimento, briefing, pedido, cadastro ou início da operação.",
      when: "Aplicar bloqueio de verificação a partir do próximo lote ou solicitação.",
      who: "Compras, atendimento, operação e responsável pelo fornecedor ou entrada.",
      how: "Definir critério de aceite, registrar não conformidades e negociar correção na origem.",
      howMuch: "Pode variar; custo inicial baixo, custo maior se exigir troca de fornecedor.",
    },
  },
  tools: {
    title: "Ferramenta, sistema ou infraestrutura inadequada",
    summary:
      "A causa mais provável envolve equipamento, sistema, layout, acesso ou recurso que dificulta a execução correta.",
    metrics: ["Paradas de sistema", "Tempo perdido por falha", "Chamados técnicos", "Erros por ferramenta"],
    plan: {
      what: "Corrigir ou contornar o recurso que impede a execução estável.",
      why: "Reduzir dependência de improviso e falhas repetidas.",
      where: "No equipamento, sistema, canal ou posto de trabalho associado ao problema.",
      when: "Criar contenção imediata e plano definitivo em até 15 dias.",
      who: "Responsável técnico, gestor da área e usuários que sofrem a falha.",
      how: "Registrar falhas, priorizar impacto, aplicar manutenção, automação, ajuste de acesso ou substituição.",
      howMuch: "Médio a alto se houver compra ou desenvolvimento; baixo se for ajuste operacional.",
    },
  },
  customer: {
    title: "Expectativa ou comunicação desalinhada",
    summary:
      "O problema pode estar ligado a promessa, entendimento, uso do produto/serviço ou comunicação incompleta com o cliente.",
    metrics: ["Reclamações por motivo", "Promessas não cumpridas", "Dúvidas recorrentes", "NPS ou satisfação"],
    plan: {
      what: "Ajustar comunicação, promessa e confirmação de expectativa.",
      why: "Evitar que o cliente espere algo diferente do que será entregue.",
      where: "Venda, atendimento, contrato, instruções de uso ou pós-venda.",
      when: "Atualizar mensagens críticas imediatamente e revisar em 7 dias.",
      who: "Atendimento, comercial, operação e responsável pela experiência do cliente.",
      how: "Reescrever promessas, confirmar entendimento, criar FAQ curto e monitorar motivos de contato.",
      howMuch: "Baixo custo inicial; exige revisão de mensagens, treinamento e acompanhamento.",
    },
  },
};

const questions = [
  {
    text: "O problema acontece mais em uma etapa específica do processo?",
    category: "process",
    evidence: "O problema se concentra em uma etapa do fluxo.",
  },
  {
    text: "Pessoas diferentes executam essa atividade de formas diferentes?",
    category: "process",
    evidence: "Há variação na forma de executar a rotina.",
  },
  {
    text: "Existe um procedimento simples e atualizado para essa atividade?",
    category: "process",
    reverse: true,
    evidence: "O procedimento pode estar ausente, antigo ou pouco claro.",
  },
  {
    text: "A equipe recebeu treinamento prático sobre esse problema?",
    category: "training",
    reverse: true,
    evidence: "O treinamento prático pode não ter sido suficiente.",
  },
  {
    text: "O erro aumenta quando entra gente nova ou substituta?",
    category: "training",
    evidence: "O problema aumenta com troca ou entrada de pessoas.",
  },
  {
    text: "Existe algum indicador acompanhando esse problema toda semana?",
    category: "measurement",
    reverse: true,
    evidence: "Falta acompanhamento frequente do problema.",
  },
  {
    text: "Vocês conseguem identificar quando o problema começou?",
    category: "measurement",
    reverse: true,
    evidence: "A origem temporal do problema ainda é pouco visível.",
  },
  {
    text: "O problema aparece depois de receber material, informação ou pedido de fora?",
    category: "supplier",
    evidence: "A falha pode vir de uma entrada externa.",
  },
  {
    text: "O problema acontece mais com um fornecedor, canal ou tipo de pedido?",
    category: "supplier",
    evidence: "Existe concentração em fornecedor, canal ou tipo de entrada.",
  },
  {
    text: "Alguma ferramenta, sistema ou equipamento falha durante a rotina?",
    category: "tools",
    evidence: "Ferramenta, sistema ou equipamento pode estar prejudicando a execução.",
  },
  {
    text: "A equipe precisa improvisar porque falta recurso para fazer certo?",
    category: "tools",
    evidence: "A execução correta depende de improviso ou recurso insuficiente.",
  },
  {
    text: "O cliente entende claramente o que será entregue e em qual prazo?",
    category: "customer",
    reverse: true,
    evidence: "Pode haver desalinhamento de expectativa com o cliente.",
  },
  {
    text: "As reclamações se repetem mesmo quando a entrega segue o processo interno?",
    category: "customer",
    evidence: "A expectativa externa pode estar diferente do padrão interno.",
  },
  {
    text: "O problema é percebido tarde demais para corrigir antes de chegar ao cliente?",
    category: "measurement",
    evidence: "A detecção acontece tarde demais.",
  },
  {
    text: "A mesma falha já voltou depois de uma correção anterior?",
    category: "process",
    evidence: "A correção anterior pode ter tratado sintoma, não causa raiz.",
  },
];

const state = {
  profile: "",
  problem: "",
  index: 0,
  asked: [],
  scores: Object.fromEntries(Object.keys(categories).map((key) => [key, 0])),
};

const screens = document.querySelectorAll(".screen");
const startForm = document.querySelector("#startForm");
const profileInput = document.querySelector("#profile");
const problemInput = document.querySelector("#problem");
const stepLabel = document.querySelector("#stepLabel");
const progressBar = document.querySelector("#progressBar");
const questionText = document.querySelector("#questionText");
const questionCategory = document.querySelector("#questionCategory");
const historyList = document.querySelector("#historyList");
const answerButtons = document.querySelectorAll("[data-answer]");

function showScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });
}

function currentQuestion() {
  return questions[state.index];
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
    no: "Não",
    partial: "Parcialmente",
    unknown: "Não sei",
  }[answer];
}

function confidence() {
  const values = Object.values(state.scores);
  const top = Math.max(...values, 0);
  const total = values.reduce((sum, value) => sum + Math.max(value, 0), 0) || 1;
  return Math.min(92, Math.round((top / total) * 100));
}

function shouldFinish() {
  return (
    state.asked.length >= MAX_QUESTIONS ||
    (state.asked.length >= MIN_QUESTIONS && confidence() >= 68)
  );
}

function nextQuestionIndex() {
  const askedIndexes = new Set(state.asked.map((item) => item.index));
  const topCategory = Object.entries(state.scores).sort((a, b) => b[1] - a[1])[0]?.[0];
  const targeted = questions.findIndex(
    (question, index) => !askedIndexes.has(index) && question.category === topCategory,
  );
  if (targeted !== -1 && state.asked.length >= 3) return targeted;
  return questions.findIndex((_, index) => !askedIndexes.has(index));
}

function renderQuestion() {
  const question = currentQuestion();
  stepLabel.textContent = `Pergunta ${state.asked.length + 1}`;
  questionText.textContent = question.text;
  questionCategory.textContent = categories[question.category].title;
  progressBar.style.width = `${Math.min(100, (state.asked.length / MAX_QUESTIONS) * 100)}%`;
  renderHistory();
}

function renderHistory() {
  const recent = state.asked.slice(-4);
  historyList.innerHTML = recent
    .map((item) => `<li><strong>${labelAnswer(item.answer)}:</strong> ${item.text}</li>`)
    .join("");
}

function handleAnswer(answer) {
  const question = currentQuestion();
  state.scores[question.category] += answerWeight(answer, question.reverse);
  if (answer === "unknown") state.scores.measurement += 0.5;

  state.asked.push({
    index: state.index,
    text: question.text,
    answer,
    category: question.category,
    evidence: question.evidence,
    positive: answerWeight(answer, question.reverse) > 0,
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

function buildEvidence(categoryKey) {
  const positives = state.asked.filter((item) => item.category === categoryKey && item.positive);
  const fallback = state.asked.filter((item) => item.positive);
  return (positives.length ? positives : fallback).slice(0, 5).map((item) => item.evidence);
}

function renderResult() {
  const categoryKey = topCategoryKey();
  const diagnosis = categories[categoryKey];
  const evidence = buildEvidence(categoryKey);
  const plan = diagnosis.plan;

  document.querySelector("#confidenceLabel").textContent = `${confidence()}% de confiança`;
  document.querySelector("#rootCauseTitle").textContent = diagnosis.title;
  document.querySelector("#rootCauseText").textContent = diagnosis.summary;
  document.querySelector("#evidenceList").innerHTML = evidence.map((item) => `<li>${item}</li>`).join("");
  document.querySelector("#metricList").innerHTML = diagnosis.metrics
    .map((metric) => `<li>${metric}</li>`)
    .join("");
  document.querySelector("#actionPlan").innerHTML = [
    ["O quê", plan.what],
    ["Por quê", plan.why],
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
  const evidence = buildEvidence(categoryKey).map((item) => `- ${item}`).join("\n");
  const plan = diagnosis.plan;

  return `O Investigador da Qualidade

Perfil: ${state.profile}
Problema: ${state.problem}

Causa raiz provável: ${diagnosis.title}
Confiança: ${confidence()}%

Resumo:
${diagnosis.summary}

Evidências:
${evidence}

Plano 5W2H:
O quê: ${plan.what}
Por quê: ${plan.why}
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
  state.index = 0;
  state.asked = [];
  state.scores = Object.fromEntries(Object.keys(categories).map((key) => [key, 0]));
  startForm.reset();
  showScreen("home");
}

startForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.profile = profileInput.value;
  state.problem = problemInput.value.trim();
  if (!state.problem) return;
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
  document.querySelector("#copyReport").textContent = "Diagnóstico copiado";
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
