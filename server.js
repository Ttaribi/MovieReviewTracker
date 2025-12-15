require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const reviewRoutes = require('./routes/reviews');

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Movie Review Tracker API' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

