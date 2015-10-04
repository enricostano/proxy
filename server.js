var express = require('express'),
    httpProxy = require('express-http-proxy'),
    session = require('express-session'),
    app = express();

app.use(session({
  secret: 'hola'
}));

app.use('/api/v1', httpProxy('http://10.0.3.133', {
  port: 3000,
  forwardPath: function (req, res) {
    var original_path = require('url').parse(req.url).path
    return '/api/v1' + original_path;
  },
  intercept: function (rsp, data, req, res, callback) {
    data = JSON.parse(data.toString('utf8'));
    req.session.user_id = data.user_id;
    callback(null, JSON.stringify(data));
  },
  decorateRequest: function (req) {
    if (req.session.user_id) {
      req.headers['X-katuma-user-id'] = req.session.user_id;
    }
    console.log(req.headers);
    return req;
  },
  preserveReqSession: true
}));

app.get('/hola', function (req, res) {
  var user_id = req.session.user_id;
  console.log('[HOLA] User id: ' + user_id);
  res.send('hola');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});
