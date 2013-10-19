var connect = require('connect'),
    http = require('http'),
    socketio = require('socket.io'),
    twitter = require('ntwitter'),
    twitter_streamer = new twitter({
        consumer_key: '',       //replace
        consumer_secret: '',    //with
        access_token_key: '',   //your
        access_token_secret: '' //own
    }),
    stopwords = ['a','able','about','across','after','all','almost','also','am','among','an','and','any','are','as','at','be','because','been','but','by','can','cannot','could','dear','did','do','does','either','else','ever','every','for','from','get','got','had','has','have','he','her','hers','him','his','how','however','i','if','in','into','is','it','its','just','least','let','like','likely','may','me','might','most','must','my','neither','no','nor','not','of','off','often','on','only','or','other','our','own','rather','said','say','says','she','should','since','so','some','than','that','the','their','them','then','there','these','they','this','tis','to','too','twas','us','wants','was','we','were','what','when','where','which','while','who','whom','why','will','with','would','yet','you','your', '', '@', 'don\'t', '&amp;', 'rt', 'know', 'i\'m', 'que', 'i\'m', 'un', 'una', 'unas', 'unos', 'uno', 'sobre', 'todo', 'también', 'tras', 'otro', 'algún', 'alguno', 'alguna', 'algunos', 'algunas', 'ser', 'es', 'soy', 'eres', 'somos', 'sois', 'estoy', 'esta', 'estamos', 'estais', 'estan', 'como', 'en', 'para', 'atras', 'porque', 'por', 'qué', 'que', 'estado', 'estaba', 'ante', 'antes', 'siendo', 'ambos', 'pero', 'por', 'poder', 'puede', 'puedo', 'podemos', 'podeis', 'pueden', 'fui', 'fue', 'fuimos', 'fueron', 'hacer', 'hago', 'hace', 'hacemos', 'haceis', 'hacen', 'cada', 'fin', 'incluso', 'primero', 'desde', 'conseguir', 'consigo', 'consigue', 'consigues', 'conseguimos', 'consiguen', 'ir', 'voy', 'va', 'vamos', 'vais', 'van', 'vaya', 'gueno', 'ha', 'tener', 'tengo', 'tiene', 'tenemos', 'teneis', 'tienen', 'el', 'la', 'lo', 'las', 'los', 'su', 'aqui', 'mio', 'tuyo', 'ellos', 'ellas', 'nos', 'nosotros', 'vosotros', 'vosotras', 'si', 'dentro', 'solo', 'solamente', 'saber', 'sabes', 'sabe', 'sabemos', 'sabeis', 'saben', 'ultimo', 'largo', 'bastante', 'haces', 'muchos', 'aquellos', 'aquellas', 'sus', 'entonces', 'tiempo', 'verdad', 'verdadero', 'verdadera', 'cierto', 'ciertos', 'cierta', 'ciertas', 'intentar', 'intento', 'intenta', 'intentas', 'intentamos', 'intentais', 'intentan', 'dos', 'bajo', 'arriba', 'encima', 'usar', 'uso', 'usas', 'usa', 'usamos', 'usais', 'usan', 'emplear', 'empleo', 'empleas', 'emplean', 'ampleamos', 'empleais', 'valor', 'muy', 'era', 'eras', 'eramos', 'eran', 'modo', 'bien', 'cual', 'cuando', 'donde', 'mientras', 'quien', 'con', 'entre', 'sin', 'trabajo', 'trabajar', 'trabajas', 'trabaja', 'trabajamos', 'trabajais', 'trabajan', 'podria', 'podrias', 'podriamos', 'podrian', 'podriais', 'yo', 'aquel', 'de', 'it\'s', 'you\'re']
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
    Object.keys(words).forEach(function (word) {
        words[word] -= Math.floor(Math.pow(Math.E, words[word] / 100));
        if (words[word] <= 0) {
            delete words[word];
        }
    });
}, 1000);

setInterval(function () {
        var blah = Object.keys(words).filter(function (word) {
        return words[word] > 1;
    }).map(function (word) {
        return {text: word, size: 10 + 5 * words[word]};
    });
    io.sockets.emit('words', blah);
}, 2000);

//twitter_streamer.stream('statuses/filter', //{track: ["pokemon"]}, function (stream) {
//        {locations: ["-74,40,-73,41"]/*["-122.75,36.8","-121.75,37.8"]*/}, function (stream) {
twitter_streamer.stream('statuses/filter', {track: ["the", "it", "I", "me", "will", "to", "in"]},  function (stream) {
    stream.on('data', function (data) {
        data.text.split(' ').forEach(function (word) {
            var lowered = word.toLowerCase().replace(/^\s+|\.?\s+$/, '');
            //if (!(stopwords.indexOf(lowered) >= 0)) {
            if (!(lowered in stopword_obj)) {
                if (words[lowered]) {
                    words[lowered] += 1;
                } else {
                    words[lowered] = 1;
                }
            }
        });
    });
});
