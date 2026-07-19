# Investigation Engine

## Objetivo

O motor investiga causa raiz a partir de uma descricao curta do problema. Ele nao deve escolher perguntas por palavra-chave isolada. A decisao correta passa por:

```text
INPUT
-> CLASSIFICACAO CAUSAL
-> ROUTER
-> QUESTION ENGINE
-> STATE
-> HIPOTESES
-> CONCLUSAO
```

## Causa tecnica corrigida

Antes da refatoracao, o fluxo era:

```text
problemInput
-> detectArea()
-> buildQuestionSet()
-> seedScores()
-> nextQuestionIndex()
```

O problema era arquitetural: a "linha de investigacao" vinha da categoria da pergunta escolhida, nao de uma classificacao causal. Se a area manual fosse `commercial`, `seedScores()` favorecia `funnel`, e a primeira pergunta podia virar "A queda acontece mais em alguma fase da venda?" mesmo quando o fenomeno real era mau atendimento.

Agora a area e contexto auxiliar. A decisao principal e a rota causal.

## Classification Engine

`classifyProblem(problem, selectedArea)` normaliza o relato e retorna uma estrutura com:

```js
{
  fenomeno,
  dominio,
  subdominio,
  objeto_afetado,
  sintoma,
  evento,
  impacto,
  contexto,
  confianca_classificacao,
  possiveis_linhas,
  route,
  area,
  reason
}
```

Regra central: fenomeno primario nao pode ser confundido com impacto.

Exemplo:

```text
Cliente deixou de comprar porque foi mal atendido.
```

Resultado esperado:

```text
fenomeno: insatisfacao_cliente
dominio: atendimento
impacto: perda_comercial
route: SERVICE_FAILURE
```

## Investigation Router

`routeInvestigation(classification)` aplica confidence gating:

- `>= 0.80`: segue a rota especializada.
- `0.50` a `0.79`: usa desambiguacao antes de travar uma arvore.
- `< 0.50`: usa `GENERAL_CAUSAL_INVESTIGATION`.

Rotas atuais:

- `SERVICE_FAILURE`: reclamacao, mau atendimento, ausencia de retorno, postura, suporte.
- `FUNNEL_COMMERCIAL`: leads, propostas, fechamento, conversao e perda entre etapas comerciais.
- `TECHNICAL_REWORK`: reincidencia, oficina, mesma falha, retrabalho tecnico.
- `DOCUMENT_PROCESS`: nota fiscal, documentos, cadastros e dados incorretos.
- `DELAY`: atraso e demora sem mecanismo claro.
- `GENERAL_CAUSAL_INVESTIGATION`: fallback seguro.

## Question Engine

Perguntas possuem metadados:

```js
{
  id,
  text,
  type,
  category,
  parentQuestionId,
  triggerAnswer,
  triggerFacts,
  triggerAllFacts,
  requiredAsked,
  questionPurpose,
  targetHypothesis,
  expectedInformationGain,
  reasonForQuestion,
  evidence
}
```

Tipos suportados no motor:

- `BOOLEAN`
- `MULTIPLE_CHOICE`
- `TEXT`
- `EVIDENCE_REQUEST`
- `CONFIRMATION`

No app atual, a UI renderiza `BOOLEAN` e `MULTIPLE_CHOICE`. Os demais tipos existem como contrato para expansao controlada.

## State Machine

`state` guarda:

- `originalProblem`
- `normalizedProblem`
- `classification`
- `answers`
- `evidence`
- `activeHypotheses`
- `rejectedHypotheses`
- `confirmedFacts`
- `currentDepth`
- `investigationPath`
- `route`
- `debugEvents`

`getNextQuestion` e representado por `nextQuestionIndex()`. A prioridade e:

1. Perguntas da rota com maior ganho investigativo.
2. Perguntas condicionais ativadas por fatos confirmados.
3. Cobertura dos pilares Pessoas, Produto e Processo.
4. Categorias com maior pontuacao.
5. Fallback sem repetir pergunta.

## Causal Continuity

Cada pergunta precisa responder: "por que estou fazendo esta pergunta agora?"

Cada resposta atualiza:

- `confirmedFacts`
- `confirmedFactDetails`
- `activeHypotheses`
- `rejectedHypotheses`
- `hypothesisScores`
- `debugEvents`

Toda transicao causal registra:

```js
{
  type: "causal_transition",
  parentQuestionId,
  triggerAnswer,
  answeredQuestionId,
  nextQuestionId,
  targetHypothesis,
  reasonForQuestion,
  supportingEvidence,
  scoreDelta,
  investigationPath
}
```

Em `SERVICE_FAILURE`, perguntas sobre promessa, proposta, preco, funil, conversao ou venda ficam bloqueadas sem evidencias como `broken_promise` ou `route_sales`.

Exemplo de continuidade:

```text
tempo de resposta confirmado
+ baixa deteccao de desvios
-> perguntar sobre controle visual, alerta, SLA, responsavel, capacidade ou priorizacao
```

Nao perguntar sobre promessa comercial nesse ponto.

## Service Failure

Para reclamacao de atendimento, a primeira pergunta e de manifestacao:

```text
O que especificamente foi percebido pelo cliente como falha no atendimento?
```

Respostas como `Falta de retorno` criam fatos (`no_return`) e mudam a proxima pergunta:

```text
Havia uma pessoa responsavel por retornar ao cliente?
O responsavel recebeu a solicitacao do cliente?
Existia prazo claro para o retorno ao cliente?
```

Isso evita pular direto para culpa individual. O mecanismo investigado passa a ser responsabilidade, registro, prazo, alerta e controle.

## Ishikawa

Ishikawa e usado como mapa de hipoteses, nao como questionario literal. As categorias ajudam a organizar evidencias:

- Pessoas
- Produto
- Processo

O motor nao deve perguntar "foi mao de obra?" diretamente. Ele chega aos pilares por evidencias coletadas.

## 5 Whys

O motor nao inicia 5 Porques imediatamente. O fluxo correto e:

```text
Evento
-> Sintoma
-> Contexto
-> Mecanismo provavel
-> Evidencias
-> Hipotese dominante
-> 5 Porques
-> Causa sistemica
```

## Debug Interno

`getDebugRoute()` expõe:

- classificacao;
- rota selecionada;
- confidence;
- gate;
- motivo;
- fatos confirmados;
- hipoteses ativas;
- caminho investigativo.

Isso e para desenvolvimento e testes. Nao aparece para o usuario final.

## Fallback Seguro

Se a confianca nao for suficiente, o motor nunca escolhe uma arvore aleatoria. Ele usa:

```text
GENERAL_CAUSAL_INVESTIGATION
```

Pergunta inicial:

```text
Para eu investigar corretamente, qual e o principal efeito observado?
```

## Testes

Rodar:

```bash
node --check app.js
node tests/engine.test.js
node tests/service-debug.js
node tests/causal-continuity-debug.js
```

Regressoes obrigatorias:

- `Cliente reclamou de mau atendimento.` nunca pode cair em funil comercial.
- `Cliente deixou de comprar porque foi mal atendido.` deve separar atendimento como fenomeno e perda comercial como impacto.
- `Estamos recebendo muitos leads, mas poucos viram propostas.` deve cair em funil comercial.
- `Vendemos muitas propostas, mas poucos clientes fecham.` deve cair em funil/conversao.
- `O caminhao voltou para oficina pela mesma falha.` deve cair em retrabalho/falha tecnica.
- `A nota fiscal saiu com dados incorretos.` deve cair em processo documental.
