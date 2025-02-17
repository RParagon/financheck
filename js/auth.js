/******************************************************************
 * FinanCheck v0.3 - Módulo Auth
 * Desenvolvido por Rafael Paragon
 * Gerencia toda a autenticação utilizando Supabase e oferece:
 * - Cadastro (signUp)
 * - Login (signIn)
 * - Logout (signOut)
 * - Recuperação de senha
 * - Atualização de perfil
 * - Verificação de status de email
 * - Monitoramento e refresh de sessão/token
 * - Funções utilitárias e de depuração para testes
 ******************************************************************/

// Importa a instância do Supabase a partir do módulo supabaseClient.js
import { supabase } from './supabaseClient.js';

/**
 * Auth Module - Responsável por todas as operações de autenticação.
 */
export const Auth = {

  /**
   * Registra um novo usuário com email e senha.
   * @param {string} email - Email do usuário.
   * @param {string} password - Senha do usuário.
   * @returns {Object} Dados retornados pelo Supabase.
   * @throws {Error} Caso ocorra algum erro.
   */
  async signUp(email, password) {
    try {
      console.log('[Auth] Iniciando cadastro para:', email);
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
      });
      if (error) {
        console.error('[Auth] Erro no cadastro:', error.message);
        throw new Error(`Cadastro falhou: ${error.message}`);
      }
      console.log('[Auth] Cadastro realizado com sucesso para:', email);
      return data;
    } catch (err) {
      console.error('[Auth] Exceção em signUp:', err);
      throw err;
    }
  },

  /**
   * Realiza login do usuário com email e senha.
   * @param {string} email - Email do usuário.
   * @param {string} password - Senha do usuário.
   * @returns {Object} Sessão e dados do usuário.
   * @throws {Error} Caso ocorra algum erro.
   */
  async signIn(email, password) {
    try {
      console.log('[Auth] Iniciando login para:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      if (error) {
        console.error('[Auth] Erro no login:', error.message);
        throw new Error(`Login falhou: ${error.message}`);
      }
      console.log('[Auth] Login efetuado com sucesso para:', email);
      return data;
    } catch (err) {
      console.error('[Auth] Exceção em signIn:', err);
      throw err;
    }
  },

  /**
   * Efetua logout do usuário atualmente autenticado.
   * @returns {boolean} True se o logout ocorrer sem erros.
   * @throws {Error} Caso ocorra algum erro.
   */
  async signOut() {
    try {
      console.log('[Auth] Iniciando logout...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[Auth] Erro no logout:', error.message);
        throw new Error(`Logout falhou: ${error.message}`);
      }
      console.log('[Auth] Logout realizado com sucesso.');
      return true;
    } catch (err) {
      console.error('[Auth] Exceção em signOut:', err);
      throw err;
    }
  },

  /**
   * Recupera o usuário atualmente autenticado.
   * @returns {Object} Dados do usuário ou null se não estiver autenticado.
   * @throws {Error} Em caso de falha na operação.
   */
  async getUser() {
    try {
      console.log('[Auth] Recuperando usuário autenticado...');
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('[Auth] Erro ao recuperar usuário:', error.message);
        throw new Error(`Falha ao recuperar usuário: ${error.message}`);
      }
      console.log('[Auth] Usuário recuperado:', user ? user.email : 'Nenhum usuário');
      return user;
    } catch (err) {
      console.error('[Auth] Exceção em getUser:', err);
      throw err;
    }
  },

  /**
   * Registra um callback para mudanças no estado de autenticação.
   * @param {Function} callback - Função a ser executada nas mudanças.
   * @returns {Object} Listener de autenticação.
   */
  onAuthStateChange(callback) {
    console.log('[Auth] Registrando callback de mudança de estado de autenticação.');
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] Estado alterado:', event);
      callback(event, session);
    });
    return authListener;
  },

  /**
   * Envia um email de recuperação de senha para o usuário.
   * @param {string} email - Email do usuário.
   * @returns {Object} Dados da operação.
   * @throws {Error} Em caso de falha no envio.
   */
  async sendPasswordResetEmail(email) {
    try {
      console.log('[Auth] Solicitando envio de email de recuperação para:', email);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      });
      if (error) {
        console.error('[Auth] Erro ao enviar email de recuperação:', error.message);
        throw new Error(`Falha no envio do email de recuperação: ${error.message}`);
      }
      console.log('[Auth] Email de recuperação enviado para:', email);
      return data;
    } catch (err) {
      console.error('[Auth] Exceção em sendPasswordResetEmail:', err);
      throw err;
    }
  },

  /**
   * Atualiza o perfil do usuário com os dados fornecidos.
   * @param {Object} updates - Objeto com as propriedades a serem atualizadas.
   * @returns {Object} Dados atualizados do usuário.
   * @throws {Error} Em caso de erro na atualização.
   */
  async updateUserProfile(updates) {
    try {
      console.log('[Auth] Atualizando perfil com:', updates);
      const { data, error } = await supabase.auth.updateUser(updates);
      if (error) {
        console.error('[Auth] Erro ao atualizar perfil:', error.message);
        throw new Error(`Falha na atualização do perfil: ${error.message}`);
      }
      console.log('[Auth] Perfil atualizado com sucesso:', data);
      return data;
    } catch (err) {
      console.error('[Auth] Exceção em updateUserProfile:', err);
      throw err;
    }
  },

  /**
   * Força a atualização da sessão do usuário.
   * @returns {Object} Dados da sessão atualizada.
   * @throws {Error} Se houver problemas na atualização.
   */
  async refreshSession() {
    try {
      console.log('[Auth] Atualizando sessão...');
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('[Auth] Erro ao atualizar sessão:', error.message);
        throw new Error(`Falha ao atualizar sessão: ${error.message}`);
      }
      console.log('[Auth] Sessão atualizada:', data);
      return data;
    } catch (err) {
      console.error('[Auth] Exceção em refreshSession:', err);
      throw err;
    }
  },

  /**
   * Verifica se o email do usuário está verificado.
   * @returns {boolean} True se verificado, false caso contrário.
   * @throws {Error} Se ocorrer algum erro.
   */
  async verifyEmailStatus() {
    try {
      console.log('[Auth] Verificando status do email...');
      const user = await this.getUser();
      if (!user) {
        throw new Error('Nenhum usuário autenticado.');
      }
      if (user.email_confirmed_at) {
        console.log('[Auth] Email verificado:', user.email);
        return true;
      } else {
        console.log('[Auth] Email não verificado:', user.email);
        return false;
      }
    } catch (err) {
      console.error('[Auth] Exceção em verifyEmailStatus:', err);
      throw err;
    }
  },

  /**
   * Reenvia o email de verificação para o usuário autenticado.
   * @returns {Object} Dados da operação.
   * @throws {Error} Em caso de erro.
   */
  async resendVerificationEmail() {
    try {
      console.log('[Auth] Reenviando email de verificação...');
      const user = await this.getUser();
      if (!user) {
        throw new Error('Nenhum usuário autenticado para reenviar verificação.');
      }
      // Para reenviar o email, atualizamos o usuário com o mesmo email.
      const { data, error } = await supabase.auth.updateUser({ email: user.email });
      if (error) {
        console.error('[Auth] Erro ao reenviar verificação:', error.message);
        throw new Error(`Falha ao reenviar email de verificação: ${error.message}`);
      }
      console.log('[Auth] Email de verificação reenviado para:', user.email);
      return data;
    } catch (err) {
      console.error('[Auth] Exceção em resendVerificationEmail:', err);
      throw err;
    }
  },

  /**
   * Exclui a conta do usuário autenticado após confirmação.
   * @returns {boolean} True se a conta for excluída com sucesso.
   * @throws {Error} Em caso de falha.
   */
  async deleteAccount() {
    try {
      console.log('[Auth] Solicitando exclusão de conta...');
      const confirmation = confirm('Tem certeza de que deseja excluir sua conta? Esta ação é irreversível.');
      if (!confirmation) {
        console.log('[Auth] Exclusão de conta cancelada.');
        return null;
      }
      // Exclusão de conta via Supabase API (atenção: essa função pode variar conforme a versão)
      const { error } = await supabase.auth.api.deleteUser(currentUserId, {
        headers: { 'Authorization': `Bearer ${supabase.auth.session()?.access_token}` }
      });
      if (error) {
        console.error('[Auth] Erro ao excluir conta:', error.message);
        throw new Error(`Falha ao excluir conta: ${error.message}`);
      }
      console.log('[Auth] Conta excluída com sucesso.');
      return true;
    } catch (err) {
      console.error('[Auth] Exceção em deleteAccount:', err);
      throw err;
    }
  },

  /**
   * Registra um evento de autenticação para logging interno.
   * @param {string} eventName - Nome do evento.
   * @param {Object} details - Detalhes adicionais do evento.
   */
  logAuthEvent(eventName, details = {}) {
    console.log(`[Auth] Evento: ${eventName}`, details);
    // Em produção, esse log poderia ser enviado a um servidor de monitoramento.
  },

  /**
   * Realiza uma simulação completa de autenticação para testes.
   * Cria um usuário temporário, realiza login, atualiza perfil, envia recuperação e verifica email.
   */
  async simulateAuthTest() {
    try {
      this.logAuthEvent('Simulação Iniciada', { info: 'Testando funções Auth.' });
      const testEmail = `teste_${Date.now()}@exemplo.com`;
      const testPassword = 'Teste@123';
      const signUpData = await this.signUp(testEmail, testPassword);
      this.logAuthEvent('Cadastro Simulado', { email: testEmail, data: signUpData });
      const signInData = await this.signIn(testEmail, testPassword);
      this.logAuthEvent('Login Simulado', { email: testEmail, data: signInData });
      const user = await this.getUser();
      this.logAuthEvent('Usuário Simulado Recuperado', { user });
      const resetData = await this.sendPasswordResetEmail(testEmail);
      this.logAuthEvent('Email de Recuperação Enviado', { email: testEmail, data: resetData });
      const profileUpdate = await this.updateUserProfile({ data: { full_name: 'Teste Usuário' } });
      this.logAuthEvent('Perfil Atualizado', { update: profileUpdate });
      const emailVerified = await this.verifyEmailStatus();
      this.logAuthEvent('Status de Verificação', { email: testEmail, verified: emailVerified });
      this.logAuthEvent('Simulação de Auth Concluída', { email: testEmail });
    } catch (err) {
      console.error('[Auth] Erro na simulação de autenticação:', err);
    }
  },

  /**
   * Força a atualização manual da sessão do usuário.
   * @returns {Object} Dados da nova sessão.
   */
  async manualRefresh() {
    try {
      this.logAuthEvent('Refresh Manual Iniciado');
      const refreshed = await this.refreshSession();
      this.logAuthEvent('Sessão Atualizada', { refreshed });
      return refreshed;
    } catch (err) {
      console.error('[Auth] Erro em manualRefresh:', err);
      throw err;
    }
  },

  /**
   * Monitora alterações de sessão e realiza ações conforme necessário.
   * Este método registra um callback que lida com mudanças de estado.
   */
  monitorSession() {
    this.onAuthStateChange((event, session) => {
      this.logAuthEvent('Monitoramento de Sessão', { event, session });
      if (event === 'SIGNED_OUT') {
        console.log('[Auth] Sessão encerrada, redirecionando para login.');
      }
    });
  },

  /**
   * Executa um ciclo completo de autenticação, simulando cadastro, login,
   * refresh de sessão e verificação de email.
   * @param {string} email - Email a ser utilizado na simulação.
   * @param {string} password - Senha a ser utilizada.
   */
  async runCompleteAuthCycle(email, password) {
    try {
      this.logAuthEvent('Iniciando Ciclo Completo de Auth', { email });
      await this.signUp(email, password);
      await this.signIn(email, password);
      await this.refreshSession();
      await this.verifyEmailStatus();
      this.logAuthEvent('Ciclo Completo de Auth Concluído', { email });
    } catch (err) {
      console.error('[Auth] Erro no ciclo completo de autenticação:', err);
      throw err;
    }
  },

  /**
   * Reseta os dados de autenticação para fins de teste.
   * Essa função realiza logout e limpa dados de sessão locais.
   */
  async resetAuthData() {
    try {
      this.logAuthEvent('Resetando dados de autenticação...');
      await this.signOut();
      console.log('[Auth] Dados de autenticação resetados com sucesso.');
    } catch (err) {
      console.error('[Auth] Erro ao resetar dados de autenticação:', err);
      throw err;
    }
  },

  /**
   * Testa a atualização do perfil com dados estendidos.
   * Atualiza campos adicionais do perfil e retorna o resultado.
   */
  async testExtendedProfileUpdate() {
    try {
      this.logAuthEvent('Iniciando teste de perfil estendido...');
      const updateData = {
        data: {
          full_name: 'Usuário Teste Extendido',
          bio: 'Esta é uma bio de teste para o perfil do usuário. Ela contém informações adicionais.'
        }
      };
      const result = await this.updateUserProfile(updateData);
      this.logAuthEvent('Perfil Estendido Atualizado', { result });
      return result;
    } catch (err) {
      console.error('[Auth] Erro em testExtendedProfileUpdate:', err);
      throw err;
    }
  },

  /**
   * Verifica se o token de acesso está próximo de expirar e realiza refresh se necessário.
   * @returns {number} Tempo restante do token em segundos.
   */
  async checkTokenExpiry() {
    try {
      this.logAuthEvent('Verificando expiração do token...');
      const sessionData = await this.refreshSession();
      const expiry = sessionData?.session?.expires_in;
      this.logAuthEvent('Token expira em:', expiry);
      if (expiry && expiry < 300) {
        console.log('[Auth] Token prestes a expirar, realizando refresh...');
        await this.manualRefresh();
      }
      return expiry;
    } catch (err) {
      console.error('[Auth] Erro em checkTokenExpiry:', err);
      throw err;
    }
  },

  /**
   * Inicia um monitor periódico para verificar a expiração do token.
   * @param {number} intervalSeconds - Intervalo em segundos entre verificações.
   */
  startTokenMonitor(intervalSeconds = 60) {
    console.log('[Auth] Iniciando monitor de token a cada', intervalSeconds, 'segundos.');
    setInterval(async () => {
      try {
        await this.checkTokenExpiry();
      } catch (err) {
        console.error('[Auth] Erro no monitor de token:', err);
      }
    }, intervalSeconds * 1000);
  },

  /**
   * Realiza um dump completo das informações de autenticação para depuração.
   */
  async dumpAuthInfo() {
    try {
      const user = await this.getUser();
      const sessionData = await this.refreshSession();
      this.logAuthEvent('Dump de Auth Info', { user, sessionData });
      console.table({ user, sessionData });
    } catch (err) {
      console.error('[Auth] Erro no dumpAuthInfo:', err);
    }
  }
};

// Inicia automaticamente monitoramento de sessão e token ao carregar o módulo
Auth.monitorSession();
Auth.startTokenMonitor(60); // Checa a cada 60 segundos

// Loga informações iniciais de carregamento
console.log('[Auth] Módulo Auth carregado e inicializado.');

// Funções auxiliares para depuração e testes adicionais:

/**
 * Função para testar todas as funcionalidades do módulo Auth.
 * Chama funções de cadastro, login, atualização de perfil, reset e dump.
 */
async function runFullAuthTestCycle() {
  try {
    console.log('[Auth-Test] Iniciando ciclo completo de testes de autenticação...');
    const testEmail = `teste_${Date.now()}@exemplo.com`;
    const testPassword = 'Teste@123';
    await Auth.signUp(testEmail, testPassword);
    await Auth.signIn(testEmail, testPassword);
    await Auth.refreshSession();
    await Auth.verifyEmailStatus();
    await Auth.testExtendedProfileUpdate();
    await Auth.sendPasswordResetEmail(testEmail);
    await Auth.dumpAuthInfo();
    console.log('[Auth-Test] Ciclo completo de testes finalizado com sucesso.');
  } catch (err) {
    console.error('[Auth-Test] Erro durante o ciclo de teste:', err);
  }
}

/**
 * Função para forçar um logout e limpar os dados de autenticação.
 */
async function forceLogoutAndReset() {
  try {
    console.log('[Auth-Test] Forçando logout e reset dos dados de autenticação...');
    await Auth.resetAuthData();
    console.log('[Auth-Test] Logout e reset concluídos.');
  } catch (err) {
    console.error('[Auth-Test] Erro ao forçar logout e reset:', err);
  }
}

/**
 * Expondo as funções de teste globalmente para depuração via console.
 */
window.AuthTest = {
  runFullAuthTestCycle,
  forceLogoutAndReset,
  dumpAuthInfo: Auth.dumpAuthInfo
};
