/**
 * Module Dependencies
 */

var CsvBuilder = require('csv-builder');

/**
 * Plugin
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

  schema.static('csvReadStream', function(data) {
    return builder.createReadStream(data);
  });

  schema.static('findAndStream', function(query) {
    return this.find(query).stream().pipe(builder.createTransformStream());
  });

  schema.static('csvTransformStream', function() {
    return builder.createTransformStream();
  });
};
