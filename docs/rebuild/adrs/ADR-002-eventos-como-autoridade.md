# ADR-002 - Eventos como unica autoridade de estado

- Status: **ACEITA PELO PROMPT MESTRE**
- Data: 2026-07-19

## Contexto

O V1 e o Engine V2 atual mantem sessoes mutaveis, scores e debug posterior. Isso
nao permite replay confiavel, procedencia de fatos ou prova da ordem entre
decisao e pergunta.

## Decisao

Adotar event sourcing no novo nucleo:

- comandos externos solicitam transicoes;
- validadores e orquestrador produzem eventos candidatos;
- append atomico valida versao e idempotencia;
- eventos aceitos sao imutaveis e ordenados por investigacao;
- `InvestigationState`, DecisionLog, fatos, grafo e relatorios sao projecoes;
- correcao e reabertura usam novos eventos, nunca edicao historica;
- snapshots sao aceleradores descartaveis.

O event store concreto depende da ADR-001: IndexedDB em A ou Supabase Postgres em
B. O contrato logico e identico.

## Consequencias

Positivas:

- replay deterministico e baseline comparavel;
- fatos com procedencia e supersedencia;
- explicabilidade verificavel;
- auditoria de gates e promocoes;
- migracao de schemas por versao.

Custos:

- mais eventos, reducers e testes de invariantes;
- concorrencia otimista e idempotencia obrigatorias;
- projecoes e snapshots precisam ser reconstruiveis;
- exclusao de dados pessoais deve separar identidade do evento.

## Invariantes

- nenhum fato e evento pode nascer apenas de texto de card ou LLM;
- nenhuma hipotese antes de G1;
- nenhuma promocao fora de G4;
- todo `QUESTION_EMITTED` referencia decisao anterior;
- `Nao sei` gera lacuna/EvidenceRequest;
- acao corretiva referencia causa elegivel.
