# FASE 1 — Auditoria completa do sistema existente

Data: 2026-07-19  
Repositorio auditado: `investigador-da-qualidade`  
Commit base observado: `e8d6b19 Add production hypothesis space engine v2`

## 1. Escopo e criterio

Esta auditoria atende ao Prompt Mestre de Reconstrucao do CAUSA REAL. O objetivo desta fase e mapear o sistema existente antes de qualquer nova codificacao estrutural, identificando:

- modulos existentes;
- fluxo de dados;
- pontos de decisao;
- uso de keyword matching;
- arvores fixas;
- scores artificiais;
- hardcodes;
- conflitos com os principios inegociaveis do Prompt Mestre.

Regra de conduta aplicada: nenhum codigo de motor foi alterado nesta fase. O unico entregavel criado e este documento.

## 2. Inventario do repositorio

Arquivos principais:

- `index.html`: UI estatica, formulario inicial, tela de pergunta, historico e resultado.
- `app.js`: aplicacao principal, motor V1, ponte para Engine V2, UI, relatorio e exports para testes.
- `styles.css`: estilos da interface e painel debug.
- `engine-v2/`: motor modular criado anteriormente para piloto industrial.
- `tests/`: testes unitarios/regressivos e scripts de debug.
- `docs/INVESTIGATION_ENGINE.md`: documentacao historica do motor atual/V2.

Estrutura do Engine V2 atual:

- `engine-v2/phenomenonClassifier.js`
- `engine-v2/hypothesisEngine.js`
- `engine-v2/questionSelector.js`
- `engine-v2/informationGain.js`
- `engine-v2/evidenceEngine.js`
- `engine-v2/contradictionEngine.js`
- `engine-v2/stoppingRules.js`
- `engine-v2/knowledgeBase/productionFailure.js`
- `engine-v2/index.js`

## 3. Arquitetura atual observada

### 3.1 UI e carregamento

`index.html` carrega scripts do Engine V2 antes de `app.js`, expondo o V2 no navegador por globais:

- `index.html:155-164` carrega `engine-v2/*` e depois `app.js`.

A interface e simples e reaproveitavel: formulario inicial, pergunta atual, respostas, historico e resultado. Este componente pode ser preservado como casca visual, desde que o motor futuro entregue perguntas e estado por contrato.

### 3.2 Ponte V2/V1

`app.js` define:

- `app.js:3-13`: importa/resolve `engineV2` e define `INVESTIGATION_ENGINE_V2`.
- `app.js:1660`: `shouldUseEngineV2()`.
- `app.js:1736-1753`: em `beginInvestigation`, tenta iniciar V2; se `v2Session.supported`, sincroniza estado e retorna a pergunta V2.
- `app.js:1755+`: se V2 nao suporta, cai para o fluxo V1.

Conclusao: existe um strangler pattern parcial, mas nao ha roteamento por contrato de investigacao novo. O `app.js` continua sendo monolitico e sabe demais sobre ambos os motores.

### 3.3 Motor V1

O V1 esta concentrado em `app.js`:

- taxonomia/rotas: `classificationTargets` em `app.js:92`;
- keywords de area: `areaKeywords` em `app.js:158`;
- categorias/diagnosticos/planos: `categories` em `app.js:226`;
- banco de perguntas: `questionBank` em `app.js:373`;
- perguntas por rota fixa: `investigationRouteQuestions` em `app.js:784`;
- estado global mutavel: `state` em `app.js:1277`;
- classificacao inicial: `classifyProblem()` em `app.js:1361`;
- roteamento por confianca: `routeInvestigation()` em `app.js:1540`;
- deteccao de area por keyword: `detectArea()` em `app.js:1563`;
- construcao do conjunto de perguntas: `buildQuestionSet()` em `app.js:1630`;
- selecao de proxima pergunta: `selectNextQuestionIndex()` em `app.js:2033`;
- resposta e mutacao de estado: `recordAnswer()` em `app.js:2417`;
- conclusao e relatorio: `renderResult()` em `app.js:2571`, `buildReport()` em `app.js:2604`.

### 3.4 Engine V2 atual

O V2 atual e modular, mas ainda nao segue o Prompt Mestre novo:

- `phenomenonClassifier.js:18`: classifica fenomeno a partir do texto inicial.
- `phenomenonClassifier.js:25-29`, `41`, `53`, `65`, `77`, `89`, `101`: usa regex/keywords para detectar contexto industrial e fenomenos.
- `productionFailure.js:7`: lista hipoteses iniciais.
- `productionFailure.js:82`: pergunta de enquadramento industrial.
- `productionFailure.js:148`: banco de perguntas discriminatorias.
- `productionFailure.js:155+`: `answerEffects` predefinidos.
- `productionFailure.js:288`: drill-down fixo para sub-hipoteses de maquina/ferramental.
- `informationGain.js:36`: calcula ganho de informacao sobre pesos.
- `questionSelector.js:23`: seleciona pergunta, incluindo pergunta de framing.
- `questionSelector.js:44-52`: prioriza pergunta de evidencia quando elegivel.
- `stoppingRules.js:25`: decide parada.
- `index.js:157-177`: conclui e cria diagnostico quando `shouldStop()` retorna verdadeiro.
- `index.js:228`: `buildDiagnosis()`.

Conclusao: o V2 e mais modular que o V1, mas ainda e um motor de reducao de hipoteses predefinidas, com pesos e thresholds, mais proximo do paradigma que o Prompt Mestre agora rejeita como motor principal.

## 4. Fluxo de uma conversa hoje

### 4.1 Fluxo V2 quando suportado

1. Usuario envia problema no formulario.
2. `beginInvestigation()` chama `engineV2.beginInvestigation()` se a flag permitir (`app.js:1736-1744`).
3. `phenomenonClassifier` detecta suporte por regex/keywords (`engine-v2/phenomenonClassifier.js:18-118`).
4. `hypothesisEngine.createSession()` cria pesos iniciais (`engine-v2/hypothesisEngine.js:49-88`).
5. `questionSelector.selectQuestion()` escolhe pergunta por framing ou information gain (`engine-v2/questionSelector.js:23-66`).
6. Resposta do usuario chama `recordAnswerV2()` (`app.js:2382`).
7. `engineV2.answer()` aplica efeitos, evidencia, contradicoes e parada (`engine-v2/index.js:151-184`).
8. Se parar, `buildDiagnosis()` gera diagnostico e plano (`engine-v2/index.js:228-264`).

### 4.2 Fluxo V1 quando V2 nao suporta

1. `classifyProblem()` usa regex para classificar rota (`app.js:1361-1537`).
2. `routeInvestigation()` escolhe rota por `confianca_classificacao` (`app.js:1540-1559`).
3. `buildQuestionSet()` monta perguntas por area, categoria e rota (`app.js:1630-1652`).
4. `selectNextQuestionIndex()` escolhe pergunta por elegibilidade e score (`app.js:2033-2051`).
5. `recordAnswer()` muta scores/fatos/hipoteses (`app.js:2417-2510`).
6. `shouldFinish()` usa quantidade de perguntas + `confidence()` para encerrar (`app.js:1871` e `app.js:1823`).
7. `renderResult()` usa categoria vencedora para causa e plano (`app.js:2571-2598`).

## 5. Pontos de decisao e anti-padroes encontrados

### A1 — Keyword matching como logica de decisao

Evidencias:

- `app.js:1332`: `hasPattern(text, patterns)`.
- `app.js:1364-1399`: classificacao por regex para service, complaint, funnel, conversion, rework, document, product, delay, promise.
- `app.js:1563-1577`: `detectArea()` pontua area por `text.includes(keyword)`.
- `engine-v2/phenomenonClassifier.js:25-29`: contexto industrial por regex/keywords.
- `engine-v2/phenomenonClassifier.js:41-108`: fenomenos industriais por regex/keywords.

Conflito com Prompt Mestre:

- Proibicao absoluta: "`if (problema.includes(...))` ou keyword matching como logica de decisao".
- Principio "Processo primeiro": o sistema deve modelar INPUT -> PROCESS -> OUTPUT esperado -> OUTPUT real -> GAP antes de classificar.

Impacto:

- O sistema continua tentando inferir tipo de problema cedo demais.
- Entradas vagas podem cair em rotas ou perguntas contaminadas por vocabulario, nao por definicao operacional.

Classificacao: **DESCARTAR como logica principal**. Pode ser reaproveitado apenas como heuristica fraca de intake/sugestao, nunca como decisor.

### A2 — Arvores e listas fixas controlam a conversa

Evidencias:

- `app.js:373`: `questionBank` global.
- `app.js:784`: `investigationRouteQuestions` por rota.
- `app.js:1087`: `GENERAL_CAUSAL_INVESTIGATION` com opcoes fixas de efeito.
- `engine-v2/knowledgeBase/productionFailure.js:82`: pergunta de framing fixa.
- `engine-v2/knowledgeBase/productionFailure.js:148`: perguntas industriais fixas.
- `engine-v2/knowledgeBase/productionFailure.js:288`: drill-down fixo por `MACHINE`/`TOOLING`.

Conflito com Prompt Mestre:

- Proibicao: "arvores de decisao fixas gigantes".
- O novo produto deve iniciar por processo e definicao, nao por listas de categoria.

Impacto:

- Mesmo o V2 atual ainda conduz a investigacao a partir de um espaco fechado de hipoteses predefinidas.
- Nao ha criacao de hipoteses a partir de conhecimento das pessoas do processo antes da definicao operacional.

Classificacao: **REFATORAR** como biblioteca de prompts/perguntas/cards, nao como controlador de sequencia.

### A3 — Hipoteses sao criadas antes do gate G1-DEF

Evidencias:

- `engine-v2/hypothesisEngine.js:49-88`: `createSession()` cria `hypothesisWeights` imediatamente.
- `engine-v2/knowledgeBase/productionFailure.js:7`: hipoteses iniciais predefinidas.
- `app.js:1768-1775`: V1 cria `activeHypotheses` logo apos classificacao.

Conflito com Prompt Mestre:

- G1-DEF: nenhum no `HYPOTHESIS` pode ser criado enquanto `operationalDefinition` estiver vazia e `isIsNot.what/when` nao estiverem parcialmente preenchidos.

Impacto:

- O sistema pergunta sobre equipamento/material/operador antes de definir operacionalmente o problema.
- Falha automatica potencial nos golden cases GC1/GC2: "pecas fora da medida" exige caracteristica, nominal, tolerancia, frequencia, inicio, etc. antes de hipoteses causais.

Classificacao: **DESCARTAR/REFATORAR profundamente**. Hipoteses so devem surgir apos gate G1.

### A4 — Nao existe modelo de processo como fonte inicial

Evidencias:

- `app.js:1277-1306`: `state` contem problema, classificacao, rota, fatos, hipoteses e scores, mas nao `ProcessModel`.
- `engine-v2/hypothesisEngine.js:49-88`: sessao V2 contem `context`, `classification`, `hypothesisWeights`, mas nao SIPOC/process steps/detection points.
- Busca por `ProcessModel` retorna apenas documentacao do Prompt Mestre/anexo, nao implementacao.

Conflito com Prompt Mestre:

- Principio 1: "Processo primeiro".
- Modelo de estado exige `ProcessModel` com inputs, steps, expectedOutput, actualOutput, detectionPoints, containmentPoints e people.

Impacto:

- O sistema nao pergunta primeiro "qual processo?", "qual saida esperada?", "qual saida real?", "onde detecta?", "quem executa/inspeciona/mantem?".
- Sem processo, perguntas podem parecer inteligentes, mas nao ficam ancoradas no trabalho real.

Classificacao: **IMPLEMENTAR novo nucleo**. Nao ha componente existente suficiente.

### A5 — Nao existe event sourcing nem eventos imutaveis

Evidencias:

- `app.js:1277`: estado global mutavel unico.
- `app.js:2244`: `registerFacts()` altera arrays/objetos diretamente.
- `app.js:2417`: `recordAnswer()` muta `state` diretamente.
- `engine-v2/index.js:115-146`: `answer()` muta `session` diretamente.
- `engine-v2/hypothesisEngine.js:95-108`: `enterSubspace()` muta `session.subspace`.

Conflito com Prompt Mestre:

- Camada 1: estado e eventos com event sourcing.
- Todo turno deve produzir eventos imutaveis e estado atual deve ser projecao dos eventos.

Impacto:

- Nao ha replay confiavel.
- Decision log e auditoria ficam incompletos.
- Dificil provar que o LLM/usuario nao "inventou" fatos ou que um fato foi corrigido sem apagar historico.

Classificacao: **DESCARTAR estado atual como fonte da verdade**; manter apenas como adaptador temporario de UI.

### A6 — Fatos nao seguem schema, grau de evidencia ou fonte robusta

Evidencias:

- `app.js:1297-1298`: `confirmedFacts` e `confirmedFactDetails` sao arrays/objetos simples.
- `app.js:2244-2252`: `registerFacts()` grava `questionId`, `answer`, `evidence`, mas nao `grade`, `source.type`, `obtainedAt`, `relatesTo`.
- `app.js:1411`: `initialFacts` sao criados pela classificacao, sem fonte do usuario estruturada como Fact.
- `engine-v2/evidenceEngine.js:21-35`: registra eventos de evidencia e supportingEvidence textual, mas nao `EvidenceGrade`.

Conflito com Prompt Mestre:

- Toda informacao tem fonte e grau: OPINIAO < RELATO < REGISTRO < MEDICAO < TESTE_CONTROLADO.
- G4-PROMO depende de grau de evidencia.
- G9-FONTE: afirmacao causal sem evidencia entra como opiniao/relato e dispara pedido de evidencia.

Impacto:

- O sistema nao consegue diferenciar "acho que" de medicao real.
- Pode sustentar conclusoes com evidencias fracas.

Classificacao: **REFATORAR** para `Fact` e `EvidenceRequest` versionados.

### A7 — Decision log nativo nao existe

Evidencias:

- `app.js:1304`: existe `debugEvents`.
- `app.js:1784-1790`, `app.js:2502`: registra eventos de debug/transicao.
- `engine-v2/hypothesisEngine.js:79-86`, `engine-v2/index.js:139-147`: registra `debugEvents`.
- Busca por `DecisionLog`/`decisionLog` nao encontra implementacao real.

Conflito com Prompt Mestre:

- G7-EXPL: toda pergunta emitida exige `DecisionLogEntry` com `rationale` antes do envio.
- Camada de explicabilidade nativa.

Impacto:

- Ha explicacoes em campos como `reasonForQuestion`, mas nao ha log formal com `kind`, `triggeredByRule`, `stateEventRef`.
- O sistema nao consegue responder de forma auditavel "por que voce perguntou isso?".

Classificacao: **IMPLEMENTAR novo componente**. `debugEvents` pode inspirar, mas nao substitui decision log.

### A8 — Scores e confiancas artificiais controlam conclusao

Evidencias:

- `app.js:1336`: `scoreClassification()` limita score de classificacao arbitrario.
- `app.js:1540`: `routeInvestigation()` usa threshold `>= 0.8`.
- `app.js:1587-1626`: `seedScores()` soma pesos manuais por rota.
- `app.js:1823`: `confidence()` calcula percentual interno por scores de categorias.
- `app.js:1847`: `hypothesisStrength()` rotula hipotese por `confidence()`.
- `engine-v2/phenomenonClassifier.js:47`, `59`, `71`, `83`, `95`, `107`: confiancas fixas por padrao detectado.
- `engine-v2/knowledgeBase/productionFailure.js:155+`: `answerEffects` manuais alteram pesos.
- `engine-v2/stoppingRules.js:25-39`: conclusao por thresholds de pesos/evidencias.

Conflito com Prompt Mestre:

- Proibicao: scores numericos de confianca gerados por LLM apresentados como probabilidade.
- G4-PROMO exige gates por evidencia, nao score.
- Decisao metodologica deve usar VOI e gates, nao confianca de categoria.

Impacto:

- O sistema pode parecer quantitativo sem base estatistica.
- Pesos sao heuristicas de produto, nao probabilidades auditaveis.

Classificacao: **REFATORAR**. Pode manter "prioridade ordinal" interna, mas nao como probabilidade/confianca causal.

### A9 — Conclusao e plano podem ocorrer sem gates de promocao

Evidencias:

- `app.js:1871`: `shouldFinish()` encerra por numero de perguntas, confidence e categorias.
- `app.js:2571-2598`: `renderResult()` mostra `Causa raiz provavel` por categoria vencedora.
- `app.js:2604-2681`: `buildReport()` escreve `Causa raiz provavel`.
- `engine-v2/stoppingRules.js:29-39`: parada por quantidade, evidencia, contradicoes e peso.
- `engine-v2/index.js:228-264`: `buildDiagnosis()` gera titulo, summary e 5W2H.

Conflito com Prompt Mestre:

- G4-PROMO: causa provavel exige fato grau >= REGISTRO + no MECHANISM articulado.
- G6-SOL: acao corretiva/preventiva so apos causa provavel ou superior; contencao e excecao.
- Solution engine requer `addressesCause` e robustez.

Impacto:

- Relatorios podem recomendar plano 5W2H com base em categorias/hipoteses fortes, nao em causa promovida por evidencia.
- Nao ha distincao formal entre contencao, correcao, corretiva e preventiva.

Classificacao: **DESCARTAR fluxo de conclusao atual como motor**. UI de resultado pode ser reaproveitada.

### A10 — "Nao sei" nao vira EvidenceRequest formal

Evidencias:

- `app.js:2120-2123`: `applyRelatedScore()` em `unknown` soma medicao.
- `app.js:2326-2331`: `factsForAnswer()` retorna fatos de unknown se definidos, mas nao cria EvidenceRequest.
- `engine-v2/knowledgeBase/productionFailure.js`: varios `unknown` em `answerEffects`, em geral sem EvidenceRequest.
- Busca por `EvidenceRequest` nao encontra implementacao de schema/evento.

Conflito com Prompt Mestre:

- G5-NAOSEI: resposta "nao sei" cria EvidenceRequest ou lacuna; proibido inferir.

Impacto:

- "Nao sei" pode alterar scores, mas nao gera pendencia verificavel.
- O sistema perde uma das principais virtudes esperadas: dizer exatamente o que precisa ser observado/medido.

Classificacao: **IMPLEMENTAR novo comportamento**.

### A11 — Base de conhecimento ainda esta codificada em JavaScript

Evidencias:

- `engine-v2/knowledgeBase/productionFailure.js:7-368`: hipoteses, perguntas, efeitos, drill-down e labels em JS.
- Nao existe diretorio `knowledge/methods/*.md` ou `knowledge/domains/*.md`.

Conflito com Prompt Mestre:

- Base de conhecimento deve ser cards versionados em `knowledge/`, com front-matter YAML.
- Metodologias e dominios devem ser adicionaveis por cards, nao por alteracao de motor.

Impacto:

- Expandir dominios exige mexer no codigo.
- Conhecimento tecnico fica misturado com politica de orquestracao.

Classificacao: **REFATORAR para cards**.

### A12 — Harness de avaliacao do Prompt Mestre nao existe

Evidencias:

- `tests/engine.test.js`, `tests/service-failure-technical-gap.test.js`, `tests/engine-v2-production.test.js` sao testes determinísticos de funcoes/fluxos.
- `tests/engine-v2-production.test.js:28-89` cobre somente regressao curta de "Falhas na producao".
- Nao ha `golden cases`, respondente simulado, transcricoes completas, baseline motor antigo x novo, ou rubrica.
- Busca por `golden`, `GC1`, `baseline`, `simulado`, `harness` nao encontra implementacao real.

Conflito com Prompt Mestre:

- Seção 9 exige harness antes do motor novo.
- Fase 6 deve rodar baseline contra motor atual.
- Nada entra em producao sem harness.

Impacto:

- O V2 anterior foi implementado antes do harness exigido pelo Prompt Mestre.
- Nao ha medicao automatica das metricas criticas: hipotese antes de G1, causa sem G4, pergunta sem decision log, fato alucinado, "nao sei" sem EvidenceRequest.

Classificacao: **IMPLEMENTAR antes de qualquer nova migracao**.

## 6. Componentes a preservar / refatorar / descartar

| Componente | Decisao | Justificativa |
|---|---|---|
| UI estatica (`index.html`, partes de `styles.css`) | REAPROVEITAR | Boa casca visual para perguntas, historico e resultado. Precisa receber estado novo por adaptador. |
| Scripts de teste existentes | REAPROVEITAR como regressao legada | Protegem bugs reais ja encontrados, mas nao substituem harness do Prompt Mestre. |
| `docs/INVESTIGATION_ENGINE.md` | REFATORAR | Documenta V1/V2 antigo; conflita parcialmente com Prompt Mestre. Deve virar documento historico ou ser substituido por arquitetura reconstruida. |
| `app.js` como UI controller | REFATORAR | Deve parar de conter motor; pode virar adaptador UI + renderizacao. |
| `app.js` como motor V1 | DESCARTAR como arquitetura alvo | Monolitico, keyword-driven, sem process model/event sourcing/gates. Manter apenas como baseline ate Fase 15. |
| `engine-v2/*` atual | REFATORAR/DESCARTAR como motor principal | Modular, mas ainda cria hipoteses antes de definicao e usa espaco fechado de hipoteses; pode inspirar separacao de modulos. |
| `engine-v2/knowledgeBase/productionFailure.js` | REFATORAR para cards | Conteudo pode virar domain/method cards, mas nao deve ser JS que controla motor. |
| `questionBank` e `investigationRouteQuestions` | REAPROVEITAR parcialmente como biblioteca historica | Algumas perguntas tem boa linguagem, mas precisam virar candidates/cards com precondicoes e VOI, nao arvore. |
| `debugEvents` | REFATORAR | Ideia boa de rastreabilidade; precisa virar event store + decision log formal. |
| `confirmedFacts` atual | DESCARTAR como schema | Nao tem fonte, grau, timestamp, relatesTo, supersedencia. |
| `buildReport/renderResult` | REFATORAR | UI/relatorio uteis; conteudo deve depender de gates, SolutionSet e effectiveness plan. |

## 7. Conflitos explicitos com o Prompt Mestre

1. O prompt diz: "Nao é um Akinator de causas". O Engine V2 atual foi implementado como `Hypothesis Space Engine`, com reducao de hipoteses por information gain (`engine-v2/index.js`, `questionSelector.js`, `informationGain.js`). Isso conflita com a nova tese: processo primeiro, definicao antes de hipotese.
2. O prompt exige harness antes do novo motor. O repositorio ja contem V2 implementado e teste `tests/engine-v2-production.test.js`; isso inverte a ordem das Fases 6 e 7-10.
3. O prompt proibe keyword matching como logica de decisao. Tanto V1 quanto V2 usam regex/keywords para classificacao inicial.
4. O prompt exige event sourcing; o repositorio usa estado global/sessao mutavel.
5. O prompt exige `DecisionLogEntry` antes de emitir pergunta; o sistema usa `reasonForQuestion`/`debugEvents`, que nao garantem schema nem ponte para evento.
6. O prompt exige gate G1 antes de hipoteses; V1 e V2 criam hipoteses no inicio.
7. O prompt exige G2-MSA antes de mexer no processo em fenomeno medido; nao ha MSA/GR&R implementado.
8. O prompt exige Solution Engine com contencao/correcao/acao corretiva/prevencao/eficacia; o sistema gera plano 5W2H direto.

## 8. Riscos tecnicos atuais

- `app.js` tem responsabilidades demais: UI, estado, motor, relatorio, testes exports e ponte V2.
- Nao ha isolamento claro entre conversa, orquestrador, estado, conhecimento e solucao.
- Nao ha persistencia de investigacao; refresh perde estado.
- Nao ha schemas validados para entrada livre ou eventos.
- Nao ha camada LLM implementada; logo tambem nao ha protecao de "LLM nao decide".
- A feature flag V2 esta no `app.js`, mas o V2 atual nao deveria ser promovido como arquitetura alvo sem Fases 6-14.

## 9. O que deve acontecer na proxima fase

Conforme Prompt Mestre, a proxima fase e:

**FASE 2 — Documentar a arquitetura atual.**

Entregavel esperado: `docs/rebuild/02-arquitetura-atual.md`, com:

- diagrama de componentes;
- fluxo de conversa V1;
- fluxo de conversa V2;
- fronteiras reais entre UI, motor e testes;
- pontos onde a arquitetura atual viola a arquitetura cognitiva alvo.

Antes de qualquer nova codificacao de motor, tambem sera necessario planejar:

- FASE 3: divida tecnica/conceitual com decisao REAPROVEITAR/REFATORAR/DESCARTAR por componente;
- FASE 4: arquitetura alvo instanciada na stack real;
- FASE 5: migracao sem quebrar produto;
- FASE 6: harness de avaliacao e baseline contra motor atual.

## 10. Conclusao da Fase 1

O produto atual contem uma UI aproveitavel, testes de regressao uteis e alguns aprendizados reais sobre perguntas de atendimento/producao. Porem, como motor de investigacao, ele ainda contradiz pontos centrais do Prompt Mestre:

- classifica antes de modelar processo;
- gera hipoteses antes de definicao operacional;
- usa keywords/regex como decisores;
- nao possui event sourcing;
- nao possui Fact/EvidenceRequest/DecisionLog formais;
- conclui por score/threshold, nao por gates de evidencia;
- nao possui harness de avaliacao com golden cases.

Portanto, a recomendacao tecnica desta auditoria e congelar V1 e V2 atuais como **baseline legado**, reaproveitar a UI e testes existentes, e iniciar a reconstrucao real pelas Fases 2-6 antes de implementar qualquer novo motor de causa raiz.
