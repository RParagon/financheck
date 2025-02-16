// js/app.js
import { Auth } from './auth.js';
import { UI } from './ui.js';
import { Storage } from './storage.js';
import { supabaseClient } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  const authContainer = document.getElementById('auth-container');
  const appContainer = document.getElementById('app-container');

  // --- Verifica se há sessão ativa ---
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    showApp(session.user);
  } else {
    showAuth();
  }

  // --- Monitoramento de mudanças de autenticação ---
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session) {
      showApp(session.user);
    } else {
      showAuth();
    }
  });

  // --- Funções para alternar entre telas ---
  function showApp(user) {
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    UI.initNavigation();
    UI.renderAll(user);
  }

  function showAuth() {
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
  }

  // --- Alterna entre formulários de Login e Cadastro ---
  const loginFormContainer = document.getElementById('login-form');
  const signupFormContainer = document.getElementById('signup-form');
  document.getElementById('show-signup').addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.classList.add('hidden');
    signupFormContainer.classList.remove('hidden');
  });
  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    signupFormContainer.classList.add('hidden');
    loginFormContainer.classList.remove('hidden');
  });

  // --- Processa Login ---
  document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const { user, error } = await Auth.signIn(email, password);
    if (error) {
      document.getElementById('login-error').textContent = error.message;
    } else {
      document.getElementById('login-error').textContent = '';
      // A alteração de estado acionará o showApp.
    }
  });

  // --- Processa Cadastro ---
  document.getElementById('form-signup').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const { user, error } = await Auth.signUp(email, password);
    if (error) {
      document.getElementById('signup-error').textContent = error.message;
    } else {
      document.getElementById('signup-error').textContent =
        'Cadastro realizado! Verifique seu email para confirmar sua conta.';
      // Opcional: você pode redirecionar o usuário para a tela de login.
    }
  });

  // --- Logout ---
  document.getElementById('logout-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    await Auth.signOut();
  });

  // --- Formulário de Transações ---
  document.getElementById('transaction-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('transaction-description').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const type = document.getElementById('transaction-type').value;
    await Storage.addTransaction({ description, amount, type });
    UI.renderDashboard();
    UI.renderTransactions();
    e.target.reset();
  });

  // --- Formulário de Investimentos ---
  document.getElementById('investment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('investment-name').value;
    const amount = parseFloat(document.getElementById('investment-amount').value);
    await Storage.addInvestment({ name, amount });
    UI.renderInvestments();
    e.target.reset();
  });

  // --- Formulário de Metas ---
  document.getElementById('goal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('goal-description').value;
    const target = parseFloat(document.getElementById('goal-target').value);
    await Storage.addGoal({ description, target });
    UI.renderGoals();
    e.target.reset();
  });

  // --- Delegação de eventos para exclusão ---
  document.body.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-transaction')) {
      const id = e.target.dataset.id;
      await Storage.deleteTransaction(id);
      UI.renderDashboard();
      UI.renderTransactions();
    }
    if (e.target.classList.contains('delete-investment')) {
      const id = e.target.dataset.id;
      await Storage.deleteInvestment(id);
      UI.renderInvestments();
    }
    if (e.target.classList.contains('delete-goal')) {
      const id = e.target.dataset.id;
      await Storage.deleteGoal(id);
      UI.renderGoals();
    }
  });
});
