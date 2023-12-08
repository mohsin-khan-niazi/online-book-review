import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const { users } = prisma;
// import { books } from './booksdb.js';
const regd_users = express.Router();

// check if the username is valid
const isValidUsername = async (username) => {
  const user = await users.findUnique({
    where: {
      username,
    },
  });
  if (user) return false;
  return true;
};

// check if username and password match the one we have in records.
const authenticateUser = async (username, password) => {
  const user = await users.findUnique({
    where: {
      username,
      password,
    },
  });
  if (!user) return false;
  return { success: true, user };
};

const signJWT = (user) => {
  const accessToken = jsonwebtoken.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_PRIVATE_KEY,
    { expiresIn: '1d' },
  );
  return accessToken;
};

//only registered users can login
regd_users.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Username not found' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password not found' });
  }

  const isValidUser = await authenticateUser(username, password);
  if (!isValidUser) {
    return res
      .status(401)
      .json({ message: 'Invalid username and/or password' });
  }

  const { user } = isValidUser;
  const accessToken = signJWT(user);

  return res
    .status(200)
    .json({ message: 'User successfully logged in', accessToken });
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

export { regd_users as authenticated, isValidUsername, users };
