const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
  "username": "joe",
  "password": "123456"
}];

const isValid = (newUsername)=> users.findIndex(({username}) => (username === newUsername)) === -1

const authenticatedUser = (username,password)=>{
  return users.findIndex((user) => user?.username === username && user.password === password) !== -1
}

const isUserHasReview = (username, bookISBN) => {
  const foundBook = books[bookISBN]

  return foundBook.reviews.hasOwnProperty(username)
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body?.username
  const password = req.body?.password

  if (!username) return res.status(404).json({message: "Username is required"});
  if (!password) return res.status(404).json({message: "Password is required"});

  if (!authenticatedUser(username, password)) {
    return res.status(403).json({message: "User with this username is not registered yet"});
  }

  const accessToken = jwt.sign({
    data: password
  },
      'secret_key', {expiresIn: '1h'}
  );

  req.session.authorization = {accessToken, username}

  return res.status(200).json({message: "Logged in successfully"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const {isbn:bookISBN} = req.params;
  const review = req.query?.review;
  const {username} = req.session.authorization

  if (!review || !review.trim()) {
    return res.status(403).json({message: "You should pass any review"})
  }

  const foundBook = books[bookISBN]

  if (!foundBook) {
    return res.status(404).json({message: `Book with ISBN ${bookISBN} not found`});
  }

  if (!isUserHasReview(username, bookISBN)) {
    foundBook.reviews = {[username]: review};
    return res.status(200).json({message: `Review  for the book with ISBN ${bookISBN} has been added successfully`})
  } else {
    foundBook.reviews = {[username]: review};
    return res.status(200).json({message: `Review  for the book with ISBN ${bookISBN} has been updated successfully`})
  }
});

regd_users.delete('/auth/review/:isbn', (req,res) => {
  const {isbn:bookISBN} = req.params;
  const {username} = req.session.authorization

  const foundBook = books[bookISBN]

  if (!foundBook) {
    return res.status(404).json({message: `Book with ISBN ${bookISBN} not found`});
  }

  if (!isUserHasReview(username, bookISBN)) {
    return res.status(404).json({message: `You don't have review for book with ISBN ${bookISBN}`});
  }

  delete foundBook.reviews[username];

  return res.status(200).json({message: "You review has been deleted successfully"})
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
