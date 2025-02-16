import { supabase } from './db.js';
import { login, signup, logout } from './auth.js';
import { UI } from './ui.js';
import { addTransaction, addInvestment, addGoal } from './db.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Verifica se há usuário autenticado
  let { data: { user } } = await supabase.auth.getUser();
  if (user) {
    showApp();
    UI.renderAll(user.id);
  } else {
    showAuth();
  }

  // Monitora alterações no estado da autenticação
  supabase.auth.onAuthStateChange((event, session) => {
    if (session && session.user) {
      showApp();
      UI.renderAll(session.user.id);
    } else {
      showAuth();
    }
  });

  // Alterna entre abas Login e Cadastro
  const loginTab = document.getElementById('login-tab');
  const signupTab = document.getElementById('signup-tab');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  });

  signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });

  // Processa o login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
      await login(email, password);
      // O listener de auth irá atualizar a interface
    } catch (error) {
      alert('Erro no login: ' + error.message);
    }
  });

  // Processa o cadastro
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    try {
      await signup(email, password);
      alert('Cadastro realizado com sucesso! Verifique seu email para confirmação, se necessário.');
    } catch (error) {
      alert('Erro no cadastro: ' + error.message);
    }
  });

  // Logout
  document.getElementById('logout-button').addEventListener('click', async () => {
    await logout();
    showAuth();
  });

  // Inicializa a navegação entre seções
  UI.initNavigation();

  // Processa o formulário de Transações
  const transactionForm = document.getElementById('transaction-form');
  transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('transaction-description').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const type = document.getElementById('transaction-type').value;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await addTransaction({ description, amount, type, user_id: user.id });
    UI.renderTransactions(user.id);
    UI.renderDashboard(user.id);
    transactionForm.reset();
  });

  // Processa o formulário de Investimentos
  const investmentForm = document.getElementById('investment-form');
  investmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('investment-name').value;
    const amount = parseFloat(document.getElementById('investment-amount').value);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await addInvestment({ name, amount, user_id: user.id });
    UI.renderInvestments(user.id);
    investmentForm.reset();
  });

  // Processa o formulário de Metas
  const goalForm = document.getElementById('goal-form');
  goalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('goal-description').value;
    const target = parseFloat(document.getElementById('goal-target').value);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await addGoal({ description, target, user_id: user.id });
    UI.renderGoals(user.id);
    goalForm.reset();
  });
});

// Funções para exibir/esconder as seções de autenticação e app
function showAuth() {
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('app-section').classList.add('hidden');
  document.getElementById('app-nav').classList.add('hidden');
}

function showApp() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('app-section').classList.remove('hidden');
  document.getElementById('app-nav').classList.remove('hidden');
}
