const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.configure(express.rest());
app.configure(socketio());

app.use('/something', service({ Model: Something }));
app.use(express.errorHandler());

app.on('connection', connection =>
  app.channel('everybody').join(connection)
);

app.publish(data => app.channel('everybody'));

app.get('/csomething', async (req, res) => {
  try {

    await app.service('something').create({
      username: 'ccc',
      birthday: new Date(1980, 6, 20)
    });

    // Find all existing messages
    const messages = await app.service('something').find();

    console.log('All messages', messages);
  } catch (error) {
    console.log('error noooo', error)
  }

  res.json({ ok: true })
});

var port = process.env.PORT || 1337;
app.listen(port).on('listening', () =>
  console.log('Feathers server listening on localhost:3030')
);

app.service('something').create({
  text: 'Hello world from the server'
});
