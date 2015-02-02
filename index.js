/**
 * Module Dependencies
 */

var _ = require('lodash')
 , fs = require('fs');

/**
 * Expose
 */

module.exports = function (o){ return new MongooseToCsv(o); };
module.exports.MongooseToCsv = MongooseToCsv;

/**
 * Constructor
 */

function MongooseToCsv (options) {
	this._transformers = [];
	if (options) {
		if (options.model)    this._model = new options.model({});
		if (options.filename) this._filename = options.filename;
		if (options.exclude)  this._exclude = exclude;
		if (options.data)     this._data = data;
		if (options.order)    this._order = options.order;
	}
	return this;
};

/**
 * Set Filename
 *
 * @param {String} filename
 */

MongooseToCsv.prototype.filename = function(f){this._filename = f;return this;};

/**
 * Set Excludes
 *
 * @param {String} excludes Space separated list of fields to exclude from  csv
 */

MongooseToCsv.prototype.exclude = function(e){this._exclude = e;return this;};

/**
 * Set Data
 *
 * @param {Array} data Mongoose query
 */

MongooseToCsv.prototype.data = function(d){this._data = d;return this;};

/**
 * Set Order
 *
 * @param {String} order Space separated list of properties of the schema, this will be the order for the headers of the csv files
 * @note This should be a correspondence to the properties of the mongoose schema, not what the headers 
 * 			 will be transformed to.
 */

MongooseToCsv.prototype.order = function(o){this._order = o;return this;};

/**
 * Set Model
 *
 * @param {Object} model Mongoose model
 */

MongooseToCsv.prototype.model = function (model) {
	this._model = new model({});
	return this;
};

/**
 * Transform headers
 * @param {Object|Function}
 *
 * @use {Object} should be a one to one correspondence
 * ###Ex {
 *  'firstname': 'User Firstname'
 *  'lastname' : 'User Lastname'
 * }
 *
 * @use {Function} should be a one to all transformation
 * ###Ex
 * mCsv.use(function (field) {
 * 		// uppercase first
 *    return (field.slice(0, 1).toUpperCase() + field.slice(1));
 * })
 * @api public
 */

MongooseToCsv.prototype.use = function (transformer) {
	if (_.isPlainObject(transformer) || _.isFunction(transformer)) {
		this._transformers.push(transformer);
	} 
	return this;
};

/**
 * Create the csv stream
 *
 * @param {Object|Function} [options = {}] Any valid options for `fs.createWriteStream`
 *
 * @return {Stream}
 * ###Ex
 * mongooseToCsv()
 * 		.filename('my.csv')
 * 		.model(MyModel)
 * 		.data(myQuery)
 *    .run()
 * 		.on('finish', function() {
 *			// done
 *    })
 */

MongooseToCsv.prototype.run = function (options) {
	options = (options || {});
	if (!this._filename || !this._data || !this._model) {
		throw new Error('Must have model, filename and data to run');
	}

	if (!_.isString(this._filename)) throw new TypeError('Filename must be of String type');
	if (!_.isArray(this._data)) throw new TypeError('Data must be of Array type');

	var headersMap = this._createHeaders()
	  , headers = headersMap.map(function (obj){return obj.header;}).join(', ');

	var stream = fs.createWriteStream(this._filename, options);
	stream.write(headers+'\n');
	this._data.forEach(function (obj) {
		stream.write(objToRow(headersMap, obj)+'\n');
	});
	stream.end('');
	return stream;
};

/**
 * Create the headers Obj
 *
 * @api private
 * @return Array<Object> 
 * @format { actual, header }
 * 	 where actual is the mongoose schema property,
 *	 and header is the csv header that values of the `actual` property will correspond to.
 */

MongooseToCsv.prototype._createHeaders = function () {
	var model = this._model
		, transformers = this._transformers
	  , keys, excludes, headers;

	if (this._exclude) {
		excludes = this._exclude.split(' ');
		keys = mongooseKeys(model).filter(function (key) {
			var i = excludes.length;
			while (i--) {
				if (key === excludes[i]) {
					return false;
				}
			}
			return true;
		});
	}

	headers = keys.map(function (key) {
		return {
			actual: key,
			header: useTransformers(transformers, key)
		};
	});

	return _.isUndefined(this._order)
		? headers
		: orderHeaders(this._order, headers);
};

/**
 * Helpers
 */

/**
 * Transformer
 */

function useTransformers (transformers, key) {
	transformers.forEach(function (transformer) {
		key = handleTransformer(transformer, key);
	});
	return key;

	// handle obj transformer
	function handleObj (objTransformer, key) {
		_.each(objTransformer, function (val, prop) {
			if (key === prop) key = val;
		});
		return key;
	}

	// handle transformer
	function handleTransformer (transformer, key) {
		if (_.isPlainObject(transformer)) {
			return handleObj(transformer, key);
		} else if (_.isFunction(transformer)) {
			return transformer(key);
		}
	}
}

/**
 * Object to csv row
 */

function objToRow(headersMap, data) {
	var arr = [];
	_.each(headersMap, function (obj) {
		if (data[obj.actual]) {
			arr.push(data[obj.actual]);
		} else {
			arr.push('');
		}
	});
	return arr.join(', ');
}

/**
 * Order headersMap
 * orders should be keys of the object, not headers after transformation
 * and One to One correspondence
 *
 */

function orderHeaders (orderString, headersMap) {
	var arr = orderString.split(' ')
	  , len = arr.length
	  , ret = new Array(len);
	if (headersMap.length !== len) {
		throw new Error('Order and headers do not correspond!');
	}
	for (var i = 0; i < len; i++) {
		var j = headersMap.length;
		while (j--) {
			if (headersMap[j].actual === arr[i]) {
				ret[i] = headersMap[j];
				break;
			}
		}
	}
	return ret;
}

/**
 * Object keys for mongoose Doc
 */

function mongooseKeys (doc) {
	if (doc._doc) {
		return Object.keys(doc._doc);
	}
}