const CACHE_NAME = 'crm-romanychev-v16';
const urlsToCache = [
    './index.html',
    './manifest.json',
    './icon.svg',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Кэшируем файлы');
                return cache.addAll(urlsToCache.map(url=>new Request(url,{cache:'reload'})));
            })
            .then(()=>self.skipWaiting())
    );
});

self.addEventListener('message',event=>{
    if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (event.request.mode === 'navigate') {
        event.respondWith((async()=>{
            const cache=await caches.open(CACHE_NAME);
            try{
                const request=new Request(event.request,{cache:'no-store'});
                const response=await fetch(request);
                if(response?.ok)await cache.put('./index.html',response.clone());
                return response;
            }catch{
                return (await cache.match('./index.html'))||(await caches.match('./index.html'));
            }
        })());
        return;
    }
    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key.startsWith('crm-romanychev-') && key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(()=>self.clients.claim())
    );
});
