'use strict';

const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');
const Folder = require('../models/folder');

/* ========== GET/READ ALL FOLDERS ========== */
router.get('/', (req, res, next) => {
  Folder.find()
    .sort()
    .then(folders => {
      if (folders) {
        res.json(folders);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ FOLDER BY ID ========== */

router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  Folder.findById(id)
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

/* ========== POST/CREATE A FOLDER ========== */

router.post('/', (req, res, next) => {


  Folder.create({
    name: req.body.name
  })
    .then(result => {
      if (result) {
        res
          .location(`${req.baseUrl}/${result.id}`)
          .status(201)
          .json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== PUT OR UPDATE A FOLDER ========== */

router.put('/:id', (req, res, next) => {
  if (!('name' in req.body)) {
    const message = 'Missing `Name` in request body';
    return res.status(400).send(message);
  }

  const updateFolder = { name: req.body.name };
  Folder.findByIdAndUpdate(req.params.id, { $set: updateFolder }, { new: true })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status(400);
      }
      next(err);
    });
});

/* ========== PUT OR UPDATE A FOLDER ========== */

router.delete('/:id', (req, res, next) => {
  Folder.findByIdAndDelete(req.params.id) 
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

module.exports = router;
