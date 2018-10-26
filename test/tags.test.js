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

describe('Noteful API Tags Tests', function() {
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
    return Promise.all([
      noteInsertPromise,
      folderInsertPromise,
      tagsInsertPromise
    ]);
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('GET /api/tags', function() {
    it('should return the correct # of tags', function() {
      const dbPromise = Folder.find();
      const apiPromise = chai.request(app).get('/api/tags');
      return Promise.all([dbPromise, apiPromise]).then(([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(data.length);
      });
    });
  });

  it('should return all correct fields', function() {
    const dbPromise = Folder.find();
    const apiPromise = chai.request(app).get('/api/tags');

    return Promise.all([dbPromise, apiPromise]).then(([data, res]) => {
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res.body).to.be.a('array');
      expect(res.body).to.have.length(data.length);
      res.body.forEach(function(item) {
        expect(item).to.be.a('object');
        expect(item).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
      });
    });
  });

  describe('GET /api/tags/:id', function() {
    it('should return a correct tag for a given id', function() {
      let data;
      return Tag.findOne()
        .select('id name')
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/tags/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
        });
    });

    it('should respond with a 400 for a non-valid id', function() {
      const wrongId = '0HELLOIMNOTREAL0';
      return chai
        .request(app)
        .get(`/api/tags/${wrongId}`)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });

  describe('POST /api/tags', function() {
    it('should create and return a new tag when provided valid inputs', function() {
      const newTag = { name: 'newTestTag' };

      let res;
      return chai
        .request(app)
        .post('/api/tags')
        .send(newTag)
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res).to.have.header('location');
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          return Tag.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.name).to.equal(data.name);
        });
    });

    describe('PUT /api/tags/:id', function() {
      it('should update and return a tag when provided valid inputs', function() {
        const updatedTag = { name: 'updatedTag' };

        let data;
        return Tag.findOne()
          .select('id name')
          .then(_data => {
            data = _data;
            return chai
              .request(app)
              .put(`/api/tags/${data.id}`)
              .send(updatedTag);
          })
          .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys('id', 'name');

            expect(res.body.id).to.equal(data.id);
            expect(res.body.name).to.equal(updatedTag.name);
          });
      });

      it('should respond with a 404 for a non-existent id', function() {
        const falseId = 'AbAbAb000000000000000100';
        const updatedTag = { name: 'updatedTag' };

        return chai
          .request(app)
          .post(`/api/tags/${falseId}`)
          .send(updatedTag)
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(404);
          });
      });
    });

    describe('DELETE /api/tags/:id', function() {
      it('should delete a tag by id', function() {
        let data;
        return Folder.findOne()
          .then(_data => {
            data = _data;
            return chai.request(app).delete(`/api/tags/${data.id}`);
          })
          .then(res => {
            expect(res).to.have.status(204);
          });
      });
    });
  });

});
