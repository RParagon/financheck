/**
 * service-worker.js – Service Worker para FinanCheck v0.3
 * Autor: Rafael Paragon
 * Descrição: Responsável por cachear recursos estáticos, gerenciar atualizações dinâmicas,
 * lidar com eventos de fetch, push e mensagens, permitindo que o FinanCheck opere offline e
 * seja instalado como PWA.
 */

const CACHE_NAME = 'financheck-v0.3-cache-v1';
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
  './icons/icon-512.png'
];

// Evento de instalação: cacheia os ativos estáticos.
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Instalação iniciada.');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Cacheando ativos estáticos.');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Evento de ativação: limpa caches antigos e assume controle dos clientes.
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Ativação iniciada.');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[ServiceWorker] Removendo cache antigo: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Evento de fetch: responde com o cache e faz fallback para a rede.
self.addEventListener('fetch', event => {
  console.log(`[ServiceWorker] Fetch: ${event.request.url}`);
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        console.log(`[ServiceWorker] Requisição atendida pelo cache: ${event.request.url}`);
        return response;
      }
      return fetch(event.request)
        .then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              cache.put(event.request, networkResponse.clone());
              console.log(`[ServiceWorker] Cache atualizado para: ${event.request.url}`);
            }
            return networkResponse;
          });
        })
        .catch(error => {
          console.error(`[ServiceWorker] Erro na fetch: ${event.request.url}`, error);
          // Fallback para documentos
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
    })
  );
});

// Evento de mensagem: permite ações como skipWaiting e limpeza do cache.
self.addEventListener('message', event => {
  console.log('[ServiceWorker] Mensagem recebida:', event.data);
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data.action === 'clearCache') {
    caches.delete(CACHE_NAME).then(success => {
      console.log('[ServiceWorker] Cache limpo:', success);
    });
  }
});

// Função auxiliar para atualizar dinamicamente o cache de um recurso.
async function updateCache(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    console.log('[ServiceWorker] Cache atualizado para:', request.url);
    return response;
  } catch (error) {
    console.error('[ServiceWorker] Erro ao atualizar cache para:', request.url, error);
    return null;
  }
}

// Evento push: exibe notificações push se integradas.
self.addEventListener('push', event => {
  console.log('[ServiceWorker] Push recebido.');
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  const title = data.title || 'FinanCheck';
  const options = {
    body: data.body || 'Você tem uma nova notificação do FinanCheck.',
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Evento de clique na notificação: foca na janela ou abre nova.
self.addEventListener('notificationclick', event => {
  console.log('[ServiceWorker] Notificação clicada.');
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('./index.html');
    })
  );
});
