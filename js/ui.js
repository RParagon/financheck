import { Chart, registerables } from 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.esm.js';
import { Storage } from './storage.js';
import { Gamification } from './gamification.js';

Chart.register(...registerables);

// UI Module: Gerencia toda a renderização e interações na interface
export const UI = {
  chart: null,

  // Inicializa a navegação: cada link da nav ativa sua seção
  initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.hideAllSections();
        const target = e.target.getAttribute('href');
        this.showSection(target);
        this.highlightNavLink(e.target);
      });
    });
  },

  // Destaca o link ativo na navegação
  highlightNavLink(activeLink) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active-link'));
    activeLink.classList.add('active-link');
  },

  // Esconde todas as seções
  hideAllSections() {
    const sections = document.querySelectorAll('main .section');
    sections.forEach(section => section.classList.remove('active'));
  },

  // Mostra uma seção específica
  showSection(selector) {
    const section = document.querySelector(selector);
    if (section) section.classList.add('active');
  },

  // Inicializa o menu mobile (toggle)
  initMenuToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    menuToggle.addEventListener('click', () => {
      if (mainNav.style.display === 'flex') {
        mainNav.style.display = 'none';
      } else {
        mainNav.style.display = 'flex';
        mainNav.style.flexDirection = 'column';
      }
    });
  },

  // Renderiza o dashboard financeiro com gráfico doughnut
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

      // Atualiza o gráfico utilizando Chart.js
      const ctx = document.getElementById('balanceChart').getContext('2d');
      if (this.chart) this.chart.destroy();
      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Receitas', 'Despesas'],
          datasets: [{
            data: [totalIncome, totalExpense],
            backgroundColor: ['#28a745', '#dc3545'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              enabled: true,
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  return `${label}: R$ ${value.toFixed(2)}`;
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Erro ao renderizar dashboard:', error);
    }
  },

  // Renderiza a tabela de transações
  async renderTransactions() {
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
          <td>
            <button class="btn delete-btn" data-id="${t.id}">Excluir</button>
            <button class="btn detail-btn transaction-detail" data-id="${t.id}">Detalhes</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error('Erro ao renderizar transações:', error);
    }
  },

  // Renderiza a tabela de investimentos
  async renderInvestments() {
    try {
      const investments = await Storage.getInvestments();
      const tbody = document.querySelector('#investments-table tbody');
      tbody.innerHTML = '';
      investments.forEach(inv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${inv.name}</td>
          <td>R$ ${parseFloat(inv.amount).toFixed(2)}</td>
          <td><button class="btn delete-btn" data-id="${inv.id}">Excluir</button></td>
        `;
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error('Erro ao renderizar investimentos:', error);
    }
  },

  // Renderiza a tabela de metas financeiras
  async renderGoals() {
    try {
      const goals = await Storage.getGoals();
      const tbody = document.querySelector('#goals-table tbody');
      tbody.innerHTML = '';
      goals.forEach(goal => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${goal.description}</td>
          <td>R$ ${parseFloat(goal.target).toFixed(2)}</td>
          <td><button class="btn delete-btn" data-id="${goal.id}">Excluir</button></td>
        `;
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error('Erro ao renderizar metas:', error);
    }
  },

  // Renderiza a seção de crescimento (gamificação)
  async renderCrescimento() {
    try {
      const progress = Gamification.getProgress();
      const progressBar = document.getElementById('progress-bar');
      const progressText = document.getElementById('progress-text');
      const percentage = Math.min((progress.points / 100) * 100, 100);
      progressBar.style.width = `${percentage}%`;
      progressText.textContent = `${progress.points} pontos - Nível ${progress.level}` + (progress.badge ? ` - ${progress.badge}` : '');
    } catch (error) {
      console.error('Erro ao renderizar crescimento:', error);
    }
  },

  // Renderiza uma lista de notificações (dados fictícios)
  renderNotifications() {
    const notificationsList = document.getElementById('notifications-list');
    if (notificationsList) {
      notificationsList.innerHTML = '';
      const notifications = [
        "Bem-vindo ao FinanCheck!",
        "Você ganhou 10 pontos por adicionar uma transação.",
        "Confira suas metas para melhorar seu crescimento."
      ];
      notifications.forEach(note => {
        const li = document.createElement('li');
        li.textContent = note;
        notificationsList.appendChild(li);
      });
    }
  },

  // Função para renderizar a seção de configurações (exemplo)
  renderSettings() {
    // Neste exemplo, as configurações são salvas via formulário
  },

  // Renderiza todas as seções necessárias
  async renderAll(user_id) {
    await this.renderDashboard();
    await this.renderTransactions();
    await this.renderInvestments();
    await this.renderGoals();
    await this.renderCrescimento();
    this.renderNotifications();
  },

  // Função para rolagem suave até uma seção
  smoothScrollTo(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  },

  // Abre um modal com título e conteúdo customizados
  openModal(title, content) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = `<h3>${title}</h3>
      <div class="modal-body">${content}</div>
      <button id="close-modal" class="btn">Fechar</button>`;
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    document.getElementById('close-modal').addEventListener('click', () => {
      document.body.removeChild(modalOverlay);
    });
  },

  // Mostra detalhes de uma transação em modal
  async showTransactionDetail(transactionId) {
    try {
      const transactions = await Storage.getTransactions();
      const transaction = transactions.find(t => t.id === transactionId);
      if (transaction) {
        const detailContent = `<p><strong>Descrição:</strong> ${transaction.description}</p>
          <p><strong>Tipo:</strong> ${transaction.type === 'income' ? 'Receita' : 'Despesa'}</p>
          <p><strong>Valor:</strong> R$ ${parseFloat(transaction.amount).toFixed(2)}</p>
          <p><strong>Data:</strong> ${new Date(transaction.created_at).toLocaleString()}</p>`;
        this.openModal("Detalhes da Transação", detailContent);
      }
    } catch (error) {
      console.error("Erro ao exibir detalhes da transação:", error);
    }
  },

  // Função para animar elementos com fade-in
  fadeIn(element, duration = 500) {
    element.style.opacity = 0;
    element.style.display = 'block';
    let last = +new Date();
    const tick = () => {
      element.style.opacity = +element.style.opacity + (new Date() - last) / duration;
      last = +new Date();
      if (+element.style.opacity < 1) {
        requestAnimationFrame(tick);
      }
    };
    tick();
  },

  // Alterna a visibilidade de um elemento pelo ID
  toggleVisibility(elementId) {
    const elem = document.getElementById(elementId);
    if (elem) {
      if (elem.style.display === 'none' || getComputedStyle(elem).display === 'none') {
        elem.style.display = 'block';
      } else {
        elem.style.display = 'none';
      }
    }
  },

  // Registra eventos de UI para debug
  logUIEvent(eventName, details) {
    console.log(`[UI EVENT] ${eventName}:`, details);
  },

  // Inicializa tooltips para elementos com atributo data-tooltip
  initTooltips() {
    const tooltipElems = document.querySelectorAll('[data-tooltip]');
    tooltipElems.forEach(elem => {
      elem.addEventListener('mouseenter', () => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = elem.getAttribute('data-tooltip');
        document.body.appendChild(tooltip);
        const rect = elem.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 30}px`;
        elem._tooltip = tooltip;
      });
      elem.addEventListener('mouseleave', () => {
        if (elem._tooltip) {
          document.body.removeChild(elem._tooltip);
          elem._tooltip = null;
        }
      });
    });
  },

  // Inicializa recursos adicionais da UI
  initUI() {
    this.initNavigation();
    this.initMenuToggle();
    this.initTooltips();
    this.logUIEvent("UI Inicializada", { timestamp: new Date().toISOString() });
  },

  // Função para exibir uma animação personalizada (ex: zoom in)
  animateElement(element, animationClass = 'zoom-in') {
    element.classList.add(animationClass);
    setTimeout(() => {
      element.classList.remove(animationClass);
    }, 500);
  },

  // Função para atualizar contadores dinâmicos (ex: total de transações)
  updateCounters() {
    const transactionCount = document.querySelectorAll('#transactions-table tbody tr').length;
    const investmentCount = document.querySelectorAll('#investments-table tbody tr').length;
    const goalCount = document.querySelectorAll('#goals-table tbody tr').length;
    document.getElementById('transaction-count').textContent = transactionCount;
    document.getElementById('investment-count').textContent = investmentCount;
    document.getElementById('goal-count').textContent = goalCount;
  },

  // Função para exibir mensagem de sucesso na UI (além do notyf)
  showSuccessMessage(message) {
    const msgElem = document.createElement('div');
    msgElem.className = 'success-message';
    msgElem.textContent = message;
    document.body.appendChild(msgElem);
    setTimeout(() => {
      msgElem.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(msgElem);
      }, 500);
    }, 3000);
  },

  // Função para redimensionar dinamicamente o canvas do gráfico
  resizeChart() {
    if (this.chart) {
      this.chart.resize();
    }
  },

  // Função para atualizar dados quando a janela é redimensionada
  handleWindowResize() {
    window.addEventListener('resize', () => {
      this.resizeChart();
      this.logUIEvent("Janela redimensionada", { width: window.innerWidth, height: window.innerHeight });
    });
  },

  // Função para inicializar todas as funcionalidades de UI
  initComplete() {
    this.initUI();
    this.handleWindowResize();
    this.logUIEvent("UI completa inicializada", { timestamp: new Date().toISOString() });
  }
};

// Inicializa o módulo UI ao carregar o script
UI.initComplete();
