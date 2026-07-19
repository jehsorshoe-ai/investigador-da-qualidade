---
name: root-cause-investigation-engine
description: Maintain and evolve the Causa Real / Investigador da Qualidade causal investigation engine. Use when changing app.js routing, classifyProblem, routeInvestigation, question types, investigation questions, hypotheses, Ishikawa/5 Whys behavior, root-cause reports, or tests for atendimento, vendas, retrabalho, atraso, falha tecnica, documentos, produto, processo, pessoas, or confidence gating.
---

# Root Cause Investigation Engine

## Core Rule

Treat the initial text as evidence, not as a category label. Separate:

- `evento`: what happened.
- `sintoma`: what was perceived.
- `fenomeno`: the primary problem pattern.
- `impacto`: business consequence.
- `causa`: mechanism that explains recurrence.

Never confuse commercial context with commercial cause. Example: "Cliente deixou de comprar porque foi mal atendido" is `SERVICE_FAILURE` with `perda_comercial` as impact, not `FUNNEL_COMMERCIAL`.

## Workflow

1. Read `docs/INVESTIGATION_ENGINE.md`.
2. Inspect `app.js` before editing.
3. Map the path:

```text
INPUT -> CLASSIFICACAO -> ROUTER -> QUESTION ENGINE -> STATE -> HIPOTESES -> CONCLUSAO
```

4. Add or modify classification in `classifyProblem()`.
5. Route only through `routeInvestigation()`.
6. Add question metadata when adding questions:

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

7. Update regression tests in `tests/engine.test.js`.
8. Run:

```bash
node --check app.js
node tests/engine.test.js
node tests/service-debug.js
node tests/causal-continuity-debug.js
```

## Routing Standards

Use high-confidence route only when the phenomenon is explicit.

- `SERVICE_FAILURE`: complaint, bad service, no return, support, posture, incorrect guidance.
- `FUNNEL_COMMERCIAL`: leads, proposals, conversion, closing, sales stages.
- `TECHNICAL_REWORK`: same failure, workshop return, rework, recurring technical failure.
- `DOCUMENT_PROCESS`: invoice, document, registration, billing data errors.
- `DELAY`: delay or waiting where the mechanism is unclear.
- `GENERAL_CAUSAL_INVESTIGATION`: low confidence or ambiguous problem.

Confidence gating:

- `>= 0.80`: specialized route.
- `0.50` to `0.79`: ask one disambiguation question.
- `< 0.50`: safe fallback.

## Question Standards

Do not use a static questionnaire mindset. Each question must:

- confirm, weaken, or reject a hypothesis;
- discover a mechanism;
- collect evidence;
- depend on route, facts, previous answers, or depth.

Before showing a next question, explain: "why this question now?" If there is no causal reason, do not show it.

Maintain causal continuity with `confirmedFacts`, `confirmedFactDetails`, `activeHypotheses`, `rejectedHypotheses`, `hypothesisScores`, and `debugEvents`.

In `SERVICE_FAILURE`, block questions about proposal, promise, price, funnel, conversion, closing, or sales unless a fact such as `broken_promise` or `route_sales` exists.

Use `BOOLEAN` only for questions that can honestly be answered with `Sim`, `Nao`, `Parcialmente`, `Nao sei`.

Use `MULTIPLE_CHOICE` for "what happened?" questions. Do not force `Sim/Nao` for manifestation questions.

Avoid abstract language where a shop floor, sales, service, or operations user would hesitate. Prefer observable wording.

## Ishikawa And 5 Whys

Use Ishikawa as a hypothesis map, not as literal questions. Do not ask "was it people/process/product?" directly.

Run 5 Whys only after a likely mechanism is known:

```text
evento -> sintoma -> contexto -> mecanismo -> evidencias -> hipotese dominante -> 5 whys -> causa sistemica
```

Do not end at "falha humana" when the evidence points to missing control, missing owner, missing standard, missing alert, missing training, or missing feedback loop.

## Mandatory Regression Cases

Preserve these cases:

- `Cliente reclamou de mau atendimento.` -> `SERVICE_FAILURE`; never funnel.
- `Cliente deixou de comprar porque foi mal atendido.` -> service phenomenon, commercial impact.
- `Estamos recebendo muitos leads, mas poucos viram propostas.` -> `FUNNEL_COMMERCIAL`.
- `Vendemos muitas propostas, mas poucos clientes fecham.` -> commercial conversion.
- `O caminhao voltou para oficina pela mesma falha.` -> technical rework.
- `A nota fiscal saiu com dados incorretos.` -> document process.
- Atendimento + tempo de resposta confirmado + baixa deteccao de desvios -> next question investigates monitoring, alert, SLA, owner, priority, or capacity; never promise, price, funnel, or conversion.

When a change affects routing or questions, add a test before publishing.
