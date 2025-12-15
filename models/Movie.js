const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  imdbID: {
    type: String,
    required: [true, 'IMDB ID is required'],
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  year: {
    type: String,
    required: [true, 'Year is required']
  },
  poster: {
    type: String,
    default: 'N/A'
  },
  plot: {
    type: String,
    default: ''
  },
  director: {
    type: String,
    default: 'N/A'
  },
  genre: {
    type: String,
    default: 'N/A'
  },
  runtime: {
    type: String,
    default: 'N/A'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);

