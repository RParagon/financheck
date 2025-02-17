/******************************************************************
 * FinanCheck v0.3 - Módulo UI
 * Desenvolvido por Rafael Paragon
 * Responsável por renderizar e animar a interface do FinanCheck,
 * incluindo Dashboard, Transações, Investimentos, Metas, Crescimento,
 * e funções extras como modais, animações e responsividade.
 ******************************************************************/

import { Chart, registerables } from 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.esm.js';
import { Storage } from './storage.js';
import { Gamification } from './gamification.js';

Chart.register(...registerables);

export const UI = {
  chart: null,

  initNavigation() {
    console.log('[UI] Inicializando navegação...');
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        this.hideAllSections();
        const target = e.target.getAttribute('href');
        const section = document.querySelector(target);
        if (section) {
          section.classList.add('active');
          this.animateWidget(section);
        }
      });
    });
  },

  hideAllSections() {
    document.querySelectorAll('main .section').forEach(section => {
      section.classList.remove('active');
    });
  },

  initMenuToggle() {
    console.log('[UI] Inicializando menu mobile...');
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    menuToggle.addEventListener('click', () => {
      mainNav.style.display = (mainNav.style.display === 'flex') ? 'none' : 'flex';
      mainNav.style.flexDirection = 'column';
    });
  },

  async renderDashboard() {
    console.log('[UI] Renderizando Dashboard...');
    try {
      const transactions = await Storage.getTransactions();
      let totalIncome = 0, totalExpense = 0;
      transactions.forEach(t => {
        if (t.type === 'income') totalIncome += parseFloat(t.amount);
        else totalExpense += parseFloat(t.amount);
      });
      const balance = totalIncome - totalExpense;
      document.getElementById('current-balance').textContent = `R$ ${balance.toFixed(2)}`;
      const ctx = document.getElementById('balanceChart').getContext('2d');
      if (this.chart) this.chart.destroy();
      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Receitas', 'Despesas'],
          datasets: [{
            data: [totalIncome, totalExpense],
            backgroundColor: ['#28a745', '#dc3545'],
            borderColor: ['#fff', '#fff'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
      this.animateWidget(document.querySelector('.chart-widget'));
    } catch (error) {
      console.error('[UI] Erro ao renderizar Dashboard:', error);
    }
  },

  async renderTransactions() {
    console.log('[UI] Renderizando Transações...');
    try {
      const transactions = await Storage.getTransactions();
      const tbody = document.querySelector('#transactions-table tbody');
      tbody.innerHTML = '';
      transactions.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${t.description}</td>
          <td>${t.type === 'income' ? 'Receita' : 'Despesa'}</td>
          <td>R$ ${parseFloat(t.amount).toFixed(2)}</td>
          <td><button class="delete-transaction" data-id="${t.id}" title="Excluir transação">Excluir</button></td>
        `;
        tbody.appendChild(tr);
      });
      this.animateWidget(document.getElementById('transactions-table'));
    } catch (error) {
      console.error('[UI] Erro ao renderizar Transações:', error);
    }
  },

  async renderInvestments() {
    console.log('[UI] Renderizando Investimentos...');
    try {
      const investments = await Storage.getInvestments();
      const tbody = document.querySelector('#investments-table tbody');
      tbody.innerHTML = '';
      investments.forEach(inv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${inv.name}</td>
          <td>R$ ${parseFloat(inv.amount).toFixed(2)}</td>
          <td><button class="delete-investment" data-id="${inv.id}" title="Excluir investimento">Excluir</button></td>
        `;
        tbody.appendChild(tr);
      });
      this.animateWidget(document.getElementById('investments-table'));
    } catch (error) {
      console.error('[UI] Erro ao renderizar Investimentos:', error);
    }
  },

  async renderGoals() {
    console.log('[UI] Renderizando Metas...');
    try {
      const goals = await Storage.getGoals();
      const tbody = document.querySelector('#goals-table tbody');
      tbody.innerHTML = '';
      goals.forEach(goal => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${goal.description}</td>
          <td>R$ ${parseFloat(goal.target).toFixed(2)}</td>
          <td><button class="delete-goal" data-id="${goal.id}" title="Excluir meta">Excluir</button></td>
        `;
        tbody.appendChild(tr);
      });
      this.animateWidget(document.getElementById('goals-table'));
    } catch (error) {
      console.error('[UI] Erro ao renderizar Metas:', error);
    }
  },

  async renderCrescimento() {
    console.log('[UI] Renderizando Crescimento...');
    try {
      const progress = Gamification.getProgress();
      const percentage = Math.min((progress.points / 100) * 100, 100);
      document.getElementById('progress-bar').style.width = `${percentage}%`;
      document.getElementById('progress-text').textContent = `${progress.points} pontos - Nível ${progress.level}${progress.badge ? ' - ' + progress.badge : ''}`;
      this.animateWidget(document.getElementById('progress-bar'));
    } catch (error) {
      console.error('[UI] Erro ao renderizar Crescimento:', error);
    }
  },

  renderUserProfile() {
    console.log('[UI] Renderizando Perfil do Usuário...');
    const profilePhoto = document.getElementById('profile-photo');
    const profileEmail = document.getElementById('profile-email');
    const profileName = document.getElementById('profile-nome');
    if (profilePhoto) profilePhoto.src = 'icons/default-profile.png';
    if (profileEmail) profileEmail.textContent = 'usuario@exemplo.com';
    if (profileName) profileName.textContent = 'Usuário Exemplo';
    this.animateWidget(document.querySelector('.profile-widget'));
  },

  renderNotification(message, type = 'info') {
    console.log('[UI] Exibindo notificação:', message);
    const notif = document.createElement('div');
    notif.classList.add('notification', `notif-${type}`);
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => {
      notif.remove();
    }, 4000);
  },

  animateWidget(element) {
    if (!element) return;
    element.classList.add('animate');
    setTimeout(() => {
      element.classList.remove('animate');
    }, 1000);
  },

  async renderAll(user_id) {
    console.log('[UI] Renderizando todas as seções...');
    await this.renderDashboard();
    await this.renderTransactions();
    await this.renderInvestments();
    await this.renderGoals();
    await this.renderCrescimento();
    this.renderUserProfile();
    console.log('[UI] Todas as seções renderizadas.');
  },

  // Funções para indicadores de tema e idioma (opcional)
  renderThemeIndicator() {
    const indicator = document.getElementById('theme-indicator');
    if (indicator) {
      indicator.textContent = `Tema: ${document.documentElement.getAttribute('data-theme')}`;
    }
  },

  renderLanguageIndicator() {
    const indicator = document.getElementById('language-indicator');
    if (indicator) {
      indicator.textContent = `Idioma: ${navigator.language}`;
    }
  },

  // Funções para modais e interações extras
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'block';
      this.animateWidget(modal);
      console.log('[UI] Modal aberto:', modalId);
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      console.log('[UI] Modal fechado:', modalId);
    }
  },

  toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
    }
  },

  // Funções para responsividade
  adjustLayout() {
    const width = window.innerWidth;
    console.log('[UI] Ajustando layout para largura:', width);
    document.body.classList.toggle('mobile', width < 600);
  },

  initResizeListener() {
    window.addEventListener('resize', () => {
      this.adjustLayout();
    });
    this.adjustLayout();
  },

  // Funções de debug
  debugLog(message, data = null) {
    if (window.debugMode) {
      console.log('[DEBUG]', message, data || '');
    }
  },

  renderDebugIndicators() {
    const debugDiv = document.getElementById('debug-indicator');
    if (debugDiv) {
      debugDiv.textContent = `Modo Debug: ${window.debugMode ? 'Ativado' : 'Desativado'} | ${new Date().toLocaleString()}`;
    }
  },

  initDebugInterval() {
    setInterval(() => {
      this.renderDebugIndicators();
    }, 5000);
  }
};

UI.initResizeListener();
UI.initDebugInterval();
console.log('[UI] Módulo UI carregado e inicializado.');
