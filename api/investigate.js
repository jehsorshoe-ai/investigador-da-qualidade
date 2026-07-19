const MAX_BODY_SIZE = 24000;
const FORBIDDEN_TERMS = /ishikawa|5\s*porqu|metodologia|diagrama/i;

function allowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || "https://jehsorshoe-ai.github.io")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins().includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function cleanText(value, maxLength) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function canonicalOptions(question) {
  return Array.isArray(question?.options)
    ? question.options.map((option) => ({ value: cleanText(option.value, 40), label: cleanText(option.label, 80) }))
    : [];
}

function validateAdaptation(adaptation, canonicalQuestion) {
  const question = cleanText(adaptation?.question, 240);
  const expectedOptions = canonicalOptions(canonicalQuestion);
  const options = Array.isArray(adaptation?.options) ? adaptation.options : [];
  const expectedValues = expectedOptions.map((option) => option.value).sort();
  const receivedValues = options.map((option) => cleanText(option?.value, 40)).sort();

  if (question.length < 12 || FORBIDDEN_TERMS.test(question)) return null;
  if (!expectedValues.length || expectedValues.join("|") !== receivedValues.join("|")) return null;

  const labelsByValue = new Map(options.map((option) => [cleanText(option.value, 40), cleanText(option.label, 80)]));
  const normalizedOptions = expectedOptions.map((option) => ({ value: option.value, label: labelsByValue.get(option.value) }));
  const labelSet = new Set(normalizedOptions.map((option) => option.label.toLocaleLowerCase("pt-BR")));
  if (
    normalizedOptions.some((option) => option.label.length < 2 || FORBIDDEN_TERMS.test(option.label)) ||
    labelSet.size !== normalizedOptions.length
  ) return null;

  return { question, options: normalizedOptions };
}

function promptFor(body) {
  const question = body.canonicalQuestion;
  const context = body.context || {};
  return `Voce adapta uma unica pergunta de investigacao da qualidade para portugues do Brasil.

Regras inviolaveis:
- Nao diagnostique, nao conclua causa raiz e nao invente fatos.
- Preserve exatamente os valores das opcoes recebidas; apenas reescreva os rotulos em linguagem clara.
- Mantenha uma unica pergunta objetiva, compreensivel para o segmento e o publico.
- Nao mencione Ishikawa, 5 Porques, metodologia, IA ou bastidores.
- Nao acrescente opcoes, nem remova opcoes.
- Responda exclusivamente JSON valido com as chaves question e options.

Contexto do caso:
${JSON.stringify(context)}

Pergunta canonica escolhida pelo motor deterministico:
${JSON.stringify(question)}`;
}

async function callGemini(body) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("Gemini nao configurado");
    error.code = "ai_not_configured";
    throw error;
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: promptFor(body) }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) {
    const error = new Error("Falha ao consultar o Gemini");
    error.code = "provider_error";
    throw error;
  }

  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!text) {
    const error = new Error("Resposta vazia do Gemini");
    error.code = "invalid_provider_response";
    throw error;
  }
  return JSON.parse(text);
}

async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const body = req.body || {};
  if (JSON.stringify(body).length > MAX_BODY_SIZE || body.operation !== "adapt_question" || !body.canonicalQuestion) {
    return res.status(400).json({ error: "invalid_request" });
  }

  try {
    const rawAdaptation = await callGemini(body);
    const adaptation = validateAdaptation(rawAdaptation, body.canonicalQuestion);
    if (!adaptation) return res.status(422).json({ error: "invalid_ai_adaptation" });
    return res.status(200).json({ adaptation });
  } catch (error) {
    const status = error.code === "ai_not_configured" ? 503 : 502;
    return res.status(status).json({ error: error.code || "ai_unavailable" });
  }
}

module.exports = handler;
module.exports.validateAdaptation = validateAdaptation;
module.exports.promptFor = promptFor;
