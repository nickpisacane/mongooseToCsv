/**
 * Module Dependencies
 */

var CsvBuilder = require('csv-builder');

/**
 * Create csv streams from a mongoose schema
 * @param {mongoose.Schema} schema
 * @param {Object} options CsvBuilder options
 * @param {String|Array} options.headers Space separated headers, or array of headers
 * @param {String} [options.delimiter = ','] Value delimiter for csv data
 * @param {String} [options.terminator = '\n'] Line terminator for csv data
 * @param {Object} options.constraints {"header": "prop"}
 * @param {Object} options.virtuals Virtual properties.
 */

module.exports = function mongooseToCsv(schema, options) {
  // need options.headers
  if (!options.headers) throw new Error('MongooseToCsv requires the `headers` option');
  var builder = new CsvBuilder(options);
  if (options.virtuals) {
    for (var v in options.virtuals) {
      builder.virtual(v, options.virtuals[v]);
    }
  }

  /**
   * Static Method `csvReadStream`
   * @param {Array<Documents>} docs Array of mongoose documents
   * @return {Stream} Csv read stream.
   */

  schema.static('csvReadStream', function(docs) {
    if (!docs) {
      throw new Error('[Model].csvReadStream requires an array of documents.');
    }
    var data = docs.map(function(obj) {
      return obj._doc;
    });
    return builder.createReadStream(data);
  });

  /**
   * Create a Csv stream from a query Object.
   * @param {Object} query Mongoose query
   * @return {Stream} Csv transform stream
   */

  schema.static('findAndStreamCsv', function(query) {
    query = query || {};
    return this.find(query).stream().pipe(builder.createTransformStream());
  });

  /**
   * Create a transform stream
   * @return {Stream} transform stream
   */

  schema.static('csvTransformStream', function() {
    return builder.createTransformStream();
  });
};
