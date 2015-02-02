// mocha

/**
 * Module Dependencies
 */

var mongoose = require('mongoose')
  , mongooseToCsv = require('../')
  , assert = require('assert')
  , fs = require('fs');

/**
 * Test Schema
 */

var TestSchema = new mongoose.Schema({
	name: { type: String, default: '' },
	email: { type: String, default: '' },
	idNumber: { type: Number, default: '' }
});

var TestModel = mongoose.model('TestModel', TestSchema);


/**
 * Dumby Data
 */

var data = [
	{ name: 'Nick', email: 'pisacanen@gmail.com', idNumber: 1 },
	{ name: 'John', email: 'john@gmail.com', idNumber: 2 },
	{ name: 'Joe', email: 'joe@gmail.com', idNumber: 3 },
	{ name: 'Sally', email: 'sally@gmail.com', idNumber: 4 },
	{ name: 'Sarah', email: 'sarah@gmail.com', idNumber: 5 },
	{ name: 'Smith', email: 'smith@gmail.com', idNumber: 6 },
	{ name: 'Josh', email: 'josh@gmail.com', idNumber: 7 },
	{ name: 'John', email: 'john@gmail.com', idNumber: 8 },
	{ name: 'Mike', email: 'mike@gmail.com', idNumber: 9 },
	{ name: 'Tammy', email: 'tammy@gmail.com', idNumber: 10 },
	{ name: 'Wendy', email: 'wendy@gmail.com', idNumber: 11 }
];

var expected = [
	'Name, Email, BadgeNumber\n',
	'Nick, pisacanen@gmail.com, 1\n',
	'John, john@gmail.com, 2\n',
	'Joe, joe@gmail.com, 3\n',
	'Sally, sally@gmail.com, 4\n',
	'Sarah, sarah@gmail.com, 5\n',
	'Smith, smith@gmail.com, 6\n',
	'Josh, josh@gmail.com, 7\n',
	'John, john@gmail.com, 8\n',
	'Mike, mike@gmail.com, 9\n',
	'Tammy, tammy@gmail.com, 10\n',
	'Wendy, wendy@gmail.com, 11\n'
].join('');

describe('Mongoose To Csv', function () {
	it('should create a csv file with custom headers', function (done) {
		mongooseToCsv()
			.filename('test.csv')
			.model(TestModel)
			.data(data)
			.exclude('_id')
			.order('name email idNumber')
			.use(function (p) {
				return (p.slice(0, 1).toUpperCase() + p.slice(1));
			})
			.use({
				'IdNumber': 'BadgeNumber'
			})
			.run()
			.on('finish', function () {
				fs.readFile(__dirname + '/test.csv', function (err, data) {
					if (err) {
						return done(err);
					}
					data = String(data);
					assert.equal(expected);
					done();
				})
			});
	});
});