'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Tag = require('../models/tag');


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
  if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
    const message = 'Does Not Exist';
    return res.status(400).send(message);
  }

  Tag.findById(req.params.id)
    .then(result => {
      result ? res.status(200).json(result) : next();
    })
    .catch(err => next(err));
});

// /* ========== POST/CREATE TAGS  ========== */
router.post('/', (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

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
        next(err);
      }
      next(err);
    });
});

// /* ========== PUT/UPDATE TAGS BY ID ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  if(req.body.id && id !== req.body.id) {
    const err = new Error('IDs do not match');
    err.status = 400;
    return next(err);
  }

  if(!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
    const message = 'Does Not Exist';
    return res.status(400).send(message);
  }

  Tag.findByIdAndUpdate(id, {$set: {name: name }}, {next: true})
    .then(result => {
      result ? res.json(result) : next();
    })
    .catch(err => {
      if( err.code === 11000) {
        err = new Error('The tag name already exists :(');
        err.status(400);
        next(err);
      }
      next(err);
    });
});
// /* ========== DELETE TAGS BY ID ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  Tag.delete(id)
    .then(() => res.sendStatus(204))
    .catch(next);
});

module.exports = router;
