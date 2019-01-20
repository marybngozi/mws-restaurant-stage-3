let favorite_img = document.querySelector('#favorites');
let favorite_view = document.querySelector('#favorite-view');
let favorite_list = document.querySelector('#favorite-list');

/**
 * Update favorite icon
 */
fetchFavorites = () => {
  fetch('http://localhost:1337/restaurants/?is_favorite=true',{
    cache: "no-cache"
  })
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
favorite_img.addEventListener('click', e => {
  if(e.target.alt == "show favorites"){
    fetchFavorites();
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