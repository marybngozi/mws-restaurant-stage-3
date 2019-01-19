/**
 * Common review database helper functions.
 */
class DBReviewHelper {

  static getParameterByName(name, url){
    if (!url)
      url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
      results = regex.exec(url);
    if (!results)
      return null;
    if (!results[2])
      return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  /**
   * Review Database URL.
   */
  static get DATABASE_REVIEW_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews/?restaurant_id=${getParameterByName('id')}`;
  }

  /**
   * Fetch all reviews.
   */
  static fetchReviews(callback) {
    let fetchUrl = DBReviewHelper.DATABASE_REVIEW_URL;
    let networkDataRecieved = false;
    fetch(fetchUrl)
    .then(res => res.json())
    .then(reviews => {
      networkDataRecieved = true;
      return callback(null, reviews);
    })
    .catch(err => {
      console.log(err);
      callback(err, null);
      if ('indexedDB' in window) {
        readAllData('reviews')
        .then(reviews => {
          if (!networkDataRecieved){
            return callback(null, reviews);
          }
        }).catch(error => {
          callback('Request failed:'+ error, null);
        })
      }
    })
  }

  /**
   * Fetch a review by its ID.
   */
  /* static fetchReviewById(id, callback) {
    // fetch all reviews with proper error handling.
    DBReviewHelper.fetchReviews((error, reviews) => {
      if (error) {
        callback(error, null);
      } else {
        const review = reviews.find(r => r.id == id);
        if (review) { // Got the review
          callback(null, review);
        } else { // Review does not exist in the database
          callback('Review does not exist', null);
        }
      }
    });
  } */

  /**
   * Post reviews
   */
  static postReview(data, callback){
    fetch('http://localhost:1337/reviews', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
      return callback(null, result);
    })
    .catch(err => {
      callback(err, null);
    });
  }
}

