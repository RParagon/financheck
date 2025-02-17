/******************************************************************
 * FinanCheck v0.3 - Módulo Gamification
 * Desenvolvido por Rafael Paragon
 * Responsável por gerenciar a gamificação do FinanCheck:
 * - Pontos acumulados
 * - Níveis de usuário
 * - Conquistas (achievements)
 * - Badges e recompensas
 * - Exportação/importação de dados
 * - Funções de simulação e depuração
 ******************************************************************/

// Chave para armazenar os dados de gamificação no localStorage
const GAMIFICATION_KEY = 'financheck-gamification';

// Define alguns padrões para o progresso
const DEFAULT_PROGRESS = {
  points: 0,
  level: 'Iniciante',
  badge: '',
  achievements: [] // Armazena os IDs das conquistas já obtidas
};

// Define uma lista de conquistas disponíveis (exemplo real)
const AVAILABLE_ACHIEVEMENTS = [
  { id: 'achv-001', name: 'Primeiro Passo', description: 'Realize sua primeira transação.', pointsRequired: 10 },
  { id: 'achv-002', name: 'Começando a Crescer', description: 'Acumule 50 pontos.', pointsRequired: 50 },
  { id: 'achv-003', name: 'Em Ascensão', description: 'Acumule 100 pontos.', pointsRequired: 100 },
  { id: 'achv-004', name: 'Foco Total', description: 'Acumule 200 pontos.', pointsRequired: 200 },
  { id: 'achv-005', name: 'Mestre das Finanças', description: 'Acumule 500 pontos.', pointsRequired: 500 },
  { id: 'achv-006', name: 'Lendário', description: 'Acumule 1000 pontos.', pointsRequired: 1000 }
];

// Função interna para salvar os dados de gamificação
function saveGamificationData(data) {
  try {
    localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(data));
    console.log('[Gamification] Dados salvos com sucesso.');
  } catch (err) {
    console.error('[Gamification] Erro ao salvar dados:', err);
  }
}

// Função interna para carregar os dados de gamificação
function loadGamificationData() {
  try {
    const data = localStorage.getItem(GAMIFICATION_KEY);
    if (data) {
      console.log('[Gamification] Dados carregados do localStorage.');
      return JSON.parse(data);
    } else {
      console.log('[Gamification] Nenhum dado encontrado. Usando padrão.');
      return { ...DEFAULT_PROGRESS };
    }
  } catch (err) {
    console.error('[Gamification] Erro ao carregar dados:', err);
    return { ...DEFAULT_PROGRESS };
  }
}

// Exporta o objeto Gamification com várias funções
export const Gamification = {

  // Retorna o progresso atual do usuário
  getProgress() {
    const progress = loadGamificationData();
    return progress;
  },

  // Atualiza o progresso com novos pontos e recalcula nível e badge
  updateProgress(newPoints) {
    let progress = this.getProgress();
    progress.points += newPoints;
    progress.level = this.calculateLevel(progress.points);
    progress.badge = this.determineBadge(progress.points);
    saveGamificationData(progress);
    console.log('[Gamification] Progresso atualizado:', progress);
    return progress;
  },

  // Reseta os dados de gamificação para o padrão inicial
  resetProgress() {
    saveGamificationData({ ...DEFAULT_PROGRESS });
    console.log('[Gamification] Progresso resetado.');
  },

  // Calcula o nível do usuário com base nos pontos acumulados
  calculateLevel(points) {
    if (points < 100) {
      return 'Iniciante';
    } else if (points < 300) {
      return 'Intermediário';
    } else if (points < 600) {
      return 'Avançado';
    } else if (points < 1000) {
      return 'Experiente';
    } else {
      return 'Mestre';
    }
  },

  // Determina qual badge o usuário deve receber com base nos pontos
  determineBadge(points) {
    if (points >= 1000) {
      return 'Lendário';
    } else if (points >= 600) {
      return 'Experiente';
    } else if (points >= 300) {
      return 'Ambicioso';
    } else if (points >= 100) {
      return 'Em Ascensão';
    } else if (points >= 10) {
      return 'Primeiro Passo';
    } else {
      return '';
    }
  },

  // Retorna a lista completa de conquistas disponíveis
  getAvailableAchievements() {
    return AVAILABLE_ACHIEVEMENTS;
  },

  // Retorna as conquistas já obtidas pelo usuário
  getUserAchievements() {
    const progress = this.getProgress();
    return progress.achievements;
  },

  // Verifica se o usuário já tem uma conquista
  hasAchievement(achievementId) {
    const achievements = this.getUserAchievements();
    return achievements.includes(achievementId);
  },

  // Adiciona uma conquista ao usuário, se ainda não tiver sido concedida
  awardAchievement(achievementId) {
    let progress = this.getProgress();
    if (!progress.achievements.includes(achievementId)) {
      progress.achievements.push(achievementId);
      saveGamificationData(progress);
      console.log(`[Gamification] Conquista ${achievementId} concedida.`);
      return true;
    } else {
      console.log(`[Gamification] Conquista ${achievementId} já foi concedida.`);
      return false;
    }
  },

  // Verifica e concede conquistas baseadas em uma ação específica
  checkAndAwardAchievement(action) {
    // Exemplo: para a ação 'primeira_transacao', conceder a conquista 'achv-001'
    console.log(`[Gamification] Verificando conquistas para ação: ${action}`);
    if (action === 'primeira_transacao') {
      if (!this.hasAchievement('achv-001')) {
        this.awardAchievement('achv-001');
        return 'achv-001';
      }
    }
    // Outras verificações podem ser adicionadas conforme necessário
    if (action === 'acumular_pontos') {
      const progress = this.getProgress();
      // Itera por todas as conquistas disponíveis
      for (let achievement of AVAILABLE_ACHIEVEMENTS) {
        if (progress.points >= achievement.pointsRequired && !this.hasAchievement(achievement.id)) {
          this.awardAchievement(achievement.id);
          console.log(`[Gamification] Conquista ${achievement.name} concedida.`);
        }
      }
    }
    return null;
  },

  // Exporta os dados de gamificação como uma string JSON (útil para backup)
  exportData() {
    const data = this.getProgress();
    const jsonData = JSON.stringify(data, null, 2);
    console.log('[Gamification] Dados exportados.');
    return jsonData;
  },

  // Importa dados de gamificação a partir de uma string JSON (útil para restauração)
  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      // Valida se os dados possuem a estrutura mínima
      if (data.points !== undefined && data.level && data.achievements) {
        saveGamificationData(data);
        console.log('[Gamification] Dados importados com sucesso.');
        return data;
      } else {
        throw new Error('Dados de gamificação inválidos.');
      }
    } catch (err) {
      console.error('[Gamification] Erro ao importar dados:', err);
      throw err;
    }
  },

  // Simula a realização de uma ação que gera pontos
  simulateAction(action, pointsGained) {
    console.log(`[Gamification] Simulando ação: ${action} com +${pointsGained} pontos.`);
    const updatedProgress = this.updateProgress(pointsGained);
    this.checkAndAwardAchievement('acumular_pontos');
    return updatedProgress;
  },

  // Retorna uma representação textual do progresso atual
  progressToString() {
    const progress = this.getProgress();
    return `Você possui ${progress.points} pontos, está no nível ${progress.level} e ganhou os seguintes badges: ${progress.badge || 'Nenhum'}. Conquistas: ${progress.achievements.join(', ') || 'Nenhuma'}.`;
  },

  // Função para logar o progresso no console de forma detalhada
  logProgress() {
    const progressStr = this.progressToString();
    console.log('[Gamification] Progresso Atual:', progressStr);
  },

  // Função para resetar as conquistas (mantém os pontos, mas limpa a lista de achievements)
  resetAchievements() {
    let progress = this.getProgress();
    progress.achievements = [];
    saveGamificationData(progress);
    console.log('[Gamification] Conquistas resetadas.');
  },

  // Função para forçar a atualização de pontos com base em um array de ações
  processMultipleActions(actionsArray) {
    // actionsArray é um array de objetos: { action: 'nome', points: número }
    console.log('[Gamification] Processando múltiplas ações...');
    actionsArray.forEach(act => {
      this.simulateAction(act.action, act.points);
    });
    console.log('[Gamification] Múltiplas ações processadas.');
    return this.getProgress();
  },

  // Função para exibir todas as conquistas disponíveis e o status do usuário
  listAchievementsStatus() {
    const allAchievements = AVAILABLE_ACHIEVEMENTS;
    const userAch = this.getUserAchievements();
    let statusList = allAchievements.map(ach => {
      const status = userAch.includes(ach.id) ? 'Conquistada' : 'Pendente';
      return `${ach.name}: ${status} (Requer ${ach.pointsRequired} pontos)`;
    });
    console.log('[Gamification] Status das Conquistas:\n', statusList.join('\n'));
    return statusList;
  },

  // Função para simular um ciclo de ação de gamificação completo
  simulateFullCycle() {
    console.log('[Gamification] Iniciando simulação de ciclo completo de gamificação...');
    this.resetProgress();
    this.resetAchievements();
    // Simula diversas ações com diferentes pontos
    const actions = [
      { action: 'primeira_transacao', points: 10 },
      { action: 'compra', points: 25 },
      { action: 'economia', points: 15 },
      { action: 'investimento', points: 30 },
      { action: 'meta_alcancada', points: 20 },
      { action: 'bonus', points: 50 }
    ];
    this.processMultipleActions(actions);
    this.logProgress();
    this.listAchievementsStatus();
    console.log('[Gamification] Ciclo completo de gamificação simulado.');
  },

  // Função para exportar os dados e baixar como arquivo (simulação)
  exportDataAsFile() {
    const dataStr = this.exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financheck-gamification-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log('[Gamification] Dados exportados como arquivo.');
  },

  // Função para importar dados a partir de um objeto File (simulação)
  importDataFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = this.importData(e.target.result);
        console.log('[Gamification] Dados importados a partir do arquivo:', importedData);
      } catch (err) {
        console.error('[Gamification] Falha ao importar dados do arquivo:', err);
      }
    };
    reader.readAsText(file);
  },

  // Função para configurar um cronômetro para simular ações de gamificação periodicamente
  startSimulationTimer(intervalSeconds = 30) {
    console.log('[Gamification] Iniciando cronômetro de simulação com intervalo de', intervalSeconds, 'segundos.');
    setInterval(() => {
      // Simula uma ação aleatória com pontos entre 5 e 20
      const randomPoints = Math.floor(Math.random() * 16) + 5;
      this.simulateAction('simulacao_periodica', randomPoints);
      console.log(`[Gamification] Simulação periódica: +${randomPoints} pontos.`);
      this.logProgress();
    }, intervalSeconds * 1000);
  },

  // Função para registrar um log detalhado das operações de gamificação (para depuração)
  detailedLog() {
    console.group('[Gamification] Log Detalhado');
    console.log('Data Atual:', new Date().toLocaleString());
    console.log('Progresso:', this.getProgress());
    console.log('Conquistas Disponíveis:', AVAILABLE_ACHIEVEMENTS);
    console.log('Conquistas do Usuário:', this.getUserAchievements());
    console.groupEnd();
  },

  // Função para validar a integridade dos dados de gamificação
  validateData() {
    let progress = this.getProgress();
    let valid = true;
    if (typeof progress.points !== 'number') {
      valid = false;
      console.error('[Gamification] Dados inválidos: points não é um número.');
    }
    if (!progress.level || typeof progress.level !== 'string') {
      valid = false;
      console.error('[Gamification] Dados inválidos: level ausente ou inválido.');
    }
    if (!Array.isArray(progress.achievements)) {
      valid = false;
      console.error('[Gamification] Dados inválidos: achievements deve ser um array.');
    }
    if (!valid) {
      console.warn('[Gamification] Dados de gamificação corrompidos. Resetando para padrão.');
      this.resetProgress();
    } else {
      console.log('[Gamification] Dados de gamificação validados com sucesso.');
    }
    return valid;
  },

  // Função para sincronizar dados com um servidor remoto (simulação)
  async syncWithServer() {
    try {
      console.log('[Gamification] Iniciando sincronização com o servidor remoto...');
      // Simulação: envia os dados via fetch (a URL é fictícia)
      const progress = this.getProgress();
      const response = await fetch('https://api.exemplo.com/sync-gamification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progress)
      });
      if (!response.ok) {
        throw new Error('Erro na sincronização com o servidor.');
      }
      const result = await response.json();
      console.log('[Gamification] Sincronização concluída com sucesso:', result);
      return result;
    } catch (err) {
      console.error('[Gamification] Erro na sincronização com o servidor:', err);
      throw err;
    }
  },

  // Função para ajustar dinamicamente a UI de gamificação (ex.: para diferentes resoluções)
  adjustUIForGamification() {
    console.log('[Gamification] Ajustando UI de gamificação...');
    const progressContainer = document.querySelector('.progress-container');
    if (window.innerWidth < 400) {
      progressContainer.style.height = '15px';
    } else {
      progressContainer.style.height = '20px';
    }
    console.log('[Gamification] UI ajustada.');
  },

  // Função para reinicializar a simulação completa de gamificação (para testes)
  fullSimulationReset() {
    console.log('[Gamification] Reinicializando simulação completa...');
    this.resetProgress();
    this.resetAchievements();
    this.detailedLog();
  },

  // Função para exportar os dados de gamificação e retorná-los como objeto
  getExportObject() {
    const progress = this.getProgress();
    const exportObj = {
      timestamp: new Date().toISOString(),
      progress: progress,
      achievements: this.getUserAchievements(),
      available: AVAILABLE_ACHIEVEMENTS
    };
    console.log('[Gamification] Objeto de exportação criado.');
    return exportObj;
  },

  // Função para importar dados de um objeto (ao invés de string)
  importDataObject(dataObj) {
    try {
      if (dataObj && dataObj.progress) {
        saveGamificationData(dataObj.progress);
        console.log('[Gamification] Dados importados a partir de objeto.');
        return dataObj.progress;
      } else {
        throw new Error('Objeto de dados inválido.');
      }
    } catch (err) {
      console.error('[Gamification] Erro ao importar objeto de dados:', err);
      throw err;
    }
  },

  // Função para simular uma atualização periódica e sincronização
  async periodicSyncAndValidation() {
    console.log('[Gamification] Iniciando ciclo periódico de validação e sincronização...');
    this.validateData();
    await this.syncWithServer();
    console.log('[Gamification] Ciclo periódico concluído.');
  },

  // Função para limpar todos os dados de gamificação (para testes extremos)
  clearAllData() {
    localStorage.removeItem(GAMIFICATION_KEY);
    console.log('[Gamification] Todos os dados foram removidos do localStorage.');
  },

  // Função para exibir uma notificação visual (usando alertas customizados)
  showVisualNotification(message) {
    const notifDiv = document.createElement('div');
    notifDiv.className = 'gamification-notif';
    notifDiv.textContent = message;
    notifDiv.style.position = 'fixed';
    notifDiv.style.top = '20px';
    notifDiv.style.right = '20px';
    notifDiv.style.backgroundColor = '#28a745';
    notifDiv.style.color = '#fff';
    notifDiv.style.padding = '10px';
    notifDiv.style.borderRadius = '5px';
    notifDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    document.body.appendChild(notifDiv);
    setTimeout(() => {
      notifDiv.remove();
    }, 4000);
    console.log('[Gamification] Notificação visual exibida:', message);
  },

  // Função para atualizar o layout de gamificação baseada na data e hora
  updateDynamicThemeBasedOnTime() {
    const hour = new Date().getHours();
    let theme = 'day';
    if (hour >= 18 || hour < 6) {
      theme = 'night';
    }
    console.log('[Gamification] Tema dinâmico baseado no horário:', theme);
    // Aqui, você poderia ajustar as cores dos elementos de gamificação
    document.documentElement.style.setProperty('--gamification-bg', theme === 'night' ? '#333' : '#fff');
  },

  // Função para registrar dados de gamificação em um log (pode ser exportado para servidor)
  logDataForAnalytics() {
    const progress = this.getProgress();
    console.log('[Gamification] Log para Analytics:', {
      timestamp: new Date().toISOString(),
      points: progress.points,
      level: progress.level,
      achievements: progress.achievements
    });
    // Em uma aplicação real, enviar esses dados para um servidor de analytics
  },

  // Função para iniciar um conjunto de tarefas de gamificação em paralelo
  startParallelTasks() {
    console.log('[Gamification] Iniciando tarefas paralelas...');
    this.adjustUIForGamification();
    this.updateDynamicThemeBasedOnTime();
    this.logDataForAnalytics();
    console.log('[Gamification] Tarefas paralelas iniciadas.');
  },

  // Função para simular um teste de performance do módulo de gamificação
  async runPerformanceTest(iterations = 50) {
    console.log('[Gamification] Iniciando teste de performance com', iterations, 'iterações.');
    const startTime = performance.now();
    for (let i = 0; i < iterations; i++) {
      this.updateProgress(5);
    }
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log('[Gamification] Teste de performance concluído em', duration.toFixed(2), 'ms.');
    return duration;
  },

  // Função para retornar um resumo completo dos dados de gamificação
  getSummary() {
    const progress = this.getProgress();
    const summary = {
      totalPoints: progress.points,
      currentLevel: progress.level,
      currentBadge: progress.badge || 'Nenhum',
      achievementsEarned: progress.achievements.length,
      availableAchievements: AVAILABLE_ACHIEVEMENTS.length
    };
    console.log('[Gamification] Resumo dos dados:', summary);
    return summary;
  },

  // Função para verificar se os dados de gamificação estão dentro dos parâmetros esperados
  auditDataIntegrity() {
    const progress = this.getProgress();
    let issues = [];
    if (typeof progress.points !== 'number') {
      issues.push('Pontos devem ser um número.');
    }
    if (!progress.level || typeof progress.level !== 'string') {
      issues.push('Nível inválido.');
    }
    if (!Array.isArray(progress.achievements)) {
      issues.push('Conquistas devem ser um array.');
    }
    if (issues.length > 0) {
      console.error('[Gamification] Problemas de integridade encontrados:', issues.join(' | '));
      return false;
    }
    console.log('[Gamification] Integridade dos dados verificada com sucesso.');
    return true;
  },

  // Função para executar uma auditoria completa e retornar um relatório
  runFullAudit() {
    console.group('[Gamification] Relatório de Auditoria Completa');
    this.auditDataIntegrity();
    console.log('Progresso Atual:', this.getProgress());
    console.log('Resumo:', this.getSummary());
    console.groupEnd();
  },

  // Função para adicionar pontos com registro detalhado
  addPointsWithDetail(points, reason) {
    console.log(`[Gamification] Adicionando ${points} pontos por: ${reason}`);
    const updated = this.updateProgress(points);
    this.logDataForAnalytics();
    return updated;
  },

  // Função para conceder múltiplas conquistas em sequência (se aplicável)
  awardMultipleAchievements(achievementsArray) {
    console.log('[Gamification] Concedendo múltiplas conquistas:', achievementsArray);
    achievementsArray.forEach(achId => {
      if (!this.hasAchievement(achId)) {
        this.awardAchievement(achId);
      }
    });
    return this.getUserAchievements();
  },

  // Função para simular a conclusão de um desafio complexo
  completeComplexChallenge() {
    console.log('[Gamification] Iniciando desafio complexo...');
    // Simula ganhos de pontos variados
    this.addPointsWithDetail(15, 'Desafio Parte 1');
    this.addPointsWithDetail(25, 'Desafio Parte 2');
    this.addPointsWithDetail(40, 'Desafio Parte 3');
    // Verifica e concede conquistas baseadas no novo total de pontos
    this.checkAndAwardAchievement('acumular_pontos');
    console.log('[Gamification] Desafio complexo concluído.');
  },

  // Função para exibir um relatório de desempenho detalhado (para analistas)
  async generateDetailedPerformanceReport() {
    const duration = await this.runPerformanceTest(100);
    const summary = this.getSummary();
    const report = {
      timestamp: new Date().toISOString(),
      testIterations: 100,
      durationMs: duration,
      summary: summary
    };
    console.table(report);
    return report;
  },

  // Função para inicializar a gamificação e configurar tarefas automáticas
  initialize() {
    console.log('[Gamification] Inicializando módulo de gamificação...');
    this.validateData();
    this.adjustUIForGamification();
    this.startParallelTasks();
    console.log('[Gamification] Módulo de gamificação inicializado com sucesso.');
  }
};

// Executa a inicialização do módulo de gamificação ao carregar o arquivo
Gamification.initialize();

// Expondo funções de teste para acesso global (para depuração via console)
window.GamificationTest = {
  simulateFullCycle: () => Gamification.simulateFullCycle(),
  exportData: () => Gamification.exportData(),
  importData: (json) => Gamification.importData(json),
  runPerformanceTest: (iterations) => Gamification.runPerformanceTest(iterations),
  getSummary: () => Gamification.getSummary(),
  auditData: () => Gamification.auditDataIntegrity(),
  fullAudit: () => Gamification.runFullAudit(),
  addPoints: (points, reason) => Gamification.addPointsWithDetail(points, reason),
  completeChallenge: () => Gamification.completeComplexChallenge()
};

// Funções adicionais para debug de gamificação:

// Mostra um alerta customizado com o resumo atual de gamificação
function showProgressAlert() {
  const summary = Gamification.getSummary();
  alert(`Resumo de Gamificação:\nPontos: ${summary.totalPoints}\nNível: ${summary.currentLevel}\nBadge: ${summary.currentBadge}\nConquistas: ${summary.achievementsEarned}/${summary.availableAchievements}`);
  console.log('[Gamification] Alerta de progresso exibido.');
}
window.showProgressAlert = showProgressAlert;

// Força uma auditoria completa e exibe os resultados no console
function forceAudit() {
  Gamification.runFullAudit();
}
window.forceAudit = forceAudit;

// Final do módulo Gamification
console.log('[Gamification] Módulo Gamification carregado e pronto.');
