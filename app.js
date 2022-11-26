const express = require('express');
const { ObjectId } = require('mongodb');
const { connectTODB, getDB } = require('./db');

// init app & middleware
const app = express();
app.use(express.json());

// db connection
let DB;

connectTODB((err) => {
  if (!err) {
    app.listen(3000, () => {
      console.info('App listening at port 3000');
    });
    DB = getDB();
  }
});


// routes

// Getting all books
app.get('/books', (req, res) => {
  let books = [];
  let { page } = req.query;
  !page ? page = 0 : page -=1;
  let booksPerPage = 1;

  //db.books in mongosh
  DB.collection('books')
    .find()
    .sort({
      author: 1
    })
    // skip and limit is for pagination
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach((book) => {
      books.push(book);
    }).then(() => {
      res.status(200).json(books);
    }).catch(() => {
      res.status(500).json({
        error: 'Internal Error'
      });
    });
});


// Geeting single book
app.get('/books/:id', (req, res) => {
  let {
    id
  } = req.params;
  if (ObjectId.isValid(id)) {
    // ObjectId.isValid(id) checks the valid ID format
    DB.collection('books')
      .findOne({
        _id: ObjectId(id)
      })
      .then((doc) => {
        if (!doc) {
          res.status(500).json({
            error: 'Book doesn\'t exist'
          });
        }
        res.status(200).json(doc);
      }).catch(() => {
        res.status(500).json({
          error: 'Internal Error'
        });
      });

    return;
  }
  res.status(500).json({
    error: 'Wrong books id passed'
  });

});

// Adding the book
app.post('/books', (req, res) => {
  let {
    body: book
  } = req;

  DB.collection('books')
    .insertOne(book)
    .then(() => {
      res.status(201).json({
          message: 'Book added successfully'
        })
        .catch(() => {
          res.status(500).json({
            error: 'Internal Error'
          });
        });
    })
});


// deleting the book

app.delete('/books/:id', (req, res) => {
  let {
    id
  } = req.params;

  if (ObjectId.isValid(id)) {
    DB.collection('books')
      .deleteOne({
        _id: ObjectId(id)
      })
      .then((data) => {
        res.status(200).json({ data, message: 'books deleted successfully' });
      }).catch(() => {
        res.status(500).json({
          error: 'Internal Error'
        });
      });

    return;
  }

  res.status(500).json({
    error: 'Wrong books id passed'
  });
});

// patch updating(partial updating) the book

app.patch('/books/:id', (req, res) => {
  let {
    body: bookPatch
  } = req;
  let {
    id
  } = req.params;

  if (ObjectId.isValid(id)) {

    DB.collection('books')
      .updateOne({
        _id: ObjectId(id)
      }, {
        $set: bookPatch
      })
      .then((data) => {
        res.status(201).json({
          data,
          message: 'Book updated successfully'
        })
      })
      .catch(() => {
        res.status(500).json({
          error: 'Internal Error'
        });
      });
    return;
  }

  res.status(500).json({
    error: 'Wrong books id passed'
  });
});