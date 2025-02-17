/**
 * gamification.js – Módulo de Gamificação do FinanCheck v0.3
 * Autor: Rafael Paragon
 * Descrição: Gerencia pontos, níveis e badges (conquistas) utilizando o localStorage.
 * Funcionalidades incluem: atualização de pontos, verificação de conquistas, 
 * exportação/importação de dados e simulação de bônus.
 */

import { v4 as uuidv4 } from 'https://esm.sh/uuid';

export const Gamification = {

  // Recupera os dados de gamificação do localStorage ou inicializa com padrão.
  getProgress() {
    let data = localStorage.getItem('financheck_gamification');
    if (!data) {
      data = JSON.stringify({ points: 0, level: 'Iniciante', badges: [] });
      localStorage.setItem('financheck_gamification', data);
      console.log("[GAMIFICATION] Dados iniciais configurados.");
    }
    console.log("[GAMIFICATION] Dados recuperados:", data);
    return JSON.parse(data);
  },

  // Atualiza os pontos e recalcula o nível com base em thresholds definidos.
  updateProgress(additionalPoints) {
    let progress = this.getProgress();
    console.log("[GAMIFICATION] Pontos atuais:", progress.points);
    progress.points += additionalPoints;
    // Define níveis com base em pontos
    if (progress.points < 100) {
      progress.level = 'Iniciante';
    } else if (progress.points < 300) {
      progress.level = 'Intermediário';
    } else if (progress.points < 600) {
      progress.level = 'Avançado';
    } else {
      progress.level = 'Expert';
    }
    console.log("[GAMIFICATION] Novo nível:", progress.level);
    // Concede badge de "Primeiro Passo" se for a primeira transação
    if (progress.points >= 10 && !progress.badges.includes("Primeiro Passo")) {
      progress.badges.push("Primeiro Passo");
      console.log("[GAMIFICATION] Badge 'Primeiro Passo' concedida.");
      this.triggerBadgeEvent("Primeiro Passo");
    }
    localStorage.setItem('financheck_gamification', JSON.stringify(progress));
    return progress;
  },

  // Reseta o progresso de gamificação para o padrão.
  resetProgress() {
    const defaultProgress = { points: 0, level: 'Iniciante', badges: [] };
    localStorage.setItem('financheck_gamification', JSON.stringify(defaultProgress));
    console.log("[GAMIFICATION] Progresso resetado.");
    return defaultProgress;
  },

  // Concede manualmente um badge se ainda não foi concedido.
  awardBadge(badgeName) {
    let progress = this.getProgress();
    if (!progress.badges.includes(badgeName)) {
      progress.badges.push(badgeName);
      localStorage.setItem('financheck_gamification', JSON.stringify(progress));
      console.log(`[GAMIFICATION] Badge '${badgeName}' concedida manualmente.`);
      this.triggerBadgeEvent(badgeName);
      return true;
    }
    return false;
  },

  // Dispara um evento customizado para notificar que um badge foi concedido.
  triggerBadgeEvent(badgeName) {
    const event = new CustomEvent("badgeAwarded", { detail: { badge: badgeName, timestamp: new Date().toISOString() } });
    window.dispatchEvent(event);
    console.log(`[GAMIFICATION] Evento de badge disparado para: ${badgeName}`);
  },

  // Verifica e concede conquistas com base na ação realizada.
  async checkAndAwardAchievement(user_id, action) {
    console.log(`[GAMIFICATION] Verificando conquistas para ação: ${action}`);
    if (action === 'primeira_transacao') {
      this.awardBadge("Primeira Transação");
    }
    // Outras verificações podem ser implementadas aqui.
  },

  // Exporta os dados de gamificação para um arquivo JSON.
  exportGamificationData() {
    const progress = this.getProgress();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(progress, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "gamification_data.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    console.log("[GAMIFICATION] Dados exportados para JSON.");
  },

  // Importa dados de gamificação a partir de um arquivo JSON.
  importGamificationData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        localStorage.setItem('financheck_gamification', JSON.stringify(importedData));
        console.log("[GAMIFICATION] Dados importados com sucesso.");
        window.dispatchEvent(new Event("gamificationDataImported"));
      } catch (error) {
        console.error("[GAMIFICATION] Erro ao importar dados:", error);
      }
    };
    reader.readAsText(file);
  },

  // Simula um bônus diário (ex.: +5 pontos) após um intervalo definido.
  simulateDailyBonus() {
    console.log("[GAMIFICATION] Iniciando simulação de bônus diário...");
    setTimeout(() => {
      this.updateProgress(5);
      console.log("[GAMIFICATION] Bônus diário concedido: +5 pontos.");
      window.dispatchEvent(new CustomEvent("dailyBonusAwarded", { detail: { bonus: 5 } }));
    }, 60000);
  },

  // Verifica conquistas complexas com base em milestones.
  async complexAchievementChecker() {
    console.log("[GAMIFICATION] Verificando conquistas complexas...");
    const progress = this.getProgress();
    if (progress.points >= 200 && !progress.badges.includes("Milestone 200")) {
      this.awardBadge("Milestone 200");
    }
    if (progress.points >= 500 && !progress.badges.includes("Milestone 500")) {
      this.awardBadge("Milestone 500");
    }
  },

  // Registra o estado atual de gamificação para debug.
  logCurrentState() {
    const state = this.getProgress();
    console.log("[GAMIFICATION] Estado atual:", state);
  },

  // Inicia todas as funcionalidades do módulo de gamificação.
  init() {
    console.log("[GAMIFICATION] Inicializando módulo de gamificação...");
    this.getProgress();
    this.simulateDailyBonus();
    this.logCurrentState();
    // Verifica conquistas complexas periodicamente (a cada 2 minutos)
    setInterval(() => {
      this.complexAchievementChecker();
    }, 120000);
    console.log("[GAMIFICATION] Módulo de gamificação inicializado.");
  }
};

// Inicializa o módulo assim que o script for carregado.
Gamification.init();
