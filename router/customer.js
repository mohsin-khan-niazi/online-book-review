import express from 'express';
import jwt from 'jsonwebtoken';
import { books } from './booksdb.js';
const regd_users = express.Router();

let users = [];

// check if the username is valid
const isValid = (username) => {
  const usernameConflictingUser = users.filter(
    (user) => user.username == username,
  );
  if (usernameConflictingUser.length > 0) return false;
  return true;
};

// check if username and password match the one we have in records.
const authenticatedUser = (username, password) => {
  const user = users.filter((user) => {
    return user.username == username && user.password == password;
  });
  if (user.length == 0) return false;
  return true;
};

//only registered users can login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Username not found' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password not found' });
  }

  const isUserPresent = !isValid(username);
  if (!isUserPresent) {
    return res.status(400).json({ message: 'User not registered' });
  }

  const isValidUser = authenticatedUser(username, password);
  if (!isValidUser) {
    return res
      .status(401)
      .json({ message: 'Invalid username and/or password' });
  }

  const accessToken = jwt.sign(
    {
      data: password,
    },
    'access',
    { expiresIn: 60 * 60 },
  );
  req.session.authorization = {
    accessToken,
    username,
  };
  return res.status(200).send('User successfully logged in');
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  if (!isbn) {
    return res.status(400).json({ message: 'ISBN not found' });
  }

  const { review } = req.query;
  if (!review) {
    return res.status(400).json({ message: 'Review not found' });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(400).json({ message: 'Book not found' });
  }

  const { username } = req.session.authorization;
  const userReview = { username, review };

  const reviewIndex = book.reviews.findIndex(
    (review) => review.username === username,
  );
  if (reviewIndex == -1) {
    book.reviews.push(userReview);
  } else {
    book.reviews[reviewIndex].review = review;
  }

  books[isbn] = book;

  return res.status(200).json({ message: 'Review posted', book });
});

// Delete a book review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  if (!isbn) {
    return res.status(400).json({ message: 'ISBN not found' });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(400).json({ message: 'Book not found' });
  }

  const { username } = req.session.authorization;

  const reviewIndex = book.reviews.findIndex(
    (review) => review.username === username,
  );
  if (reviewIndex == -1) {
    return res.status(400).json({ message: 'Review not found' });
  } else {
    // delete book.reviews[reviewIndex];
    book.reviews.splice(reviewIndex, 1);
  }

  books[isbn] = book;

  console.log('books: ', books);

  return res.status(200).json({ message: 'Review deleted' });
});

export { regd_users as authenticated, isValid, users };
