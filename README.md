# MongooseToCsv
Export mongoose queries in csv format. The headers will be, the properties of your mongoose schema, while
giving you the ability to transform and order them as you wish.

```bash
	$ npm install mongoose-to-csv
```
## MongooseToCsv([options]) 
	* model Mongoose Model, See model method
	* filename String, See filename method
	* exclude String, See exclude method
	* data Array, See data method
	* order String, See order method

	```js
		var mongooseToCsv = require('mongoose-to-csv');
		mongooseToCsv(/* options */)
		// OR
		var mongooseToCsv = new require('mongoose-to-csv').MongooseToCsv(/* options */);
	```
## Methods
* <h3> MongooseToCsv#model(model)</h3>
	* model Mongoose Model
* <h3>MongooseToCsv#data(data)</h3>
	* data Array Mongoose query
* <h3>MongooseToCsv#filename(filename)
	* filename String Csv filename
* <h3>MongooseToCsv#order(order)
	* order String Space separated list of properties of the schema, this will be the order for the headers of the csv files
* <h3>MongooseToCsv#exclude(excludes)
	* excludes String Space separated list of properties to eclude from the csv file.
* <h3>MongooseToCsv#use(transformer)
	* transformer Object|Function
	If the `transformer` is an Object, it should be a one to one correspondence
	Example
	```js
		// property : header
		{	
			'firstname': 'User FirstName'
		}
	```
	If function, then it should be a one to all transformative function, that takes a single property as an argument.
* <h3>MongooseToCsv#run()
	* returns a WritableStream
## Example
```js

	MyModel.find({}, function (err, doc) {
		// handler err
		mongooseToCsv()
			.filename('export.csv')
			.model(MyModel)
			.exclude('_id')
			.order('name email phone street')
			.use(function (prop) {
				return (prop.slice(0, 1).toUpperCase() + prop.slice(1))
			})
			.run()
			.on('finish', function () {
				// export to csv is ready
			});
	});
```