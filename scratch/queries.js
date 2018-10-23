'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

mongoose
  .connect(
    MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(() => {
    const searchTerm = 'lady gaga';
    const re = new RegExp(searchTerm, 'i');
    let filter = {};

    if (searchTerm) {
      filter.title = re;
    }

    return Note.find(filter).sort({ updatedAt: 'desc' });
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

mongoose
  .connect(
    MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(() => {
    const id = '5bcf75329ed9478ef3602fed';
    return Note.findById(id).sort({ updatedAt: 'desc' });
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

//Create a new note using Note.create

mongoose
  .connect(
    MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(() => {
    const title = 'Hey Im a title';
    const content = 'New Content Has Arrived!';
    const newNote = {};

    if (title) {
      newNote.title = title;
      newNote.content = content;
    }

    return Note.create(newNote);
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

mongoose
  .connect(
    MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(() => {
    const id = '5bcf75329ed9478ef3602fed';
    const newNote = {
      title: 'Hey Im a Newer Title!',
      content: 'New Content Has Arrived!'
    };
    return Note.findByIdAndUpdate(id, { $set: newNote }, { new: true });
  })
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

//Delete a note by id using Note.findByIdAndRemove

mongoose
  .connect(
    MONGODB_URI,
    { useNewUrlParser: true }
  )
  .then(() => {
    const id = '5bcf75329ed9478ef3602fed';
    Note.findByIdAndDelete(id);
  })
  .then(result => {
    console.log(result);
  })
  .then(() => {
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });

// 1. connect to db
// 2. create an const id
// 3. use find by ID and Remove, passing in the ID
// 4. console.log the results
//
