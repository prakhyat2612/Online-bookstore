const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { validateGetByFilter } = require('./validation');

// Create Express app
const app = express();

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bookstore', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define Book schema and model
const BookSchema = new mongoose.Schema({
  title: String,
  author: String,
  genre: [String],
  description: String,
  price: Number,
  ISBN: String,
  publicationDate: Date,
  publisher: String,
  language: String,
  imageURL: String,
  quantityAvailable: Number,
  ratings: [{ userId: String, rating: Number, comment: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Book = mongoose.model('Book', BookSchema);

app.post('/books', async (req, res) => {
    try {
      console.log(req);
      const book = new Book(req.body);
      console.log(book);
      await book.save();
      res.status(201).json(book);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// GET route for fetching books with optional filter parameters
app.get('/books', async (req, res) => {
  try {
    if (!validateGetByFilter(req.query)) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }

    let query = {};

    if (req.query.author) {
      query.author = req.query.author;
    }

    if (req.query.title) {
      query.title = req.query.title;
    }

    const books = await Book.find(query);

    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a book by ID
app.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a book by ID
app.put('/books/:id', async (req, res) => {
  try {
    req.body.updatedAt = Date.now();
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a book by ID
app.delete('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
