// Example express application adding the parse-server module to expose Parse
// compatible API routes.

const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');

const path = require('path');
// const { Client } = require('pg')
// const client = new Client(process.env.DATABASE_URL);

const databaseUri = process.env.DATABASE_URL || 'postgres://postgres:12345@localhost:5432/rrecaredo';

console.log('Database URL', databaseUri);
console.log('Server URL', process.env.SERVER_URL);

const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize(databaseUri, { dialect: 'postgres' });
const service = require('feathers-sequelize');

class Something extends Model {};

Something.init({
  username: DataTypes.STRING,
  birthday: DataTypes.DATE
}, { sequelize, modelName: 'something' });

sequelize.sync()
  .then(() => Something.create({
    username: 'janedoe',
    birthday: new Date(1980, 6, 20)
  }))
  .then(jane => {
    console.log(jane.toJSON());
  });

const app = express(feathers());

app.use('something', service({ Model: Something }));

app.service('something').on('created', message => {
  console.log('A new message has been created', message);
});

const main = async () => {
  // Create a new message on our message service
  await app.service('something').create({
    username: 'aaa',
    birthday: new Date(1980, 6, 20)
  });

  // Find all existing messages
  const messages = await app.service('something').find();

  console.log('All messages', messages);
};

(async () => {
  try {
    await main();
  } catch (error) {
    console.log('oh no error', error)
  }
})();


app.use('/public', express.static(path.join(__dirname, '/public')));

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

app.get('/env', function (req, res) {
  res.json({ env: process.env });
});

app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);

httpServer.listen(port, function () {
  console.log('example running on port ' + port + '.');
});
