// js/storage.js
import { supabaseClient } from './supabase.js';

export class Storage {
  // --- TRANSAÇÕES ---
  static async getTransactions() {
    const { data, error } = await supabaseClient
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Erro ao buscar transações:', error);
    return data || [];
  }

  static async addTransaction(transaction) {
    // transaction: { description, amount, type }
    const { data, error } = await supabaseClient
      .from('transactions')
      .insert([transaction]);
    if (error) console.error('Erro ao adicionar transação:', error);
    return { data, error };
  }

  static async deleteTransaction(id) {
    const { data, error } = await supabaseClient
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) console.error('Erro ao excluir transação:', error);
    return { data, error };
  }

  // --- INVESTIMENTOS ---
  static async getInvestments() {
    const { data, error } = await supabaseClient
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Erro ao buscar investimentos:', error);
    return data || [];
  }

  static async addInvestment(investment) {
    // investment: { name, amount }
    const { data, error } = await supabaseClient
      .from('investments')
      .insert([investment]);
    if (error) console.error('Erro ao adicionar investimento:', error);
    return { data, error };
  }

  static async deleteInvestment(id) {
    const { data, error } = await supabaseClient
      .from('investments')
      .delete()
      .eq('id', id);
    if (error) console.error('Erro ao excluir investimento:', error);
    return { data, error };
  }

  // --- METAS ---
  static async getGoals() {
    const { data, error } = await supabaseClient
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Erro ao buscar metas:', error);
    return data || [];
  }

  static async addGoal(goal) {
    // goal: { description, target }
    const { data, error } = await supabaseClient
      .from('goals')
      .insert([goal]);
    if (error) console.error('Erro ao adicionar meta:', error);
    return { data, error };
  }

  static async deleteGoal(id) {
    const { data, error } = await supabaseClient
      .from('goals')
      .delete()
      .eq('id', id);
    if (error) console.error('Erro ao excluir meta:', error);
    return { data, error };
  }
}
