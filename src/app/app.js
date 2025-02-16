import { supabase } from '../supabase/client.js'
import { renderDashboard } from './dashboard.js'

// Verifica autenticação
supabase.auth.onAuthStateChange((event, session) => {
    if (!session) window.location.href = '/';
});

// Logout
document.getElementById('logout').addEventListener('click', async () => {
    await supabase.auth.signOut();
});

// Carrega dashboard
renderDashboard();