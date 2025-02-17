/******************************************************************
 * FinanCheck v0.3 - Módulo Storage
 * Desenvolvido por Rafael Paragon
 * Responsável por gerenciar operações de CRUD para:
 * - Transações
 * - Investimentos
 * - Metas
 *
 * Além disso, inclui funcionalidades extras:
 * - Cache local via localStorage para operações offline
 * - Sincronização dos dados locais com o Supabase
 * - Operações em lote (batch operations)
 * - Funções de pesquisa e ordenação dos registros
 * - Logs detalhados e métricas de operação
 ******************************************************************/

// Importa a instância do Supabase a partir do módulo supabaseClient.js
import { supabase } from './supabaseClient.js';

// Chaves para cache local
const CACHE_KEYS = {
  transactions: 'financheck-cache-transactions',
  investments: 'financheck-cache-investments',
  goals: 'financheck-cache-goals'
};

// Função utilitária para logar operações
function logOperation(operationName, details = {}) {
  console.log(`[Storage] Operação: ${operationName}`, details);
}

// Função utilitária para armazenar dados no localStorage
function storeLocalData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    logOperation('storeLocalData', { key, data });
  } catch (err) {
    console.error('[Storage] Erro ao armazenar dados localmente:', err);
  }
}

// Função utilitária para recuperar dados do localStorage
function getLocalData(key) {
  try {
    const data = localStorage.getItem(key);
    logOperation('getLocalData', { key });
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('[Storage] Erro ao recuperar dados localmente:', err);
    return null;
  }
}

// Função utilitária para limpar dados do localStorage
function clearLocalData(key) {
  try {
    localStorage.removeItem(key);
    logOperation('clearLocalData', { key });
  } catch (err) {
    console.error('[Storage] Erro ao limpar dados locais:', err);
  }
}

// Exporta o objeto Storage contendo todas as funções de CRUD e extras
export const Storage = {

  /*************** OPERAÇÕES COM TRANSAÇÕES ***************/

  /**
   * Recupera todas as transações do usuário.
   * Tenta buscar no Supabase; se falhar, usa cache local.
   */
  async getTransactions() {
    logOperation('getTransactions - Início');
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('[Storage] Erro no getTransactions:', error.message);
        throw error;
      }
      // Armazena no cache local
      storeLocalData(CACHE_KEYS.transactions, data);
      logOperation('getTransactions - Sucesso', { count: data.length });
      return data;
    } catch (err) {
      console.warn('[Storage] Usando cache local para transações devido a erro:', err);
      const cached = getLocalData(CACHE_KEYS.transactions);
      return cached || [];
    }
  },

  /**
   * Adiciona uma nova transação.
   * Se a operação falhar, tenta armazenar localmente para sincronização futura.
   * @param {Object} transaction - Objeto com { description, amount, type, user_id }
   */
  async addTransaction(transaction) {
    logOperation('addTransaction - Início', { transaction });
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction]);
      if (error) {
        console.error('[Storage] Erro ao adicionar transação:', error.message);
        throw error;
      }
      logOperation('addTransaction - Sucesso', { data });
      // Atualiza o cache local
      const currentCache = (await this.getTransactions()) || [];
      storeLocalData(CACHE_KEYS.transactions, currentCache);
      return data;
    } catch (err) {
      console.warn('[Storage] Armazenando transação localmente devido a erro:', err);
      let localCache = getLocalData(CACHE_KEYS.transactions) || [];
      localCache.unshift({ ...transaction, created_at: new Date().toISOString(), local: true });
      storeLocalData(CACHE_KEYS.transactions, localCache);
      return [{ ...transaction, local: true }];
    }
  },

  /**
   * Atualiza uma transação existente.
   * @param {string} id - ID da transação a atualizar.
   * @param {Object} newData - Dados para atualizar.
   */
  async updateTransaction(id, newData) {
    logOperation('updateTransaction - Início', { id, newData });
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(newData)
        .eq('id', id);
      if (error) {
        console.error('[Storage] Erro ao atualizar transação:', error.message);
        throw error;
      }
      logOperation('updateTransaction - Sucesso', { data });
      // Atualiza cache local
      await this.getTransactions();
      return data;
    } catch (err) {
      console.error('[Storage] Falha ao atualizar transação:', err);
      throw err;
    }
  },

  /**
   * Exclui uma transação pelo ID.
   * @param {string} id - ID da transação a excluir.
   */
  async deleteTransaction(id) {
    logOperation('deleteTransaction - Início', { id });
    try {
      const { data, error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('[Storage] Erro ao excluir transação:', error.message);
        throw error;
      }
      logOperation('deleteTransaction - Sucesso', { data });
      // Atualiza o cache local
      await this.getTransactions();
      return data;
    } catch (err) {
      console.error('[Storage] Falha ao excluir transação:', err);
      throw err;
    }
  },

  /**
   * Realiza operações em lote para adicionar múltiplas transações.
   * @param {Array} transactionsArray - Array de transações.
   */
  async batchAddTransactions(transactionsArray) {
    logOperation('batchAddTransactions - Início', { count: transactionsArray.length });
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionsArray);
      if (error) {
        console.error('[Storage] Erro no batchAddTransactions:', error.message);
        throw error;
      }
      logOperation('batchAddTransactions - Sucesso', { data });
      // Atualiza o cache
      await this.getTransactions();
      return data;
    } catch (err) {
      console.error('[Storage] Falha no batchAddTransactions:', err);
      throw err;
    }
  },

  /*************** OPERAÇÕES COM INVESTIMENTOS ***************/

  /**
   * Recupera todos os investimentos do usuário.
   */
  async getInvestments() {
    logOperation('getInvestments - Início');
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('[Storage] Erro no getInvestments:', error.message);
        throw error;
      }
      storeLocalData(CACHE_KEYS.investments, data);
      logOperation('getInvestments - Sucesso', { count: data.length });
      return data;
    } catch (err) {
      console.warn('[Storage] Usando cache local para investimentos:', err);
      const cached = getLocalData(CACHE_KEYS.investments);
      return cached || [];
    }
  },

  /**
   * Adiciona um novo investimento.
   * @param {Object} investment - Objeto com { name, amount, user_id }
   */
  async addInvestment(investment) {
    logOperation('addInvestment - Início', { investment });
    try {
      const { data, error } = await supabase
        .from('investments')
        .insert([investment]);
      if (error) {
        console.error('[Storage] Erro ao adicionar investimento:', error.message);
        throw error;
      }
      logOperation('addInvestment - Sucesso', { data });
      const currentCache = (await this.getInvestments()) || [];
      storeLocalData(CACHE_KEYS.investments, currentCache);
      return data;
    } catch (err) {
      console.warn('[Storage] Armazenando investimento localmente devido a erro:', err);
      let localCache = getLocalData(CACHE_KEYS.investments) || [];
      localCache.unshift({ ...investment, created_at: new Date().toISOString(), local: true });
      storeLocalData(CACHE_KEYS.investments, localCache);
      return [{ ...investment, local: true }];
    }
  },

  /**
   * Atualiza um investimento existente.
   * @param {string} id - ID do investimento.
   * @param {Object} newData - Dados a serem atualizados.
   */
  async updateInvestment(id, newData) {
    logOperation('updateInvestment - Início', { id, newData });
    try {
      const { data, error } = await supabase
        .from('investments')
        .update(newData)
        .eq('id', id);
      if (error) {
        console.error('[Storage] Erro ao atualizar investimento:', error.message);
        throw error;
      }
      logOperation('updateInvestment - Sucesso', { data });
      await this.getInvestments();
      return data;
    } catch (err) {
      console.error('[Storage] Falha ao atualizar investimento:', err);
      throw err;
    }
  },

  /**
   * Exclui um investimento pelo ID.
   * @param {string} id - ID do investimento.
   */
  async deleteInvestment(id) {
    logOperation('deleteInvestment - Início', { id });
    try {
      const { data, error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('[Storage] Erro ao excluir investimento:', error.message);
        throw error;
      }
      logOperation('deleteInvestment - Sucesso', { data });
      await this.getInvestments();
      return data;
    } catch (err) {
      console.error('[Storage] Falha ao excluir investimento:', err);
      throw err;
    }
  },

  /*************** OPERAÇÕES COM METAS ***************/

  /**
   * Recupera todas as metas do usuário.
   */
  async getGoals() {
    logOperation('getGoals - Início');
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('[Storage] Erro no getGoals:', error.message);
        throw error;
      }
      storeLocalData(CACHE_KEYS.goals, data);
      logOperation('getGoals - Sucesso', { count: data.length });
      return data;
    } catch (err) {
      console.warn('[Storage] Usando cache local para metas:', err);
      const cached = getLocalData(CACHE_KEYS.goals);
      return cached || [];
    }
  },

  /**
   * Adiciona uma nova meta.
   * @param {Object} goal - Objeto com { description, target, user_id }
   */
  async addGoal(goal) {
    logOperation('addGoal - Início', { goal });
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([goal]);
      if (error) {
        console.error('[Storage] Erro ao adicionar meta:', error.message);
        throw error;
      }
      logOperation('addGoal - Sucesso', { data });
      const currentCache = (await this.getGoals()) || [];
      storeLocalData(CACHE_KEYS.goals, currentCache);
      return data;
    } catch (err) {
      console.warn('[Storage] Armazenando meta localmente devido a erro:', err);
      let localCache = getLocalData(CACHE_KEYS.goals) || [];
      localCache.unshift({ ...goal, created_at: new Date().toISOString(), local: true });
      storeLocalData(CACHE_KEYS.goals, localCache);
      return [{ ...goal, local: true }];
    }
  },

  /**
   * Atualiza uma meta existente.
   * @param {string} id - ID da meta.
   * @param {Object} newData - Dados a serem atualizados.
   */
  async updateGoal(id, newData) {
    logOperation('updateGoal - Início', { id, newData });
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(newData)
        .eq('id', id);
      if (error) {
        console.error('[Storage] Erro ao atualizar meta:', error.message);
        throw error;
      }
      logOperation('updateGoal - Sucesso', { data });
      await this.getGoals();
      return data;
    } catch (err) {
      console.error('[Storage] Falha ao atualizar meta:', err);
      throw err;
    }
  },

  /**
   * Exclui uma meta pelo ID.
   * @param {string} id - ID da meta.
   */
  async deleteGoal(id) {
    logOperation('deleteGoal - Início', { id });
    try {
      const { data, error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('[Storage] Erro ao excluir meta:', error.message);
        throw error;
      }
      logOperation('deleteGoal - Sucesso', { data });
      await this.getGoals();
      return data;
    } catch (err) {
      console.error('[Storage] Falha ao excluir meta:', err);
      throw err;
    }
  },

  /*************** OPERAÇÕES EM LOTE E UTILITÁRIOS ***************/

  /**
   * Executa uma operação em lote para excluir múltiplas transações.
   * @param {Array} idsArray - Array de IDs de transações.
   */
  async batchDeleteTransactions(idsArray) {
    logOperation('batchDeleteTransactions - Início', { ids: idsArray });
    try {
      const { data, error } = await supabase
        .from('transactions')
        .delete()
        .in('id', idsArray);
      if (error) {
        console.error('[Storage] Erro no batchDeleteTransactions:', error.message);
        throw error;
      }
      logOperation('batchDeleteTransactions - Sucesso', { data });
      await this.getTransactions();
      return data;
    } catch (err) {
      console.error('[Storage] Falha no batchDeleteTransactions:', err);
      throw err;
    }
  },

  /**
   * Executa uma operação em lote para atualizar múltiplas metas.
   * @param {Array} updatesArray - Array de objetos { id, newData }.
   */
  async batchUpdateGoals(updatesArray) {
    logOperation('batchUpdateGoals - Início', { count: updatesArray.length });
    let results = [];
    for (const update of updatesArray) {
      try {
        const res = await this.updateGoal(update.id, update.newData);
        results.push(res);
      } catch (err) {
        console.error('[Storage] Erro na atualização em lote de meta:', err);
      }
    }
    logOperation('batchUpdateGoals - Concluído', { results });
    return results;
  },

  /**
   * Pesquisa transações localmente com base em um termo de busca.
   * @param {string} query - Termo de busca.
   */
  async searchTransactions(query) {
    logOperation('searchTransactions - Início', { query });
    const transactions = await this.getTransactions();
    const filtered = transactions.filter(t => 
      t.description.toLowerCase().includes(query.toLowerCase())
    );
    logOperation('searchTransactions - Sucesso', { count: filtered.length });
    return filtered;
  },

  /**
   * Ordena as transações com base em um critério.
   * @param {string} criteria - 'amount', 'date' ou 'description'.
   */
  async sortTransactions(criteria) {
    logOperation('sortTransactions - Início', { criteria });
    const transactions = await this.getTransactions();
    let sorted = [];
    if (criteria === 'amount') {
      sorted = transactions.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
    } else if (criteria === 'date') {
      sorted = transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (criteria === 'description') {
      sorted = transactions.sort((a, b) => a.description.localeCompare(b.description));
    } else {
      sorted = transactions;
    }
    logOperation('sortTransactions - Sucesso', { count: sorted.length });
    return sorted;
  },

  /**
   * Limpa todos os caches locais (transações, investimentos, metas).
   */
  clearAllLocalCaches() {
    logOperation('clearAllLocalCaches - Início');
    clearLocalData(CACHE_KEYS.transactions);
    clearLocalData(CACHE_KEYS.investments);
    clearLocalData(CACHE_KEYS.goals);
    logOperation('clearAllLocalCaches - Concluído');
  },

  /**
   * Sincroniza os dados armazenados localmente com o Supabase.
   * Essa função tenta enviar registros marcados como 'local' para o servidor.
   */
  async syncLocalCache() {
    logOperation('syncLocalCache - Início');
    // Sincroniza transações locais
    let localTransactions = getLocalData(CACHE_KEYS.transactions) || [];
    const unsynced = localTransactions.filter(t => t.local);
    if (unsynced.length > 0) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert(unsynced);
        if (error) throw error;
        // Remove a flag local e atualiza o cache
        localTransactions = localTransactions.map(t => {
          if (t.local) {
            t.local = false;
          }
          return t;
        });
        storeLocalData(CACHE_KEYS.transactions, localTransactions);
        logOperation('syncLocalCache - Transações sincronizadas', { count: data.length });
      } catch (err) {
        console.error('[Storage] Erro ao sincronizar transações:', err);
      }
    } else {
      logOperation('syncLocalCache - Nenhuma transação local para sincronizar');
    }
    // Similarmente, pode ser implementado para investimentos e metas se necessário
    logOperation('syncLocalCache - Concluído');
  },

  /**
   * Recupera dados de um tipo específico do cache local.
   * @param {string} type - 'transactions', 'investments' ou 'goals'.
   */
  getCachedData(type) {
    logOperation('getCachedData - Início', { type });
    if (CACHE_KEYS[type]) {
      const data = getLocalData(CACHE_KEYS[type]);
      logOperation('getCachedData - Sucesso', { count: data ? data.length : 0 });
      return data;
    } else {
      console.warn('[Storage] Tipo de cache não reconhecido:', type);
      return [];
    }
  },

  /**
   * Força a atualização dos dados locais a partir do Supabase.
   * @param {string} type - Tipo de dados a atualizar.
   */
  async refreshLocalCache(type) {
    logOperation('refreshLocalCache - Início', { type });
    if (type === 'transactions') {
      await this.getTransactions();
    } else if (type === 'investments') {
      await this.getInvestments();
    } else if (type === 'goals') {
      await this.getGoals();
    } else {
      console.warn('[Storage] refreshLocalCache: Tipo desconhecido.');
    }
    logOperation('refreshLocalCache - Concluído', { type });
  },

  /*************** FUNÇÕES DE MONITORAMENTO E LOGS ***************/

  /**
   * Registra um log detalhado de uma operação de armazenamento.
   * Esse log pode ser enviado a um sistema de monitoramento.
   * @param {string} operation - Nome da operação.
   * @param {Object} details - Detalhes da operação.
   */
  detailedLog(operation, details = {}) {
    console.group(`[Storage - Detailed Log] ${operation}`);
    console.log('Timestamp:', new Date().toISOString());
    console.table(details);
    console.groupEnd();
  },

  /**
   * Mede o tempo de execução de uma função assíncrona.
   * @param {Function} asyncFunc - Função assíncrona a ser medida.
   * @param  {...any} args - Argumentos para a função.
   * @returns {any} Retorno da função.
   */
  async measureExecutionTime(asyncFunc, ...args) {
    const start = performance.now();
    const result = await asyncFunc(...args);
    const end = performance.now();
    console.log(`[Storage] Tempo de execução para ${asyncFunc.name}: ${(end - start).toFixed(2)} ms`);
    return result;
  },

  /*************** FUNÇÕES DE BUSCA E FILTRAGEM ***************/

  /**
   * Realiza uma busca local em investimentos com base em um termo.
   * @param {string} query - Termo de busca.
   */
  async searchInvestments(query) {
    logOperation('searchInvestments - Início', { query });
    const investments = await this.getInvestments();
    const filtered = investments.filter(inv => inv.name.toLowerCase().includes(query.toLowerCase()));
    logOperation('searchInvestments - Sucesso', { count: filtered.length });
    return filtered;
  },

  /**
   * Ordena as metas com base em um critério: 'target', 'description' ou 'date'.
   * @param {string} criteria - Critério de ordenação.
   */
  async sortGoals(criteria) {
    logOperation('sortGoals - Início', { criteria });
    const goals = await this.getGoals();
    let sorted = [];
    if (criteria === 'target') {
      sorted = goals.sort((a, b) => parseFloat(b.target) - parseFloat(a.target));
    } else if (criteria === 'description') {
      sorted = goals.sort((a, b) => a.description.localeCompare(b.description));
    } else if (criteria === 'date') {
      sorted = goals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      sorted = goals;
    }
    logOperation('sortGoals - Sucesso', { count: sorted.length });
    return sorted;
  },

  /*************** FUNÇÕES DE SINCRONIZAÇÃO ***************/

  /**
   * Sincroniza todas as caches locais (transações, investimentos, metas)
   * com os dados do Supabase.
   */
  async syncAllCaches() {
    logOperation('syncAllCaches - Início');
    await Promise.all([
      this.refreshLocalCache('transactions'),
      this.refreshLocalCache('investments'),
      this.refreshLocalCache('goals')
    ]);
    logOperation('syncAllCaches - Concluído');
  },

  /*************** FUNÇÕES DE BACKUP E RESTAURAÇÃO ***************/

  /**
   * Exporta todos os dados do Storage (transações, investimentos, metas)
   * como um objeto JSON.
   */
  async exportAllData() {
    logOperation('exportAllData - Início');
    const transactions = await this.getTransactions();
    const investments = await this.getInvestments();
    const goals = await this.getGoals();
    const exportObj = {
      exportedAt: new Date().toISOString(),
      transactions,
      investments,
      goals
    };
    logOperation('exportAllData - Sucesso', { counts: { transactions: transactions.length, investments: investments.length, goals: goals.length } });
    return exportObj;
  },

  /**
   * Importa dados para o Storage a partir de um objeto JSON.
   * @param {Object} importObj - Objeto com as chaves transactions, investments, goals.
   */
  async importAllData(importObj) {
    logOperation('importAllData - Início');
    try {
      if (!importObj || !importObj.transactions || !importObj.investments || !importObj.goals) {
        throw new Error('Estrutura de dados de importação inválida.');
      }
      // Importa transações
      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .insert(importObj.transactions);
      if (transError) throw transError;
      // Importa investimentos
      const { data: investData, error: investError } = await supabase
        .from('investments')
        .insert(importObj.investments);
      if (investError) throw investError;
      // Importa metas
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .insert(importObj.goals);
      if (goalsError) throw goalsError;
      // Atualiza caches locais
      await this.syncAllCaches();
      logOperation('importAllData - Sucesso', { transCount: transData.length, investCount: investData.length, goalsCount: goalsData.length });
      return { transData, investData, goalsData };
    } catch (err) {
      console.error('[Storage] Erro ao importar dados:', err);
      throw err;
    }
  },

  /*************** FUNÇÕES DE UTILITÁRIOS EXTRAS ***************/

  /**
   * Verifica se a conexão com o Supabase está ativa.
   */
  async isOnline() {
    try {
      const response = await fetch(supabase.auth.url);
      const online = response.ok;
      logOperation('isOnline', { online });
      return online;
    } catch (err) {
      console.error('[Storage] Erro ao verificar conexão:', err);
      return false;
    }
  },

  /**
   * Força um teste de conexão e, se offline, retorna dados do cache.
   */
  async getDataWithFallback(entity) {
    logOperation('getDataWithFallback - Início', { entity });
    const online = await this.isOnline();
    if (online) {
      if (entity === 'transactions') return await this.getTransactions();
      if (entity === 'investments') return await this.getInvestments();
      if (entity === 'goals') return await this.getGoals();
      return [];
    } else {
      console.warn('[Storage] Offline: retornando dados do cache para', entity);
      return getLocalData(CACHE_KEYS[entity]) || [];
    }
  },

  /**
   * Executa uma função de armazenamento com retry (tentar novamente em caso de erro).
   * @param {Function} func - Função assíncrona a ser executada.
   * @param {number} retries - Número máximo de tentativas.
   */
  async executeWithRetry(func, retries = 3) {
    let attempts = 0;
    while (attempts < retries) {
      try {
        const result = await func();
        return result;
      } catch (err) {
        attempts++;
        console.warn(`[Storage] Tentativa ${attempts} falhou. Retentando...`);
        if (attempts === retries) {
          console.error('[Storage] Todas as tentativas falharam.');
          throw err;
        }
      }
    }
  },

  /**
   * Realiza uma operação de limpeza total dos dados remotos (uso cuidadoso).
   * OBS: Esta função é para uso administrativo e deve ser protegida.
   */
  async clearRemoteData() {
    logOperation('clearRemoteData - Início');
    try {
      // Exclui transações
      const { error: transError } = await supabase.from('transactions').delete().neq('id', ''); 
      if (transError) throw transError;
      // Exclui investimentos
      const { error: investError } = await supabase.from('investments').delete().neq('id', '');
      if (investError) throw investError;
      // Exclui metas
      const { error: goalsError } = await supabase.from('goals').delete().neq('id', '');
      if (goalsError) throw goalsError;
      logOperation('clearRemoteData - Sucesso');
      return true;
    } catch (err) {
      console.error('[Storage] Erro em clearRemoteData:', err);
      throw err;
    }
  },

  /**
   * Retorna uma contagem dos registros armazenados em cada entidade.
   */
  async getCounts() {
    logOperation('getCounts - Início');
    const transactions = await this.getTransactions();
    const investments = await this.getInvestments();
    const goals = await this.getGoals();
    const counts = {
      transactions: transactions.length,
      investments: investments.length,
      goals: goals.length
    };
    logOperation('getCounts - Concluído', counts);
    return counts;
  },

  /**
   * Atualiza um registro em uma entidade específica.
   * @param {string} entity - 'transactions', 'investments' ou 'goals'.
   * @param {string} id - ID do registro.
   * @param {Object} newData - Dados a atualizar.
   */
  async updateRecord(entity, id, newData) {
    logOperation('updateRecord - Início', { entity, id, newData });
    try {
      let table = entity;
      const { data, error } = await supabase
        .from(table)
        .update(newData)
        .eq('id', id);
      if (error) throw error;
      // Atualiza cache para a entidade
      await this.refreshLocalCache(entity);
      logOperation('updateRecord - Sucesso', { data });
      return data;
    } catch (err) {
      console.error('[Storage] Erro em updateRecord:', err);
      throw err;
    }
  },

  /**
   * Remove todos os registros de uma entidade (uso para testes).
   * @param {string} entity - Nome da entidade.
   */
  async clearEntity(entity) {
    logOperation('clearEntity - Início', { entity });
    try {
      const { data, error } = await supabase
        .from(entity)
        .delete()
        .neq('id', '');
      if (error) throw error;
      // Limpa o cache local correspondente
      clearLocalData(CACHE_KEYS[entity]);
      logOperation('clearEntity - Sucesso', { data });
      return data;
    } catch (err) {
      console.error('[Storage] Erro em clearEntity:', err);
      throw err;
    }
  },

  /*************** FUNÇÕES DE EXPORTAÇÃO/IMPORTAÇÃO ***************/

  /**
   * Exporta os dados de uma entidade para um arquivo JSON.
   * @param {string} entity - 'transactions', 'investments' ou 'goals'.
   */
  async exportEntityData(entity) {
    logOperation('exportEntityData - Início', { entity });
    const data = await this.getDataWithFallback(entity);
    const jsonData = JSON.stringify(data, null, 2);
    logOperation('exportEntityData - Concluído', { length: jsonData.length });
    return jsonData;
  },

  /**
   * Importa dados para uma entidade a partir de uma string JSON.
   * @param {string} entity - Nome da entidade.
   * @param {string} jsonData - Dados em formato JSON.
   */
  async importEntityData(entity, jsonData) {
    logOperation('importEntityData - Início', { entity });
    try {
      const dataArray = JSON.parse(jsonData);
      const { data, error } = await supabase
        .from(entity)
        .insert(dataArray);
      if (error) throw error;
      // Atualiza o cache local
      await this.refreshLocalCache(entity);
      logOperation('importEntityData - Sucesso', { count: dataArray.length });
      return data;
    } catch (err) {
      console.error('[Storage] Erro em importEntityData:', err);
      throw err;
    }
  },

  /*************** FUNÇÕES DE AGENDAMENTO E SINCRONIZAÇÃO PERIÓDICA ***************/

  /**
   * Inicia um cronômetro que sincroniza os dados locais com o Supabase periodicamente.
   * @param {number} intervalSeconds - Intervalo em segundos.
   */
  startPeriodicSync(intervalSeconds = 120) {
    logOperation('startPeriodicSync - Iniciado', { intervalSeconds });
    setInterval(async () => {
      try {
        await this.syncLocalCache();
        logOperation('startPeriodicSync - Sincronização concluída');
      } catch (err) {
        console.error('[Storage] Erro durante sincronização periódica:', err);
      }
    }, intervalSeconds * 1000);
  },

  /*************** FUNÇÕES DE CACHE ADICIONAL ***************/

  /**
   * Atualiza o cache local de uma entidade com dados atuais do Supabase.
   * Reutiliza a função refreshLocalCache definida anteriormente.
   * @param {string} entity - Nome da entidade.
   */
  async updateLocalCache(entity) {
    logOperation('updateLocalCache - Início', { entity });
    await this.refreshLocalCache(entity);
    logOperation('updateLocalCache - Concluído', { entity });
  },

  /*************** FUNÇÕES DE FILTRAGEM E RELATÓRIOS ***************/

  /**
   * Gera um relatório simples dos dados de todas as entidades.
   * @returns {Object} Relatório com contagens e dados resumidos.
   */
  async generateReport() {
    logOperation('generateReport - Início');
    const counts = await this.getCounts();
    const report = {
      timestamp: new Date().toISOString(),
      transactionsCount: counts.transactions,
      investmentsCount: counts.investments,
      goalsCount: counts.goals,
      note: 'Relatório gerado a partir dos dados do Supabase e cache local.'
    };
    logOperation('generateReport - Concluído', report);
    return report;
  },

  /*************** FUNÇÕES DE MONITORAMENTO DE ERROS ***************/

  /**
   * Tenta executar uma função e, em caso de erro, envia um log detalhado.
   * @param {Function} func - Função a ser executada.
   */
  async executeWithErrorMonitoring(func) {
    try {
      await func();
    } catch (err) {
      console.error('[Storage] Erro monitorado:', err);
      // Aqui, você poderia enviar o erro para um serviço de monitoramento
    }
  },

  /*************** FUNÇÕES DE UTILITÁRIOS EXTRAS ***************/

  /**
   * Retorna uma cópia dos dados atuais de todas as entidades para debug.
   */
  async dumpAllData() {
    logOperation('dumpAllData - Início');
    const transactions = await this.getTransactions();
    const investments = await this.getInvestments();
    const goals = await this.getGoals();
    const dump = {
      transactions,
      investments,
      goals,
      dumpedAt: new Date().toISOString()
    };
    console.group('[Storage] Dump completo de dados:');
    console.log(dump);
    console.groupEnd();
    return dump;
  },

  /**
   * Faz um teste de performance de uma operação de armazenamento.
   * @param {Function} operation - Função assíncrona a ser medida.
   */
  async testPerformance(operation) {
    const startTime = performance.now();
    await operation();
    const endTime = performance.now();
    const duration = endTime - startTime;
    logOperation('testPerformance', { durationMs: duration });
    return duration;
  },

  /**
   * Função para inicializar o módulo de Storage.
   * Pode ser chamada durante a inicialização do app para configurar tarefas.
   */
  async initializeStorageModule() {
    logOperation('initializeStorageModule - Início');
    // Atualiza caches locais para todas as entidades
    await Promise.all([
      this.refreshLocalCache('transactions'),
      this.refreshLocalCache('investments'),
      this.refreshLocalCache('goals')
    ]);
    // Inicia sincronização periódica
    this.startPeriodicSync(120);
    logOperation('initializeStorageModule - Concluído');
  }
};

// Funções globais para depuração e testes adicionais

/**
 * Função para forçar um dump de todos os dados para o console.
 */
export async function debugDumpAllData() {
  console.log('[Storage] Executando debugDumpAllData...');
  const dump = await Storage.dumpAllData();
  console.table(dump);
}

/**
 * Função para limpar todos os caches locais.
 */
export function clearAllCaches() {
  console.log('[Storage] Limpando todos os caches locais...');
  clearLocalData(CACHE_KEYS.transactions);
  clearLocalData(CACHE_KEYS.investments);
  clearLocalData(CACHE_KEYS.goals);
  console.log('[Storage] Caches locais limpos.');
}

/**
 * Função para simular uma operação de batch update em metas.
 */
export async function simulateBatchGoalUpdate() {
  console.log('[Storage] Simulando batch update em metas...');
  const goals = await Storage.getGoals();
  const updates = goals.map(goal => ({
    id: goal.id,
    newData: { target: parseFloat(goal.target) + 50 }
  }));
  const result = await Storage.batchUpdateGoals(updates);
  console.log('[Storage] Batch update concluído:', result);
  return result;
}

// Função para expor algumas funções de teste globalmente
window.StorageTest = {
  debugDumpAllData,
  clearAllCaches,
  simulateBatchGoalUpdate,
  exportAllData: () => Storage.exportAllData(),
  importAllData: (data) => Storage.importAllData(data),
  getCounts: () => Storage.getCounts()
};

// Fim do módulo Storage
console.log('[Storage] Módulo Storage carregado e inicializado.');
