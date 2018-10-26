'use strict';

const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');
const Note = require('../models/note');
const Folder = require('../models/folder');

/* ========== GET/READ ALL NOTES ========== */
router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;
  const { folderId } = req.query;
  const { tags } = req.query;

  let filter = {};
  let sort = 'createdAt';

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{ title: re }, { content: re }];
    sort = 'id';
  }

  if (folderId) {
    filter.folderId = folderId;
  }

  if (tags) {
    filter.tags = tags;
  }

  Note.find(filter)
    .sort(sort)
    .populate('folders')
    .populate('tags')
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
    .populate('tags')
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
  const { title, content, folderId, tags } = req.body;
  const newNote = {
    title: title,
    content: content,
    folderId: folderId,
    tags: tags
  };

  if (!newNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  if (!mongoose.Types.ObjectId.isValid(newNote.folderId)) {
    const message = 'Folder Does Not Exist';
    return res.status(400).send(message);
  }

  for (let tag of newNote.tags) {
    console.log(tag);
    if (!mongoose.Types.ObjectId.isValid(tag)) {
      const message = 'Tags Does Not Exist';
      return res.status(400).send(message);
    }
  }

  Note.create(newNote)
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
  const noteUpdate = {};
  const updateableFields = ['title', 'content', 'folderId', 'tags'];

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const message = 'Note Does Not Exist';
    return res.status(400).send(message);
  }

  if (!req.body.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  updateableFields.forEach(field => {
    if (field in req.body) {
      noteUpdate[field] = req.body[field];
    }
  });


  if (
    noteUpdate.folderId &&
    !mongoose.Types.ObjectId.isValid(noteUpdate.folderId)
  ) {
    const message = 'Folder Does Not Exist';
    return res.status(400).send(message);
  }

  for (let tag of noteUpdate.tags) {
    if (!mongoose.Types.ObjectId.isValid(tag)) {
      const message = 'Tags Does Not Exist';
      return res.status(400).send(message);
    }
  }

  if(noteUpdate.folderId === '') {
    delete noteUpdate.folderId;
    noteUpdate.$unset = {folderId : 1};
  }

  Note.findByIdAndUpdate(req.params.id, { $set: noteUpdate }, { new: true })
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
