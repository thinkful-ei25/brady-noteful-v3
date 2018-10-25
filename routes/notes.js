'use strict';

const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');
const Note = require('../models/note');
const Folder = require('../models/folder');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;
  const { folderId } = req.query;

  console.log(req.body);

  // const re = new RegExp(searchTerm, 'i');
  const filter = {};

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{'title': re}, {'content': re } ];
  }

  if(folderId) {
    filter.folderId = folderId;
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

  if (!('title' in req.body)) {
    const message = 'Missing `Title` in request body';
    return res.status(400).send(message);
  }
  if(!(mongoose.Types.ObjectId.isValid(req.body.folderId))) {
    const message = 'Folder Does Not Exist';
    return res.status(400).send(message);
  }  


  Note.create({
    title: req.body.title,
    content: req.body.content,
    folderId: req.body.folderId
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
  const toUpdate = {};
  const updateableFields = ['title', 'content', 'folderId'];

  if (!(mongoose.Types.ObjectId.isValid(req.body.folderId))) {
    const message = 'Folder Does Not Exist';
    return res.status(400).send(message);
  }


  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Note.findByIdAndUpdate(req.params.id, { $set: toUpdate }, { new: true })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
