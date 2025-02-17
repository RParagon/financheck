/******************************************************************
 * FinanCheck v0.3 - Service Worker
 * Desenvolvido por Rafael Paragon
 * Responsável por:
 * - Gerenciar o cache estático e dinâmico dos recursos da aplicação
 * - Implementar estratégias de fetch (cache-first, network-first)
 * - Gerenciar background sync e push notifications
 * - Sincronizar dados offline com o servidor
 * - Logar operações e monitorar mudanças de versão do cache
 ******************************************************************/

'use strict';

// Nome do cache atual e versão
const CACHE_VERSION = 'v0.3';
const STATIC_CACHE_NAME = `financheck-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `financheck-dynamic-${CACHE_VERSION}`;

// Lista de arquivos estáticos a serem cacheados durante a instalação
const STATIC_ASSETS = [
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/supabaseClient.js',
  './js/auth.js',
  './js/storage.js',
  './js/gamification.js',
  './js/ui.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/favicon.ico'
];

// Utilitário para log detalhado
function swLog(...args) {
  console.log('[Service Worker]', ...args);
}

// ======================== INSTALL EVENT ===========================
self.addEventListener('install', event => {
  swLog('Evento INSTALL iniciado.');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        swLog('Cache estático aberto:', STATIC_CACHE_NAME);
        // Cacheia todos os ativos estáticos
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        swLog('Todos os ativos estáticos foram cacheados.');
        // Força a ativação imediata do SW
        return self.skipWaiting();
      })
      .catch(error => {
        swLog('Erro ao cachear ativos estáticos:', error);
      })
  );
});

// ======================== ACTIVATE EVENT ===========================
self.addEventListener('activate', event => {
  swLog('Evento ACTIVATE iniciado.');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        swLog('Caches existentes:', cacheNames);
        // Remove caches antigas que não correspondem à versão atual
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              swLog('Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        swLog('Ativação concluída. Cliente reivindicado.');
        return self.clients.claim();
      })
  );
});

// ======================== FETCH EVENT ===========================
self.addEventListener('fetch', event => {
  // Filtra apenas requisições GET
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  // Estrutura para tratar requisições para a API (network-first)
  if (requestUrl.origin === self.location.origin) {
    // Trata requisições internas com cache-first
    event.respondWith(cacheFirst(event.request));
  } else {
    // Para requisições externas, usa network-first
    event.respondWith(networkFirst(event.request));
  }
});

// ======================== STRATEGIES ===========================

// Estratégia: Cache First para ativos estáticos
async function cacheFirst(request) {
  swLog('cacheFirst para:', request.url);
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    swLog('Resposta encontrada no cache.');
    return cachedResponse;
  }
  swLog('Nenhuma resposta no cache. Buscando na rede...');
  const response = await fetch(request);
  // Atualiza cache dinâmico se a resposta for válida
  return updateDynamicCache(request, response);
}

// Estratégia: Network First para dados dinâmicos ou externos
async function networkFirst(request) {
  swLog('networkFirst para:', request.url);
  try {
    const networkResponse = await fetch(request);
    // Atualiza cache dinâmico com a nova resposta
    return updateDynamicCache(request, networkResponse);
  } catch (error) {
    swLog('Erro na requisição de rede, tentando cache...', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      swLog('Retornando resposta do cache após erro de rede.');
      return cachedResponse;
    }
    // Se não houver cache, lança o erro
    throw error;
  }
}

// Atualiza o cache dinâmico com a resposta da rede
async function updateDynamicCache(request, response) {
  // Se a resposta não for válida, retorna-a sem cache
  if (!response || response.status !== 200 || response.type === 'opaque') {
    swLog('Resposta inválida para cache:', response);
    return response;
  }
  const responseClone = response.clone();
  caches.open(DYNAMIC_CACHE_NAME)
    .then(cache => {
      cache.put(request, responseClone);
      swLog('Cache dinâmico atualizado para:', request.url);
    });
  return response;
}

// ======================== BACKGROUND SYNC ===========================

self.addEventListener('sync', event => {
  swLog('Evento SYNC recebido:', event.tag);
  if (event.tag === 'sync-local-cache') {
    event.waitUntil(syncLocalCacheData());
  }
});

// Sincroniza dados armazenados localmente (simulação)
async function syncLocalCacheData() {
  swLog('Sincronizando dados do cache local com o servidor...');
  // Aqui você poderia iterar sobre caches específicos e enviar dados para o servidor
  // Este exemplo é meramente ilustrativo
  try {
    const transactions = await caches.match('./index.html')
      .then(() => {
        // Simulação: aguarda 1 segundo para representar sincronização
        return new Promise(resolve => setTimeout(() => resolve('Transações sincronizadas.'), 1000));
      });
    swLog('Sync Result:', transactions);
    // Poderia adicionar lógica para remover os dados locais sincronizados
    return transactions;
  } catch (error) {
    swLog('Erro durante a sincronização do cache local:', error);
  }
}

// ======================== PUSH NOTIFICATIONS ===========================

self.addEventListener('push', event => {
  swLog('Evento PUSH recebido.');
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'FinanCheck', body: event.data.text() };
    }
  }
  const title = data.title || 'FinanCheck';
  const options = {
    body: data.body || 'Você tem novas atualizações financeiras!',
    icon: data.icon || 'icons/icon-192.png',
    badge: data.badge || 'icons/icon-192.png',
    data: {
      url: data.url || '/'
    }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notificação click event
self.addEventListener('notificationclick', event => {
  swLog('Notificação clicada.', event.notification.data);
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

// ======================== SERVICE WORKER MESSAGING ===========================

self.addEventListener('message', event => {
  swLog('Mensagem recebida do cliente:', event.data);
  // Pode adicionar lógica para processar mensagens específicas do cliente
  if (event.data && event.data.action === 'SKIP_WAITING') {
    swLog('Ação SKIP_WAITING recebida, ativando o SW imediatamente.');
    self.skipWaiting();
  }
});

// ======================== UTILITÁRIOS DE CACHE E LIMPEZA ===========================

// Função para limpar caches antigos com base em uma lista de nomes
async function cleanOldCaches(validCacheNames) {
  const cacheNames = await caches.keys();
  const deletions = cacheNames.map(name => {
    if (!validCacheNames.includes(name)) {
      swLog('Excluindo cache antigo:', name);
      return caches.delete(name);
    }
    return Promise.resolve(true);
  });
  return Promise.all(deletions);
}

// Função para forçar a atualização do cache dinâmico
async function refreshDynamicCache() {
  swLog('Atualizando cache dinâmico manualmente.');
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const keys = await cache.keys();
  for (const request of keys) {
    try {
      const response = await fetch(request);
      if (response && response.status === 200) {
        await cache.put(request, response.clone());
        swLog('Cache atualizado para:', request.url);
      }
    } catch (error) {
      swLog('Erro ao atualizar cache para:', request.url, error);
    }
  }
}

// ======================== EVENTOS DE ERRO E LOG ===========================

self.addEventListener('error', event => {
  swLog('Erro global no Service Worker:', event.message);
});

self.addEventListener('unhandledrejection', event => {
  swLog('Rejeição não tratada no Service Worker:', event.reason);
});

// ======================== EVENTOS DE SINCRONIZAÇÃO PERSONALIZADOS ===========================

// Evento para atualização de dados periódica via mensagem
self.addEventListener('sync', event => {
  if (event.tag === 'periodic-update') {
    swLog('Evento sync "periodic-update" acionado.');
    event.waitUntil(refreshDynamicCache());
  }
});

// ======================== BACKGROUND FETCH (EXPERIMENTAL) ===========================

self.addEventListener('backgroundfetchsuccess', event => {
  swLog('Background fetch bem-sucedido:', event.registration.id);
  // Processa os dados do background fetch, se necessário
});

self.addEventListener('backgroundfetchfail', event => {
  swLog('Background fetch falhou:', event.registration.id);
});

self.addEventListener('backgroundfetchabort', event => {
  swLog('Background fetch abortado:', event.registration.id);
});

// ======================== GESTÃO DE VERSÃO DO CACHE ===========================

self.addEventListener('activate', event => {
  swLog('Reativando Service Worker e gerenciando versões do cache.');
  event.waitUntil(
    cleanOldCaches([STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME])
      .then(() => {
        swLog('Caches antigos limpos.');
      })
      .catch(error => {
        swLog('Erro ao limpar caches antigos:', error);
      })
  );
});

// ======================== FUNÇÕES DE MONITORAMENTO INTERNO ===========================

// Função para enviar logs do SW para o cliente (via postMessage)
async function broadcastLog(message) {
  const allClients = await self.clients.matchAll({ includeUncontrolled: true });
  for (const client of allClients) {
    client.postMessage({ type: 'SW_LOG', message });
  }
  swLog('Log transmitido para clientes:', message);
}

// Programa um broadcast de log a cada 5 minutos
setInterval(() => {
  broadcastLog('Service Worker ativo desde: ' + new Date().toLocaleTimeString());
}, 300000);

// ======================== PUSH NOTIFICATION ACTION HANDLING ===========================

self.addEventListener('notificationclose', event => {
  swLog('Notificação fechada:', event.notification);
});

// ======================== BACKGROUND SYNC PERSONALIZADO ===========================

self.addEventListener('sync', event => {
  if (event.tag === 'offline-sync') {
    swLog('Background sync "offline-sync" iniciado.');
    event.waitUntil(
      (async () => {
        try {
          await refreshDynamicCache();
          swLog('Offline sync concluído com sucesso.');
        } catch (error) {
          swLog('Erro durante offline sync:', error);
        }
      })()
    );
  }
});

// ======================== FUNCIONALIDADES EXTRAS ===========================

// Função para testar o serviço do SW via mensagem
self.addEventListener('message', event => {
  swLog('Mensagem recebida no SW:', event.data);
  if (event.data && event.data.action === 'TEST_SW') {
    event.ports[0].postMessage({ message: 'Service Worker está ativo!' });
  }
});

// Função para lidar com atualização forçada do cache via mensagem
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'CLEAR_DYNAMIC_CACHE') {
    refreshDynamicCache().then(() => {
      broadcastLog('Cache dinâmico foi atualizado via mensagem.');
    });
  }
});

// ======================== FUNÇÕES DE FALLBACK PARA CONTEÚDO NÃO ENCONTRADO ===========================

self.addEventListener('fetch', event => {
  // Estratégia para retornar um fallback para imagens se não forem encontradas
  if (event.request.destination === 'image') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('./icons/favicon.ico'))
    );
  }
});

// ======================== MONITORAMENTO DE PERFORMANCE ===========================

// Função para calcular e logar o tempo de resposta de uma requisição
async function measureFetchTime(request) {
  const startTime = performance.now();
  const response = await fetch(request);
  const endTime = performance.now();
  swLog(`Tempo de resposta para ${request.url}: ${(endTime - startTime).toFixed(2)} ms`);
  return response;
}

// Substitui a estratégia networkFirst com medição de tempo (usado opcionalmente)
async function networkFirstWithTiming(request) {
  try {
    const response = await measureFetchTime(request);
    return updateDynamicCache(request, response);
  } catch (error) {
    swLog('Erro em networkFirstWithTiming:', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || Response.error();
  }
}

// ======================== ATUALIZAÇÃO DINÂMICA DO CONTEÚDO ===========================

// Função para forçar revalidação de um recurso específico periodicamente
async function revalidateResource(url) {
  swLog('Revalidando recurso:', url);
  try {
    const response = await fetch(url, { cache: 'reload' });
    if (response && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(url, response.clone());
      swLog('Revalidação concluída para:', url);
      return response;
    }
  } catch (error) {
    swLog('Erro na revalidação do recurso:', url, error);
  }
  return null;
}

// Programa a revalidação de recursos estáticos a cada 10 minutos
setInterval(() => {
  STATIC_ASSETS.forEach(url => {
    revalidateResource(url);
  });
}, 600000);

// ======================== BACKGROUND FETCH EXTRAS ===========================

// Função para iniciar um background fetch (experimental)
async function startBackgroundFetch(id, requestUrls) {
  if ('backgroundFetch' in self.registration) {
    try {
      const bgFetch = await self.registration.backgroundFetch.fetch(id, requestUrls, {
        title: 'FinanCheck Background Fetch',
        icons: [{
          sizes: '192x192',
          src: 'icons/icon-192.png',
          type: 'image/png'
        }],
        downloadTotal: 1000000 // Exemplo
      });
      swLog('Background Fetch iniciado:', id);
      return bgFetch;
    } catch (error) {
      swLog('Erro ao iniciar Background Fetch:', error);
      return null;
    }
  } else {
    swLog('Background Fetch não suportado neste navegador.');
    return null;
  }
}

// ======================== CONTROLE DE VERSÃO E ATUALIZAÇÃO ===========================

// Função para forçar o cliente a atualizar, se uma nova versão estiver disponível
async function checkForUpdate() {
  const currentVersion = CACHE_VERSION;
  // Em uma aplicação real, essa versão pode ser comparada com uma versão remota
  swLog('Checando atualizações. Versão atual:', currentVersion);
  // Simulação: se a versão for 'v0.3', não faz nada; caso contrário, força atualização
  if (currentVersion !== 'v0.3') {
    swLog('Nova versão detectada. Forçando atualização.');
    self.skipWaiting();
  }
}

// Programa verificação de atualização a cada 15 minutos
setInterval(() => {
  checkForUpdate();
}, 900000);

// ======================== METRÍCAS E COLETA DE DADOS ===========================

// Função para coletar e enviar métricas de desempenho do SW para um endpoint
async function sendPerformanceMetrics() {
  swLog('Coletando métricas de desempenho do SW.');
  const metrics = {
    timestamp: new Date().toISOString(),
    cacheNames: await caches.keys(),
    clientsCount: (await self.clients.matchAll()).length
  };
  try {
    await fetch('https://api.exemplo.com/sw-metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    });
    swLog('Métricas enviadas com sucesso.');
  } catch (error) {
    swLog('Erro ao enviar métricas:', error);
  }
}

// Envia métricas a cada 20 minutos
setInterval(() => {
  sendPerformanceMetrics();
}, 1200000);

// ======================== EVENTOS DE DEBUG EXTRAS ===========================

// Ativa um log extra se o modo debug estiver ativado via mensagem do cliente
let debugMode = false;
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'TOGGLE_DEBUG') {
    debugMode = !debugMode;
    swLog('Modo debug alterado para:', debugMode);
  }
  if (debugMode && event.data && event.data.action === 'RUN_SW_TEST') {
    swLog('Modo debug: Executando teste de SW');
    // Executa um teste simples: revalidação de um recurso
    revalidateResource('./index.html');
  }
});

// ======================== FUNÇÕES DE LIMPEZA E MANUTENÇÃO ===========================

// Função para limpar caches dinâmicos que excedam um limite de tamanho
async function cleanDynamicCache(limit = 50) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const keys = await cache.keys();
  if (keys.length > limit) {
    swLog('Limite de cache dinâmico excedido. Iniciando limpeza...');
    for (let i = 0; i < keys.length - limit; i++) {
      await cache.delete(keys[i]);
      swLog('Excluído item do cache dinâmico:', keys[i].url);
    }
  }
}

// Programa limpeza periódica do cache dinâmico a cada 30 minutos
setInterval(() => {
  cleanDynamicCache(100);
}, 1800000);

// ======================== FUNÇÕES DE MONITORAMENTO DE ERROS ===========================

// Registra erros críticos e os envia para um endpoint de monitoramento
self.addEventListener('error', event => {
  swLog('Erro crítico capturado pelo SW:', event.message);
  sendErrorReport({ type: 'error', message: event.message, filename: event.filename, lineno: event.lineno });
});

self.addEventListener('unhandledrejection', event => {
  swLog('Rejeição não tratada capturada pelo SW:', event.reason);
  sendErrorReport({ type: 'unhandledrejection', reason: event.reason });
});

// Função para enviar relatórios de erro
async function sendErrorReport(errorData) {
  try {
    await fetch('https://api.exemplo.com/sw-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    });
    swLog('Relatório de erro enviado com sucesso.');
  } catch (err) {
    swLog('Falha ao enviar relatório de erro:', err);
  }
}

// ======================== FINALIZAÇÃO ===========================

swLog('Service Worker FinanCheck v0.3 carregado e em execução.');

// Fim do arquivo service-worker.js
