
const dbPromise = idb.open('restaurants-store', 1, (db) => {
  if (!db.objectStoreNames.contains('restaurants')) {
    db.createObjectStore('restaurants', {keyPath: 'id'});
  }
  /* if (!db.objectStoreNames.contains('sync-posts')) {
    db.createObjectStore('sync-posts', {keyPath: 'id'});
  } */
})

function writeData(stall, data) {
  return dbPromise.then(db => {
    const tx = db.transaction(stall, 'readwrite');
    const store = tx.objectStore(stall);
    store.put(data);
    return tx.complete;
  })
}

function readAllData(stall) {
  return dbPromise.then(db => {
    const tx = db.transaction(stall, 'readonly');
    const store = tx.objectStore(stall);
    return store.getAll();
  })
}

function clearAllData(stall) {
  return dbPromise.then(db => {
    const tx = db.transaction(stall, 'readwrite');
    const store = tx.objectStore(stall)
    store.clear();
    return tx.complete;
  })
}

function deleteItemFrmData(stall, id) {
  dbPromise.then(db => {
    const tx = db.transaction(stall, 'readwrite');
    const store = tx.objectStore(stall);
    store.delete(id);
    return tx.complete;
  })
  .then(() => {
    console.log('Item Deleted');
  })
}


/**
 * Update favorite icon
 */
fetchFavorites = () => {
  fetch('http://localhost:1337/restaurants/?is_favorite=true')
  .then(res => res.json())
  .then(favorites => {
    if (favorites.length > 0) {
      favorite_img.src = "./img/fav-close.svg";
      favorite_img.alt = "show favorites";
    }else{
      favorite_img.src = "./img/fav-open.svg";
      favorite_img.alt = "no favorites";
    }
    createFavoriteHtml(favorites);
  })
}

/**
 * Ultities for index and restaurant html
 */
let favorite_img = document.querySelector('#favorite img');
let favorite_view = document.querySelector('#favorite-view');
let favorite_list = document.querySelector('#favorite-list');

favorite_img.addEventListener('click', e => {
  if(e.target.alt == "show favorites"){
    fetchFavorites();
    // createFavoriteHtml(fetchFavorites());
    favorite_view.classList.toggle('open');
  }
})

createFavoriteHtml = (favorites) => {
  favorite_list.innerHTML = "";
  favorites.forEach(favorite => {
    let li = document.createElement('li');
    let a = document.createElement('a');
    a.href = `./restaurant.html?id=${favorite.id}`;
    a.innerText = favorite.name;
    li.append(a);
    favorite_list.append(li);
  });
}