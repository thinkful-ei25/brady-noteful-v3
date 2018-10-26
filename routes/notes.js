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


  let filter = {};
  let sort = 'createdAt';

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{'title': re}, {'content': re } ];
    sort = 'id';
  }

  if(folderId) {
    filter.folderId = folderId;
  }

  Note.find(filter)
    .sort(sort)
    .then(notes => {
      if (notes) {
        res.json(notes);
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

  const {title, content, folderId} = req.body;

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  if(!(mongoose.Types.ObjectId.isValid(req.body.folderId))) {
    const message = 'Folder Does Not Exist';
    return res.status(400).send(message);
  }  


  Note.create({
    title: title,
    content: content,
    folderId: folderId
  })
    .then(result => {
      if (result) {
        res
          .location(`${req.baseUrl}/${result.id}`)
          .status(201)
          .json(result);
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

  if (!(mongoose.Types.ObjectId.isValid(req.params.id))) {
    const message = 'Folder Does Not Exist';
    return res.status(400).send(message);
  }

  if(!req.body.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
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
