'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tag');

const { notes, folders, tags } = require('../db/seed/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful API Note Tests', function() {
  before(function() {
    return mongoose.connect(
      TEST_MONGODB_URI,
      { useNewUrlParser: true }
    );
  });

  beforeEach(function() {
    const noteInsertPromise = Note.insertMany(notes);
    const folderInsertPromise = Folder.insertMany(folders);
    const tagsInsertPromise = Tag.insertMany(tags);
    return Promise.all([noteInsertPromise, folderInsertPromise, tagsInsertPromise]);
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('GET /api/notes', function() {
    it('should return the correct # of Notes and all correct fields', function() {
      const dbPromise = Note.find();
      const apiPromise = chai.request(app).get('/api/notes');

      return Promise.all([dbPromise, apiPromise]).then(([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(data.length);
        res.body.forEach(item => {
          expect(item).to.be.a('object');
          expect(item).to.have.keys(
            'id',
            'title',
            'content',
            'folderId',
            'createdAt',
            'updatedAt',
            'tags'
          );
        });
      });
    });

    it('should return the correct search results for a searchTerm query', function() {
      const searchTerm = 'gaga';
      const re = new RegExp(searchTerm, 'i');
      const reFilter = { $regex: re };
      const dbPromise = Note.find({ title: reFilter });
      const apiPromise = chai
        .request(app)
        .get(`/api/notes?searchTerm=${searchTerm}`);

      return Promise.all([dbPromise, apiPromise]).then(([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(1);
        expect(res.body[0]).to.be.an('object');
        expect(res.body[0].id).to.equal(data[0].id);
      });
    });

    it('should return correct search results for a folderId query', function() {
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          const dbPromise = Note.find({ folderId: data.id });
          const apiPromise = chai
            .request(app)
            .get(`/api/notes?folderId=${data.id}`);
          return Promise.all([dbPromise, apiPromise]);
        })
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return an empty array for non-matching query', function() {
      const searchTerm = 'NoWayThisMatchesAnything';
      const re = new RegExp(searchTerm, 'i');
      const reFilter = { $regex: re };
      const dbPromise = Note.find({ title: reFilter });
      const apiPromise = chai
        .request(app)
        .get(`/api/notes?searchTerm=${searchTerm}`);

      return Promise.all([dbPromise, apiPromise]).then(([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(data.length);
      });
    });
  });

  describe('GET /api/notes/:id', function() {
    it('should return a correct note for a given id', function() {
      let data;
      return Note.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys(
            'id',
            'title',
            'content',
            'folderId',
            'createdAt',
            'updatedAt',
            'tags'
          );

          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
        });
    });
  });

  describe('POST /api/notes', function() {
    it('should create and return a new note when provided valid inputs', function() {
      const newNote = {
        title: 'Tyup testing',
        content: 'just testing away',
        folderId: '111111111111111111111100',
        tags: [
          '222222222222222222222200',
          '222222222222222222222201',
          '222222222222222222222202'
        ]
      };

      let res;
      return chai
        .request(app)
        .post('/api/notes')
        .send(newNote)
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res).to.have.header('location');
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys(
            'id',
            'title',
            'content',
            'folderId',
            'createdAt',
            'updatedAt',
            'tags'
          );
          return Note.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
        });
    });

    it('should return an error when posting a new note with no title', function() {
      const newNote = {
        content: 'Test note with no title'
      };

      return chai
        .request(app)
        .post('/api/notes')
        .send(newNote)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });
  });

  describe('PUT /api/notes/:id', function() {
    it('should update and return a note when provided valid inputs', function() {
      const updatedNote = {
        title: 'test updated note',
        content: 'work',
        tags: [
          '222222222222222222222200',
          '222222222222222222222201',
          '222222222222222222222202'
        ]
      };
      let data;
      return Note.findOne()
        .then(_data => {
          data = _data;
          return chai
            .request(app)
            .put(`/api/notes/${data.id}`)
            .send(updatedNote);
        })
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys(
            'id',
            'title',
            'content',
            'createdAt',
            'folderId',
            'updatedAt',
            'tags'
          );

          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(updatedNote.title);
          expect(res.body.content).to.equal(updatedNote.content);
        });
    });

    it('should return an error when updating a note with no title', function() {
      const updatedNote = {
        content: 'it really does not matter what i put here'
      };

      return chai
        .request(app)
        .put('/api/notes/000000000000000000000000')
        .send(updatedNote)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });
  });

  describe('DELETE /api/notes/:id', function() {
    it('should delete a note by id', function() {
      let data;
      return Note.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/notes/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
        });
    });
  });
});
