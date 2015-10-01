var express = require('express'),
    httpProxy = require('express-http-proxy'),
    session = require('express-session'),
    app = express();

app.use(session({
  secret: 'hola'
}));

app.use('/api/v1', httpProxy('http://10.0.3.70', {
  forwardPath: function(req, res) {
    console.log('[proxy]');
    var original_path = require('url').parse(req.url).path
    return '/api/v1' + original_path;
  },
  intercept: function(rsp, data, req, res, callback) {
    data = JSON.parse(data.toString('utf8'));
    req.session.user_id = data.user_id;

    callback(null, JSON.stringify(data));
  },
  port: 3000
}));

app.get('/hola', function (req, res) {
  var user_id = req.session.user_id;
  console.log('[PROXY] User id: ' + user_id);
  res.send('hola');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});
