// ====================================================================
// FinanCheck v0.3 - Arquivo Principal: app.js
// Desenvolvido por Rafael Paragon
// Este arquivo orquestra toda a lógica da aplicação, integrando
// autenticação, armazenamento, gamificação, UI, temas e modais.
// ====================================================================

// Importações dos módulos essenciais
import { supabase } from './supabaseClient.js';
import { Auth } from './auth.js';
import { Storage } from './storage.js';
import { UI } from './ui.js';
import { Gamification } from './gamification.js';

// Variável global para armazenar o ID do usuário logado
let currentUserId = null;

// Variável para armazenar configurações do tema e idioma (persistidas localmente)
let appSettings = {
  theme: 'light',
  language: 'pt'
};

// Função para salvar configurações no localStorage
function saveSettings(settings) {
  localStorage.setItem('financheck-settings', JSON.stringify(settings));
  console.log('[App] Configurações salvas:', settings);
}

// Função para carregar configurações do localStorage
function loadSettings() {
  const settings = localStorage.getItem('financheck-settings');
  if (settings) {
    appSettings = JSON.parse(settings);
    console.log('[App] Configurações carregadas:', appSettings);
  } else {
    saveSettings(appSettings);
  }
}

// Função para aplicar o tema na interface
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  console.log('[App] Tema aplicado:', theme);
}

// Função para atualizar o idioma (simplesmente altera textos básicos)
function applyLanguage(lang) {
  // Em uma implementação completa, você carregaria um arquivo de tradução
  if (lang === 'pt') {
    document.getElementById('auth-header').querySelector('p.tagline').textContent = "Organize, evolua e cresça financeiramente!";
  } else if (lang === 'en') {
    document.getElementById('auth-header').querySelector('p.tagline').textContent = "Organize, evolve and grow financially!";
  }
  console.log('[App] Idioma aplicado:', lang);
}

// Função para inicializar eventos de configurações do app
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

// Função para inicializar eventos de modais extras
function initModalEvents() {
  const footerLinks = document.querySelectorAll('.footer-nav a');
  footerLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = e.target.getAttribute('href').substring(1);
      openModal(modalId);
    });
  });
  const closeButtons = document.querySelectorAll('.close-btn');
  closeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal(btn.parentElement.parentElement.id);
    });
  });
  window.addEventListener('click', (e) => {
    document.querySelectorAll('.modal').forEach((modal) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
}

// Função para abrir um modal pelo ID
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'block';
    console.log('[App] Modal aberto:', id);
  }
}

// Função para fechar um modal pelo ID
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'none';
    console.log('[App] Modal fechado:', id);
  }
}

// Função para inicializar a lógica do PWA (exibição do banner de instalação)
function initPWAInstallPrompt() {
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.style.position = 'fixed';
    installBanner.style.bottom = '0';
    installBanner.style.width = '100%';
    installBanner.style.background = '#28a745';
    installBanner.style.color = '#fff';
    installBanner.style.textAlign = 'center';
    installBanner.style.padding = '1rem';
    installBanner.innerHTML = '<p>Instale o FinanCheck e gerencie suas finanças em qualquer lugar!</p><button id="install-btn">Instalar</button>';
    document.body.appendChild(installBanner);
    document.getElementById('install-btn').addEventListener('click', async () => {
      installBanner.style.display = 'none';
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] Usuário escolheu:', outcome);
      deferredPrompt = null;
    });
  });
}

// Função para inicializar o Service Worker
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('[PWA] Service Worker registrado com sucesso:', registration);
      })
      .catch(error => {
        console.error('[PWA] Erro ao registrar o Service Worker:', error);
      });
  }
}

// Função para inicializar os eventos de autenticação
function initAuthEvents() {
  document.getElementById('show-signup').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('signup-form-container').style.display = 'block';
    console.log('[Auth] Alternou para tela de cadastro.');
  });
  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signup-form-container').style.display = 'none';
    document.getElementById('login-form-container').style.display = 'block';
    console.log('[Auth] Alternou para tela de login.');
  });
  document.getElementById('voltar-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('password-recovery-container').style.display = 'none';
    document.getElementById('login-form-container').style.display = 'block';
    console.log('[Auth] Retornou para tela de login.');
  });
  document.getElementById('recovery-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const recoveryEmail = document.getElementById('recovery-email').value;
    // Aqui seria implementada a lógica de recuperação de senha com Supabase
    console.log('[Auth] Pedido de recuperação de senha para:', recoveryEmail);
    alert('Instruções de recuperação enviadas para ' + recoveryEmail);
    document.getElementById('password-recovery-container').style.display = 'none';
    document.getElementById('login-form-container').style.display = 'block';
  });
}

// Função para inicializar eventos de logout
function initLogoutEvent() {
  document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
      await Auth.signOut();
      currentUserId = null;
      toggleAuth(true);
      console.log('[Auth] Logout realizado com sucesso.');
    } catch (error) {
      console.error('[Auth] Erro ao efetuar logout:', error);
    }
  });
}

// Função para inicializar o envio de formulários de cadastro e login
function initFormEvents() {
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
      await Auth.signIn(email, password);
      console.log('[Auth] Login efetuado para:', email);
      await checkUser();
    } catch (error) {
      console.error('[Auth] Erro no login:', error);
      alert('Erro no login: ' + error.message);
    }
  });
  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    try {
      await Auth.signUp(email, password);
      console.log('[Auth] Cadastro realizado para:', email);
      alert('Cadastro realizado com sucesso! Verifique seu email para confirmar.');
      document.getElementById('signup-form-container').style.display = 'none';
      document.getElementById('login-form-container').style.display = 'block';
    } catch (error) {
      console.error('[Auth] Erro no cadastro:', error);
      alert('Erro no cadastro: ' + error.message);
    }
  });
}

// Função para inicializar eventos de formulários financeiros
function initFinancialFormEvents() {
  document.getElementById('transaction-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('transaction-description').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const type = document.getElementById('transaction-type').value;
    try {
      await Storage.addTransaction({ description, amount, type, user_id: currentUserId });
      console.log('[Finance] Transação adicionada:', description, amount, type);
      // Atualiza gamificação: 10 pontos por transação
      Gamification.updateProgress(10);
      await UI.renderAll(currentUserId);
      e.target.reset();
    } catch (error) {
      console.error('[Finance] Erro ao adicionar transação:', error);
      alert('Erro ao adicionar transação: ' + error.message);
    }
  });
  document.getElementById('investment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('investment-name').value;
    const amount = parseFloat(document.getElementById('investment-amount').value);
    try {
      await Storage.addInvestment({ name, amount, user_id: currentUserId });
      console.log('[Finance] Investimento adicionado:', name, amount);
      await UI.renderInvestments();
      e.target.reset();
    } catch (error) {
      console.error('[Finance] Erro ao adicionar investimento:', error);
      alert('Erro ao adicionar investimento: ' + error.message);
    }
  });
  document.getElementById('goal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('goal-description').value;
    const target = parseFloat(document.getElementById('goal-target').value);
    try {
      await Storage.addGoal({ description, target, user_id: currentUserId });
      console.log('[Finance] Meta adicionada:', description, target);
      await UI.renderGoals();
      e.target.reset();
    } catch (error) {
      console.error('[Finance] Erro ao adicionar meta:', error);
      alert('Erro ao adicionar meta: ' + error.message);
    }
  });
}

// Função para inicializar eventos de exclusão (delegação de eventos)
function initDeleteEvents() {
  document.body.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-transaction')) {
      const id = e.target.dataset.id;
      try {
        await Storage.deleteTransaction(id);
        console.log('[Finance] Transação excluída:', id);
        await UI.renderAll(currentUserId);
      } catch (error) {
        console.error('[Finance] Erro ao excluir transação:', error);
        alert('Erro ao excluir transação: ' + error.message);
      }
    }
    if (e.target.classList.contains('delete-investment')) {
      const id = e.target.dataset.id;
      try {
        await Storage.deleteInvestment(id);
        console.log('[Finance] Investimento excluído:', id);
        await UI.renderInvestments();
      } catch (error) {
        console.error('[Finance] Erro ao excluir investimento:', error);
        alert('Erro ao excluir investimento: ' + error.message);
      }
    }
    if (e.target.classList.contains('delete-goal')) {
      const id = e.target.dataset.id;
      try {
        await Storage.deleteGoal(id);
        console.log('[Finance] Meta excluída:', id);
        await UI.renderGoals();
      } catch (error) {
        console.error('[Finance] Erro ao excluir meta:', error);
        alert('Erro ao excluir meta: ' + error.message);
      }
    }
  });
}

// Função para verificar se o usuário está autenticado e ajustar a interface
async function checkUser() {
  try {
    const user = await Auth.getUser();
    if (user) {
      currentUserId = user.id;
      console.log('[Auth] Usuário autenticado:', user.email);
      toggleAuth(false);
      await UI.renderAll(currentUserId);
    } else {
      console.log('[Auth] Nenhum usuário autenticado.');
      toggleAuth(true);
    }
  } catch (error) {
    console.error('[Auth] Erro ao verificar usuário:', error);
  }
}

// Função para alternar a exibição entre tela de autenticação e área do app
function toggleAuth(showAuth) {
  document.getElementById('auth-container').style.display = showAuth ? 'block' : 'none';
  document.getElementById('app-container').style.display = showAuth ? 'none' : 'block';
  console.log('[App] Alternando interface. Autenticado:', !showAuth);
}

// Função para inicializar o registro de eventos do Service Worker (PWA)
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('[PWA] Service Worker registrado com sucesso:', registration.scope);
      })
      .catch(error => {
        console.error('[PWA] Erro no registro do Service Worker:', error);
      });
  }
}

// Função principal de inicialização da aplicação
async function initApp() {
  console.log('[App] Inicializando FinanCheck v0.3...');
  loadSettings();
  applyTheme(appSettings.theme);
  applyLanguage(appSettings.language);
  initSettingsEvents();
  initModalEvents();
  initPWAInstallPrompt();
  registerServiceWorker();
  initAuthEvents();
  initFormEvents();
  initFinancialFormEvents();
  initDeleteEvents();
  initLogoutEvent();
  await checkUser();
  console.log('[App] FinanCheck v0.3 inicializado com sucesso.');
}

// Adiciona evento de DOMContentLoaded para iniciar a aplicação
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// --------------------------------------------------------------------
// Funções utilitárias adicionais para debug e testes
// --------------------------------------------------------------------
function debugLog(message) {
  console.log('[DEBUG]', message);
}

function clearLocalData() {
  localStorage.removeItem('gamification');
  localStorage.removeItem('financheck-settings');
  console.log('[App] Dados locais limpos.');
}

// Função para simular incremento de pontos (para testes)
function simulatePointsIncrement(increment) {
  const current = Gamification.getProgress().points;
  Gamification.updateProgress(increment);
  console.log('[Simulação] Pontos incrementados de', current, 'para', Gamification.getProgress().points);
  UI.renderCrescimento();
}

// Função para forçar recarregamento da interface
async function forceReloadUI() {
  console.log('[App] Forçando recarregamento da interface...');
  await UI.renderAll(currentUserId);
  console.log('[App] Interface recarregada.');
}

// Função para alternar temporariamente o modo debug (ativa logs extras)
let debugMode = false;
function toggleDebugMode() {
  debugMode = !debugMode;
  if (debugMode) {
    console.log('[App] Modo debug ativado.');
  } else {
    console.log('[App] Modo debug desativado.');
  }
}

// Adiciona atalhos de teclado para funções de debug
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'd') {
    toggleDebugMode();
  }
  if (e.ctrlKey && e.key === 'r') {
    forceReloadUI();
  }
  if (e.ctrlKey && e.key === 'c') {
    clearLocalData();
  }
  if (e.ctrlKey && e.key === 'p') {
    simulatePointsIncrement(20);
  }
});

// --------------------------------------------------------------------
// Fim das funções utilitárias
// --------------------------------------------------------------------
