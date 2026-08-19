# Guarda Certo 💰

Assistente de reserva de emergência: calcula a meta a partir do seu perfil,
acompanha o progresso e registra as movimentações.

React + TypeScript + Vite no front, **Supabase (Postgres + Auth)** no back.

## Rodando o projeto

```bash
npm install
cp .env.example .env   # preencha com os dados do seu projeto Supabase
npm run dev
```

Sem o `.env` preenchido o app não sobe — o client falha na hora, com mensagem
explícita, em vez de dar erro de rede confuso mais tarde.

## Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (o plano free basta).
2. Em **Project Settings → API**, copie a *Project URL* e a chave *anon public*
   para o seu `.env`:

   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=...
   ```

3. Abra o **SQL Editor** e rode o conteúdo de
   [`supabase/migrations/0001_reserva.sql`](supabase/migrations/0001_reserva.sql).
   Ele cria as tabelas, os índices, a view de saldo e — o mais importante — as
   policies de Row Level Security.
4. Em **Authentication → Providers**, deixe *Email* habilitado. Se quiser testar
   sem abrir o e-mail a cada cadastro, desligue *Confirm email* enquanto
   desenvolve.
5. Em **Authentication → URL Configuration**, adicione em *Redirect URLs* os
   endereços de onde o app roda — `http://localhost:5173/*` para
   desenvolvimento e a URL do Netlify em produção. O "esqueci minha senha"
   manda o usuário de volta para cá; sem essa lista, o Supabase rejeita o
   redirect e o link do e-mail não funciona.

### Por que o RLS não é opcional

A chave `anon` é pública: ela vai no bundle que o navegador baixa, e qualquer
pessoa consegue lê-la. Quem impede um usuário de ler os dados de outro são as
policies (`auth.uid() = user_id`), não a chave. Se você criar tabelas novas,
crie as policies junto — uma tabela com RLS desligado é uma tabela pública.

## Como os dados são guardados

| Tabela / view | O que é |
| --- | --- |
| `perfis` | uma linha por usuário (renda, gastos, idade, objetivo) |
| `transacoes` | livro-caixa, só insere e apaga — não existe UPDATE |
| `saldos` | view: soma das entradas menos as saídas, por usuário |

O saldo **não** é uma coluna. Guardar saldo e transações lado a lado abre espaço
para os dois divergirem; aqui o saldo é sempre derivado do livro-caixa.

O `localStorage` continua em uso, mas só como cache: ele preenche a tela no
primeiro frame e é sobrescrito assim que o servidor responde. É limpo no logout.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | type-check (`tsc -b`) + build de produção |
| `npm run lint` | ESLint |
| `npm run preview` | serve o build de produção localmente |
