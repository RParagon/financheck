// js/supabase.js
const SUPABASE_URL = 'https://elmjtdztnwecsregkbut.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsbWp0ZHp0bndlY3NyZWdrYnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3NDQ3NzksImV4cCI6MjA1NTMyMDc3OX0.KicoVbt18thHT2Xud4L5oa95yboiZSYmomNFYnnLdIg';

export const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// js/storage.js
import { supabaseClient } from './supabase.js';

export class Storage {
  // Transações
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

  // Investimentos
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

  // Metas
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
