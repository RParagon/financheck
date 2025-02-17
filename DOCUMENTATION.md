# FinanCheck v0.2 – Documentação Completa

## Introdução

**FinanCheck** é uma ferramenta web para gerenciamento financeiro pessoal. A aplicação permite que o usuário:
- Faça login e cadastro (usando o Supabase para autenticação);
- Registre transações (receitas e despesas);
- Gerencie investimentos e metas financeiras;
- Visualize um dashboard dinâmico com gráficos (usando Chart.js) mostrando o balanço entre receitas e despesas.

Esta documentação apresenta o código-fonte completo, explicando cada parte da aplicação de forma didática.

---

## Tecnologias Utilizadas

- **HTML5** – Estrutura da aplicação.
- **CSS3** – Estilização e design responsivo.
- **JavaScript (ES6 Modules)** – Lógica da aplicação.
- **Supabase** – Backend para autenticação e armazenamento (CRUD) de dados.
- **Chart.js** – Renderização de gráficos interativos.

---

## Estrutura de Arquivos

```
/financheck
├── index.html
├── css
│   └── styles.css
└── js
    ├── app.js
    ├── supabaseClient.js
    ├── auth.js
    ├── storage.js
    └── ui.js
```

---

## Descrição dos Arquivos

### 1. `index.html`

**Objetivo:**  
Define a estrutura principal da aplicação, contendo duas áreas:  
- **Tela de Autenticação:** Formulários para login e cadastro.  
- **Área do App:** Interface principal com o dashboard, seções de transações, investimentos e metas, além da navegação.

**Principais elementos:**
- `<div id="auth-container">` – Exibe os formulários de login e cadastro.
- `<div id="app-container">` – Contém a interface principal da FinanCheck.
- `<canvas id="balanceChart">` – Local onde o gráfico do dashboard é renderizado (usando Chart.js).

---

### 2. `css/styles.css`

**Objetivo:**  
Estilizar toda a interface do FinanCheck, garantindo:
- Layout limpo e responsivo;
- Estilização específica para formulários, tabelas, botões e a navegação.

**Principais componentes:**
- Reset CSS global e definição de tipografia;
- Estilos para a tela de autenticação (centralizada com box-shadow e bordas arredondadas);
- Estilos para o header, navegação e seções do app;
- Configurações para formulários e tabelas para uma boa experiência visual.

---

### 3. `js/supabaseClient.js`

**Objetivo:**  
Inicializar e configurar a conexão com o Supabase.

**Código:**
> **Atenção:** Os valores de `SUPABASE_URL` e `SUPABASE_ANON_KEY` foram substituídos por _placeholders_ para proteger dados sensíveis.

```js
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

const SUPABASE_URL = 'https://[seu-supabase-url]'; // Substitua pelo URL do seu Supabase
const SUPABASE_ANON_KEY = '[sua-anon-key]'; // Substitua pela sua chave anônima

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

### 4. `js/auth.js`

**Objetivo:**  
Gerenciar a autenticação dos usuários utilizando a API do Supabase.

**Funções principais:**
- `signUp(email, password)`: Cria um novo usuário.
- `signIn(email, password)`: Realiza login do usuário.
- `signOut()`: Efetua logout.
- `getUser()`: Retorna o usuário autenticado atualmente.
- `onAuthStateChange(callback)`: Permite registrar um callback para mudanças no estado de autenticação.

**Código:**

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

### 5. `js/storage.js`

**Objetivo:**  
Executar operações CRUD no banco de dados do Supabase para:
- **Transações**
- **Investimentos**
- **Metas**

Cada função interage com a tabela correspondente no Supabase e respeita as políticas de Row Level Security (RLS) configuradas.

**Código:**

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

### 6. `js/ui.js`

**Objetivo:**  
Controlar a interface do usuário, incluindo:
- **Navegação** entre as seções do app.
- **Renderização do Dashboard:** Exibe saldo atual e gráfico (doughnut) comparando receitas e despesas.
- **Renderização de tabelas:** Atualiza as listas de transações, investimentos e metas.

**Importante:**  
Como o Chart.js (versão 3+) exige que os componentes sejam registrados, usamos o comando `Chart.register(...registerables)`.

**Código Completo:**

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

      // Se já existir um gráfico, destrua-o para evitar conflitos
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

### 7. `js/app.js`

**Objetivo:**  
Integrar todas as funcionalidades:
- Configura eventos para formulários de login, cadastro, logout e envio de dados (transações, investimentos, metas);
- Inicializa a navegação e a renderização da interface;
- Verifica o estado de autenticação e alterna entre a tela de autenticação e a área do app.

**Código:**

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

## Como Utilizar

1. **Instalação e Configuração:**
   - Clone o repositório:
     ```bash
     git clone https://github.com/RParagon/financheck.git
     ```
   - Navegue até o branch `FinanCheck-SupaBase`:
     ```bash
     cd financheck
     git checkout FinanCheck-SupaBase
     ```
   - No arquivo `js/supabaseClient.js`, substitua os _placeholders_ de `SUPABASE_URL` e `SUPABASE_ANON_KEY` com as credenciais do seu projeto Supabase. **Atenção para não expor esses dados em repositórios públicos.**

2. **Executando Localmente:**
   - Utilize um servidor HTTP simples (por exemplo, `live-server` ou `http-server`) para executar o projeto.
   - Abra o `index.html` no seu navegador.

3. **Deploy:**
   - FinanCheck pode ser implantado em serviços de hospedagem estática, como Netlify.
   - Faça o deploy vinculando o repositório do GitHub à Netlify, garantindo que as configurações do Supabase estejam corretas.

---



Esta documentação completa inclui uma explicação detalhada de cada arquivo, a lógica de funcionamento, orientações de instalação e deploy, e um exemplo de README.md para o repositório do GitHub. Basta copiar e colar os arquivos conforme apresentados e ajustar os _placeholders_ com as informações do seu projeto. Se precisar de mais alguma alteração ou tiver dúvidas, estou à disposição para ajudar!
