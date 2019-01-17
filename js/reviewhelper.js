/**
 * Common review database helper functions.
 */
class DBReviewHelper {

  /**
   * Review Database URL.
   */
  static get DATABASE_REVIEW_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews`;
  }

  /**
   * Fetch all reviews.
   */
  static fetchReviews(callback) {
    let fetchUrl = DBReviewHelper.DATABASE_REVIEW_URL;
    let networkDataRecieved = false;
    fetch(fetchUrl)
    .then(res => {
      return res.json();
    })
    .then(reviews => {
      networkDataRecieved = true;
      return callback(null, reviews);
    })
    .catch(err => {
      console.log(err);
      /* if ('indexedDB' in window) {
        readAllData('reviews')
        .then(reviews => {
          if (!networkDataRecieved){
            return callback(null, reviews);
          }
        }).catch(error => {
          callback('Request failed:'+ error, null);
        })
      } */
    })
  }

  /**
   * Fetch a review by its ID.
   */
  static fetchReviewById(id, callback) {
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
  }

  /**
   * Fetch reviews by a restaurant id with proper error handling.
   */
  static fetchReviewsByRestaurantId(restaurant_id, callback) {
    // Fetch all reviews with proper error handling
    DBReviewHelper.fetchReviews((error, reviews) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter reviews to have only given restaurant_id type
        const results = reviews.filter(r => r.restaurant_id == restaurant_id);
        console.log(results);
        callback(null, results);
      }
    });
  }
}

