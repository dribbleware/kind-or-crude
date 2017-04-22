var app = require('http').createServer(handler),
    io = require('socket.io')(app),
    fs = require('fs'),
    path = require('path'),
    twitter = require('twitter'),
    keys = require('./keys');

app.listen(1337);

var contentTypesByExtention = {
  'html': 'text/html',
  'js':   'text/javascript',
  'css':  'text/css'
};


function handler (req, res) {

  var filePath = req.url;

  if(filePath == '/') {
    filePath = './' + 'index.html';
  } else {
    filePath = './' + req.url;
  }

  var ext = path.extname(filePath || '').split('.').pop();
  var contentType = contentTypesByExtention[ext] || 'text/plain';

  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(500);
      res.end('Error loading file...');
    } else {
      res.writeHead(200, {'Content-Type': contentType});
      res.end(data);
    }
  });

}

var twit = new twitter({
  consumer_key: keys.consumer_key,
  consumer_secret: keys.consumer_secret,
  access_token_key: keys.access_token_key,
  access_token_secret: keys.access_token_secret
});

var tweet = io.of('tweet');

var goodWords = ['love', 'happy', 'beautiful'];
var badWords = ['fuck', 'shit', 'bitch'];
var words = goodWords.concat(badWords);

var stream = twit.stream('statuses/filter', { track: words.join() });

stream.on('error', function (error) {
  io.sockets.emit('error', error);
});

stream.on('limit', function (msg) {
  console.log("Limit : " + JSON.stringify(msg));
});

stream.on('data', function (data) {
  if (data.text) {
    var code = wordsMap(data.text.toLowerCase());

    if (code) {
      io.sockets.emit('code', code);
      console.log(code, data.text);
    }
  }

});

var wordsMap = function (tweet) {
  for (var i = 0; i < words.length; i++) {
    if (tweet.includes(words[i])) {
      return i + 1;  // Avoid sending zero.
    }
  }
  return false;
}
