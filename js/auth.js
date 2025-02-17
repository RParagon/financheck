import { supabase } from './supabaseClient.js';

export const Auth = {
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Erro ao deslogar:', error);
  },

  // Retorna a sessão atual (incluindo o usuário)
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange(callback) {
    supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};
