import { supabase } from './supabaseClient.js';

export const Gamification = {
  // Obtém o progresso do usuário. Se não existir, cria um registro.
  async getUserProgress(user_id) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user_id)
      .single();
    if (error) {
      // Cria um novo registro se não existir
      const { data: newData, error: newError } = await supabase
        .from('user_progress')
        .insert([{ user_id, points: 0, level: 'Iniciante' }])
        .single();
      if (newError) throw newError;
      return newData;
    }
    return data;
  },

  // Atualiza o progresso do usuário com novos pontos.
  async updateUserProgress(user_id, newPoints) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({ user_id, points: newPoints, last_updated: new Date() })
      .single();
    if (error) throw error;
    return data;
  },

  // Obtém as conquistas já alcançadas pelo usuário.
  async getUserAchievements(user_id) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', user_id);
    if (error) throw error;
    return data;
  },

  // Concede uma conquista ao usuário, se ainda não tiver sido atribuída.
  async awardAchievement(user_id, achievement_id) {
    const { data: existing, error: checkError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user_id)
      .eq('achievement_id', achievement_id)
      .maybeSingle();
    if (checkError) throw checkError;
    if (existing) return; // Já possui essa conquista
    const { data, error } = await supabase
      .from('user_achievements')
      .insert([{ user_id, achievement_id }]);
    if (error) throw error;
    return data;
  },

  // Exemplo de verificação de ação para conceder conquista
  async checkAndAwardAchievement(user_id, action) {
    if (action === 'primeira_transacao') {
      const { data: achievementData, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('name', 'Primeira Transação')
        .maybeSingle();
      if (error) throw error;
      if (achievementData) {
        await this.awardAchievement(user_id, achievementData.id);
      }
    }
    // Outras ações podem ser implementadas aqui...
  }
};
