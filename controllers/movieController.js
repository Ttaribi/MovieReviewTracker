const axios = require('axios');
const Movie = require('../models/Movie');
require('dotenv').config();

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = 'http://www.omdbapi.com/';

const searchMovies = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    console.log('Searching for:', q, 'with API key:', OMDB_API_KEY ? 'SET' : 'NOT SET');

    const response = await axios.get(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        s: q,
        type: 'movie'
      }
    });

    console.log('OMDB Response:', response.data.Response, 'Count:', response.data.Search?.length || 0);

    if (response.data.Response === 'False') {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const movies = response.data.Search || [];
    
    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies
    });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getMovieDetails = async (req, res) => {
  try {
    const { imdbID } = req.params;

    if (!imdbID) {
      return res.status(400).json({
        success: false,
        error: 'IMDB ID is required'
      });
    }

    let movie = await Movie.findOne({ imdbID });

    if (movie) {
      return res.status(200).json({
        success: true,
        data: movie,
        source: 'database'
      });
    }

    const response = await axios.get(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        i: imdbID,
        plot: 'full'
      }
    });

    if (response.data.Response === 'False') {
      return res.status(404).json({
        success: false,
        error: response.data.Error || 'Movie not found'
      });
    }

    const movieData = {
      imdbID: response.data.imdbID,
      title: response.data.Title,
      year: response.data.Year,
      poster: response.data.Poster === 'N/A' ? 'N/A' : response.data.Poster,
      plot: response.data.Plot || '',
      director: response.data.Director === 'N/A' ? 'N/A' : response.data.Director,
      genre: response.data.Genre === 'N/A' ? 'N/A' : response.data.Genre,
      runtime: response.data.Runtime === 'N/A' ? 'N/A' : response.data.Runtime
    };

    movie = await Movie.findOneAndUpdate(
      { imdbID: movieData.imdbID },
      movieData,
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      data: movie,
      source: 'api'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const saveMovieToDB = async (movieData) => {
  try {
    const movie = await Movie.findOneAndUpdate(
      { imdbID: movieData.imdbID },
      movieData,
      { upsert: true, new: true }
    );
    return movie;
  } catch (error) {
    throw new Error(`Failed to save movie: ${error.message}`);
  }
};

module.exports = {
  searchMovies,
  getMovieDetails,
  saveMovieToDB
};

