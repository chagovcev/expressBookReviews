const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const getBooksFromDB = async () => {
  return await books
}

const getBookByISBN = async (isbn) => {
  return await books[isbn]
}

const getBooksByAuthor = async (author) => {
  let foundBooks = []

  for (let bookISBN in books) {
    if (books[bookISBN]?.author?.toLowerCase()?.includes(author.toLowerCase().trim())) {
      foundBooks.push(books[bookISBN])
    }
  }

  return foundBooks
}

const getBooksByTitle = async (title) => {
  let foundBooks = []

  for (let bookISBN in books) {
    if (books[bookISBN]?.title?.toLowerCase()?.includes(title.toLowerCase().trim())) {
      foundBooks.push(books[bookISBN])
    }
  }

  return foundBooks
}

public_users.post("/register", (req,res) => {
  const username = req.body?.username
  const password = req.body?.password

  if (!username) return res.status(404).json({message: "Username is required"});
  if (!password) return res.status(404).json({message: "Password is required"});

  if (!isValid(username.toLowerCase())) {
    return res.status(404).json({message: "User with this username already exists"});
  }


  users.push({username: username.toLowerCase(), password});

  return res.status(200).json({message: "User was registered successfully"});
});

// Get the book list available in the shop
public_users.get('/',async (req, res) => {
  let books = {};

  try {
    books = await getBooksFromDB();
  } catch (error) {
    res.status(500).json({message: `Error occur during getting books form DB: ${error}`})
  }

  return res.status(200).json({data: books});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async (req, res) => {
  const {isbn} = req.params;

  let foundBook;

  try {
    foundBook = await getBookByISBN(isbn);
  } catch (error) {
    res.status(500).json({message: `Error occur during getting books form DB: ${error}`})
  }


  if (!foundBook) {
    return res.status(404).json({message: `Book with ISBN ${isbn} is not found`});
  }

  return res.status(200).json({data: foundBook});
 });

// Get book details based on author
public_users.get('/author/:author',async (req, res) => {
  const {author} = req.params;

  let foundBooks = [];

  try {
    foundBooks = await getBooksByAuthor(author);
  } catch (error) {
    res.status(500).json({message: `Error occur during getting books form DB: ${error}`})
  }

  if (!foundBooks.length) {
    return res.status(404).json({message: `Book of author ${author} is not found`});
  }

  return res.status(200).json({data: foundBooks});
});

// Get all books based on title
public_users.get('/title/:title',async (req, res) => {
  const {title} = req.params;

  let foundBooks = []

  try {
    foundBooks = await getBooksByTitle(title);
  } catch (error) {
    res.status(500).json({message: `Error occur during getting books form DB: ${error}`})
  }


  if (!foundBooks.length) {
    return res.status(404).json({message: `Book with title ${title} is not found`});
  }

  return res.status(200).json({data: foundBooks});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const {isbn} = req.params;
  const books = getBooksFromDB();

  const foundBookReviews = books[isbn]?.reviews;

  if (!foundBookReviews) {
    return res.status(404).json({message: `Book with ISBN ${isbn} is not found`});
  }

  return res.status(200).json({data: foundBookReviews});
});

module.exports.general = public_users;
