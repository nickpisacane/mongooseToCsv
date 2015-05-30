var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/csvtest');
var mongooseToCsv = require('../');
var fs = require('fs');

var TestSchema = new mongoose.Schema({
  name: {
    type: String
  },
  age: {
    type: Number
  }
});

TestSchema.plugin(mongooseToCsv, {
  headers: 'Firstname Lastname Age',
  constraints: {
    'Age': 'age'
  },
  virtuals: {
    'Firstname': function(doc) {
      return doc.name.split(' ')[0];
    },
    'Lastname': function(doc) {
      return doc.name.split(' ')[1];
    }
  }
});

var Test = mongoose.model('users', TestSchema);

Test.findAndStream({}).pipe(fs.createWriteStream('test.csv'));
