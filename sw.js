self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('static').then(cache => {
      return cache.addAll(['./', 'https://js.arcgis.com/4.16/'])
    })
  )
});
