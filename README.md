# Leandro — Developer Portfolio

Portfolio pessoal e comercial de Leandro Fernandes, desenvolvido como uma SPA estática com HTML, CSS e JavaScript vanilla. O projeto apresenta perfil profissional, habilidades, projetos, princípios de arquitetura, segurança, assistente de IA e formulário de contato.

Personal and commercial portfolio for Leandro Fernandes, built as a static SPA with vanilla HTML, CSS, and JavaScript. The project presents professional profile, skills, projects, architecture principles, security, an AI assistant, and a contact form.

## Navegação / Navigation

- [Português](#portugues)
- [English](#english)

---

## Português

### Objetivo

Este portfólio foi criado para apresentar o trabalho de Leandro Fernandes para clientes, recrutadores e parceiros. A interface concentra informações profissionais, projetos selecionados, habilidades técnicas, princípios de arquitetura e canais de contato em uma experiência leve, responsiva e sem dependências de front-end.

### Principais funcionalidades

- SPA estática com HTML, CSS e JavaScript vanilla.
- Conteúdo data-driven para projetos, arquitetura, segurança, skills e animação do editor.
- Suporte nativo a idiomas `pt-BR` e `en-US`, com seletor visual e persistência em `localStorage`.
- Tema dark/light com `data-theme` e preferência salva em `localStorage`.
- Cards de projetos com metadados opcionais de timeline (`year` e `category`).
- Suporte opcional a imagem e vídeo nos cards de projetos, com modal de vídeo acessível.
- Experiência inicial opcional "Sistema Solar Profissional" com Three.js carregado sob demanda.
- Fallback HTML/CSS para a experiência 3D quando WebGL ou CDN falham.
- Assistente de IA integrado por Vercel Function em `/api/chat`.
- Formulário de contato enviado via Resend por Vercel Function em `/api/contact`.
- Animações por scroll, editor de código animado no hero e suporte a `prefers-reduced-motion`.
- Efeito visual de cursor decorativo, desativado em touch ou movimento reduzido.

### Tecnologias usadas

| Recurso | Uso |
| --- | --- |
| HTML, CSS e JavaScript | Interface, renderização das seções e comportamento da SPA |
| CSS custom properties | Tokens de cor, espaçamento, tipografia, sombras e temas |
| Vercel Functions | Backend mínimo para contato e IA |
| Resend API | Envio das mensagens do formulário de contato |
| OpenAI API | Respostas do assistente com contexto profissional |
| Three.js | Cena 3D da intro, carregada sob demanda via CDN |
| Google Fonts | Tipografias Inter e JetBrains Mono |
| LocalStorage | Preferências de idioma, tema e visualização da intro |

### Estrutura de pastas

```txt
Portfólio/
├── api/
│   ├── chat.js
│   └── contact.js
├── assets/
│   ├── css/
│   │   ├── animations.css
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── layout.css
│   │   └── tokens.css
│   ├── js/
│   │   ├── ai-chat.js
│   │   ├── code-animation.js
│   │   ├── contact.js
│   │   ├── cursor-effect.js
│   │   ├── data.js
│   │   ├── i18n.js
│   │   ├── intro-experience.js
│   │   ├── main.js
│   │   ├── nav.js
│   │   ├── professional-solar-system.js
│   │   ├── reveal.js
│   │   ├── scroll-animations.js
│   │   └── theme.js
│   └── media/
│       └── projects/
│           ├── sigp/
│           └── sigpv2/
├── data/
│   └── ai-context.md
├── index.html
└── README.md
```

### Conteudo e internacionalizacao

O conteúdo principal dos projetos, skills, arquitetura, segurança e editor animado fica em `assets/js/data.js`. A camada de internacionalização fica em `assets/js/i18n.js` e suporta os idiomas:

- `pt-BR`
- `en-US`

O idioma escolhido é salvo em:

```txt
portfolioLanguage
```

Projetos podem usar campos traduzidos por idioma:

```js
title: {
  "pt-BR": "Nome do projeto",
  "en-US": "Project name"
},
description: {
  "pt-BR": "Descrição em português.",
  "en-US": "Description in English."
}
```

Os campos opcionais `year` e `category` são renderizados como badges discretos nos cards. Cards sem esses campos continuam funcionando normalmente.

### Tema

O tema é controlado por `assets/js/theme.js`, aplicado no elemento `<html>`:

```html
<html data-theme="dark">
```

ou:

```html
<html data-theme="light">
```

A preferência é salva em:

```txt
portfolioTheme
```

### Variáveis de ambiente

Crie um arquivo `.env` local para uso com `vercel dev` e configure as mesmas variáveis no painel da Vercel em produção. Não versionar arquivos `.env`.

```txt
RESEND_API_KEY=your-resend-api-key
CONTACT_EMAIL=destination@example.com
CONTACT_FROM_EMAIL=Portfolio <noreply@example.com>
OPEN_AI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4.1-mini
```

Observações:

- `RESEND_API_KEY` é obrigatória para `/api/contact`.
- `CONTACT_EMAIL` deve ser o e-mail que receberá as mensagens.
- `CONTACT_FROM_EMAIL` deve usar um remetente validado no Resend em produção.
- `OPEN_AI_API_KEY` é obrigatória para `/api/chat`.
- `OPENAI_MODEL` define o modelo usado pela função de IA.

### Como executar localmente

Para testar apenas a interface estática:

```bash
python3 -m http.server 8000
```

Acesse:

```txt
http://localhost:8000
```

Para testar as Vercel Functions (`/api/contact` e `/api/chat`), use a Vercel CLI:

```bash
vercel dev
```

Este projeto não possui `package.json` no estado atual e não depende de scripts npm para a interface estática.

### Configuração das APIs e credenciais

#### Contato com Resend

O formulário em `assets/js/contact.js` envia `name`, `email`, `message` e o honeypot `website` para `/api/contact`.

A função `api/contact.js`:

- aceita apenas `POST`;
- ignora submissões que preenchem o honeypot;
- valida nome, e-mail e mensagem;
- escapa HTML antes de montar o e-mail;
- envia a mensagem via Resend usando `RESEND_API_KEY`;
- usa `CONTACT_EMAIL` como destinatário;
- usa `CONTACT_FROM_EMAIL` como remetente quando configurado;
- define `reply_to` com o e-mail informado pelo visitante.

#### Assistente de IA com OpenAI

A interface em `assets/js/ai-chat.js` envia `message` e `language` para `/api/chat`.

A função `api/chat.js`:

- aceita apenas `POST`;
- valida o tamanho da pergunta;
- lê o contexto público em `data/ai-context.md`;
- usa `OPEN_AI_API_KEY` somente no servidor;
- usa `OPENAI_MODEL` como modelo;
- responde em `pt-BR` ou `en-US`, conforme o idioma enviado pelo front-end;
- restringe a resposta ao contexto profissional do portfólio.

### Deploy

O projeto foi estruturado para deploy na Vercel.

Passos gerais:

1. Criar/importar o projeto na Vercel.
2. Configurar as variáveis de ambiente no painel do projeto.
3. Garantir que `index.html`, `assets/`, `data/` e `api/` estejam versionados.
4. Fazer o deploy pelo fluxo da Vercel ou pela Vercel CLI.

As funções em `/api` dependem das variáveis de ambiente configuradas no ambiente de deploy.

### Segurança

- Chaves de Resend e OpenAI não ficam no front-end.
- Chamadas sensíveis passam por Vercel Functions.
- Arquivos `.env`, `.env.*` e `.vercel/` são ignorados pelo Git.
- O formulário tem validação no cliente para UX e validação no servidor para segurança.
- O campo honeypot ajuda a descartar submissões automatizadas simples.
- O HTML do e-mail de contato usa escape de conteúdo informado pelo usuário.
- Erros internos são registrados no servidor e retornam mensagens genéricas ao cliente.
- O contexto da IA em `data/ai-context.md` deve conter apenas informações públicas.

### Acessibilidade

- A intro usa `role="dialog"` e pode ser fechada por botão ou tecla `Esc`.
- O modal de vídeo dos projetos usa `role="dialog"`, botão de fechar e fechamento por `Esc`.
- Os domínios da intro aceitam mouse, foco e navegação por teclado no fallback.
- O assistente de IA usa regiões com `aria-live`.
- Controles de tema e idioma expõem estado por atributos ARIA.
- O projeto respeita `prefers-reduced-motion` para reduzir animações não essenciais.

---

## English

### Purpose

This portfolio was created to present Leandro Fernandes' work to clients, recruiters, and partners. The interface brings together professional information, selected projects, technical skills, architecture principles, and contact channels in a lightweight, responsive experience without front-end dependencies.

### Main features

- Static SPA built with vanilla HTML, CSS, and JavaScript.
- Data-driven content for projects, architecture, security, skills, and the animated code editor.
- Native `pt-BR` and `en-US` language support, with a visual selector and `localStorage` persistence.
- Dark/light theme with `data-theme` and preference persistence in `localStorage`.
- Project cards with optional timeline metadata (`year` and `category`).
- Optional image and video support in project cards, with an accessible video modal.
- Optional "Professional Solar System" intro with Three.js loaded on demand.
- HTML/CSS fallback for the 3D intro when WebGL or CDN loading fails.
- AI assistant integrated through the Vercel Function at `/api/chat`.
- Contact form sent through Resend via the Vercel Function at `/api/contact`.
- Scroll animations, animated code editor in the hero, and `prefers-reduced-motion` support.
- Decorative cursor effect, disabled on touch devices or reduced motion.

### Technologies

| Feature | Usage |
| --- | --- |
| HTML, CSS, and JavaScript | Interface, section rendering, and SPA behavior |
| CSS custom properties | Color, spacing, typography, shadow, and theme tokens |
| Vercel Functions | Minimal backend for contact and AI |
| Resend API | Contact form email delivery |
| OpenAI API | AI assistant responses with professional context |
| Three.js | 3D intro scene, loaded on demand from CDN |
| Google Fonts | Inter and JetBrains Mono typography |
| LocalStorage | Language, theme, and intro state preferences |

### Folder structure

```txt
Portfólio/
├── api/
│   ├── chat.js
│   └── contact.js
├── assets/
│   ├── css/
│   │   ├── animations.css
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── layout.css
│   │   └── tokens.css
│   ├── js/
│   │   ├── ai-chat.js
│   │   ├── code-animation.js
│   │   ├── contact.js
│   │   ├── cursor-effect.js
│   │   ├── data.js
│   │   ├── i18n.js
│   │   ├── intro-experience.js
│   │   ├── main.js
│   │   ├── nav.js
│   │   ├── professional-solar-system.js
│   │   ├── reveal.js
│   │   ├── scroll-animations.js
│   │   └── theme.js
│   └── media/
│       └── projects/
│           ├── sigp/
│           └── sigpv2/
├── data/
│   └── ai-context.md
├── index.html
└── README.md
```

### Content and internationalization

The main content for projects, skills, architecture, security, and the animated editor lives in `assets/js/data.js`. The internationalization layer lives in `assets/js/i18n.js` and supports:

- `pt-BR`
- `en-US`

The selected language is saved under:

```txt
portfolioLanguage
```

Projects can use translated fields by language:

```js
title: {
  "pt-BR": "Nome do projeto",
  "en-US": "Project name"
},
description: {
  "pt-BR": "Descrição em português.",
  "en-US": "Description in English."
}
```

The optional `year` and `category` fields are rendered as subtle badges in project cards. Cards without these fields continue to work normally.

### Theme

The theme is controlled by `assets/js/theme.js` and applied to the `<html>` element:

```html
<html data-theme="dark">
```

or:

```html
<html data-theme="light">
```

The preference is saved under:

```txt
portfolioTheme
```

### Environment variables

Create a local `.env` file for `vercel dev` and configure the same variables in the Vercel dashboard for production. Do not commit `.env` files.

```txt
RESEND_API_KEY=your-resend-api-key
CONTACT_EMAIL=destination@example.com
CONTACT_FROM_EMAIL=Portfolio <noreply@example.com>
OPEN_AI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4.1-mini
```

Notes:

- `RESEND_API_KEY` is required for `/api/contact`.
- `CONTACT_EMAIL` should be the inbox that receives messages.
- `CONTACT_FROM_EMAIL` should use a verified Resend sender in production.
- `OPEN_AI_API_KEY` is required for `/api/chat`.
- `OPENAI_MODEL` defines the model used by the AI function.

### Running locally

To test only the static interface:

```bash
python3 -m http.server 8000
```

Open:

```txt
http://localhost:8000
```

To test the Vercel Functions (`/api/contact` and `/api/chat`), use the Vercel CLI:

```bash
vercel dev
```

This project does not currently include a `package.json` file and does not require npm scripts for the static interface.

### API and credential setup

#### Contact with Resend

The form in `assets/js/contact.js` sends `name`, `email`, `message`, and the `website` honeypot field to `/api/contact`.

The `api/contact.js` function:

- accepts only `POST`;
- ignores submissions that fill the honeypot;
- validates name, email, and message;
- escapes HTML before building the email;
- sends the message through Resend using `RESEND_API_KEY`;
- uses `CONTACT_EMAIL` as the recipient;
- uses `CONTACT_FROM_EMAIL` as the sender when configured;
- sets `reply_to` with the email provided by the visitor.

#### AI assistant with OpenAI

The interface in `assets/js/ai-chat.js` sends `message` and `language` to `/api/chat`.

The `api/chat.js` function:

- accepts only `POST`;
- validates the question length;
- reads the public context from `data/ai-context.md`;
- uses `OPEN_AI_API_KEY` only on the server;
- uses `OPENAI_MODEL` as the model;
- responds in `pt-BR` or `en-US`, according to the language sent by the front-end;
- keeps responses constrained to the portfolio's professional context.

### Deploy

The project is structured for deployment on Vercel.

General steps:

1. Create/import the project in Vercel.
2. Configure the environment variables in the project dashboard.
3. Ensure `index.html`, `assets/`, `data/`, and `api/` are versioned.
4. Deploy through the Vercel flow or the Vercel CLI.

The `/api` functions depend on environment variables configured in the deployment environment.

### Security

- Resend and OpenAI keys are not exposed in the front-end.
- Sensitive calls go through Vercel Functions.
- `.env`, `.env.*`, and `.vercel/` files are ignored by Git.
- The form has client-side validation for UX and server-side validation for security.
- The honeypot field helps discard simple automated submissions.
- Contact email HTML escapes user-provided content.
- Internal errors are logged on the server and returned to the client as generic messages.
- The AI context in `data/ai-context.md` should contain only public information.

### Accessibility

- The intro uses `role="dialog"` and can be closed by button or `Esc`.
- The project video modal uses `role="dialog"`, a close button, and `Esc` close behavior.
- Intro domains support mouse, focus, and keyboard navigation in fallback mode.
- The AI assistant uses `aria-live` regions.
- Theme and language controls expose state through ARIA attributes.
- The project respects `prefers-reduced-motion` to reduce non-essential animations.
