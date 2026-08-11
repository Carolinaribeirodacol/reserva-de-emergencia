-- Guarda Certo — schema inicial
-- Rode este arquivo no SQL Editor do Supabase (ou via `supabase db push`).

-- ── Perfis ────────────────────────────────────────────────
-- Uma linha por usuário: a chave primária É o id do usuário,
-- então não existe como alguém ter dois perfis.
create table if not exists public.perfis (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  renda      numeric(12, 2) not null check (renda >= 0),
  gastos     numeric(12, 2) not null check (gastos >= 0),
  idade      integer        not null check (idade between 16 and 120),
  objetivo   text           not null check (objetivo in ('estabilidade', 'viagem', 'outro')),
  criado_em  timestamptz    not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ── Transações ────────────────────────────────────────────
-- Livro-caixa append-only: o saldo é derivado daqui, nunca guardado.
create table if not exists public.transacoes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid           not null references auth.users (id) on delete cascade,
  tipo       text           not null check (tipo in ('entrada', 'saida')),
  valor      numeric(12, 2) not null check (valor > 0),
  motivo     text           not null check (length(trim(motivo)) > 0),
  criada_em  timestamptz    not null default now()
);

-- O app sempre lê as transações de um usuário em ordem cronológica.
create index if not exists transacoes_user_data_idx
  on public.transacoes (user_id, criada_em desc);

-- ── Saldo derivado ────────────────────────────────────────
-- security_invoker faz a view rodar com as permissões de quem consulta,
-- então o RLS de transacoes vale aqui também. Sem isso, a view vazaria
-- o saldo de todo mundo.
create or replace view public.saldos with (security_invoker = on) as
  select
    user_id,
    greatest(
      0,
      coalesce(sum(case when tipo = 'entrada' then valor else -valor end), 0)
    ) as saldo
  from public.transacoes
  group by user_id;

-- ── Row Level Security ────────────────────────────────────
-- A chave anon é pública: sem as policies abaixo, qualquer pessoa com o
-- bundle do site leria as tabelas inteiras. Esta é a parte que não pode
-- ficar de fora.
alter table public.perfis     enable row level security;
alter table public.transacoes enable row level security;

drop policy if exists "perfil próprio: ler"     on public.perfis;
drop policy if exists "perfil próprio: criar"   on public.perfis;
drop policy if exists "perfil próprio: alterar" on public.perfis;
drop policy if exists "perfil próprio: apagar"  on public.perfis;

create policy "perfil próprio: ler"
  on public.perfis for select
  using (auth.uid() = user_id);

create policy "perfil próprio: criar"
  on public.perfis for insert
  with check (auth.uid() = user_id);

create policy "perfil próprio: alterar"
  on public.perfis for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "perfil próprio: apagar"
  on public.perfis for delete
  using (auth.uid() = user_id);

drop policy if exists "transações próprias: ler"    on public.transacoes;
drop policy if exists "transações próprias: criar"  on public.transacoes;
drop policy if exists "transações próprias: apagar" on public.transacoes;

create policy "transações próprias: ler"
  on public.transacoes for select
  using (auth.uid() = user_id);

create policy "transações próprias: criar"
  on public.transacoes for insert
  with check (auth.uid() = user_id);

create policy "transações próprias: apagar"
  on public.transacoes for delete
  using (auth.uid() = user_id);

-- Não existe policy de UPDATE em transacoes de propósito: um livro-caixa
-- não se reescreve. Para corrigir um lançamento, apague e registre de novo.

-- ── atualizado_em automático ──────────────────────────────
create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists perfis_atualizado_em on public.perfis;
create trigger perfis_atualizado_em
  before update on public.perfis
  for each row execute function public.tocar_atualizado_em();
