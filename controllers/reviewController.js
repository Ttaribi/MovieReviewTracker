const Review = require('../models/Review');
const Movie = require('../models/Movie');

const createReview = async (req, res) => {
  try {
    const { imdbID, title, year, poster, reviewerName, rating, comment } = req.body;

    let movie = await Movie.findOne({ imdbID });
    
    if (!movie) {
      movie = await Movie.create({
        imdbID,
        title,
        year,
        poster: poster || 'N/A'
      });
    }

    const review = await Review.create({
      movieId: movie._id,
      reviewerName,
      rating,
      comment
    });

    await review.populate('movieId');

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('movieId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('movieId');

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getReviewsByMovie = async (req, res) => {
  try {
    const { imdbID } = req.params;
    
    const movie = await Movie.findOne({ imdbID });
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }

    const reviews = await Review.find({ movieId: movie._id })
      .populate('movieId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  getReviewsByMovie,
  deleteReview
};
