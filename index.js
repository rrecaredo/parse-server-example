// Example express application adding the parse-server module to expose Parse
// compatible API routes.

const express = require('express');
const path = require('path');
// const { Client } = require('pg')
// const client = new Client(process.env.DATABASE_URL);

const databaseUri = process.env.DATABASE_URL || 'postgres://postgres:12345@localhost:5432/rrecaredo';

console.log('Database URL', databaseUri);
console.log('Server URL', process.env.SERVER_URL);

const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize(databaseUri, { dialect: 'postgres' });

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

// (async () => {
// const createTableQuery = `
// CREATE TABLE IF NOT EXISTS users (
//     email varchar,
//     firstName varchar,
//     lastName varchar,
//     age int
// );
// `;

// const insertQuery = `INSERT INTO users(email, firstName, lastName, age) VALUES('mary@ann.com', 'Mary Ann', 'Wilters', 20)`;

// try {
//   client.connect();
//   await client.query(createTableQuery);
//   await client.query(insertQuery);
//   console.log('All OK');
// } catch (err) {
//   console.log('Table is not created');
//   console.log(err.stack);
// } finally {
//   client.end();
// }
// })();


const app = express();

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
