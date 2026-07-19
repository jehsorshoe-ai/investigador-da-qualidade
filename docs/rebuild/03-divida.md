# Fase 3 - Divida tecnica e conceitual

## 1. Objetivo e regra de classificacao

Este documento consolida a Secao 6 de `01-auditoria.md` e transforma cada decisao de refatoracao em destino verificavel. Nenhum destino listado aqui e implementacao: os cards serao criados apenas na Fase 8, depois do harness e do baseline da Fase 6.

Classificacoes:

- **REAPROVEITAR**: pode permanecer com mudancas pequenas e sem autoridade causal.
- **REFATORAR**: ha valor no comportamento, texto ou separacao, mas o contrato/autoridade precisa mudar.
- **DESCARTAR**: contradiz os principios do Prompt Mestre e nao pode controlar o motor alvo.

Uma classificacao pode separar conteudo de mecanismo. Exemplo: o texto de uma pergunta pode ser refatorado para card enquanto seus `scores` e `answerEffects` sao descartados.

## 2. Criterios inegociaveis usados

As decisoes foram tomadas contra estes principios:

1. processo primeiro;
2. definicao operacional antes de hipotese (G1-DEF);
3. mudanca versus cronico define a rota (G3-ROTA);
4. hipotese nao e causa; promocao depende de evidencia (G4-PROMO);
5. toda informacao possui fonte e grau;
6. `Nao sei` cria lacuna/EvidenceRequest (G5-NAOSEI);
7. observacao e afirmacao causal exigem evidencia (G9-FONTE);
8. proximo passo por valor da informacao versus custo;
9. toda pergunta possui DecisionLogEntry anterior a emissao (G7-EXPL);
10. solucao depende do mecanismo e segue hierarquia de robustez (G6-SOL/G8-ROB).

## 3. Catalogo de destinos candidatos

Os nomes abaixo tornam o destino concreto, mas ainda podem ser ajustados na Fase 4. Eles nao criam arquivos nem fecham o schema dos cards.

### 3.1 Methodology cards

| Id candidato | Arquivo futuro | Papel do conteudo migrado |
|---|---|---|
| `definicao-e-nao-e` | `knowledge/methods/definicao-e-nao-e.md` | Definir fenomeno, objeto, padrao, IS/IS NOT, extensao e tempo |
| `analise-de-mudanca` | `knowledge/methods/analise-de-mudanca.md` | Comparar ultima condicao boa, inicio e mudancas coincidentes |
| `estratificacao` | `knowledge/methods/estratificacao.md` | Comparar etapa, pessoa, turno, canal, lote, equipamento, cliente e origem |
| `folha-de-verificacao` | `knowledge/methods/folha-de-verificacao.md` | Pedir/coletar registros estruturados e distribuicoes |
| `msa-grr` | `knowledge/methods/msa-grr.md` | Validar sistema de medicao antes de agir no processo |
| `cep-estabilidade` | `knowledge/methods/cep-estabilidade.md` | Avaliar estabilidade temporal sobre dados validos |
| `pareto` | `knowledge/methods/pareto.md` | Priorizar frequencias registradas, nunca opinioes convertidas em numeros |
| `brainstorming-assistido` | `knowledge/methods/brainstorming-assistido.md` | Extrair hipoteses das pessoas do processo apos G1 |
| `cinco-porques-ramificado` | `knowledge/methods/cinco-porques-ramificado.md` | Aprofundar mecanismos em grafo, sem profundidade fixa |
| `gemba-genchi-genbutsu` | `knowledge/methods/gemba-genchi-genbutsu.md` | Transformar lacuna observavel em EvidenceRequest |
| `trabalho-padronizado` | `knowledge/methods/trabalho-padronizado.md` | Comparar trabalho prescrito, condicao real e criterio de aceitacao |
| `poka-yoke` | `knowledge/methods/poka-yoke.md` | Investigar deteccao, escape e prevencao de propagacao |
| `tpm` | `knowledge/methods/tpm.md` | Consultar condicao/manutencao de equipamento com registros |
| `vsm` | `knowledge/methods/vsm.md` | Modelar fluxo, espera, fila, handoff e retrabalho |
| `pdca-sdca` | `knowledge/methods/pdca-sdca.md` | Validar eficacia, recorrencia e padronizacao |
| `8d` | `knowledge/methods/8d.md` | Macrofluxo de referencia para recorrencia/risco |
| `5w2h` | `knowledge/methods/5w2h.md` | Formato de acao somente depois de G6-SOL |
| `a3` | `knowledge/methods/a3.md` | Formato de sintese, nao motor decisorio |

### 3.2 Domain cards

| Id candidato | Arquivo futuro | Origem |
|---|---|---|
| `variacao-dimensional` | `knowledge/domains/variacao-dimensional.md` | Obrigatorio no Prompt Mestre; recebe medicao, maquina, ferramenta, material, ambiente, engenharia e metodo |
| `defeito-de-produto` | `knowledge/domains/defeito-de-produto.md` | Obrigatorio no Prompt Mestre; recebe familias amplas de falha produtiva |
| `atraso-fila-atendimento` | `knowledge/domains/atraso-fila-atendimento.md` | Obrigatorio no Prompt Mestre; recebe demanda, capacidade, fila, SLA, handoff, sistema e monitoramento |
| `falha-atendimento` | `knowledge/domains/falha-atendimento.md` | Candidate adicional: manifestacao, informacao, postura, resolucao e contato |
| `variacao-de-execucao` | `knowledge/domains/variacao-de-execucao.md` | Candidate adicional: habilidade, interpretacao, padrao, suporte e diferenca entre executores |
| `desalinhamento-promessa-entrega` | `knowledge/domains/desalinhamento-promessa-entrega.md` | Candidate adicional: expectativa, compromisso, registro e entrega real |
| `queda-performance-comercial` | `knowledge/domains/queda-performance-comercial.md` | Candidate adicional: fluxo comercial, entrada, conversao, canal, oferta e motivos de perda |
| `falha-fluxo-informacao` | `knowledge/domains/falha-fluxo-informacao.md` | Candidate adicional: entrada incompleta, documento, acesso, handoff e sistema |

A separacao entre metodologia e dominio e obrigatoria. Cards adicionais so entram se a curadoria da Fase 8 confirmar que possuem fronteira semantica util e se os testes demonstrarem recuperacao correta. O motor nao podera depender da existencia de uma lista fechada desses dominios.

## 4. Classificacao consolidada por componente

| Componente atual | Decisao | Destino concreto | O que nao migra |
|---|---|---|---|
| `index.html` - estrutura de telas | REAPROVEITAR | Casca do front e componentes de intake/pergunta/historico/resultado | Textos que afirmam causa/plano antes dos gates (`index.html:121-139`) |
| `styles.css` | REAPROVEITAR | Estilo visual responsivo, adaptado a novos estados | Nenhuma autoridade de motor |
| `manifest.webmanifest` | REAPROVEITAR | Metadados de instalacao web | Nao representa app nativo, offline ou persistente |
| `app.js` como controlador de UI | REFATORAR | Futuro adaptador de comandos/projecoes para a casca atual | Acesso/mutacao direta do estado causal |
| Intake fixo por perfil/segmento/area/publico | REFATORAR | Contexto opcional do intake e metadados de fonte | Area/segmento como roteador causal |
| `classifyProblem()`/`routeInvestigation()`/`detectArea()` | DESCARTAR | Nenhum destino decisorio; termos podem virar tags de recuperacao nao vinculantes | Regex, keyword matching, confianca e rota por categoria |
| `questionBank` | REFATORAR | Candidates de method/domain cards detalhados na Secao 5 | Ordem global, scores, evidencia fabricada e pergunta sem precondicao |
| `investigationRouteQuestions` | REFATORAR | Candidates de cards detalhados na Secao 6 | Arvores `SERVICE_FAILURE`, `FUNNEL_COMMERCIAL` e `GENERAL_CAUSAL_INVESTIGATION` |
| `segmentQuestionBoost`/`makeSegmentQuestions` | DESCARTAR como seletor | Vocabulos de contexto podem virar exemplos de linguagem nos domain cards | Boost numerico por segmento |
| `state` global V1 | DESCARTAR como fonte da verdade | Apenas adaptador temporario durante migracao; futuro estado projetado de eventos | Mutacao direta e schema atual |
| `confirmedFacts`/`confirmedFactDetails` | DESCARTAR como schema | Futuro `Fact` com source, grade, timestamp, relatesTo e supersedencia | Strings inferidas e textos `evidence` tratados como fatos |
| `activeHypotheses`/`hypothesisScores`/`scores` | DESCARTAR | Futuro grafo com estados ordinais e gates | Peso tratado como forca/probabilidade causal |
| Elegibilidade/continuidade V1 | REFATORAR conceitualmente | Precondicoes declarativas dos cards + fases/gates + VOI/custo | Hard blocks ligados a fatos ad hoc e ranking por score |
| `debugEvents`/`causal_transition` | REFATORAR | Event store imutavel + `DecisionLogEntry` formal | Telemetria posterior como substituto de explicabilidade |
| `registerEvidence()` e textos `evidence` | DESCARTAR como evidencia | Textos podem virar rationale/candidate; evidencia nasce de `Fact` informado/obtido | Sistema declarar como evidencia aquilo que a pergunta sugere |
| `shouldFinish()` V1 | DESCARTAR | Gates de conclusao e estados `CLOSED_*` | Quantidade de perguntas e score |
| `renderResult`/`buildReport` | REFATORAR | Views de `InvestigationState`, `SolutionSet`, pendencias e eficacia | Categoria vencedora, causa automatica e 5W2H generico |
| `phenomenonClassifier.js` | DESCARTAR como decisor | Nenhum; eventualmente tags fracas de busca sem transicao de fase | Regex, suporte por dominio e confianca fixa |
| `hypothesisEngine.js` | DESCARTAR como motor | Separacao modular inspira contratos, mas estado/grafo sera novo | Priors, normalizacao, percentuais e hipoteses no intake |
| `informationGain.js` | REFATORAR o conceito | Futuro VOI ordinal/explicavel com custo e discriminacao declarada | Probabilidades fixas de respostas e entropia sobre priors arbitrarios |
| `questionSelector.js` | REFATORAR | Orquestrador escolhe passo elegivel por fase, gate, VOI e custo | Ranking de banco fechado e limiar `minTopWeight` |
| `evidenceEngine.js` | DESCARTAR como schema | Futuro ledger de `Fact` e `EvidenceRequest` | Strings sem fonte/grau tratadas como evidencia |
| `contradictionEngine.js` | REFATORAR | Regras de sustentacao/contradicao sobre facts ligados ao grafo | Quatro regras fixas por pergunta/resposta |
| `stoppingRules.js` | DESCARTAR | Gates deterministas de promocao/conclusao | Thresholds de peso, contagem e contradicoes |
| `engine-v2/index.js` | DESCARTAR como orquestrador principal | Fachada futura tera contratos novos definidos na Fase 4 | Mutacao de sessao, diagnostico por top weight e 5W2H automatico |
| `productionFailure.js` | REFATORAR para cards | Mapeamento detalhado na Secao 7 | JavaScript executavel, priors, efeitos, subespacos e thresholds |
| Testes legados | REAPROVEITAR como regressao/baseline | Adaptadores do harness da Fase 6 podem executar motor atual | Nao sao criterio de aceite do motor novo |
| `docs/INVESTIGATION_ENGINE.md` | REFATORAR | Marcar como arquitetura historica e apontar para `docs/rebuild/` | Tratar V1/V2 antigo como alvo vigente |

## 5. Mapeamento detalhado de `questionBank`

Cada linha abaixo classifica o **texto e a intencao** como candidate. Metadados numericos e conclusoes associados sao descartados.

Abreviacoes de fase: `DEF` = `PROBLEM_DEFINITION`; `PM` = `PROCESS_MODELING`; `CAR` = `CHARACTERIZATION`; `HG` = `HYPOTHESIS_GENERATION`; `ET` = `EVIDENCE_AND_TESTING`.

| Pergunta atual | Candidate de card | Precondicao / valor da informacao | Fase/gate |
|---|---|---|---|
| Dificuldade tecnica (`app.js:375`) | domain `falha-atendimento` + `variacao-de-execucao` | G1 satisfeito e atividade localizada; separar habilidade de metodo/suporte | HG; G1/G8 |
| Informacoes claras (`app.js:394`) | domain `falha-atendimento` | Manifestacao de informacao/comunicacao; verificar clareza percebida | DEF/CAR |
| Equipe sabe como agir (`app.js:400`) | method `trabalho-padronizado` + domain `variacao-de-execucao` | Situacao e comportamento esperado definidos; separar referencia ausente de desvio | PM/HG |
| Expectativa diferente (`app.js:407`) | domain `desalinhamento-promessa-entrega` | Cliente, expectativa e entrega identificados; confirmar gap | DEF/CAR; G1 |
| Promessa mudou (`app.js:423`) | method `analise-de-mudanca` + domain promessa/entrega | Promessa existente e problema recente; localizar mudanca | CAR; G3 |
| Mudanca nas entradas (`app.js:439`) | method `analise-de-mudanca` + domains produto/informacao | Inputs e inicio definidos; comparar condicao boa/ruim | CAR; G3 |
| Real versus padrao (`app.js:445`) | methods `trabalho-padronizado`, `gemba-genchi-genbutsu` | Processo/padrao modelados; observar trabalho real | PM/ET; G9 |
| Deteccao do desvio (`app.js:451`) | domains atraso/produto + method `poka-yoke` | Desvio definido; localizar deteccao/propagacao | PM/HG |
| Espera excessiva (`app.js:470`) | domain `atraso-fila-atendimento` + method `vsm` | Tempo/etapa afetada identificados; localizar fila | DEF/PM |
| Retrabalho (`app.js:476`) | domain `defeito-de-produto` + methods `vsm`, `pareto` | Retrabalho operacionalmente definido; localizar retorno/recorrencia | DEF/CAR |
| Canal de atendimento (`app.js:482`) | method `estratificacao` + domain atendimento | Casos comparaveis por canal; testar concentracao | CAR |
| Tempo de resposta (`app.js:494`) | domain `atraso-fila-atendimento` | Manifestacao ambigua; separar demora de outras reclamacoes | DEF |
| Forma de tratamento (`app.js:510`) | domain `falha-atendimento` | Manifestacao ambigua; identificar postura/comunicacao | DEF |
| Padrao de atendimento (`app.js:516`) | method `trabalho-padronizado` + domain atendimento | Processo modelado; verificar existencia/clareza do padrao | PM/HG |
| Registro do motivo (`app.js:535`) | methods `folha-de-verificacao`, `pareto` | Reclamacoes existentes; verificar qualidade do historico | CAR/ET |
| Concentracao por pessoa (`app.js:553`) | method `estratificacao` + domain `variacao-de-execucao` | Casos/pessoas comparaveis; separar sistemico de executor | CAR |
| Concentracao por horario (`app.js:571`) | method `estratificacao` + domain atraso | Horario registrado; testar turno, demanda e escala | CAR |
| Fase da venda (`app.js:577`) | domain `queda-performance-comercial` + method `vsm` | Fenomeno comercial confirmado; localizar gap no fluxo | DEF/PM |
| Volume de oportunidades (`app.js:583`) | domain comercial + method `analise-de-mudanca` | Queda e periodo definidos; separar entrada de conversao | CAR; G3 |
| Qualidade das oportunidades (`app.js:589`) | domain `queda-performance-comercial` | Entrada localizada; discriminar volume de aderencia | CAR/HG |
| Motivos de perdas (`app.js:595`) | methods `folha-de-verificacao`, `pareto` + domain comercial | Perdas registraveis; pedir distribuicao factual | CAR/ET |
| Objecoes recorrentes (`app.js:602`) | method `pareto` + domain comercial | Objecoes registradas/relatadas; localizar frequencia | CAR/HG |
| Tempo comercial aumentou (`app.js:608`) | method `analise-de-mudanca` + domains comercial/atraso | Referencia anterior disponivel; localizar mudanca | CAR; G3 |
| Rotina de follow-up (`app.js:614`) | method `trabalho-padronizado` + domain comercial | Etapa localizada; verificar padrao, responsavel e cadencia | PM/HG |
| Beneficio antes do preco (`app.js:621`) | domain `queda-performance-comercial` | Perda em proposta/fechamento; levantar comunicacao de valor | HG |
| Desempenho por canal (`app.js:628`) | method `estratificacao` + domain comercial | Dados/relatos comparaveis por canal | CAR |
| Abordagem dos melhores (`app.js:634`) | methods `estratificacao`, `trabalho-padronizado` + domain comercial | Executores comparaveis; condicao boa versus ruim | CAR/HG |
| Dominio dos diferenciais (`app.js:640`) | domains comercial + `variacao-de-execucao` | Etapa/oferta definidas; testar conhecimento aplicado | HG |
| Visibilidade do proximo passo (`app.js:647`) | domains comercial + `falha-fluxo-informacao` | Fluxo modelado; verificar handoff/controle | PM/HG |
| Preco como barreira (`app.js:654`) | methods `analise-de-mudanca`, `pareto` + domain comercial | Motivos de perda disponiveis; comparar frequencia | CAR/ET |
| Concorrencia mudou (`app.js:660`) | method `analise-de-mudanca` + domain comercial | Problema recente; testar mudanca externa coincidente | CAR; G3 |
| Tipo de cliente (`app.js:666`) | method `estratificacao` + domain aplicavel | Perfil registravel; localizar concentracao | CAR |
| Promessa versus entrega (`app.js:672`) | domain `desalinhamento-promessa-entrega` | Promessa/entrega identificadas; comparar de modo verificavel | DEF/CAR |
| Parte especifica do trabalho (`app.js:689`) | methods `estratificacao`, `vsm` | Processo minimamente modelado; localizar etapa | PM/CAR |
| Execucao diferente (`app.js:695`) | methods `estratificacao`, `trabalho-padronizado` | Mesma atividade por pessoas diferentes; testar variacao | CAR/HG |
| Criterio de correto (`app.js:701`) | methods `definicao-e-nao-e`, `trabalho-padronizado` | Output esperado incompleto; obter criterio/padrao | DEF/PM; G1 |
| Treinamento pratico (`app.js:708`) | domain `variacao-de-execucao` | Habilidade candidate apos G1; buscar registro, sem concluir treinamento | HG/ET; G4/G9 |
| Entrada de pessoas novas (`app.js:715`) | methods `analise-de-mudanca`, `estratificacao` | Inicio e composicao conhecidos; testar coincidencia | CAR; G3 |
| Indicador semanal (`app.js:721`) | methods `folha-de-verificacao`, `cep-estabilidade` | Fenomeno mensuravel; verificar historico, com G2 se aplicavel | DEF/CAR; G2 |
| Quando comecou (`app.js:728`) | methods `definicao-e-nao-e`, `analise-de-mudanca` | Inicio desconhecido; preencher `when` e decidir rota | DEF/CAR; G1/G3 |
| Entradas incompletas (`app.js:735`) | domains atendimento/produto/informacao | Inputs modelados; testar qualidade da entrada | PM/HG |
| Lugar de origem (`app.js:741`) | method `estratificacao` | Origem/fornecedor/canal registravel; localizar concentracao | CAR |
| Ferramenta falha (`app.js:747`) | domains aplicaveis produto/informacao | Ferramenta vinculada a etapa; levantar candidate, nao causa | HG |
| Improviso por recurso (`app.js:753`) | methods `gemba-genchi-genbutsu`, `trabalho-padronizado` | Processo/condicao real observaveis; pedir verificacao | PM/ET; G9 |
| Reclama apesar do padrao (`app.js:759`) | domains atendimento + promessa/entrega | Padrao e execucao confirmados; separar padrao inadequado de aderencia | HG/ET |
| Deteccao tardia (`app.js:771`) | method `poka-yoke` + domains produto/atraso | Pontos de criacao/deteccao modelados; avaliar escape | PM/HG |
| Recorrencia apos correcao (`app.js:777`) | methods `pdca-sdca`, `8d`, `analise-de-mudanca` | Acao anterior registrada; avaliar eficacia/sistemico | CAR/ET |

## 6. Mapeamento de `investigationRouteQuestions`

| Pergunta atual | Candidate de card | Precondicao / valor da informacao | Fase/gate |
|---|---|---|---|
| Manifestacao do atendimento (`app.js:788`) | method `definicao-e-nao-e` + domain atendimento | Relato generico; transformar "atendimento ruim" em efeito observavel | DEF; G1 |
| Responsavel pelo retorno (`app.js:856`) | domain atraso + method trabalho padronizado | Falta de retorno confirmada; testar ownership | PM/HG |
| Solicitacao recebida (`app.js:868`) | domains atraso + fluxo de informacao | Responsavel identificado; testar handoff | PM/HG |
| Prazo de retorno (`app.js:881`) | domain atraso | Falta de retorno confirmada; verificar SLA | PM/HG |
| Padrao de postura (`app.js:894`) | method trabalho padronizado + domain atendimento | Postura e a manifestacao; verificar referencia | PM/HG |
| Fonte de informacao (`app.js:906`) | domains atendimento + fluxo de informacao | Informacao incorreta confirmada; localizar acesso | PM/HG |
| Registro da promessa (`app.js:918`) | domain promessa/entrega | Promessa nao cumprida confirmada; pedir registro | PM/HG; G9 |
| Alerta de atraso (`app.js:930`) | domain atraso + method `poka-yoke` | Demora confirmada e deteccao fraca | HG/ET |
| SLA de atendimento (`app.js:946`) | domain atraso | Tempo de resposta confirmado; obter padrao | PM/HG |
| Responsavel por atrasos (`app.js:961`) | domain atraso + trabalho padronizado | Atrasos existentes; verificar acompanhamento | PM/HG |
| Capacidade no pico (`app.js:974`) | domain atraso + method `vsm` | Demora confirmada; separar capacidade de controle | CAR/HG |
| Local da dificuldade tecnica (`app.js:986`) | domains atendimento + variacao de execucao | Dificuldade relatada; localizar atividade | CAR/HG |
| Treinamento formal (`app.js:1038`) | domain variacao de execucao | Habilidade e candidate ativa; pedir evidencia de preparacao | HG/ET; G9 |
| Suficiencia do procedimento (`app.js:1054`) | method trabalho padronizado | Dificuldade localizada; separar habilidade de usabilidade | HG/ET |
| Etapa comercial (`app.js:1070`) | domain comercial + method `vsm` | Fenomeno comercial confirmado; localizar etapa | DEF/PM |
| Efeito geral (`app.js:1090`) | method `definicao-e-nao-e` | Relato sem fenomeno observavel; obter definicao | INTAKE/DEF; G1 |

As opcoes de manifestacao/etapa sao vocabulario candidate. `scores` e rotas automaticas sao descartados. Uma opcao escolhida so podera gerar `Fact` por evento de resposta, com fonte e grau; nunca por inferencia do card.

## 7. Mapeamento de `productionFailure.js`

| Conteudo atual | Destino concreto | Parte reaproveitavel | Parte descartada |
|---|---|---|---|
| 12 familias (`productionFailure.js:7-80`) | domains `variacao-dimensional` e `defeito-de-produto`; planejamento tambem informa atraso | Labels/familias como candidates de brainstorming | Todos os `prior` e `actionableLabel` que antecipa conclusao |
| Enquadramento do efeito (`:82-146`) | method `definicao-e-nao-e` + tags dos domain cards | Nomes de efeitos: defeito, retrabalho, refugo, parada, produtividade, atraso | `effects`, ganho fixo e classificacao automatica |
| Mesma etapa (`:150`) | method `estratificacao` | Candidate para localizar concentracao apos processo modelado | `answerEffects` e hipotese implicita |
| Operadores diferentes (`:167`) | methods estratificacao/trabalho padronizado + domain variacao de execucao | Comparacao entre executores | Peso contra/a favor de `MANPOWER` |
| Mesmo equipamento (`:184`) | method estratificacao + domains produto/dimensional | Comparacao por maquina/dispositivo | Peso automatico de maquina/ferramental |
| Lote/fornecedor/material (`:201`) | method estratificacao + domains produto/dimensional | Comparacao por lote/fornecedor | Peso automatico |
| Apos setup/parametro/modelo (`:218`) | method `analise-de-mudanca` + domain dimensional | Candidate quando rota MUDANCA e setup identificavel | Efeitos numericos |
| Deteccao antes da etapa seguinte (`:234`) | method `poka-yoke` + domains produto/dimensional | Candidate sobre ponto de deteccao/escape | Tratar resposta como causa de medicao |
| Turno/ambiente (`:250`) | method estratificacao + domain dimensional | Comparacao de condicoes | Efeitos numericos |
| Resultado apos ajuste/manutencao (`:266`) | EvidenceRequest de comparacao/teste + domains produto/dimensional | Modelo de teste discriminante | `minTopWeight` e evidencia causal automatica |
| Familias de maquina (`:289-297`) | domains dimensional/produto + method `tpm` | Regulagem, desgaste, calibracao, sensor, intermitencia, manutencao como candidates | Subespaco fechado e priors |
| Ajuste recente (`:300`) | method analise de mudanca + domain dimensional | Candidate apos G1 e equipamento ligado ao processo | Efeitos numericos |
| Preventiva/calibracao (`:312`) | methods `tpm`, `msa-grr` + domain dimensional | Pedido de registro confiavel | Misturar calibracao do instrumento com manutencao de maquina sem distinguir sistema |
| Familias de ferramental (`:325-332`) | domains dimensional/produto | Desgaste, dispositivo incorreto, folga, setup e contaminacao como candidates | Subespaco e priors |
| Troca de ferramenta (`:335`) | EvidenceRequest de teste controlado + domain dimensional | Teste discriminante quando ferramental e hipotese ativa | Sustentacao automatica e efeitos numericos |

## 8. Regras de transformacao na futura migracao

Para todo conteudo classificado como REFATORAR:

1. `text`, opcoes e finalidade podem virar `question_candidates` ou exemplos de formulacao no card.
2. `triggerFacts`, `requiresFacts` e contexto podem inspirar `preconditions`, mas devem referenciar campos/schemas formais.
3. `questionPurpose` pode inspirar `purpose`/rationale; cada decisao real ainda exige DecisionLogEntry no momento da emissao.
4. `expectedInformationGain` fixo pode virar descricao qualitativa do que a pergunta discrimina; o numero atual nao migra.
5. `evidence`/`evidenceByAnswer` podem virar descricao do dado buscado ou rationale; nunca sao `Fact` por si so.
6. `scores`, `prior`, `answerEffects`, `hypothesisDelta`, `confidence` e thresholds nao migram.
7. `unknown` nunca altera hipotese. Deve acionar G5 e produzir `EvidenceRequest` ou lacuna explicita.
8. Uma resposta so sustenta/contradiz no causal se virar `Fact` com fonte, grau e vinculo ao no.
9. Candidates de treinamento so entram depois de separar padrao, recurso, informacao, capacidade e sistema; a solucao deve respeitar G8-ROB.
10. Todo texto migrado deve ter encoding normalizado; ha mojibake no arquivo atual, por exemplo `app.js:482`.

## 9. Divida de teste e criterio de aceite

Os testes atuais permanecem porque protegem regressao do baseline, especialmente perguntas binarias sem `ou`, coerencia de rota e ausencia de salto comercial em atendimento. Eles nao validam o motor novo.

Verificacao desta fase:

- `engine.test.js`: 9 casos aprovados;
- `service-failure-technical-gap.test.js`: 2 casos aprovados;
- `engine-v2-production.test.js`: 3 casos aprovados;
- `audit-question-eligibility.js`: executou com saida 0, inspecionou 85 perguntas e encontrou 22 perguntas sensiveis, das quais 5 possuem guarda declarada e 17 permanecem sem guarda. Esse resultado e divida documentada do baseline, nao autorizacao para patch no motor atual.

O unico criterio de aceite futuro e o harness da Fase 6 com GC1-GC4 e as metricas do Prompt Mestre. Ate que ele exista e gere baseline documentado contra o motor atual:

- nenhum modulo do motor novo pode ser criado;
- nenhum card pode controlar conversa de producao;
- nenhum teste legado pode ser promovido a gate de aceite do motor novo;
- V1 e V2 atual permanecem intactos como alvos do baseline.

## 10. Dependencia para as proximas fases

Fase 4 deve apresentar, sem implementar, duas arquiteturas de runtime:

- **Opcao A:** aplicacao estatica no navegador, chamadas diretas a API de LLM e persistencia local;
- **Opcao B:** backend com Supabase como event store e storage de cards, funcoes serverless na Vercel para orquestracao/LLM e front atual como casca.

A Fase 4 deve comparar seguranca de segredo/API, event sourcing multiusuario, auditabilidade, custo, latencia, operacao, offline, portabilidade, RLS/autorizacao e risco de lock-in. Por envolver Supabase, a proposta deve validar detalhes atuais da plataforma e tratar RLS, chaves e funcoes privilegiadas explicitamente.

Ao fim da Fase 4, a decisao de runtime fica **PENDENTE DO USUARIO**. A Fase 5 nao deve iniciar antes dessa escolha. Independentemente da opcao, a Fase 6 deve executar o harness contra o motor atual e documentar o baseline antes de qualquer linha do motor novo.

## 11. Evidencia de conclusao da Fase 3

- Classificacao consolidada por componente: Secao 4.
- Destinos concretos para `questionBank`: Secao 5.
- Destinos concretos para `investigationRouteQuestions`: Secao 6.
- Destinos concretos para `productionFailure.js`: Secao 7.
- Regras explicitas de preservacao e descarte: Secao 8.
- Sequencia Fase 4 -> decisao -> Fase 5 e harness antes do motor: Secoes 9 e 10.
- Nenhum arquivo de motor, teste ou dependencia foi alterado.
