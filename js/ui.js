import { Storage } from './storage.js';

export class UI {
  // Inicializa a navegação entre seções
  static initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('main section').forEach(sec => sec.classList.remove('active'));
        const target = e.target.getAttribute('href');
        document.querySelector(target).classList.add('active');
      });
    });
  }

  // Renderiza o dashboard com saldo e gráfico
  static renderDashboard() {
    const transactions = Storage.getTransactions();
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;
    });
    const balance = totalIncome - totalExpense;
    document.getElementById('current-balance').textContent = `R$ ${balance.toFixed(2)}`;

    // Renderiza gráfico com Chart.js
    const ctx = document.getElementById('balanceChart').getContext('2d');
    // Se já houver um gráfico renderizado, destrói-o para atualizar
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
  }

  // Renderiza a lista de transações
  static renderTransactions() {
    const transactions = Storage.getTransactions();
    const tbody = document.querySelector('#transactions-table tbody');
    tbody.innerHTML = '';
    transactions.forEach((t, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${t.description}</td>
        <td>${t.type === 'income' ? 'Receita' : 'Despesa'}</td>
        <td>R$ ${t.amount.toFixed(2)}</td>
        <td><button class="delete-transaction" data-index="${index}">Excluir</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Renderiza a lista de investimentos
  static renderInvestments() {
    const investments = Storage.getInvestments();
    const tbody = document.querySelector('#investments-table tbody');
    tbody.innerHTML = '';
    investments.forEach((inv, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${inv.name}</td>
        <td>R$ ${inv.amount.toFixed(2)}</td>
        <td><button class="delete-investment" data-index="${index}">Excluir</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Renderiza a lista de metas
  static renderGoals() {
    const goals = Storage.getGoals();
    const tbody = document.querySelector('#goals-table tbody');
    tbody.innerHTML = '';
    goals.forEach((goal, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${goal.description}</td>
        <td>R$ ${goal.target.toFixed(2)}</td>
        <td><button class="delete-goal" data-index="${index}">Excluir</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Renderiza todas as seções
  static renderAll() {
    UI.renderDashboard();
    UI.renderTransactions();
    UI.renderInvestments();
    UI.renderGoals();
  }
}
