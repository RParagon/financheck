import { supabase } from './supabaseClient.js';
import { Auth } from './auth.js';
import { Storage } from './storage.js';
import { UI } from './ui.js';
import { Gamification } from './gamification.js';

// Inicializa o sistema de analytics
function initAnalytics() {
  console.log("Analytics iniciado: FinanCheck v0.3");
}
initAnalytics();

// Variável global para o ID do usuário logado
let currentUserId = null;

// Função utilitária para registrar mensagens de debug
function debugLog(message) {
  console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`);
}
debugLog("Iniciando app.js...");

// Função para inicializar o sistema de notificações
function initNotifications() {
  window.notyf = new Notyf({
    duration: 5000,
    position: { x: 'right', y: 'top' },
    ripple: true,
    dismissible: true
  });
  debugLog("Sistema de notificações inicializado.");
}
initNotifications();

// Função para exibir notificações
function notifyUser(message, type) {
  if (window.notyf) {
    switch (type) {
      case "success":
        window.notyf.success(message);
        break;
      case "error":
        window.notyf.error(message);
        break;
      case "warning":
        window.notyf.open({ type: 'warning', message: message });
        break;
      case "info":
        window.notyf.open({ type: 'info', message: message });
        break;
      default:
        window.notyf.open({ type: 'default', message: message });
    }
  }
  debugLog("Notificação exibida: " + message);
}

// Função para reiniciar o timer de inatividade
let inactivityTimer;
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    notifyUser("Sessão expirada por inatividade.", "warning");
    Auth.signOut();
    toggleAuth(true);
  }, 1800000); // 30 minutos
  debugLog("Timer de inatividade reiniciado.");
}
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keydown', resetInactivityTimer);
resetInactivityTimer();

// Função para atualizar o timestamp do dashboard
function updateDashboardTimestamp() {
  const now = new Date().toLocaleTimeString();
  const tsElem = document.getElementById('dashboard-updated');
  if (tsElem) {
    tsElem.textContent = now;
  }
}
setInterval(updateDashboardTimestamp, 10000);

// Função para exportar dados de transações para CSV
async function exportDataToCSV() {
  debugLog("Exportando dados para CSV.");
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Descrição,Tipo,Valor,Data\n";
  const transactions = await Storage.getTransactions();
  transactions.forEach((t) => {
    const row = [t.description, t.type, t.amount, t.created_at].join(",");
    csvContent += row + "\n";
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "financheck_transactions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  debugLog("Exportação para CSV concluída.");
}

// Função para limpar dados do usuário (para testes)
async function clearUserData() {
  debugLog("Limpando dados do usuário para teste.");
  localStorage.clear();
  notifyUser("Dados do usuário limpos.", "warning");
}
clearUserData();

// Função para simular bônus de pontos periódico
function simulatePointBonus() {
  debugLog("Simulando bônus de pontos.");
  setTimeout(() => {
    Gamification.updateProgress(5);
    notifyUser("Bônus diário: +5 pontos!", "success");
    UI.renderCrescimento();
  }, 60000);
}
simulatePointBonus();

// Função para registrar eventos de clique duplo e abrir modal de transação
function openTransactionModal(transactionId) {
  debugLog("Abrindo modal para transação ID: " + transactionId);
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.innerHTML = `<h3>Detalhes da Transação</h3>
    <p>ID: ${transactionId}</p>
    <button id="close-modal" class="btn">Fechar</button>`;
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  document.getElementById('close-modal').addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
    debugLog("Modal de transação fechado.");
  });
}
document.body.addEventListener('dblclick', (e) => {
  if (e.target.classList.contains('transaction-detail')) {
    const id = e.target.dataset.id;
    openTransactionModal(id);
  }
});

// Função para buscar notícias financeiras externas (exemplo)
async function fetchFinancialNews() {
  debugLog("Buscando notícias financeiras.");
  try {
    const response = await fetch('https://api.example.com/financial-news');
    const news = await response.json();
    const notificationsList = document.getElementById('notifications-list');
    notificationsList.innerHTML = '';
    news.articles.forEach(article => {
      const li = document.createElement('li');
      li.textContent = article.title;
      notificationsList.appendChild(li);
    });
    debugLog("Notícias financeiras atualizadas.");
  } catch (error) {
    debugLog("Erro ao buscar notícias: " + error.message);
  }
}
fetchFinancialNews();

// Função para exportar relatórios mensais (exemplo avançado)
async function exportMonthlyReport() {
  debugLog("Exportando relatório mensal.");
  const transactions = await Storage.getTransactions();
  let totalIncome = 0, totalExpense = 0;
  transactions.forEach(t => {
    if (t.type === 'income') totalIncome += parseFloat(t.amount);
    else totalExpense += parseFloat(t.amount);
  });
  const report = {
    month: new Date().toLocaleString('default', { month: 'long' }),
    totalIncome: totalIncome,
    totalExpense: totalExpense,
    netBalance: totalIncome - totalExpense
  };
  const reportJson = JSON.stringify(report, null, 2);
  const blob = new Blob([reportJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'relatorio_mensal.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  debugLog("Relatório mensal exportado.");
}

// Função para monitorar a conectividade e notificar o usuário
function monitorConnectivity() {
  window.addEventListener('offline', () => {
    notifyUser("Você está offline.", "error");
    debugLog("Evento offline detectado.");
  });
  window.addEventListener('online', () => {
    notifyUser("Você voltou a estar online.", "success");
    debugLog("Evento online detectado.");
    if (currentUserId) UI.renderAll(currentUserId);
  });
}
monitorConnectivity();

// Função para atualizar dados automaticamente a cada 5 minutos
setInterval(async () => {
  debugLog("Atualização automática de dados.");
  if (currentUserId) await UI.renderAll(currentUserId);
}, 300000);

// Função para atualizar dados quando a janela ganha foco
window.addEventListener('focus', async () => {
  debugLog("Janela focada, atualizando dados.");
  if (currentUserId) await UI.renderAll(currentUserId);
});

// Função para registrar o Service Worker (PWA)
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      debugLog("Service Worker registrado: " + registration.scope);
    } catch (error) {
      debugLog("Erro no registro do Service Worker: " + error.message);
    }
  }
}
registerServiceWorker();

// Função para checar a autenticação do usuário
async function checkUser() {
  debugLog("Verificando autenticação do usuário.");
  const user = await Auth.getUser();
  if (user) {
    currentUserId = user.id;
    toggleAuth(false);
    debugLog("Usuário autenticado: " + currentUserId);
    await UI.renderAll(currentUserId);
  } else {
    toggleAuth(true);
    debugLog("Nenhum usuário autenticado.");
  }
}

// Função para alternar entre a tela de autenticação e a área do app
function toggleAuth(showAuth) {
  const authContainer = document.getElementById('auth-container');
  const appContainer = document.getElementById('app-container');
  if (showAuth) {
    authContainer.style.display = 'block';
    appContainer.style.display = 'none';
    debugLog("Exibindo tela de autenticação.");
  } else {
    authContainer.style.display = 'none';
    appContainer.style.display = 'block';
    debugLog("Exibindo área do aplicativo.");
  }
}

// Listener para mudanças de estado de autenticação
supabase.auth.onAuthStateChange((event, session) => {
  debugLog("Mudança de estado de autenticação: " + event);
  checkUser();
});

// Função para alterar tema (claro/escuro)
function toggleTheme(theme) {
  document.body.className = theme;
  localStorage.setItem('theme', theme);
  debugLog("Tema alterado para: " + theme);
}
document.getElementById('theme-select')?.addEventListener('change', (e) => {
  toggleTheme(e.target.value);
});
const savedTheme = localStorage.getItem('theme') || 'light';
toggleTheme(savedTheme);

// Função para alterar idioma
function changeLanguage(lang) {
  localStorage.setItem('lang', lang);
  debugLog("Idioma alterado para: " + lang);
  notifyUser("Idioma alterado. (Exemplo: tradução não implementada)", "info");
}
document.getElementById('lang-select')?.addEventListener('change', (e) => {
  changeLanguage(e.target.value);
});

// Função para salvar configurações do usuário
document.getElementById('settings-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  debugLog("Salvando configurações do usuário.");
  const theme = document.getElementById('theme-select').value;
  const lang = document.getElementById('lang-select').value;
  toggleTheme(theme);
  changeLanguage(lang);
  notifyUser("Configurações salvas.", "success");
});

// Função para exportar relatório mensal (chamada por botão, se implementado)
document.getElementById('export-report-btn')?.addEventListener('click', () => {
  exportMonthlyReport();
});

// Função para limpar dados do usuário (para testes)
document.getElementById('clear-data-btn')?.addEventListener('click', async () => {
  await clearUserData();
});

// Função para simular clique em um elemento (exemplo de utilidade)
function simulateClick(elementId) {
  const elem = document.getElementById(elementId);
  if (elem) {
    elem.click();
    debugLog("Clique simulado no elemento: " + elementId);
  }
}
simulateClick('dummy-element');

// Função para logar eventos de desempenho
function logPerformance() {
  const t = performance.now();
  debugLog("Tempo de desempenho: " + t + "ms");
}
setInterval(logPerformance, 15000);

// Função para buscar dados adicionais (exemplo)
async function fetchAdditionalData() {
  debugLog("Buscando dados adicionais...");
  try {
    const res = await fetch('https://api.example.com/additional-data');
    const data = await res.json();
    debugLog("Dados adicionais recebidos: " + JSON.stringify(data));
  } catch (error) {
    debugLog("Erro ao buscar dados adicionais: " + error.message);
  }
}
fetchAdditionalData();

// Função para lidar com erros globais
window.onerror = function(message, source, lineno, colno, error) {
  debugLog(`Erro global: ${message} em ${source}:${lineno}:${colno}`);
};

// Função para lidar com rejeições não tratadas
window.onunhandledrejection = function(event) {
  debugLog("Rejeição não tratada: " + event.reason);
};

// Finalização da inicialização do app
debugLog("App.js carregado e inicializado completamente.");
// Fim do arquivo app.js
