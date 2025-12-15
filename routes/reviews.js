const express = require('express');
const router = express.Router();
const {
  createReview,
  getAllReviews,
  getReviewById,
  getReviewsByMovie,
  deleteReview
} = require('../controllers/reviewController');

router.post('/', createReview);
router.get('/', getAllReviews);
router.get('/:id', getReviewById);
router.get('/movie/:imdbID', getReviewsByMovie);
router.delete('/:id', deleteReview);

module.exports = router;
