# ADR-003 - LLM como adaptador sem autoridade causal

- Status: **ACEITA PELO PROMPT MESTRE**
- Data: 2026-07-19

## Contexto

O produto precisa interpretar texto livre e conversar de forma natural, mas nao
pode permitir que variacao do modelo crie fatos, escolha metodos, promova causas
ou encerre investigacoes.

## Decisao

O LLM sera usado somente para:

- interpretar o turno como proposta estruturada com trecho-fonte;
- redigir a unica pergunta escolhida pelo orquestrador;
- sugerir hipoteses `origin: ai` depois de G1 e a partir de cards recuperados;
- sintetizar projecoes existentes;
- explicar DecisionLogEntries existentes;
- atuar como respondente simulado no harness.

O LLM nao controla estado, fase, gates, VOI, metodologia, calculos, promocao,
solucao ou conclusao.

Toda saida passa por:

1. JSON Schema estrito e versionado;
2. validador semantico deterministico;
3. append do event store antes de qualquer pergunta ser exibida.

## Regras conversacionais

- ECO -> CORTE -> PERGUNTA;
- uma pergunta por turno;
- pergunta disjuntiva nao recebe botoes genericos `Sim/Nao`;
- nao citar metodologia/card ao usuario por padrao;
- nao mostrar percentuais artificiais de confianca;
- nao introduzir termos comerciais, industriais ou de outro dominio sem
  evidencia e card elegivel;
- `Nao sei` permanece lacuna.

## Consequencias

Positivas:

- linguagem adaptavel sem entregar autoridade ao modelo;
- troca de provedor/modelo sem mudar a semantica do motor;
- erros formais e causais podem ser bloqueados;
- harness consegue testar a fronteira.

Custos:

- schemas e prompts precisam de versao;
- ha casos em que formato valido ainda e semanticamente invalido;
- retries, timeouts e recusa precisam ser tratados sem mutar estado;
- modelo/configuracao precisam passar pelos golden cases.
