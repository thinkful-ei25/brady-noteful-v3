'use strict';

const express = require('express');

const router = express.Router();

// const mongoose = require('mongoose');
const Note = require('../models/note');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  //create a variable for storing the search term and make sure it's able to handle regEx
  // if there is a search term, then we need to make that equal to title.
  //run query for the notes
  // then pass the results through to the response, and map a serialized version.
  // then catch the err
  const { searchTerm } = req.query;
  const re = new RegExp(searchTerm, 'i');
  const filter = {};

  if (searchTerm) {
    filter.title = re;
  }

  Note.find(filter)
    .then(notes => {
      if (notes) {
        res.json(notes);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  Note.findById(req.params.id)
    .then(note => {
      console.log(`this is a ${note}`);
      if (note) {
        res.json(note);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  //create a new item from the req.
  //use Note.Create to create the new note.
  if (!('title' in req.body)) {
    const message = 'Missing `Title` in request body';
    return res.status(400).send(message);
  }
  Note.create({
    title: req.body.title,
    content: req.body.content
  })
    .then(result => {
      if (result) {
        res
          .location('path/to/new/document')
          .status(201)
          .json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  console.log('Update a Note');
  res.json({ id: 1, title: 'Updated Temp 1' });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  console.log('Delete a Note');
  res.status(204).end();
});

module.exports = router;
