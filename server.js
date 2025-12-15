const express = require('express');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/database');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const moviesRoutes = require('./routes/movies');
const reviewsRoutes = require('./routes/reviews');

const Review = require('./models/Review');
const Movie = require('./models/Movie');

app.use('/api/movies', moviesRoutes);
app.use('/api/reviews', reviewsRoutes);

// Home page - shows search and recent reviews
app.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('movieId')
      .sort({ createdAt: -1 })
      .limit(6);
    res.render('index', { reviews });
  } catch (error) {
    res.render('index', { reviews: [] });
  }
});

// All reviews page
app.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('movieId')
      .sort({ createdAt: -1 });
    res.render('reviews', { reviews });
  } catch (error) {
    res.render('reviews', { reviews: [] });
  }
});

// Movie detail page
app.get('/movie/:imdbID', async (req, res) => {
  try {
    const { imdbID } = req.params;
    
    // Try to find movie in database first
    let movie = await Movie.findOne({ imdbID });
    
    // If not found, fetch from OMDB API
    if (!movie) {
      const response = await axios.get('http://www.omdbapi.com/', {
        params: {
          apikey: process.env.OMDB_API_KEY,
          i: imdbID,
          plot: 'full'
        }
      });
      
      if (response.data.Response === 'False') {
        return res.redirect('/');
      }
      
      movie = await Movie.findOneAndUpdate(
        { imdbID: response.data.imdbID },
        {
          imdbID: response.data.imdbID,
          title: response.data.Title,
          year: response.data.Year,
          poster: response.data.Poster === 'N/A' ? 'N/A' : response.data.Poster,
          plot: response.data.Plot || '',
          director: response.data.Director === 'N/A' ? 'N/A' : response.data.Director,
          genre: response.data.Genre === 'N/A' ? 'N/A' : response.data.Genre,
          runtime: response.data.Runtime === 'N/A' ? 'N/A' : response.data.Runtime
        },
        { upsert: true, new: true }
      );
    }
    
    // Get reviews for this movie
    const reviews = await Review.find({ movieId: movie._id })
      .sort({ createdAt: -1 });
    
    res.render('movie', { movie, reviews });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
});

// Submit review for a movie
app.post('/movie/:imdbID/review', async (req, res) => {
  try {
    const { imdbID, title, year, poster, reviewerName, rating, comment } = req.body;
    
    // Find or create movie
    let movie = await Movie.findOne({ imdbID });
    if (!movie) {
      movie = await Movie.create({
        imdbID,
        title,
        year,
        poster: poster || 'N/A'
      });
    }
    
    // Create review
    await Review.create({
      movieId: movie._id,
      reviewerName,
      rating: parseInt(rating),
      comment
    });
    
    res.redirect(`/movie/${imdbID}`);
  } catch (error) {
    console.error(error);
    // Get movie and reviews to re-render with error
    const movie = await Movie.findOne({ imdbID: req.params.imdbID });
    const reviews = movie ? await Review.find({ movieId: movie._id }).sort({ createdAt: -1 }) : [];
    res.render('movie', { 
      movie: movie || { imdbID: req.params.imdbID, title: 'Unknown', year: '', poster: 'N/A' }, 
      reviews,
      message: 'Failed to submit review. Please try again.',
      messageType: 'error'
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
