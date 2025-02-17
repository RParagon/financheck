import { supabase } from './supabaseClient.js';

export const Storage = {
  // Transações
  async getTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addTransaction(transaction) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction]);
    if (error) throw error;
    return data;
  },

  async deleteTransaction(id) {
    const { data, error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  // Investimentos
  async getInvestments() {
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addInvestment(investment) {
    const { data, error } = await supabase
      .from('investments')
      .insert([investment]);
    if (error) throw error;
    return data;
  },

  async deleteInvestment(id) {
    const { data, error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  },

  // Metas
  async getGoals() {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addGoal(goal) {
    const { data, error } = await supabase
      .from('goals')
      .insert([goal]);
    if (error) throw error;
    return data;
  },

  async deleteGoal(id) {
    const { data, error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return data;
  }
};
