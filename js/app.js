/******************************************************************
 * FinanCheck v0.3 - Arquivo Principal: app.js
 * Desenvolvido por Rafael Paragon
 * Orquestra a aplicação: integra autenticação, armazenamento,
 * gamificação, UI, temas, modais e PWA.
 ******************************************************************/

import { supabase } from './supabaseClient.js';
import { Auth } from './auth.js';
import { Storage } from './storage.js';
import { UI } from './ui.js';
import { Gamification } from './gamification.js';

let currentUserId = null;
let appSettings = {
  theme: 'light',
  language: 'pt'
};

function saveSettings(settings) {
  localStorage.setItem('financheck-settings', JSON.stringify(settings));
}

function loadSettings() {
  const settings = localStorage.getItem('financheck-settings');
  if (settings) {
    appSettings = JSON.parse(settings);
  } else {
    saveSettings(appSettings);
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function applyLanguage(lang) {
  // Exemplo simples: atualiza o texto da tagline
  const tagline = document.querySelector('#auth-header .tagline');
  if (tagline) {
    tagline.textContent = lang === 'pt'
      ? "Organize, evolua e cresça financeiramente!"
      : "Organize, evolve and grow financially!";
  }
}

function initSettingsEvents() {
  const themeSelect = document.getElementById('theme-select');
  const langSelect = document.getElementById('lang-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      appSettings.theme = e.target.value;
      saveSettings(appSettings);
      applyTheme(appSettings.theme);
    });
  }
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      appSettings.language = e.target.value;
      saveSettings(appSettings);
      applyLanguage(appSettings.language);
    });
  }
}

function toggleAuth(showAuth) {
  document.getElementById('auth-container').style.display = showAuth ? 'block' : 'none';
  document.getElementById('app-container').style.display = showAuth ? 'none' : 'block';
  console.log('[App] Interface atualizada. Autenticado:', !showAuth);
}

async function checkUser() {
  try {
    const user = await Auth.getUser();
    if (user) {
      currentUserId = user.id;
      console.log('[App] Usuário autenticado:', user.email);
      toggleAuth(false);
      await UI.renderAll(currentUserId);
    } else {
      console.log('[App] Nenhum usuário autenticado.');
      toggleAuth(true);
    }
  } catch (error) {
    console.error('[App] Erro ao verificar usuário:', error);
    toggleAuth(true);
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('[PWA] Service Worker registrado:', registration.scope);
      })
      .catch(error => {
        console.error('[PWA] Erro no registro do Service Worker:', error);
      });
  }
}

function initPWAInstallPrompt() {
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.innerHTML = '<p>Instale o FinanCheck para acessar suas finanças de qualquer lugar!</p><button id="install-btn">Instalar</button>';
    document.body.appendChild(installBanner);
    document.getElementById('install-btn').addEventListener('click', async () => {
      installBanner.style.display = 'none';
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] Resultado da instalação:', outcome);
      deferredPrompt = null;
    });
  });
}

function initAuthEvents() {
  document.getElementById('show-signup').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('signup-form-container').style.display = 'block';
    console.log('[App] Exibindo tela de cadastro.');
  });
  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signup-form-container').style.display = 'none';
    document.getElementById('login-form-container').style.display = 'block';
    console.log('[App] Exibindo tela de login.');
  });
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
      await Auth.signIn(email, password);
      console.log('[App] Login efetuado.');
      await checkUser();
    } catch (error) {
      console.error('[App] Erro no login:', error);
      alert('Erro no login: ' + error.message);
    }
  });
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
      console.error('[App] Erro no cadastro:', error);
      alert('Erro no cadastro: ' + error.message);
    }
  });
}

function initLogoutEvent() {
  document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
      await Auth.signOut();
      currentUserId = null;
      toggleAuth(true);
      console.log('[App] Logout efetuado.');
    } catch (error) {
      console.error('[App] Erro no logout:', error);
    }
  });
}

function initFinancialFormEvents() {
  document.getElementById('transaction-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('transaction-description').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const type = document.getElementById('transaction-type').value;
    try {
      await Storage.addTransaction({ description, amount, type, user_id: currentUserId });
      Gamification.updateProgress(10);
      await UI.renderAll(currentUserId);
      e.target.reset();
    } catch (error) {
      console.error('[App] Erro ao adicionar transação:', error);
      alert('Erro ao adicionar transação: ' + error.message);
    }
  });
  document.getElementById('investment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('investment-name').value;
    const amount = parseFloat(document.getElementById('investment-amount').value);
    try {
      await Storage.addInvestment({ name, amount, user_id: currentUserId });
      await UI.renderInvestments();
      e.target.reset();
    } catch (error) {
      console.error('[App] Erro ao adicionar investimento:', error);
      alert('Erro ao adicionar investimento: ' + error.message);
    }
  });
  document.getElementById('goal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('goal-description').value;
    const target = parseFloat(document.getElementById('goal-target').value);
    try {
      await Storage.addGoal({ description, target, user_id: currentUserId });
      await UI.renderGoals();
      e.target.reset();
    } catch (error) {
      console.error('[App] Erro ao adicionar meta:', error);
      alert('Erro ao adicionar meta: ' + error.message);
    }
  });
}

function initDeleteEvents() {
  document.body.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-transaction')) {
      const id = e.target.dataset.id;
      try {
        await Storage.deleteTransaction(id);
        await UI.renderAll(currentUserId);
      } catch (error) {
        console.error('[App] Erro ao excluir transação:', error);
        alert('Erro ao excluir transação: ' + error.message);
      }
    }
    if (e.target.classList.contains('delete-investment')) {
      const id = e.target.dataset.id;
      try {
        await Storage.deleteInvestment(id);
        await UI.renderInvestments();
      } catch (error) {
        console.error('[App] Erro ao excluir investimento:', error);
        alert('Erro ao excluir investimento: ' + error.message);
      }
    }
    if (e.target.classList.contains('delete-goal')) {
      const id = e.target.dataset.id;
      try {
        await Storage.deleteGoal(id);
        await UI.renderGoals();
      } catch (error) {
        console.error('[App] Erro ao excluir meta:', error);
        alert('Erro ao excluir meta: ' + error.message);
      }
    }
  });
}

async function initApp() {
  console.log('[App] Inicializando FinanCheck v0.3...');
  loadSettings();
  applyTheme(appSettings.theme);
  applyLanguage(appSettings.language);
  initSettingsEvents();
  initPWAInstallPrompt();
  registerServiceWorker();
  initAuthEvents();
  initFinancialFormEvents();
  initDeleteEvents();
  initLogoutEvent();
  // Verifica o usuário e alterna a interface: se autenticado, mostra a área principal
  await checkUser();
  console.log('[App] FinanCheck v0.3 inicializado.');
}

// Funções utilitárias de tema e idioma
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  console.log('[App] Tema aplicado:', theme);
}
function applyLanguage(lang) {
  const tagline = document.querySelector('#auth-header .tagline');
  if (tagline) {
    tagline.textContent = lang === 'pt' ? "Organize, evolua e cresça financeiramente!" : "Organize, evolve and grow financially!";
  }
  console.log('[App] Idioma aplicado:', lang);
}
function loadSettings() {
  const settings = localStorage.getItem('financheck-settings');
  if (settings) {
    appSettings = JSON.parse(settings);
  } else {
    saveSettings(appSettings);
  }
}
function saveSettings(settings) {
  localStorage.setItem('financheck-settings', JSON.stringify(settings));
}

// Inicializa o SW e o prompt de instalação do PWA
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('[PWA] SW registrado:', reg.scope))
      .catch(err => console.error('[PWA] Erro no registro do SW:', err));
  }
}
function initPWAInstallPrompt() {
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.innerHTML = '<p>Instale o FinanCheck para gerenciar suas finanças em qualquer lugar!</p><button id="install-btn">Instalar</button>';
    document.body.appendChild(banner);
    document.getElementById('install-btn').addEventListener('click', async () => {
      banner.style.display = 'none';
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] Resultado da instalação:', outcome);
      deferredPrompt = null;
    });
  });
}

// Alterna a interface entre tela de autenticação e app principal
function toggleAuth(showAuth) {
  document.getElementById('auth-container').style.display = showAuth ? 'block' : 'none';
  document.getElementById('app-container').style.display = showAuth ? 'none' : 'block';
  console.log('[App] Interface atualizada. Autenticado:', !showAuth);
}

// Verifica o usuário autenticado e ajusta a interface
async function checkUser() {
  try {
    const user = await Auth.getUser();
    if (user) {
      currentUserId = user.id;
      console.log('[App] Usuário autenticado:', user.email);
      toggleAuth(false);
      await UI.renderAll(currentUserId);
    } else {
      console.log('[App] Nenhum usuário autenticado.');
      toggleAuth(true);
    }
  } catch (error) {
    console.error('[App] Erro ao verificar usuário:', error);
    toggleAuth(true);
  }
}

// Inicia a aplicação quando o DOM é carregado
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// Funções extras para debug e testes
function debugLog(message, data = null) {
  console.log('[DEBUG]', message, data || '');
}
function forceReloadUI() {
  console.log('[App] Forçando recarregamento da interface...');
  UI.renderAll(currentUserId);
}
window.forceReloadUI = forceReloadUI;

document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'd') {
    console.log('[App] Ativando modo debug.');
    debugLog('Modo debug ativado.');
  }
  if (e.ctrlKey && e.key === 'r') {
    forceReloadUI();
  }
});
