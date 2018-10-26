'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');

const { notes, folders } = require('../db/seed/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful API Folder Tests', function () {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true });
  });

  beforeEach(function () {
    return Folder.insertMany(folders)
      .then(() => Folder.createIndexes());
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET /api/folders', function () {

    it('should return the correct # of Folders', function () {

      const dbPromise = Folder.find();
      const apiPromise = chai.request(app).get('/api/folders');

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });

    });

    it('should return all correct fields', function () {

      const dbPromise = Folder.find();
      const apiPromise = chai.request(app).get('/api/folders');

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item) {
            expect(item).to.be.a('object');
            expect(item).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          });
        });

    });

  });

  describe('GET /api/folders/:id', function () {

    it('should return a correct folder for a given id', function () {
      let data;
      return Folder.findOne().select('id name')
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/folders/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
        });
    });


    it('should respond with a 404 for a non-existent id', function () {

      const unrealId = 'A0A0A0000000000000000100';
      return chai.request(app)
        .get(`/api/notes/${unrealId}`)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
        });

    });


  });

  describe('POST /api/folders', function () {

    it('should create and return a new folder when provided valid inputs', function () {

      const newFolder = { 'name': 'testFolder' };

      let res;
      return chai.request(app)
        .post('/api/folders')
        .send(newFolder)
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res).to.have.header('location');
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          return Folder.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.name).to.equal(data.name);
        });

    });

    it('should return an error when posting a new folder with a duplicate name', function () {

      const newFolder = { 'name': 'Archive' };

      return chai.request(app)
        .post('/api/folders')
        .send(newFolder)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('The folder name already exists');
        });

    });

  });

  describe('PUT /api/folders/:id', function () {

    it('should update and return a folder when provided valid inputs', function () {

      const updatedFolder = { 'name': 'updated' };

      let data;
      return Folder.findOne().select('id name')
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/folders/${data.id}`)
            .send(updatedFolder);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'name');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(updatedFolder.name);
        });

    });

    it('should respond with a 404 for a non-existent id', function () {

      const unrealId = 'A0A0A0000000000000000100';
      const updatedFolder = { 'name': 'updated' };

      return chai.request(app)
        .post(`/api/notes/${unrealId}`)
        .send(updatedFolder)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
        });

    });



  });

  describe('DELETE /api/folders/:id', function () {

    it('should delete a folder by id', function () {
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/folders/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
        });
    });


  });


});