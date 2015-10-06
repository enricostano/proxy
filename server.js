var express = require('express'),
    session = require('express-session'),
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express();

app.use(session({
  secret: 'hola'
}));

app.use(bodyParser.json());

app.post('/api/v1/login', function (req, res) {
  var options = {
    method: 'POST',
    uri: 'http://localhost:3000/api/v1/login',
    json: true,
    body: req.body
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      req.session.user_id = body.user_id;
      res.json(body);
    }
  });
});

app.use('/api/v1', function (req, res) {
  var options = {
    method: req.method,
    uri: 'http://localhost:3000/api/v1' + require('url').parse(req.url).path,
    json: true,
    body: req.body,
    headers: {
      'X-katuma-user-id': req.session.user_id
    }
  };

  request(options, function (error, response, body) {
    if (!error) {
      res.status(response.statusCode).send(body);
    }
  });
});

app.get('/hola', function (req, res) {
  var user_id = req.session.user_id;
  console.log('[HOLA] User id: ' + user_id);
  res.send('hola');
});

var server = app.listen(8000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});
