# ADR-001 - Runtime do produto comercial

- Status: **PENDENTE DE DECISAO DO USUARIO**
- Data: 2026-07-19
- Decisores: Jefferson Alves e arquitetura do projeto

## Contexto

O repositorio e uma aplicacao estatica publicada no GitHub Pages. A nova
arquitetura exige event sourcing, cards versionados, LLM com output estruturado,
auditoria e capacidade futura de atender varias empresas e segmentos.

Esta ADR nao antecipa a Fase 5 e nao autoriza implementacao.

## Opcao A

Manter app estatico no navegador, chamadas diretas a API de LLM e persistencia
local em IndexedDB.

Consequencias positivas:

- infraestrutura minima;
- baixo custo fixo;
- nucleo deterministico e historico local podem operar offline;
- boa topologia para demonstracao, harness e piloto com dados sinteticos.

Consequencias negativas:

- a chave do produto nao pode ser mantida secreta no navegador;
- eventos locais nao constituem trilha empresarial confiavel;
- ausencia de multiempresa, colaboracao e continuidade multidispositivo;
- quotas e limites de custo podem ser contornados;
- releases de cards dependem do bundle/deploy;
- persistencia local pode ser apagada ou alterada.

Parecer: reprovada como arquitetura pura de um SaaS B2B comercial.

## Opcao B

Usar Supabase como event store, Auth, read models e registry/Storage de releases
de cards; Vercel Functions como fronteira de autorizacao, orquestracao e LLM; o
front atual permanece como casca.

Consequencias positivas:

- segredos protegidos no servidor;
- event store central, replay e auditoria;
- isolamento multiempresa e trabalho em equipe;
- cards fixados por release e protegidos como propriedade intelectual;
- controle central de quota, custo, observabilidade e idempotencia;
- evolucao do front sem mover autoridade causal para a UI.

Consequencias negativas:

- maior custo e complexidade operacional;
- desenho cuidadoso de RLS, grants e autorizacao server-side;
- dependencia de Supabase, Vercel e provedor de LLM;
- latencia de rede e necessidade de tratar concorrencia/retries;
- governanca LGPD e transferencia internacional exigem trabalho contratual.

## Recomendacao

**Opcao B** para o produto comercial. A nao deve receber chave corporativa nem
promessa de auditoria empresarial.

## Decisao necessaria

O usuario deve responder explicitamente `A` ou `B`. Ate la:

- Fase 5 nao comeca;
- nenhum adaptador de runtime e criado;
- nenhum motor novo e implementado;
- Fase 6 continua sendo o primeiro artefato executavel da reconstrucao.
