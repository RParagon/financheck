# FinanCheck v0.2

FinanCheck é uma ferramenta web de gerenciamento financeiro pessoal desenvolvida por Rafael Paragon. Com FinanCheck, os usuários podem gerenciar transações, investimentos e metas financeiras, além de visualizar um dashboard interativo que apresenta um gráfico comparando receitas e despesas.

## Funcionalidades
- **Autenticação:** Login e cadastro utilizando Supabase.
- **CRUD Completo:** Adição, listagem e exclusão de transações, investimentos e metas.
- **Dashboard Dinâmico:** Visualização de saldo e gráfico "doughnut" com Chart.js.
- **Interface Responsiva:** Desenvolvido com HTML, CSS e JavaScript (ES6 Modules).

## Tecnologias
- **HTML5**
- **CSS3**
- **JavaScript (ES6 Modules)**
- **[Supabase](https://supabase.com/)**
- **[Chart.js](https://www.chartjs.org/)**

## Instalação

### Pré-requisitos
- Conta e projeto no Supabase configurado com as tabelas `transactions`, `investments` e `goals` e as políticas de Row Level Security (RLS).
- [Node.js](https://nodejs.org/) (opcional, para rodar um servidor de desenvolvimento local).

### Passos
1. Clone o repositório:
   ```bash
   git clone https://github.com/RParagon/financheck.git
   ```
2. Navegue para o branch `FinanCheck-SupaBase`:
   ```bash
   cd financheck
   git checkout FinanCheck-SupaBase
   ```
3. No arquivo `js/supabaseClient.js`, atualize as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` com as credenciais do seu projeto Supabase. **Certifique-se de manter esses dados seguros.**

## Execução Local
Utilize um servidor HTTP para executar o projeto localmente. Por exemplo, com `live-server`:
```bash
npx live-server
```
Abra o navegador em `http://localhost:8080`.

## Deploy
FinanCheck é uma aplicação estática e pode ser implantada em serviços como Netlify. Basta vincular o repositório do GitHub e configurar as variáveis de ambiente necessárias.

## Estrutura do Projeto
```
/financheck
├── index.html          # Arquivo principal HTML
├── css
│   └── styles.css      # Estilos da aplicação
└── js
    ├── app.js          # Lógica principal do app
    ├── supabaseClient.js  # Configuração do Supabase (atenção com dados sensíveis)
    ├── auth.js         # Módulo de autenticação
    ├── storage.js      # Operações CRUD com Supabase
    └── ui.js           # Renderização da interface e integração com Chart.js
```

## Documentação
Para uma documentação completa e detalhada do código, veja o arquivo de documentação incluído neste repositório.

## Licença
Este projeto é licenciado sob a [MIT License](LICENSE).

## Autor
Rafael Paragon