import { fetchTransactions, fetchInvestments, fetchGoals, deleteTransaction, deleteInvestment, deleteGoal } from './db.js';
import { supabase } from './db.js';
import { Chart } from 'chart.js';

export const UI = {
  // Inicializa a navegação entre seções do app
  initNavigation: () => {
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

  // Renderiza o Dashboard com saldo e gráfico
  renderDashboard: async (userId) => {
    const transactions = await fetchTransactions(userId);
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += parseFloat(t.amount);
      else totalExpense += parseFloat(t.amount);
    });
    const balance = totalIncome - totalExpense;
    document.getElementById('current-balance').textContent = `R$ ${balance.toFixed(2)}`;

    // Atualiza o gráfico (destrói o anterior, se houver)
    const ctx = document.getElementById('balanceChart').getContext('2d');
    if (UI.chart) UI.chart.destroy();
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
  },

  // Renderiza a tabela de Transações
  renderTransactions: async (userId) => {
    const transactions = await fetchTransactions(userId);
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
  },

  // Renderiza a tabela de Investimentos
  renderInvestments: async (userId) => {
    const investments = await fetchInvestments(userId);
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
  },

  // Renderiza a tabela de Metas
  renderGoals: async (userId) => {
    const goals = await fetchGoals(userId);
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
  },

  // Renderiza todas as seções da aplicação
  renderAll: async (userId) => {
    await UI.renderDashboard(userId);
    await UI.renderTransactions(userId);
    await UI.renderInvestments(userId);
    await UI.renderGoals(userId);
  }
};

// Delegação de eventos para exclusão de registros
document.body.addEventListener('click', async (e) => {
  // Obtenha o usuário a partir do Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (e.target.classList.contains('delete-transaction')) {
    const id = e.target.dataset.id;
    await deleteTransaction(id);
    UI.renderTransactions(user.id);
    UI.renderDashboard(user.id);
  }
  if (e.target.classList.contains('delete-investment')) {
    const id = e.target.dataset.id;
    await deleteInvestment(id);
    UI.renderInvestments(user.id);
  }
  if (e.target.classList.contains('delete-goal')) {
    const id = e.target.dataset.id;
    await deleteGoal(id);
    UI.renderGoals(user.id);
  }
});
