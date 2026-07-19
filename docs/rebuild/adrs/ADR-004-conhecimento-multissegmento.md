# ADR-004 - Conhecimento multissegmento por cards versionados

- Status: **ACEITA COMO DIRECAO ARQUITETURAL**
- Data: 2026-07-19

## Contexto

O motor atual repete diagnosticos genericos e contamina atendimento com funil
comercial porque categorias, keywords, perguntas e conclusoes vivem juntas no
codigo. O produto precisa atender mercados diferentes sem criar uma arvore fixa
para cada segmento.

## Decisao

Separar o conhecimento em:

- `knowledge/methods/*.md`: precondicoes, outputs, custo e candidates de metodo;
- `knowledge/domains/*.md`: formatos de processo, familias de falha,
  discriminadores, evidencias, exclusoes e vocabulario do trabalho real.

O Git e a fonte canonica. Cada card e validado por schema, possui versao e entra
em uma release imutavel. Cada investigacao fixa a release usada.

Recuperacao ocorre por:

1. filtros estruturados de fase, processo, fenomeno, precondicoes e exclusoes;
2. ranking leve de conteudo, com embeddings opcionais.

Gates e precondicoes sempre vencem similaridade. O segmento ajusta vocabulario e
entidades; nao escolhe causa. Card recuperado gera candidate, nao transicao.

## Conteudo minimo de um domain card

- fenomenos e formatos de processo aplicaveis;
- exemplos de segmentos, sem lista fechada;
- etapas/handoffs e entidades do dominio;
- familias causais completas;
- fatos que sustentam e contradizem;
- perguntas discriminantes e pedidos de evidencia;
- anti-patterns e saltos de contexto proibidos;
- exemplos de linguagem natural.

## Consequencias

Positivas:

- novos mercados entram por conhecimento, nao por fork do motor;
- perguntas ficam ligadas ao processo e ao estado;
- conteudo pode ser revisado por especialista e pull request;
- diagnosticos registram exatamente qual release foi usada;
- propriedade intelectual e curadoria ficam separadas do codigo.

Custos:

- cards exigem governanca, schema, testes e revisao tecnica;
- sobreposicao entre cards precisa de exclusoes e testes de recuperacao;
- RAG/embedding nao substitui curadoria;
- cada novo dominio precisa de golden cases antes de ser vendido como suportado.

## Rejeitados

- um motor separado por segmento;
- keyword matching como roteador causal;
- card executavel que altera estado;
- LLM usando apenas conhecimento parametrico para afirmacao tecnica;
- categoria generica vencedora convertida diretamente em causa/plano.
