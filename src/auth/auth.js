import { supabase } from '../supabase/client.js'

// Elementos do DOM
let isSignup = false;

// Carrega interface de autenticação
async function loadAuth() {
    const response = await fetch('/src/auth/auth.html');
    document.getElementById('root').innerHTML = await response.text();
    
    document.getElementById('authForm').addEventListener('submit', handleAuth);
    document.getElementById('toggleAuth').addEventListener('click', toggleAuthMode);
}

// Gerencia login/signup
async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = isSignup 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    if (!error) window.location.href = '/app.html';
}

// Alterna entre login/cadastro
function toggleAuthMode() {
    isSignup = !isSignup;
    document.getElementById('authTitle').textContent = isSignup ? 'Criar Conta' : 'Entrar';
    document.getElementById('authAction').textContent = isSignup ? 'Cadastrar' : 'Entrar';
    document.getElementById('toggleAuth').textContent = isSignup 
        ? 'Já tem uma conta? Faça login' 
        : 'Não tem conta? Cadastre-se';
}

// Inicialização
loadAuth();