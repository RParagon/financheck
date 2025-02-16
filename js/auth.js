import { supabase } from './db.js';

export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  return data;
};

export const signup = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    throw error;
  }
  return data;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erro ao realizar logout:', error);
  }
};

export const getUser = () => {
  return supabase.auth.getUser();
};

export const onAuthStateChange = (callback) => {
  supabase.auth.onAuthStateChange(callback);
};
