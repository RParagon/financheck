// js/auth.js
import { supabaseClient } from './supabase.js';

export class Auth {
  static async signUp(email, password) {
    const { data: { user }, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });
    return { user, error };
  }

  static async signIn(email, password) {
    const { data: { user }, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    return { user, error };
  }

  static async signOut() {
    const { error } = await supabaseClient.auth.signOut();
    return { error };
  }

  static onAuthStateChange(callback) {
    supabaseClient.auth.onAuthStateChange(callback);
  }
}
