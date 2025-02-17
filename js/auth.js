/**
 * auth.js – Módulo de Autenticação do FinanCheck v0.3
 * Autor: Rafael Paragon
 * Descrição: Gerencia cadastro, login, logout, atualização de perfil, 
 * gerenciamento de tokens e armazenamento local do estado de autenticação.
 */

import { supabase } from './supabaseClient.js';

export const Auth = {

  // Cadastra um novo usuário e armazena o estado da sessão.
  async signUp(email, password) {
    try {
      console.log(`[AUTH] Iniciando cadastro para: ${email}`);
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.error(`[AUTH] Erro no signUp: ${error.message}`);
        throw error;
      }
      console.log(`[AUTH] Cadastro realizado: ${data.user ? data.user.email : 'Usuário desconhecido'}`);
      this.storeAuthState(data.session);
      this.triggerAuthEvent('userSignedUp', { email, session: data.session });
      return data;
    } catch (e) {
      console.error(`[AUTH] Exceção em signUp: ${e}`);
      throw e;
    }
  },

  // Realiza o login do usuário e armazena o estado.
  async signIn(email, password) {
    try {
      console.log(`[AUTH] Tentando login para: ${email}`);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error(`[AUTH] Erro no signIn: ${error.message}`);
        throw error;
      }
      console.log(`[AUTH] Login efetuado: ${data.user ? data.user.email : 'Usuário desconhecido'}`);
      this.storeAuthState(data.session);
      this.triggerAuthEvent('userSignedIn', { email, session: data.session });
      return data;
    } catch (e) {
      console.error(`[AUTH] Exceção em signIn: ${e}`);
      throw e;
    }
  },

  // Desloga o usuário e limpa o estado armazenado.
  async signOut() {
    try {
      console.log(`[AUTH] Iniciando logout...`);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error(`[AUTH] Erro ao deslogar: ${error.message}`);
      } else {
        console.log(`[AUTH] Logout efetuado com sucesso.`);
      }
      this.clearStoredAuthState();
      this.triggerAuthEvent('userSignedOut', {});
    } catch (e) {
      console.error(`[AUTH] Exceção em signOut: ${e}`);
      throw e;
    }
  },

  // Retorna o usuário autenticado atualmente.
  async getUser() {
    try {
      console.log(`[AUTH] Obtendo usuário atual...`);
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error(`[AUTH] Erro ao obter usuário: ${error.message}`);
        throw error;
      }
      console.log(`[AUTH] Usuário atual: ${user ? user.email : 'Nenhum usuário'}`);
      return user;
    } catch (e) {
      console.error(`[AUTH] Exceção em getUser: ${e}`);
      throw e;
    }
  },

  // Registra um callback para mudanças no estado de autenticação.
  onAuthStateChange(callback) {
    console.log(`[AUTH] Registrando onAuthStateChange listener.`);
    supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[AUTH] Estado alterado: ${event}`);
      callback(event, session);
    });
  },

  // Tenta atualizar o token da sessão e retorna a sessão atual.
  async refreshToken() {
    try {
      console.log(`[AUTH] Atualizando token...`);
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error(`[AUTH] Erro ao atualizar token: ${error.message}`);
        throw error;
      }
      console.log(`[AUTH] Sessão atual:`, data.session);
      return data.session;
    } catch (e) {
      console.error(`[AUTH] Exceção em refreshToken: ${e}`);
      throw e;
    }
  },

  // Armazena o estado de autenticação no localStorage.
  storeAuthState(session) {
    try {
      if (session) {
        localStorage.setItem('financheck_auth', JSON.stringify(session));
        console.log(`[AUTH] Estado de autenticação armazenado.`);
      }
    } catch (e) {
      console.error(`[AUTH] Erro ao armazenar estado: ${e}`);
    }
  },

  // Recupera o estado de autenticação do localStorage.
  getStoredAuthState() {
    try {
      const state = localStorage.getItem('financheck_auth');
      console.log(`[AUTH] Estado recuperado: ${state}`);
      return state ? JSON.parse(state) : null;
    } catch (e) {
      console.error(`[AUTH] Erro ao recuperar estado: ${e}`);
      return null;
    }
  },

  // Remove o estado de autenticação do armazenamento local.
  clearStoredAuthState() {
    try {
      localStorage.removeItem('financheck_auth');
      console.log(`[AUTH] Estado de autenticação removido.`);
    } catch (e) {
      console.error(`[AUTH] Erro ao limpar estado: ${e}`);
    }
  },

  // Atualiza o perfil do usuário com novas informações.
  async updateProfile(updates) {
    try {
      console.log(`[AUTH] Atualizando perfil com:`, updates);
      const { data, error } = await supabase.auth.updateUser(updates);
      if (error) {
        console.error(`[AUTH] Erro ao atualizar perfil: ${error.message}`);
        throw error;
      }
      console.log(`[AUTH] Perfil atualizado:`, data);
      this.triggerAuthEvent('profileUpdated', { updates });
      return data;
    } catch (e) {
      console.error(`[AUTH] Exceção em updateProfile: ${e}`);
      throw e;
    }
  },

  // Dispara um evento customizado para ações de autenticação.
  triggerAuthEvent(eventName, details) {
    const event = new CustomEvent(eventName, { detail: details });
    window.dispatchEvent(event);
    console.log(`[AUTH] Evento disparado: ${eventName}`, details);
  },

  // Inicializa o estado de autenticação a partir do localStorage.
  initAuthState() {
    console.log(`[AUTH] Inicializando estado a partir do localStorage.`);
    const stored = this.getStoredAuthState();
    if (stored) {
      console.log(`[AUTH] Estado encontrado:`, stored);
    } else {
      console.log(`[AUTH] Nenhum estado encontrado.`);
    }
    return stored;
  },

  // Força atualização do token em intervalos definidos (ex.: 30 minutos)
  async autoRefreshToken(interval = 1800000) {
    setInterval(async () => {
      try {
        console.log(`[AUTH] Auto-refresh token iniciado.`);
        await this.refreshToken();
      } catch (e) {
        console.error(`[AUTH] Auto-refresh falhou: ${e}`);
      }
    }, interval);
  },

  // Realiza logout após período de inatividade (ex.: 60 minutos)
  async logoutAfterInactivity(timeout = 3600000) {
    setTimeout(async () => {
      console.log(`[AUTH] Logout automático por inatividade.`);
      await this.signOut();
    }, timeout);
  },

  // Simula um delay (útil para testes de carregamento)
  async simulateDelay(ms = 1000) {
    console.log(`[AUTH] Simulando delay de ${ms}ms.`);
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Inicializa todas as funções do módulo Auth
  async init() {
    console.log(`[AUTH] Inicializando módulo de autenticação...`);
    this.initAuthState();
    await this.autoRefreshToken(1800000);
    this.logoutAfterInactivity(3600000);
    console.log(`[AUTH] Módulo de autenticação inicializado.`);
  }
};

// Inicializa o módulo assim que o script for carregado
Auth.init();
