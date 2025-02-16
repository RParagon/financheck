import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://elmjtdztnwecsregkbut.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsbWp0ZHp0bndlY3NyZWdrYnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3NDQ3NzksImV4cCI6MjA1NTMyMDc3OX0.KicoVbt18thHT2Xud4L5oa95yboiZSYmomNFYnnLdIg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- TRANSACTIONS ---
export const fetchTransactions = async (userId) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Erro ao buscar transações:', error);
    return [];
  }
  return data;
};

export const addTransaction = async (transaction) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction]);
  if (error) {
    console.error('Erro ao adicionar transação:', error);
  }
  return data;
};

export const deleteTransaction = async (id) => {
  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Erro ao excluir transação:', error);
  }
  return data;
};

// --- INVESTMENTS ---
export const fetchInvestments = async (userId) => {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Erro ao buscar investimentos:', error);
    return [];
  }
  return data;
};

export const addInvestment = async (investment) => {
  const { data, error } = await supabase
    .from('investments')
    .insert([investment]);
  if (error) {
    console.error('Erro ao adicionar investimento:', error);
  }
  return data;
};

export const deleteInvestment = async (id) => {
  const { data, error } = await supabase
    .from('investments')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Erro ao excluir investimento:', error);
  }
  return data;
};

// --- GOALS ---
export const fetchGoals = async (userId) => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Erro ao buscar metas:', error);
    return [];
  }
  return data;
};

export const addGoal = async (goal) => {
  const { data, error } = await supabase
    .from('goals')
    .insert([goal]);
  if (error) {
    console.error('Erro ao adicionar meta:', error);
  }
  return data;
};

export const deleteGoal = async (id) => {
  const { data, error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Erro ao excluir meta:', error);
  }
  return data;
};
