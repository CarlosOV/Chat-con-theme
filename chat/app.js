var port = process.env.PORT || 3000;

var express = require("express"), 
http = require("http"),
app = express(),
server = http.createServer(app),
path = require('path');
var engines = require('consolidate');

 
app.use(express.static(path.join(__dirname, 'public')));
 
app.set("views",__dirname + "/views");
app.engine('html', engines.mustache);
app.set('view engine', 'html');

  app.use(express.static(__dirname));

 
app.get("/", function(req,res){
  res.render("index.html");
});

 
server.listen(port);
 
//objecto para guardar en la sesión del socket a los que se vayan conectando
var usuariosOnline = {};
 
var io = require("socket.io").listen(server);
 
//al conectar un usuario||socket, este evento viene predefinido por socketio
io.sockets.on('connection', function(socket) 
{
  //cuando el usuario conecta al chat comprobamos si está logueado
  //el parámetro es la sesión login almacenada con sessionStorage
  socket.on("loginUser", function(username)
  {
    //si existe el nombre de usuario en el chat
    if(usuariosOnline[username])
    {
      socket.emit("userInUse");
      return;
    }
    //Guardamos el nombre de usuario en la sesión del socket para este cliente
    socket.username = username;
    //añadimos al usuario a la lista global donde almacenamos usuarios
    usuariosOnline[username] = socket.username;
    //mostramos al cliente como que se ha conectado
    socket.emit("refreshChat", "yo", "Bienvenido " + socket.username + ", te has conectado correctamente.");
    //mostramos de forma global a todos los usuarios que un usuario
    //se acaba de conectar al chat
    socket.broadcast.emit("refreshChat", "conectado", "El usuario " + socket.username + " se ha conectado al chat.");
    //actualizamos la lista de usuarios en el chat del lado del cliente
    io.sockets.emit("updateSidebarUsers", usuariosOnline);
  });
 
  //cuando un usuario envia un nuevo mensaje, el parámetro es el 
  //mensaje que ha escrito en la caja de texto
  socket.on('addNewMessage', function(message) 
  {
    //pasamos un parámetro, que es el mensaje que ha escrito en el chat, 
    //ésto lo hacemos cuando el usuario pulsa el botón de enviar un nuevo mensaje al chat
 
    //con socket.emit, el mensaje es para mi
    socket.emit("refreshChat", "msg-yo", "Yo : " + message + ".");
    //con socket.broadcast.emit, es para el resto de usuarios
    socket.broadcast.emit("refreshChat", "msg", socket.username + " dice: " + message + ".");
  });
 
  //cuando el usuario cierra o actualiza el navegador
  socket.on("disconnect", function()
  {
    //si el usuario, por ejemplo, sin estar logueado refresca la
    //página, el typeof del socket username es undefined, y el mensaje sería 
    //El usuario undefined se ha desconectado del chat, con ésto lo evitamos
    if(typeof(socket.username) == "undefined")
    {
      return;
    }
    //en otro caso, eliminamos al usuario
    delete usuariosOnline[socket.username];
    //actualizamos la lista de usuarios en el chat, zona cliente
    io.sockets.emit("updateSidebarUsers", usuariosOnline);
    //emitimos el mensaje global a todos los que están conectados con broadcasts
    socket.broadcast.emit("refreshChat", "desconectado", "El usuario " + socket.username + " se ha desconectado del chat.");
  });
});
























































/*var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
*/