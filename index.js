// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

// var databaseUri = process.env.DATABASE_URL || process.env.MONGODB_URI;

var api = new ParseServer({
  databaseURI: databaseUri,
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '',
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',
  liveQuery: {
    classNames: ["Posts", "Comments", "GameScore"]
  }
});

var app = express();

app.use('/public', express.static(path.join(__dirname, '/public')));

var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

app.get("/save", async (req, res) => {
  try {
    var GameScore = Parse.Object.extend("GameScore");
    var gameScore = new GameScore();

    gameScore.set("score", 1337);
    gameScore.set("playerName", "Sean Plott 12345");
    gameScore.set("cheatMode", false);
    gameScore.set("skills", ["pwnage", "flying"]);

    gameScore.save().then((gameScore) => {
      console.log(gameScore);
    });

    res.status(200).json({ a: 1 });

  } catch (error) {
    res.status(500).send(error);
  }
});

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

app.get('/env', function(req, res) {
  res.json({ env: process.env });
});

app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);

httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
