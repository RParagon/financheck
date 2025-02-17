import { supabase } from './supabaseClient.js';
import { Auth } from './auth.js';
import { Storage } from './storage.js';
import { UI } from './ui.js';
import { Gamification } from './gamification.js';

let currentUserId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Inicializa a navegação e o menu mobile
  UI.initNavigation();
  UI.initMenuToggle();

  // Alternar entre formulários de login e cadastro
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
      // Atualiza pontos: exemplo 10 pontos por transação
      const progress = await Gamification.getUserProgress(currentUserId);
      const newPoints = (progress.points || 0) + 10;
      await Gamification.updateUserProgress(currentUserId, newPoints);
      // Verifica conquista da primeira transação
      await Gamification.checkAndAwardAchievement(currentUserId, 'primeira_transacao');
      await UI.renderAll(currentUserId);
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
        await UI.renderAll(currentUserId);
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

  await checkUser();

  // Escuta alterações no estado de autenticação
  supabase.auth.onAuthStateChange((event, session) => {
    checkUser();
  });

  // Registra o Service Worker (PWA)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => console.log('Service Worker registrado:', registration))
      .catch(error => console.error('Erro no registro do Service Worker:', error));
  }
});

async function checkUser() {
  const user = await Auth.getUser();
  if (user) {
    currentUserId = user.id;
    toggleAuth(false);
    await UI.renderAll(currentUserId);
  } else {
    toggleAuth(true);
  }
}

function toggleAuth(showAuth) {
  document.getElementById('auth-container').style.display = showAuth ? 'block' : 'none';
  document.getElementById('app-container').style.display = showAuth ? 'none' : 'block';
}
