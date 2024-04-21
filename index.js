const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { validateGetByFilter } = require('./validation');

// Create Express app
const app = express();

app.use(bodyParser.json());

// Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/bookstore', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// mongoose.connect('mongodb+srv://chacha:chacha@cluster0.a1sltay.mongodb.net/bookstore?retryWrites=true&w=majority&appName=Cluster0', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

mongoose.connect('mongodb+srv://chacha:chacha@mymongodb.ugl5ott.mongodb.net/bookstore?retryWrites=true&w=majority&appName=mymongodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define Book schema and model
const BookSchema = new mongoose.Schema({
  title: {type: String, required: true},
  author: {type: String, required: true},
  genre: [String],
  description: String,
  price: {type: Number, required: true},
  ISBN: {type: String, required: true, unique: true},
  publicationDate: Date,
  publisher: String,
  language: String,
  imageURL: String,
  quantityAvailable: {type: Number, default: 10},
  ratings: [{ userId: String, rating: Number, comment: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

BookSchema.index({ title: 1, author: 1 }, { unique: true });

const Book = mongoose.model('Book', BookSchema);

app.post('/books', async (req, res) => {
    try {
      console.log(req);
      if (req.body.price < 0) {
        return res.status(400).json({ error: `Price cannot be negative` });
      }
      const book = new Book(req.body);
      console.log(book);
      await book.save();
      res.status(201).json(book);
    } catch (error) {
      if (error.code === 11000 && error.keyPattern) {
            // Duplicate key error
            const fieldName = Object.keys(error.keyPattern)[0];
            res.status(400).json({ error: `Duplicate value for ${fieldName}` });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// GET books with optional filter parameters
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

    if (req.query.maxPrice) {
      query.price = { $lte: parseFloat(req.query.maxPrice) };
    }

    if (req.query.genre) {
      // If genre is provided as a single value, convert it to an array
      const genres = Array.isArray(req.query.genre) ? req.query.genre : [req.query.genre];
      query.genre = { $in: genres };
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

// Borrow a book
app.put('/books/borrow/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.quantityAvailable <= 0) {
      return res.status(400).json({ error: 'Book not available for borrowing' });
    }

    book.quantityAvailable--;
    await book.save();

    res.json({ message: 'Book borrowed successfully', book });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Return a book
app.put('/books/return/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    book.quantityAvailable++;
    await book.save();

    res.json({ message: 'Book returned successfully', book });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
