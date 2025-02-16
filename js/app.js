import { Storage } from './storage.js';
import { UI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa navegação e renderiza dados
  UI.initNavigation();
  UI.renderAll();

  // Adição de transação (receita ou despesa)
  document.getElementById('transaction-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.getElementById('transaction-description').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const type = document.getElementById('transaction-type').value;
    if (isNaN(amount)) return;
    Storage.addTransaction({ description, amount, type });
    UI.renderTransactions();
    UI.renderDashboard();
    e.target.reset();
  });

  // Adição de investimento
  document.getElementById('investment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('investment-name').value;
    const amount = parseFloat(document.getElementById('investment-amount').value);
    if (isNaN(amount)) return;
    Storage.addInvestment({ name, amount });
    UI.renderInvestments();
    e.target.reset();
  });

  // Adição de meta
  document.getElementById('goal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.getElementById('goal-description').value;
    const target = parseFloat(document.getElementById('goal-target').value);
    if (isNaN(target)) return;
    Storage.addGoal({ description, target });
    UI.renderGoals();
    e.target.reset();
  });

  // Delegação de eventos para exclusão
  document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-transaction')) {
      const index = e.target.dataset.index;
      Storage.deleteTransaction(index);
      UI.renderTransactions();
      UI.renderDashboard();
    }
    if (e.target.classList.contains('delete-investment')) {
      const index = e.target.dataset.index;
      Storage.deleteInvestment(index);
      UI.renderInvestments();
    }
    if (e.target.classList.contains('delete-goal')) {
      const index = e.target.dataset.index;
      Storage.deleteGoal(index);
      UI.renderGoals();
    }
  });
});
