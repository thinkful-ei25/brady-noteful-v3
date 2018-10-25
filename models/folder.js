'use strict';

const mongoose = require('mongoose');

const folderSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

folderSchema.set('timestamps', true);

folderSchema.set('toJSON', {
  virtuals: true, // include built-in virtual `id`
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
    delete ret.__v;
  }
});

module.exports = mongoose.model('Folder', folderSchema);
