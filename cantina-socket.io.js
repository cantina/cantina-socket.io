var socketio = require('socket.io');

module.exports = function (app) {
  var conf = app.conf.get('socket.io');

  if (!app.server || !app.server.listen) {
    throw new Error('No valid server found on app.server');
  }

  // Expose oil api.
  app.io = socketio(app.server, conf);

  // Add useful hooks and events.
  app.server.once('listening', function () {
    app.io.use(function socketIOHandshake (socket, next) {
      app.hook('io:handshake').run(socket, function (err) {
        if (err) return next(err);
        next();
      });
    });
    app.io.on('connection', function (socket) {
      app.emit('io:connected', socket);
      socket.once('disconnect', function () {
        app.emit('io:disconnected', socket);
      });
    });
    app.emit('io:listening');
  });
};
