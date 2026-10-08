const V='lawyer-agenda-v3';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('lawyer-agenda-')&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  // مكتبة Whisper وملفات wasm: من الذاكرة المحفوظة أولاً (تعمل بدون نت)
  if(u.hostname==='cdn.jsdelivr.net'){
    e.respondWith(caches.match(r).then(h=>h||fetch(r)));
    return;
  }
  if(u.origin!==location.origin||r.url.includes('/models/'))return;
  // ملفات التطبيق: الشبكة أولاً لتصل التحديثات، ثم النسخة المخزنة عند انقطاع النت
  e.respondWith(fetch(r).then(res=>{
    if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}
    return res;
  }).catch(()=>caches.match(r,{ignoreSearch:true}).then(h=>h||caches.match('index.html'))));
});
