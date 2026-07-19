# Configuração segura: Gemini + Vercel

Este guia configura a integração de IA do app **Causa Real** usando o Gemini no backend hospedado na Vercel.

## 1. Criar a chave no Google AI Studio

1. Acesse o [Google AI Studio](https://aistudio.google.com/).
2. Crie ou selecione um projeto do Google Cloud.
3. Gere uma API key para a Gemini API.
4. Guarde a chave em um gerenciador de senhas ou outro local seguro.

> Nunca inclua essa chave no repositório, em arquivos JavaScript publicados ou no GitHub Pages. O GitHub Pages entrega arquivos estáticos ao navegador e qualquer chave nele pode ser exposta publicamente.

## 2. Importar o repositório na Vercel

1. Acesse [Vercel](https://vercel.com/) e entre na conta desejada.
2. Clique em **Add New...** e selecione **Project**.
3. Importe o repositório do app Causa Real.
4. Confira as configurações de build detectadas pela Vercel e mantenha a estrutura do projeto.

## 3. Configurar variáveis de ambiente

No projeto da Vercel, abra **Settings > Environment Variables** e crie as variáveis abaixo para os ambientes necessários, no mínimo **Production**:

| Variável | Valor |
| --- | --- |
| `GEMINI_API_KEY` | A chave criada no Google AI Studio |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `ALLOWED_ORIGINS` | `https://jehsorshoe-ai.github.io` |

Salve cada variável. A `GEMINI_API_KEY` deve permanecer exclusivamente no ambiente da Vercel, onde é acessada pela rota de API no servidor.

## 4. Fazer o deploy

1. Clique em **Deploy** na Vercel.
2. Aguarde a conclusão e abra o deployment para confirmar que está respondendo corretamente.
3. Copie a URL de produção fornecida pela Vercel, por exemplo: `https://seu-projeto.vercel.app`.

## 5. Atualizar a URL no frontend

No arquivo `ai-config.js` do site publicado no GitHub Pages, configure a URL completa do endpoint usando a URL de produção da Vercel:

```js
window.CAUSA_REAL_AI_CONFIG = {
  endpoint: "https://seu-projeto.vercel.app/api/investigate",
};
```

O endpoint que deve ser usado é sempre `/api/investigate`. O frontend chama essa rota, e somente o backend da Vercel usa a `GEMINI_API_KEY` para conversar com o Gemini.

## Segurança

- Não coloque `GEMINI_API_KEY` em `ai-config.js`, HTML, JavaScript do GitHub Pages ou qualquer arquivo versionado.
- Não use variáveis com prefixo público, como `NEXT_PUBLIC_`, para a chave.
- Mantenha `ALLOWED_ORIGINS` restrito à origem autorizada: `https://jehsorshoe-ai.github.io`.
- Caso a chave seja exposta, revogue-a no Google AI Studio e crie uma nova antes de atualizar a variável na Vercel.
