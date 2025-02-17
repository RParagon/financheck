# FinanCheck v0.2 – Documentação Completa

**Autor:** Rafael Paragon  
**Versão:** v0.2  
**Data:** [Insira a data de lançamento]

---

## Sumário

1. [Introdução](#introdução)
2. [Funcionalidades](#funcionalidades)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Arquitetura e Estrutura do Projeto](#arquitetura-e-estrutura-do-projeto)
5. [Descrição dos Módulos e Arquivos](#descrição-dos-módulos-e-arquivos)
   - [index.html](#indexhtml)
   - [css/styles.css](#cssstylescss)
   - [js/supabaseClient.js](#jssupabaseclientjs)
   - [js/auth.js](#jsauthjs)
   - [js/storage.js](#jsstoragejs)
   - [js/ui.js](#jsuijs)
   - [js/app.js](#jsappjs)
6. [Configuração e Instalação](#configuração-e-instalação)
7. [Execução Local](#execução-local)
8. [Deploy](#deploy)
9. [Contribuição](#contribuição)
10. [Licença](#licença)

---

## Introdução

O **FinanCheck** é uma aplicação web para gerenciamento financeiro pessoal. Com esta ferramenta, os usuários podem:
- Realizar cadastro e login por meio do Supabase.
- Registrar e visualizar transações (receitas e despesas).
- Gerenciar investimentos e metas financeiras.
- Visualizar um dashboard dinâmico que apresenta o saldo atual e um gráfico interativo comparando receitas e despesas (utilizando Chart.js).

Esta documentação apresenta de forma detalhada a arquitetura, o funcionamento e a configuração do FinanCheck.

---

## Funcionalidades

- **Autenticação e Cadastro:**  
  Integração com o Supabase para gerenciamento de usuários e controle de acesso.

- **Gerenciamento de Dados Financeiros:**  
  CRUD completo para transações, investimentos e metas financeiras.

- **Dashboard Dinâmico:**  
  Visualização de saldo atual e gráficos interativos (doughnut chart) para análise rápida dos dados.

- **Interface Responsiva:**  
  Design moderno e responsivo desenvolvido com HTML, CSS e JavaScript (ES6 Modules).

---

## Tecnologias Utilizadas

- **HTML5** – Estrutura semântica e acessível.
- **CSS3** – Estilização e design responsivo.
- **JavaScript (ES6 Modules)** – Lógica do aplicativo, manipulação da interface e integração com APIs.
- **Supabase** – Backend para autenticação e operações CRUD (com políticas de Row Level Security configuradas).
- **Chart.js** – Renderização de gráficos interativos para o dashboard.

---

## Arquitetura e Estrutura do Projeto

O projeto está organizado de forma modular, facilitando a manutenção e a escalabilidade. A estrutura de diretórios é a seguinte:

```
/financheck
├── index.html          # Estrutura principal da aplicação
├── css
│   └── styles.css      # Estilos e design da aplicação
└── js
    ├── app.js          # Lógica principal do aplicativo (integração dos módulos)
    ├── supabaseClient.js  # Configuração e inicialização do Supabase
    ├── auth.js         # Módulo de autenticação (login, cadastro, logout)
    ├── storage.js      # Operações CRUD com Supabase para transações, investimentos e metas
    └── ui.js           # Renderização da interface, navegação e integração com Chart.js
```

---

## Descrição dos Módulos e Arquivos

### index.html

Define a estrutura da interface da aplicação, dividindo-a em duas áreas principais:

- **Tela de Autenticação:**  
  Exibe os formulários de login e cadastro para o usuário.

- **Área do Aplicativo:**  
  Contém o dashboard, seções de transações, investimentos e metas, além da navegação.

Contém também a inclusão do Chart.js via CDN e o script principal (`js/app.js`) que utiliza módulos ES6.

---

### css/styles.css

Responsável pela estilização da aplicação, com foco em:
- Layout limpo e responsivo.
- Estilização dos formulários, botões, tabelas e navegação.
- Configurações específicas para a tela de autenticação e para a área principal do app.

---

### js/supabaseClient.js

Inicializa e configura a conexão com o Supabase.  
> **Atenção:** Os valores de `SUPABASE_URL` e `SUPABASE_ANON_KEY` foram substituídos por _placeholders_ para proteger dados sensíveis.

```js
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

const SUPABASE_URL = 'https://[seu-supabase-url]'; // Substitua pelo URL do seu Supabase
const SUPABASE_ANON_KEY = '[sua-anon-key]'; // Substitua pela sua chave anônima

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

### js/auth.js

Gerencia a autenticação de usuários utilizando a API do Supabase.  
Principais funções:
- **signUp(email, password):** Cria um novo usuário.
- **signIn(email, password):** Realiza o login.
- **signOut():** Efetua o logout.
- **getUser():** Retorna o usuário autenticado.
- **onAuthStateChange(callback):** Registra um callback para alterações no estado de autenticação.

```js
import { supabase } from './supabaseClient.js';

export const Auth = {
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Erro ao deslogar:', error);
  },

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange(callback) {
    supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};
```

---

### js/storage.js

Executa operações CRUD no banco de dados do Supabase para as tabelas:
- **transactions**
- **investments**
- **goals**

Cada função garante que, em caso de erro, uma exceção seja lançada para tratamento apropriado no aplicativo.

```js
import { supabase } from './supabaseClient.js';

export const Storage = {
  // Transações
  async getTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addTransaction(transaction) {
    // transaction: { description, amount, type, user_id }
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction]);
    if (error) throw error;
    return data;
  },

  async deleteTransaction(id) {
    const { data, error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  // Investimentos
  async getInvestments() {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addInvestment(investment) {
    // investment: { name, amount, user_id }
    const { data, error } = await supabase
      .from('investments')
      .insert([investment]);
    if (error) throw error;
    return data;
  },

  async deleteInvestment(id) {
    const { data, error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  // Metas
  async getGoals() {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addGoal(goal) {
    // goal: { description, target, user_id }
    const { data, error } = await supabase
      .from('goals')
      .insert([goal]);
    if (error) throw error;
    return data;
  },

  async deleteGoal(id) {
    const { data, error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  }
};
```

---

### js/ui.js

Controla a renderização da interface e a navegação entre seções.  
Principais responsabilidades:
- **Dashboard:** Exibe o saldo atual e renderiza um gráfico interativo (doughnut) com Chart.js.  
  *Observação:* Registra os componentes do Chart.js para garantir que o tipo "doughnut" seja reconhecido e destrói instâncias anteriores para evitar conflitos.
- **Listagens:** Atualiza as tabelas de transações, investimentos e metas com os dados recuperados do Supabase.

```js
import { Chart, registerables } from 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.esm.js';
import { Storage } from './storage.js';

Chart.register(...registerables);

export const UI = {
  chart: null,

  initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('main section').forEach(sec => sec.classList.remove('active'));
        const target = e.target.getAttribute('href');
        document.querySelector(target).classList.add('active');
      });
    });
  },

  async renderDashboard() {
    try {
      const transactions = await Storage.getTransactions();
      let totalIncome = 0;
      let totalExpense = 0;
      transactions.forEach(t => {
        if (t.type === 'income') totalIncome += parseFloat(t.amount);
        else totalExpense += parseFloat(t.amount);
      });
      const balance = totalIncome - totalExpense;
      document.getElementById('current-balance').textContent = `R$ ${balance.toFixed(2)}`;

      const ctx = document.getElementById('balanceChart').getContext('2d');

      if (UI.chart) {
        UI.chart.destroy();
      }

      UI.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Receitas', 'Despesas'],
          datasets: [{
            data: [totalIncome, totalExpense],
            backgroundColor: ['#28a745', '#dc3545']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    } catch (error) {
      console.error('Erro ao renderizar dashboard:', error);
    }
  },

  async renderTransactions() {
    try {
      const transactions = await Storage.getTransactions();
      const tbody = document.querySelector('#transactions-table tbody');
      tbody.innerHTML = '';
      transactions.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${t.description}</td>
          <td>${t.type === 'income' ? 'Receita' : 'Despesa'}</td>
          <td>R$ ${parseFloat(t.amount).toFixed(2)}</td>
          <td><button class="delete-transaction" data-id="${t.id}">Excluir</button></td>
        `;
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error('Erro ao renderizar transações:', error);
    }
  },

  async renderInvestments() {
    try {
      const investments = await Storage.getInvestments();
      const tbody = document.querySelector('#investments-table tbody');
      tbody.innerHTML = '';
      investments.forEach(inv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${inv.name}</td>
          <td>R$ ${parseFloat(inv.amount).toFixed(2)}</td>
          <td><button class="delete-investment" data-id="${inv.id}">Excluir</button></td>
        `;
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error('Erro ao renderizar investimentos:', error);
    }
  },

  async renderGoals() {
    try {
      const goals = await Storage.getGoals();
      const tbody = document.querySelector('#goals-table tbody');
      tbody.innerHTML = '';
      goals.forEach(goal => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${goal.description}</td>
          <td>R$ ${parseFloat(goal.target).toFixed(2)}</td>
          <td><button class="delete-goal" data-id="${goal.id}">Excluir</button></td>
        `;
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error('Erro ao renderizar metas:', error);
    }
  },

  async renderAll() {
    await UI.renderDashboard();
    await UI.renderTransactions();
    await UI.renderInvestments();
    await UI.renderGoals();
  }
};
```

---

### js/app.js

Integra todos os módulos e orquestra a lógica do FinanCheck.  
Responsabilidades:
- Alternar entre os formulários de autenticação (login/cadastro) e a área principal do app.
- Gerenciar eventos de envio de dados (cadastro, login, adição de transações/investimentos/metas e exclusões).
- Monitorar alterações no estado de autenticação e renderizar as informações conforme o usuário logado.

```js
import { supabase } from './supabaseClient.js';
import { Auth } from './auth.js';
import { Storage } from './storage.js';
import { UI } from './ui.js';

let currentUserId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Alterna entre formulários de login e cadastro
  document.getElementById('show-signup').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('signup-form-container').style.display = 'block';
  });
  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signup-form-container').style.display = 'none';
    document.getElementById('login-form-container').style.display = 'block';
  });

  // Login
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
      await Auth.signIn(email, password);
      await checkUser();
    } catch (error) {
      alert('Erro no login: ' + error.message);
    }
  });

  // Cadastro
  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    try {
      await Auth.signUp(email, password);
      alert('Cadastro realizado com sucesso! Verifique seu email para confirmar.');
      document.getElementById('signup-form-container').style.display = 'none';
      document.getElementById('login-form-container').style.display = 'block';
    } catch (error) {
      alert('Erro no cadastro: ' + error.message);
    }
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await Auth.signOut();
    currentUserId = null;
    toggleAuth(true);
  });

  // Envio de nova transação
  document.getElementById('transaction-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('transaction-description').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const type = document.getElementById('transaction-type').value;
    try {
      await Storage.addTransaction({ description, amount, type, user_id: currentUserId });
      await UI.renderAll();
      e.target.reset();
    } catch (error) {
      alert('Erro ao adicionar transação: ' + error.message);
    }
  });

  // Envio de novo investimento
  document.getElementById('investment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('investment-name').value;
    const amount = parseFloat(document.getElementById('investment-amount').value);
    try {
      await Storage.addInvestment({ name, amount, user_id: currentUserId });
      await UI.renderInvestments();
      e.target.reset();
    } catch (error) {
      alert('Erro ao adicionar investimento: ' + error.message);
    }
  });

  // Envio de nova meta
  document.getElementById('goal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('goal-description').value;
    const target = parseFloat(document.getElementById('goal-target').value);
    try {
      await Storage.addGoal({ description, target, user_id: currentUserId });
      await UI.renderGoals();
      e.target.reset();
    } catch (error) {
      alert('Erro ao adicionar meta: ' + error.message);
    }
  });

  // Eventos de exclusão (delegação)
  document.body.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-transaction')) {
      const id = e.target.dataset.id;
      try {
        await Storage.deleteTransaction(id);
        await UI.renderAll();
      } catch (error) {
        alert('Erro ao excluir transação: ' + error.message);
      }
    }
    if (e.target.classList.contains('delete-investment')) {
      const id = e.target.dataset.id;
      try {
        await Storage.deleteInvestment(id);
        await UI.renderInvestments();
      } catch (error) {
        alert('Erro ao excluir investimento: ' + error.message);
      }
    }
    if (e.target.classList.contains('delete-goal')) {
      const id = e.target.dataset.id;
      try {
        await Storage.deleteGoal(id);
        await UI.renderGoals();
      } catch (error) {
        alert('Erro ao excluir meta: ' + error.message);
      }
    }
  });

  // Verifica se há usuário logado ao iniciar
  await checkUser();

  // Escuta alterações de autenticação
  supabase.auth.onAuthStateChange((event, session) => {
    checkUser();
  });
});

async function checkUser() {
  const user = await Auth.getUser();
  if (user) {
    currentUserId = user.id;
    toggleAuth(false);
    await UI.renderAll();
  } else {
    toggleAuth(true);
  }
}

function toggleAuth(showAuth) {
  document.getElementById('auth-container').style.display = showAuth ? 'block' : 'none';
  document.getElementById('app-container').style.display = showAuth ? 'none' : 'block';
}
```

---

## Configuração e Instalação

1. **Clone o Repositório:**

   ```bash
   git clone https://github.com/RParagon/financheck.git
   ```
2. **Navegue até o branch FinanCheck-SupaBase:**

   ```bash
   cd financheck
   git checkout FinanCheck-SupaBase
   ```
3. **Configuração do Supabase:**

   No arquivo `js/supabaseClient.js`, substitua os _placeholders_ de `SUPABASE_URL` e `SUPABASE_ANON_KEY` pelas credenciais do seu projeto Supabase.  
   **Atenção:** Nunca exponha essas informações em repositórios públicos.

---

## Execução Local

Para testar o FinanCheck localmente, utilize um servidor HTTP simples. Por exemplo, com o `live-server`:

```bash
npx live-server
```

Ou com o `http-server`:

```bash
npx http-server .
```

Abra o navegador e acesse o endereço local (por exemplo, `http://localhost:8080`).

---

## Deploy

O FinanCheck é uma aplicação estática e pode ser implantado em serviços como a Netlify.  
Basta conectar o repositório do GitHub com o serviço de deploy e configurar as variáveis de ambiente necessárias (se houver).

---

## Contribuição

Se desejar contribuir com o projeto, siga as etapas abaixo:

1. Faça um fork do repositório.
2. Crie uma branch para sua feature (`git checkout -b feature/nome-da-feature`).
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`).
4. Envie a branch (`git push origin feature/nome-da-feature`).
5. Abra um Pull Request.

---

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

*Nota: Certifique-se de não expor dados sensíveis (como chaves de API) em repositórios públicos.*

---

# Fim da Documentação
```
