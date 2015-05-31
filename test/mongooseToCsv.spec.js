var mongoose = require('mongoose');
var mongooseToCsv = require('../');
var TestStream = require('testable-stream');
var seeds = require('./users.json');
var fs = require('fs');
var EXPECTED = fs.readFileSync(__dirname + '/expected.csv').toString();
var EXPECTED_U_40 = fs.readFileSync(__dirname + '/expected_under_40.csv').toString()
var should = require('should');
var conn = mongoose.connect('mongodb://localhost/__mongoose_to_csv_test__');
var assert = require('assert');

var TestSchema = new mongoose.Schema({
  fullname: {type: String},
  email: {type: String},
  age: {type: Number},
  username: {type: String}
});

TestSchema.plugin(mongooseToCsv, {
  headers: 'Firstname Lastname Username Email Age',
  constraints: {
    'Username': 'username',
    'Email': 'email',
    'Age': 'age'
  },
  virtuals: {
    'Firstname': function(doc) {
      return doc.fullname.split(' ')[0];
    },
    'Lastname': function(doc) {
      return doc.fullname.split(' ')[1];
    }
  }
});

var Test = mongoose.model('Test', TestSchema);

describe('mongooseToCsv', function() {

  before(function(done) {
    Test.collection.insert(seeds, function(err, docs) {
      if (err) return done(err);
      done();
    });
  });

  after(function() {
    conn.connection.db.dropDatabase();
  });

  it('should create a readable stream from a query.', function(done) {
    Test.find({}, function(err, docs) {
      if (err) return done(err);
      Test.csvReadStream(docs)
        .pipe(TestStream())
        .on('testable', function(data) {
          data.toString().should.equal(EXPECTED);
          done();
        });
    });
  });

  it('should create a transorm stream.', function(done) {
    Test.find({}).stream()
      .pipe(Test.csvTransformStream())
      .pipe(TestStream())
      .on('testable', function(data) {
        data.toString().should.equal(EXPECTED);
        done();
      });
  });

  it('should create a stream from a query', function(done) {
    Test.findAndStreamCsv({
      'age': {$lt: 40}
    })
      .pipe(TestStream())
      .on('testable', function(data) {
        data.toString().should.equal(EXPECTED_U_40);
        done();
      });
  });

});
