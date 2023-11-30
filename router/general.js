const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const {username, password} = req.body;
  if (!username){
    return res.status(400).json({message: "Username not found"});
  }

  if (!password){
    return res.status(400).json({message: "Password not found"});
  }

  const isUsernameValid = isValid(username);
  if (!isUsernameValid) {
    return res.status(400).json({message: "Username unavailable"});
  }

  const user = {username, password};
  users.push(user);
  return res.status(200).json({message: "User registered"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  const formatedBooks = JSON.parse(JSON.stringify(books, null, 4));
  if (!formatedBooks) {
    return res.json({message: "Books not found"}).status(204);
  }

  return res.status(200).json({ books: formatedBooks });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const {isbn} = req.params;
  const book = books[isbn];
  if (!book) {
    return res.json({message: "No book found against isbn"}).status(204);
  }
  return res.status(200).json(book);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const {author} = req.params;
  const entries = Object.values(books)
  const filteredBooks = entries.filter((book) => book.author == author);
  return res.status(200).json({books: filteredBooks});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const {title} = req.params;
  const entries = Object.values(books)
  const filteredBooks = entries.filter((book) => book.title == title);
  return res.status(200).json({books: filteredBooks});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const {isbn} = req.params;
  const book = books[isbn];
  if (!book) {
    return res.json({message: "No book found against isbn"}).status(204);
  }
  const {review} = book;
  if (!review) {
    return res.json({message: "No review found against book"}).status(204);
  }
  return res.status(200).json({review});
});

module.exports.general = public_users;
