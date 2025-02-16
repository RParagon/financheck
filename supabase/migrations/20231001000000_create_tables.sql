-- Habilita extensão UUID
create extension if not exists "uuid-ossp";

-- Tabela de Transações
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  description text not null,
  amount numeric(12,2) not null,
  type varchar(7) check (type in ('income', 'expense')),
  category varchar(50) not null,
  created_at timestamp with time zone default now()
);

-- Tabela de Metas
create table goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name varchar(100) not null,
  target_amount numeric(12,2) not null,
  current_amount numeric(12,2) default 0,
  deadline date
);

-- Row Level Security para Transações
alter table transactions enable row level security;
create policy "User can manage transactions" 
on transactions for all using (auth.uid() = user_id);

-- Row Level Security para Metas
alter table goals enable row level security;
create policy "User can manage goals" 
on goals for all using (auth.uid() = user_id);