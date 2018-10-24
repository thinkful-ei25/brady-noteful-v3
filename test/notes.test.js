'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const Note = require('../models/note');
const { notes } = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful API Resources', function() {
  before(function() {
    console.log(TEST_MONGODB_URI);
    return mongoose
      .connect(
        TEST_MONGODB_URI,
        { useNewUrlParser: true }
      )
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return Note.insertMany(notes);
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('GET Endpoint', function() {
    it('should return all existing notes', function() {
      let res;
      return chai
        .request(app)
        .get('/api/notes')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length.of.at.least(1);
          return Note.countDocuments();
        })
        .then(function(count) {
          expect(res.body).to.have.length(count);
        });
    });

    it('should return all notes matching the search term', function() {
      let searchTerm = 'about cats';
      return chai
        .request(app)
        .get('/api/notes?searchTerm=' + searchTerm)
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(3);
          expect(res.body[0]).to.be.an('object');
        });
    });
  });

  describe('GET By ID Endpoint', function() {
    it('should return only one note with the same ID', function() {
      let data;

      return Note.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys(
            '__v',
            '_id',
            'title',
            'content',
            'createdAt',
            'updatedAt'
          );
          expect(res.body._id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  describe('PUT Endpoint', function() {
    it('should only be allowed to update Title and Content', function() {});

    it('should return the updated item with the id', function() {});
  });

  describe('POST Endpoint', function() {
    it('should return a new note after being created', function() {
      const newItem = {
        title: 'fun new title',
        content: 'new content as well'
      };

      let res;

      return chai
        .request(app)
        .post('/api/notes/')
        .send(newItem)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys(
            '_id',
            '__v',
            'title',
            'content',
            'createdAt',
            'updatedAt'
          );
          return Note.findById(res.body._id);
        })
        .then(data => {
          expect(res.body._id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should return a status 400 if no title is included', function() {
      const newItem = {
        content: 'new content as well'
      };

      let res;

      return chai
        .request(app)
        .post('/api/notes/')
        .send(newItem)
        .then(function(_res) {
          res = _res;
          console.log(res);
          expect(res).to.have.status(400);
          expect(res.body._id).to.equal(undefined);
          // return Note.findById(res.body._id);
        });
    });
  });

  // // Delete Endpoint Test
  // // The item should no longer be in the database

  // describe('DELETE Endpoint', function() {
  //   it('should remove the item from the database', function() {

  //   });

  // });
});
