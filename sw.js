importScripts('/js/idb.js');
importScripts('/js/utility.js');

const v = 5;
const cacheStaticVer = `static-v${v}`;
const cacheDynamicVer = `dynamic-v${v}`;
const restaurant_url = 'http://localhost:1337/restaurants';
const review_url = 'http://localhost:1337/reviews';
const favorite_url = 'http://localhost:1337/restaurants/?is_favorite=true';


const staticArr = [
  '/',
  './index.html',
  './restaurant.html',
  './js/main.js',
  './js/dbhelper.js',
  './js/reviewhelper.js',
  '/js/restaurant_info.js',
  '/js/utility.js',
  '/js/tools.js',
  '/js/idb.js',
  '/css/styles.css',
  '/css/media.css',
  './img/icons/dish.png',
  'https://normalize-css.googlecode.com/svn/trunk/normalize.css',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css'
]


function isInArr(string, arr){
  arr.forEach(ar => {
    if (ar === string) {
      return true;
    }
  });
}


/**
* Installing Service Worker
*/
self.addEventListener('install', (e) => {
  console.log("Service Worker installing...");
  e.waitUntil(
    caches.open(cacheStaticVer)
    .then((cache) => {
      console.log('[Service Worker] Precaching app shell');
      cache.addAll(staticArr);
    })
  );
});


/**
* Activating Service Worker
*/
self.addEventListener('activate', (e) => {
  console.log("Service Worker activating...");
  e.waitUntil(
    caches.keys()
    .then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== cacheStaticVer && key !== cacheDynamicVer) {
          console.log('Removing old cache..', key);
          caches.delete(key);
        }
      }))
    })
  )
  return self.clients.claim();
})


/**
* Service worker cache and network side by side
* Cache dot network strategy
*/
self.addEventListener('fetch', (e) => {
  if(e.request.url == restaurant_url){ //stores restaurants to indexedDB
    e.respondWith(fetch(e.request)
      .then(res => {
        const clonedRes = res.clone();
        clearAllData('restaurants')
        .then(() => {
          return clonedRes.json()
        })
        .then(datas => {
          for (const data in datas) {
            writeData('restaurants', datas[data])
          }
        })
        return res;
      })
    );
  }else if(e.request.url.indexOf(review_url) > -1){ //stores reviews to indexedDB
    e.respondWith(fetch(e.request)
      .then(res => {
        const clonedRes = res.clone();
        return clonedRes.json()
        .then(datas => {
          for (const data in datas) {
            writeData('reviews', datas[data]);
          }
          return res;
        })
      })
    );
  }else if(e.request.url == favorite_url){ //fetches favorites from server
    e.respondWith(fetch(e.request)
      .then(res => {
        return res;
      })
    );
  }else if(isInArr(e.request.url, staticArr)){
    e.respondWith(
      caches.match(e.request)
    );
  }else{
    e.respondWith(
      caches.match(e.request)
      .then((res) => {
        if (res) {
          return res;
        }else{
          return fetch(e.request)
          .then((res) => {
            return caches.open(cacheDynamicVer)
            .then((cache) => {
              //trimCache(cacheDynamicVer, 4);
              cache.put(e.request.url, res.clone())
              return res;
            })
          })
          .catch((err) => {
            caches.open(cacheStaticVer)
            .then((cache) => {
              if (e.request.headers.get('accept').includes('text/html')) {
                console.log(err);
                return cache.match(fetch('/offline.html'));
              }
            })
          })
        }
      })
    );
  }
})


/**
 * Stores Post data offline for later online
 */
self.addEventListener('sync', (e) => {
  console.log('[Service Worker] Background Syncing ...');
  if (e.tag === 'new-review') {
    console.log('[Service Worker] Syncing new posts...');
    e.waitUntil(
      readAllData('post-reviews').then(datas => {
        for (const data of datas) {
          fetch(review_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              restaurant_id: data.restaurant_id,
              name: data.name,
              rating: data.rating,
              comments: data.comments
            })
          })
          .then(res => {
            if (res.ok) {
              console.log('Sent data');
              res.json().then((resData) => {
                deleteItemFrmData('reviews', data.id);
                writeData('reviews', resData);
                deleteItemFrmData('post-reviews', resData.name);
              })
            }
          })
          .catch((err) => {
            console.log('Error sending data', err);
          })
        }
      })
    );
  }
})
