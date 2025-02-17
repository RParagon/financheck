// Importa nossas funções de CRUD e o Chart.js (já incluído via CDN no HTML)
import { Storage } from './storage.js';
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.esm.js';

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
    } catch (error) {
      console.error('Erro ao renderizar dashboard:', error);
    }
  },

  async renderTransactions() {
    try {
      const transactions = await Storage.getTransactions();
      const tbody = document.querySelector('#transactions-table tbody');
      tbody.innerHTML = '';
      transactions.forEach((t) => {
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
      investments.forEach((inv) => {
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
      goals.forEach((goal) => {
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
