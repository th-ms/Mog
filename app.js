const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const index = require('./routes/index');
const ytdl = require('ytdl-core');
const youtube = require('scrape-youtube').default;

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/static'));

app.use('/', index);

var uri = 'https://www.youtube.com/watch?v=VH8RoWfklg4';
app.get('/y2/', (req, res, next) => {
  try {
      const video = ytdl(uri, {filter: 'audioonly', quality: 'lowest'}).pipe(res);
  } catch (exception) {
      res.status(500).send(exception)
  }
})

app.get('/play', (req, res, next) => {
  try {
      var url = 'https://www.youtube.com/watch?v='+req.query.id;
      const video = ytdl(url, {filter: 'audioonly', quality: 'lowest'}).pipe(res);
  } catch (exception) {
      res.status(500).send(exception)
  }
})

app.post('/changeSong', (req, res, next) => {
  id = req.body.id;
  uri = "https://www.youtube.com/watch?v=" + id;
  res.status(200).send('Done')
})

app.post('/search', (req, res, next) => {
  query = req.body.query;
  youtube.search(query).then(results => {
    res.send(results.videos)
  });
})

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
})

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  })
})

const server = app.listen(3000, () => console.log(`Express server listening on port 3000`));