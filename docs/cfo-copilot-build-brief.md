# Meton CFO Copilot v1 — build brief

## Fatos confirmados

- O produto atual e um app React/Vite/PWA, com dados financeiros persistidos no `localStorage` do navegador.
- O motor existente ja calcula, de forma deterministica: saldo PF/PJ, fluxo do mes, DRE gerencial, previsao 30/60/90 dias, reserva de impostos, orcamentos, qualidade dos dados, separacao PF/PJ, anomalias, score e plano de acao.
- A chave da OpenAI deve existir somente no servidor. Nenhuma credencial pode entrar no bundle do navegador.
- A v1 sera um copiloto consultivo: nao paga contas, nao envia mensagens, nao altera lancamentos e nao executa decisoes autonomamente.
- Os dados enviados ao endpoint de IA serao agregados do motor Meton. O extrato bruto e descricoes individuais de transacoes nao fazem parte do payload da v1.

## Inferencias e questoes abertas

- A v1 usa o runtime Node de uma Vercel Function em `/api/cfo`; isso e compativel com o frontend Vite atual e mantem o segredo fora do cliente.
- A experiencia inicial sera aberta a partir do Radar em um modal, evitando ampliar a navegacao inferior antes de validar uso real.
- Nao existe backend persistente/multi-tenant no repositorio. Portanto, a conversa da v1 e stateless: cada consulta envia a fotografia financeira atual.
- A projecao semanal de 13 semanas e indicativa: combina o run-rate historico com compromissos futuros cadastrados e explicita essa premissa.
- Implantacao e configuracao do ambiente de producao ficam fora deste incremento ate autorizacao expressa.
- Antes de qualquer producao com `OPENAI_API_KEY` ativa, o endpoint precisa de autenticacao server-side e rate limiting. O login atual em `localStorage` nao protege uma Function publica contra consumo indevido de creditos.

## Objetivo do produto

Transformar os numeros ja calculados pelo Meton em uma leitura de CFO terceirizado: destacar de tres a cinco decisoes, mostrar evidencia numerica, separar fato de inferencia, apontar risco e dizer qual e a proxima acao gerencial mais util.

## Contrato do agente

- Persona: `Meton CFO Copilot`, em portugues do Brasil, direto e executivo.
- Entrada: pergunta do usuario + snapshot agregado e versionado do motor financeiro.
- Ferramenta obrigatoria: `get_financial_snapshot`, que entrega ao modelo somente os dados do snapshot validado.
- Saida estruturada: resumo executivo, decisoes priorizadas, riscos, dados faltantes e limitacao profissional.
- Evidencia: toda afirmacao factual deve ser rastreavel a um campo retornado pela ferramenta.
- Calculos: o modelo nao e a calculadora financeira; valores, percentuais e forecasts factuais devem vir do motor Meton.
- Confianca: qualidade de dados baixa deve reduzir a confianca e pode virar a prioridade numero um.
- Limites: DRE e analise sao gerenciais; nao substituir contabilidade, auditoria independente, consultoria tributaria/juridica nem recomendacao de investimento.
- Aprovacoes: nenhuma acao externa e executada pela v1; logo nao ha ferramenta mutante para aprovar.

## Estado e UI

- O estado financeiro continua local no app existente.
- O modal guarda apenas o estado efemero da pergunta/resposta atual.
- O usuario recebe uma nota clara antes da consulta de que somente um resumo financeiro agregado sera enviado ao servico de IA.
- Atalhos iniciais: prioridades, risco de caixa e explicacao do resultado do mes.

## Arquitetura

1. O motor atual calcula os indicadores no navegador.
2. Um adaptador monta um snapshot minimo, incluindo DRE, auditoria, contas, metas e forecast.
3. Um helper deterministico acrescenta o fluxo de caixa semanal de 13 semanas.
4. O frontend envia `question + snapshot` para `POST /api/cfo` somente quando o usuario pede uma analise.
5. A Vercel Function valida o payload e executa um unico Agent do OpenAI Agents SDK.
6. O Agent consulta o snapshot por function tool e retorna JSON validado por schema.
7. A UI renderiza decisoes, evidencias, riscos e lacunas sem executar nenhuma acao.

## Prompt de build independente

> No app Meton Financeira existente, implemente um MVP chamado Meton CFO Copilot. Preserve o motor financeiro deterministico atual como fonte da verdade. Adicione uma previsao indicativa de caixa em 13 semanas usando codigo deterministico, sem delegar aritmetica ao LLM. Monte um snapshot agregado, sem extrato bruto nem descricoes individuais, contendo saldo e fluxo, DRE gerencial, forecast, contas, reserva de impostos, orcamentos, qualidade dos dados, separacao PF/PJ, anomalias, score, plano de acao e metas. Exponha uma Vercel Function Node em `POST /api/cfo` usando um unico agente do OpenAI Agents SDK e uma function tool `get_financial_snapshot`. A chave `OPENAI_API_KEY` deve permanecer server-side. Force uma resposta estruturada com resumo executivo, 3-5 decisoes com evidencia, diagnostico, impacto, recomendacao, proxima acao e nivel de confianca, mais riscos e dados faltantes. O agente deve separar fatos de inferencias, recusar inventar valores ausentes e deixar claro que a analise e gerencial, nao contabil, tributaria, juridica ou recomendacao de investimento. Adicione no Radar um acesso ao copiloto com tres perguntas sugeridas e uma nota de privacidade. Nao crie ferramentas de escrita/execucao e nao publique o app. Adicione testes do helper deterministico e valide build + smoke test do agente com dados ficticios.
