/**
 * storage.js – Módulo de Armazenamento do FinanCheck v0.3
 * Autor: Rafael Paragon
 * Descrição: Realiza operações CRUD (create, read, update, delete) para transações,
 * investimentos e metas utilizando o Supabase, com cache interno, paginação e logs detalhados.
 */

import { supabase } from './supabaseClient.js';

export const Storage = {
  // Cache interno para minimizar requisições
  _cache: {
    transactions: null,
    investments: null,
    goals: null,
    lastFetch: null
  },

  // Obtém transações com suporte a paginação e opção de forçar atualização.
  async getTransactions(forceRefresh = false, page = 1, limit = 20) {
    try {
      if (!forceRefresh && this._cache.transactions && this._cache.lastFetch) {
        console.log("[STORAGE] Retornando transações do cache.");
        return this._cache.transactions;
      }
      console.log(`[STORAGE] Buscando transações (página ${page}, limite ${limit}) do Supabase.`);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      if (error) {
        console.error("[STORAGE] Erro ao buscar transações:", error.message);
        throw error;
      }
      this._cache.transactions = data;
      this._cache.lastFetch = new Date();
      console.log("[STORAGE] Transações obtidas com sucesso.");
      return data;
    } catch (e) {
      console.error("[STORAGE] Exceção em getTransactions:", e);
      throw e;
    }
  },

  // Adiciona uma nova transação e invalida o cache.
  async addTransaction(transaction) {
    try {
      console.log("[STORAGE] Adicionando transação:", transaction);
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction]);
      if (error) {
        console.error("[STORAGE] Erro ao adicionar transação:", error.message);
        throw error;
      }
      console.log("[STORAGE] Transação adicionada com sucesso.");
      this._cache.transactions = null;
      return data;
    } catch (e) {
      console.error("[STORAGE] Exceção em addTransaction:", e);
      throw e;
    }
  },

  // Deleta uma transação pelo ID e invalida o cache.
  async deleteTransaction(id) {
    try {
      console.log(`[STORAGE] Deletando transação com ID: ${id}`);
      const { data, error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      if (error) {
        console.error("[STORAGE] Erro ao deletar transação:", error.message);
        throw error;
      }
      console.log("[STORAGE] Transação deletada com sucesso.");
      this._cache.transactions = null;
      return data;
    } catch (e) {
      console.error("[STORAGE] Exceção em deleteTransaction:", e);
      throw e;
    }
  },

  // Obtém investimentos com opção de forçar atualização.
  async getInvestments(forceRefresh = false) {
    try {
      if (!forceRefresh && this._cache.investments && this._cache.lastFetch) {
        console.log("[STORAGE] Retornando investimentos do cache.");
        return this._cache.investments;
      }
      console.log("[STORAGE] Buscando investimentos do Supabase.");
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error("[STORAGE] Erro ao buscar investimentos:", error.message);
        throw error;
      }
      this._cache.investments = data;
      this._cache.lastFetch = new Date();
      console.log("[STORAGE] Investimentos obtidos com sucesso.");
      return data;
    } catch (e) {
      console.error("[STORAGE] Exceção em getInvestments:", e);
      throw e;
    }
  },

  // Adiciona um novo investimento e invalida o cache.
  async addInvestment(investment) {
    try {
      console.log("[STORAGE] Adicionando investimento:", investment);
      const { data, error } = await supabase
        .from('investments')
        .insert([investment]);
      if (error) {
        console.error("[STORAGE] Erro ao adicionar investimento:", error.message);
        throw error;
      }
      console.log("[STORAGE] Investimento adicionado com sucesso.");
      this._cache.investments = null;
      return data;
    } catch (e) {
      console.error("[STORAGE] Exceção em addInvestment:", e);
      throw e;
    }
  },

  // Deleta um investimento pelo ID e invalida o cache.
  async deleteInvestment(id) {
    try {
      console.log(`[STORAGE] Deletando investimento com ID: ${id}`);
      const { data, error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);
      if (error) {
        console.error("[STORAGE] Erro ao deletar investimento:", error.message);
        throw error;
      }
      console.log("[STORAGE] Investimento deletado com sucesso.");
      this._cache.investments = null;
      return data;
    } catch (e) {
      console.error("[STORAGE] Exceção em deleteInvestment:", e);
      throw e;
    }
  },

  // Obtém metas com suporte a cache.
  async getGoals(forceRefresh = false) {
    try {
      if (!forceRefresh && this._cache.goals && this._cache.lastFetch) {
        console.log("[STORAGE] Retornando metas do cache.");
        return this._cache.goals;
      }
      console.log("[STORAGE] Buscando metas do Supabase.");
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error("[STORAGE] Erro ao buscar metas:", error.message);
        throw error;
      }
      this._cache.goals = data;
      this._cache.lastFetch = new Date();
      console.log("[STORAGE] Metas obtidas com sucesso.");
      return data;
    } catch (e) {
      console.error("[STORAGE] Exceção em getGoals:", e);
      throw e;
    }
  },

  // Adiciona uma nova meta e invalida o cache.
  async addGoal(goal) {
    try {
      console.log("[STORAGE] Adicionando meta:", goal);
      const { data, error } = await supabase
        .from('goals')
        .insert([goal]);
      if (error) {
        console.error("[STORAGE] Erro ao adicionar meta:", error.message);
        throw error;
      }
      console.log("[STORAGE] Meta adicionada com sucesso.");
      this._cache.goals = null;
      return data;
    } catch (e) {
      console.error("[STORAGE] Exceção em addGoal:", e);
      throw e;
    }
  },

  // Deleta uma meta pelo ID e invalida o cache.
  async deleteGoal(id) {
    try {
      console.log(`[STORAGE] Deletando meta com ID: ${id}`);
      const { data, error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
      if (error) {
        console.error("[STORAGE] Erro ao deletar meta:", error.message);
        throw error;
      }
      console.log("[STORAGE] Meta deletada com sucesso.");
      this._cache.goals = null;
      return data;
    } catch (e) {
      console.error("[STORAGE] Exceção em deleteGoal:", e);
      throw e;
    }
  },

  // Limpa o cache interno para testes ou atualização manual.
  clearCache() {
    this._cache.transactions = null;
    this._cache.investments = null;
    this._cache.goals = null;
    this._cache.lastFetch = null;
    console.log("[STORAGE] Cache interno limpo.");
  },

  // Simula paginação para transações.
  async getTransactionsWithPagination(page = 1, limit = 20) {
    console.log(`[STORAGE] Obtendo transações paginadas: página ${page}, limite ${limit}`);
    return await this.getTransactions(true, page, limit);
  },

  // Força atualização de todos os dados (transações, investimentos, metas).
  async refreshAllData() {
    console.log("[STORAGE] Forçando atualização de todos os dados.");
    await this.getTransactions(true);
    await this.getInvestments(true);
    await this.getGoals(true);
    console.log("[STORAGE] Todos os dados atualizados.");
  },

  // Registra o status do cache para debug.
  logCacheStatus() {
    console.log("[STORAGE] Status do cache:", this._cache);
  },

  // Simula um atraso para testar estados de carregamento.
  async simulateDelay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};
