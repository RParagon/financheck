/******************************************************************
 * FinanCheck v0.3 - Módulo UI
 * Desenvolvido por Rafael Paragon
 * Responsável pela renderização e interação da interface
 * com todos os módulos: Dashboard, Transações, Investimentos,
 * Metas, Crescimento, Modais, Perfil, Configurações e Notificações.
 ******************************************************************/

// Importa Chart.js e registra todos os componentes necessários
import { Chart, registerables } from 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.esm.js';
import { Storage } from './storage.js';
import { Gamification } from './gamification.js';

Chart.register(...registerables);

// Cria o objeto UI que exportaremos ao final
export const UI = {
  chart: null,
  notificationTimeout: null,

  /***************** INICIALIZAÇÃO GERAL *********************/

  // Inicializa a navegação entre seções (menu principal)
  initNavigation() {
    console.log('[UI] Inicializando navegação...');
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
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

  // Esconde todas as seções do main
  hideAllSections() {
    const sections = document.querySelectorAll('main .section');
    sections.forEach(section => {
      section.classList.remove('active');
    });
  },

  // Inicializa o menu hamburguer para dispositivos móveis
  initMenuToggle() {
    console.log('[UI] Inicializando menu mobile...');
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

  /***************** RENDERIZAÇÃO DE SEÇÕES *********************/

  // Renderiza o Dashboard, incluindo gráfico de receitas e despesas
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
      
      // Configuração do gráfico
      const ctx = document.getElementById('balanceChart').getContext('2d');
      if (this.chart) {
        this.chart.destroy();
      }
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
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
      this.animateWidget(document.querySelector('.chart-widget'));
    } catch (error) {
      console.error('[UI] Erro ao renderizar Dashboard:', error);
    }
  },

  // Renderiza a tabela de Transações
  async renderTransactions() {
    console.log('[UI] Renderizando Transações...');
    try {
      const transactions = await Storage.getTransactions();
      const tbody = document.querySelector('#transactions-table tbody');
      tbody.innerHTML = ''; // Limpa o conteúdo
      transactions.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${t.description}</td>
          <td>${t.type === 'income' ? 'Receita' : 'Despesa'}</td>
          <td>R$ ${parseFloat(t.amount).toFixed(2)}</td>
          <td>
            <button class="delete-transaction" data-id="${t.id}" title="Excluir transação">Excluir</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
      this.animateWidget(document.getElementById('transactions-table'));
    } catch (error) {
      console.error('[UI] Erro ao renderizar Transações:', error);
    }
  },

  // Renderiza a tabela de Investimentos
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
          <td>
            <button class="delete-investment" data-id="${inv.id}" title="Excluir investimento">Excluir</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
      this.animateWidget(document.getElementById('investments-table'));
    } catch (error) {
      console.error('[UI] Erro ao renderizar Investimentos:', error);
    }
  },

  // Renderiza a tabela de Metas
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
          <td>
            <button class="delete-goal" data-id="${goal.id}" title="Excluir meta">Excluir</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
      this.animateWidget(document.getElementById('goals-table'));
    } catch (error) {
      console.error('[UI] Erro ao renderizar Metas:', error);
    }
  },

  // Renderiza a seção de Crescimento (Gamificação)
  async renderCrescimento() {
    console.log('[UI] Renderizando Crescimento...');
    try {
      // Obtém dados de gamificação via localStorage
      const progress = Gamification.getProgress();
      // Define a barra de progresso com base nos pontos (meta de 100 pontos para próximo nível)
      const percentage = Math.min((progress.points / 100) * 100, 100);
      const progressBar = document.getElementById('progress-bar');
      progressBar.style.width = `${percentage}%`;
      // Atualiza o texto de progresso com nível e badge (se houver)
      const progressText = document.getElementById('progress-text');
      progressText.textContent = `${progress.points} pontos - Nível ${progress.level}${progress.badge ? ' - ' + progress.badge : ''}`;
      this.animateWidget(document.getElementById('progress-bar'));
    } catch (error) {
      console.error('[UI] Erro ao renderizar Crescimento:', error);
    }
  },

  // Renderiza o Perfil do Usuário (exemplo estático)
  renderUserProfile() {
    console.log('[UI] Renderizando Perfil do Usuário...');
    try {
      // Dados fictícios ou obtidos via API
      const profilePhoto = document.getElementById('profile-photo');
      const profileEmail = document.getElementById('profile-email');
      const profileName = document.getElementById('profile-nome');
      // Simulação de dados: Em uma aplicação real, estes seriam obtidos do módulo Auth
      profilePhoto.src = 'icons/default-profile.png';
      profileEmail.textContent = 'usuario@exemplo.com';
      profileName.textContent = 'Usuário Exemplo';
      this.animateWidget(document.querySelector('.profile-widget'));
    } catch (error) {
      console.error('[UI] Erro ao renderizar Perfil:', error);
    }
  },

  // Renderiza notificações na interface
  renderNotification(message, type = 'info') {
    console.log('[UI] Exibindo notificação:', message);
    // Cria um elemento de notificação
    const notif = document.createElement('div');
    notif.classList.add('notification');
    notif.classList.add(`notif-${type}`);
    notif.textContent = message;
    // Insere a notificação no topo da aplicação
    document.body.appendChild(notif);
    // Remove a notificação após 4 segundos
    setTimeout(() => {
      notif.remove();
    }, 4000);
  },

  /***************** FUNÇÕES DE ANIMAÇÃO *********************/

  // Aplica uma animação CSS a um elemento (ex.: fadeIn, slideUp)
  animateWidget(element) {
    if (!element) return;
    element.classList.add('animate');
    // Remove a classe de animação após 1 segundo para permitir reanimação
    setTimeout(() => {
      element.classList.remove('animate');
    }, 1000);
  },

  // Limpa animações de um widget específico (caso necessário)
  clearWidgetAnimation(element) {
    if (!element) return;
    element.classList.remove('animate');
    console.log('[UI] Animação limpa para elemento:', element);
  },

  /***************** RENDERIZAÇÃO COMPLETA *********************/

  // Renderiza todas as seções principais da interface
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

  /***************** FUNÇÕES DE TEMAS E CONFIGURAÇÕES *********************/

  // Atualiza o indicador de tema na interface
  renderThemeIndicator() {
    const themeIndicator = document.getElementById('theme-indicator');
    if (themeIndicator) {
      themeIndicator.textContent = `Tema: ${document.documentElement.getAttribute('data-theme')}`;
      console.log('[UI] Indicador de tema atualizado.');
    }
  },

  // Atualiza o seletor de idioma (exemplo simples)
  renderLanguageIndicator() {
    const langIndicator = document.getElementById('language-indicator');
    if (langIndicator) {
      langIndicator.textContent = `Idioma: ${navigator.language}`;
      console.log('[UI] Indicador de idioma atualizado.');
    }
  },

  /***************** FUNÇÕES DE MODAIS E INTERAÇÕES EXTRAS *********************/

  // Abre um modal customizado (já implementado no index, mas com funções extras)
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'block';
      this.animateWidget(modal);
      console.log('[UI] Modal aberto:', modalId);
    }
  },

  // Fecha um modal customizado
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      console.log('[UI] Modal fechado:', modalId);
    }
  },

  // Alterna visibilidade de um modal com efeito de fade
  toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      if (modal.style.display === 'block') {
        this.closeModal(modalId);
      } else {
        this.openModal(modalId);
      }
    }
  },

  // Exibe um banner de aviso no topo da página (exemplo para manutenção ou alertas)
  renderBanner(message, type = 'warning') {
    let banner = document.getElementById('app-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'app-banner';
      banner.classList.add('banner');
      document.body.insertBefore(banner, document.body.firstChild);
    }
    banner.textContent = message;
    banner.className = 'banner'; // limpa classes anteriores
    banner.classList.add(`banner-${type}`);
    // Permanece 5 segundos e depois some
    setTimeout(() => {
      banner.style.display = 'none';
    }, 5000);
  },

  // Limpa qualquer banner ativo
  clearBanner() {
    const banner = document.getElementById('app-banner');
    if (banner) {
      banner.remove();
      console.log('[UI] Banner removido.');
    }
  },

  /***************** FUNÇÕES DE TRANSIÇÃO E ANIMAÇÃO EXTRA *********************/

  // Realiza uma transição suave entre dois elementos
  transitionElements(oldElement, newElement) {
    if (!oldElement || !newElement) return;
    oldElement.classList.add('fade-out');
    setTimeout(() => {
      oldElement.style.display = 'none';
      newElement.style.display = 'block';
      newElement.classList.add('fade-in');
      setTimeout(() => {
        newElement.classList.remove('fade-in');
      }, 1000);
      console.log('[UI] Transição realizada entre elementos.');
    }, 1000);
  },

  // Aplica um efeito de scroll suave para uma seção específica
  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      console.log('[UI] Rolagem suave para seção:', sectionId);
    }
  },

  // Função para atualizar o conteúdo de um widget com dados dinâmicos
  updateWidgetContent(widgetId, contentHTML) {
    const widget = document.getElementById(widgetId);
    if (widget) {
      widget.innerHTML = contentHTML;
      this.animateWidget(widget);
      console.log('[UI] Conteúdo do widget atualizado:', widgetId);
    }
  },

  /***************** FUNÇÕES DE RESPONSIVIDADE E AJUSTES *********************/

  // Ajusta o layout da interface conforme a largura da janela
  adjustLayout() {
    const width = window.innerWidth;
    console.log('[UI] Ajustando layout para largura:', width);
    if (width < 600) {
      document.body.classList.add('mobile');
    } else {
      document.body.classList.remove('mobile');
    }
  },

  // Monitora eventos de redimensionamento para ajustar o layout dinamicamente
  initResizeListener() {
    window.addEventListener('resize', () => {
      this.adjustLayout();
    });
    // Chama uma vez para definir o estado inicial
    this.adjustLayout();
  },

  /***************** FUNÇÕES DE LOGGING E DEBUG *********************/

  // Loga informações de depuração se o modo debug estiver ativo
  debugLog(message, data = null) {
    if (window.debugMode) {
      console.log('[DEBUG]', message, data || '');
    }
  },

  // Exibe um alerta de debug na interface (temporário)
  debugAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.classList.add('debug-alert');
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  },

  /***************** FUNÇÕES DE TEMPO E DATAS *********************/

  // Retorna a data e hora atual formatada
  getCurrentDateTime() {
    const now = new Date();
    return now.toLocaleString();
  },

  // Atualiza um widget com a data/hora atual (exemplo de atualização dinâmica)
  updateDateTimeWidget(widgetId) {
    const widget = document.getElementById(widgetId);
    if (widget) {
      widget.textContent = `Última atualização: ${this.getCurrentDateTime()}`;
      this.debugLog('Widget de data/hora atualizado', widget.textContent);
    }
  },

  /***************** FUNÇÕES DE INTERAÇÃO COM USUÁRIO *********************/

  // Solicita confirmação antes de executar uma ação (ex.: exclusão)
  async confirmAction(message) {
    return new Promise((resolve) => {
      const confirmation = confirm(message);
      resolve(confirmation);
    });
  },

  // Mostra um prompt customizado para entrada de dados (simples)
  async customPrompt(message, defaultValue = '') {
    return new Promise((resolve) => {
      const result = prompt(message, defaultValue);
      resolve(result);
    });
  },

  /***************** FINALIZAÇÃO E EXPORTAÇÃO *********************/

  // Função para reinicializar ou resetar a interface (por exemplo, em caso de erro grave)
  resetInterface() {
    console.clear();
    document.querySelectorAll('.widget').forEach(widget => {
      widget.innerHTML = '<p>Carregando...</p>';
    });
    this.renderAll();
    console.log('[UI] Interface reinicializada.');
  },

  // Função para exibir indicadores de debug (se ativado)
  renderDebugIndicators() {
    const debugDiv = document.getElementById('debug-indicator');
    if (debugDiv) {
      debugDiv.textContent = `Modo Debug: ${window.debugMode ? 'Ativado' : 'Desativado'} | ${this.getCurrentDateTime()}`;
    }
  },

  // Inicializa um intervalo para atualizar indicadores de debug a cada 5 segundos
  initDebugInterval() {
    setInterval(() => {
      this.renderDebugIndicators();
    }, 5000);
  }
};

// Inicializa o listener de redimensionamento ao carregar este módulo
UI.initResizeListener();
UI.initDebugInterval();

// Fim do módulo UI
console.log('[UI] Módulo UI carregado e inicializado.');
