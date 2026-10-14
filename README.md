# Paróquia Senhor Santo Cristo dos Milagres

Portal institucional da Paróquia Senhor Santo Cristo dos Milagres, em Cidade Tiradentes, São Paulo.

## Tecnologias

- React, TypeScript e Vite
- Tailwind CSS
- Supabase (banco de dados, autenticação e armazenamento)
- Cloudflare Workers para publicação

## Desenvolvimento local

1. Instale as dependências com `npm install`.
2. Crie o arquivo `.env` com `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Inicie o projeto com `npm run dev`.

Para validar a versão de produção, execute `npm run build` e `npm run preview`.

## Publicação

O projeto está preparado para Cloudflare Workers:

- `npm run deploy:cf` gera a versão de produção e publica o Worker.
- `npm run dev:cf` executa o ambiente local do Worker.

As variáveis públicas do Supabase devem ser configuradas no ambiente de publicação. Segredos de servidor nunca devem usar o prefixo `VITE_`.

## Administração e segurança

O acesso ao painel depende de autenticação no Supabase e de registro na tabela `admin_users`.

- `super_admin`: acesso integral, inclusive à gestão de funções administrativas.
- `admin`: acesso ao conteúdo administrativo.
- `editor`: reservado para permissões editoriais futuras.

As políticas RLS do banco são a autoridade final de acesso. Conteúdos HTML exibidos no portal são sanitizados antes da renderização.
