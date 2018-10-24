'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const Note = require('../models/note');
const { note } = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);
