var connect = require('connect'),
    http = require('http'),
    socketio = require('socket.io'),
    twitter = require('ntwitter'),
    fs = require('fs'),
    keys = JSON.parse(fs.readFileSync('oath_keys.json')),
    twitter_streamer = new twitter(keys),
    stopwords = JSON.parse(fs.readFileSync('stopwords.json')),
    words = {};

stopword_obj = {};
stopwords.forEach(function (stopword) {
    stopword_obj[stopword] = true;
});

app = http.createServer(connect().use(connect.static('public')));
io = socketio.listen(app);

io.configure(function () {
    io.set("transports", ["websocket"]);
});

app.listen(process.env.PORT || 1337);

setInterval(function () {
    words = {};
}, 60000 * 5);

setInterval(function () {
    Object.keys(words).forEach(function (word) {
        words[word] -= Math.floor(Math.pow(Math.E, words[word] / 100));
        if (words[word] <= 0) {
            delete words[word];
        }
    });
}, 1000);

var sendWords = function (recipients) {
    var tmp = Object.keys(words).filter(function (word) {
        return words[word] > 1;
    }).map(function (word) {
        return {text: word, size: 10 + 5 * words[word]};
    }).sort(function (elt) {
        return elt.size;
    });
    recipients.emit('words', tmp.slice(tmp.lenght - 30, tmp.length));
};

setInterval(function () {
    sendWords(io.sockets);
}, 2000);

io.sockets.on('connection', function (socket) {
    sendWords(socket);
});

twitter_streamer.stream('statuses/filter', {track: ["the", "it", "I", "me", "will", "to", "in"]},  function (stream) {
    stream.on('data', function (data) {
        if (!data.text) {
            return;
        }
        data.text.split(' ').forEach(function (word) {
            var lowered = word.toLowerCase().replace(/^\s+|\.?\s+$/, '');
            //if (!(stopwords.indexOf(lowered) >= 0)) {
            if (lowered.length > 2 && !(lowered in stopword_obj)) {
                if (words[lowered]) {
                    words[lowered] += 1;
                } else {
                    words[lowered] = 1;
                }
            }
        });
    });
});
