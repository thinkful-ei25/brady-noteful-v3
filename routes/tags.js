'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Tag = require('../models/tag');
const Note = require('../models/note');

function objectIdTest(field, type, next) {
  if(!mongoose.Types.ObjectId.isValid(field)){
    const err = new Error(`The '${type}' is not valid`);
    err.status = 400;
    return next(err);
  }
}

function fieldTest(field, type, next) {
  if(!field) {
    const err = new Error(`Missing '${type}' in request body`);
    err.status = 400;
    return next(err);
  }
}


/* ========== GET/READ ALL TAGS ========== */
router.get('/', (req, res, next) => {
  Tag.find()
    .sort({ name: 1 })
    .then(result => {
      result ? res.json(result) : next();
    })
    .catch(err => next(err));
});

// /* ========== GET/READ TAGS BY ID ========== */
router.get('/:id', (req, res, next) => {
  objectIdTest(req.params.id, 'tag', next);

  Tag.findById(req.params.id)
    .then(result => {
      result ? res.status(200).json(result) : next();
    })
    .catch(err => next(err));
});

// /* ========== POST/CREATE TAGS  ========== */
router.post('/', (req, res, next) => {
  const { name } = req.body;

  fieldTest(name, 'Tag Name');

  Tag.create({ name })
    .then(result => {
      res
        .location(`${req.baseUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status(400);
      }
      return next(err);
    });
});

// /* ========== PUT/UPDATE TAGS BY ID ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;


  fieldTest(id, 'Tag', next);
  fieldTest(name, 'Tag Name', next);

  objectIdTest(id, 'Tag', next);


  Tag.findByIdAndUpdate(id, {$set: {name: name}}, {new: true})
    .then(result => {
      result ? res.json(result) : next();
    })
    .catch(err => {
      if( err.code === 11000) {
        err = new Error('The tag name already exists :(');
        err.status = 400;
        next(err);
      }
      next(err);
    });
});

// /* ========== DELETE TAGS BY ID ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  objectIdTest(id, 'Tag');

  Promise.all([
    Tag.findByIdAndRemove(id),
    Note.updateMany({tags: id}, {$pull: {tags:id}})
  ])
    .then(() => res.sendStatus(204))
    .catch(err => next(err));

});

module.exports = router;
