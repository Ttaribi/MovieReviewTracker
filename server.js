const express = require('express');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/database');

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

app.use('/movies', moviesRoutes);
app.use('/reviews', reviewsRoutes);

app.get('/', (req, res) => {
  res.send('Server is running! MongoDB connection: Check console');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

