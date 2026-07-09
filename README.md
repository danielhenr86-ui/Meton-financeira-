# Meton Financeira

Sistema de gestão financeira pessoal e empresarial (PF + PJ) — protótipo Fase 1.

Feito com React + Vite + Tailwind. Roda no navegador e no celular (PWA-friendly).

---

## O que você precisa saber antes

Este projeto foi testado e **compila** (`npm run build` funciona). Ele é um protótipo:
os dados ficam salvos **no navegador do próprio usuário** (localStorage), não em um
servidor central. Isso significa:

- Cada pessoa que abre o site tem os seus próprios dados, só no dispositivo dela.
- Não há login remoto de verdade nem sincronização entre aparelhos ainda.
- Para virar um produto multiusuário real (vários acessos, dados na nuvem, login
  social de verdade), o próximo passo é ligar um backend (ex.: Supabase). Veja o
  final deste arquivo.

---

## Rodar no seu computador (opcional, para testar)

Você precisa do Node.js instalado (versão 18 ou superior). Depois:

```bash
npm install
npm run dev
```

Abra o endereço que aparecer (geralmente http://localhost:5173).

Para gerar a versão final (a que vai para o ar):

```bash
npm run build
```

Isso cria a pasta `dist/` com o site pronto.

---

## Publicar na internet (passo a passo, sem terminal)

O jeito mais simples é: **GitHub** guarda o código, **Vercel** publica sozinha.

### Passo 1 — Subir para o GitHub
1. Entre em github.com e faça login.
2. Canto superior direito → **+** → **New repository**.
3. Nome: `meton-financeira`. Deixe **Private**. Não marque nada extra. → **Create repository**.
4. Na tela seguinte, clique em **uploading an existing file**.
5. Arraste **todos os arquivos e pastas deste projeto** (menos a pasta `node_modules`,
   se ela existir) para a área de upload.
6. Escreva "primeira versão" e clique em **Commit changes**.

### Passo 2 — Publicar na Vercel
1. Entre em vercel.com e faça login **com sua conta do GitHub**.
2. Clique em **Add New… → Project**.
3. Escolha o repositório `meton-financeira` que você acabou de criar → **Import**.
4. A Vercel detecta o Vite sozinha. Não precisa mudar nada. Clique em **Deploy**.
5. Aguarde ~1 minuto. Ela te dá um endereço tipo `meton-financeira.vercel.app`.

Pronto — está no ar. Toda vez que você atualizar o código no GitHub, a Vercel
republica sozinha.

> Alternativa: a Netlify (netlify.com) funciona igual. Se preferir, use
> "Add new site → Import an existing project" e aponte para o repositório.

---

## Instalar no celular como "app"

Depois de publicado, abra o endereço no celular:
- **iPhone (Safari):** botão compartilhar → "Adicionar à Tela de Início".
- **Android (Chrome):** menu (⋮) → "Adicionar à tela inicial".

Vira um ícone como se fosse um aplicativo.

---

## Estrutura do projeto

```
meton-financeira/
├── index.html              → página raiz
├── package.json            → dependências e scripts
├── vite.config.js          → configuração do Vite
├── tailwind.config.js      → configuração do Tailwind
├── postcss.config.js
├── src/
│   ├── main.jsx            → ponto de entrada + persistência (localStorage)
│   ├── MetonFinanceira.jsx → o app inteiro
│   └── index.css          → estilos base (Tailwind)
└── README.md
```

---

## Próximo passo: virar produto de verdade (backend)

Quando você quiser sair do protótipo:

1. **Dados na nuvem + login real:** integrar o **Supabase** (banco PostgreSQL,
   autenticação com e-mail/senha e login social prontos). Substitui o localStorage
   por tabelas reais e faz vários usuários compartilharem os mesmos dados com segurança.
2. **Agregação bancária automática:** integrar a **Pluggy** (Open Finance) para puxar
   extratos PF e PJ sem upload manual.
3. **LGPD:** com dados na nuvem, formalizar consentimento, criptografia e política de
   privacidade antes de qualquer cliente real usar.

Estas três coisas são o que separa "protótipo que funciona no meu celular" de
"produto que meus clientes podem confiar".
