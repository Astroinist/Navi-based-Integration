
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , index = require('./routes/mainIndex')
  , navi = require('./routes/mainNavi')
  , http = require('http')
  , socketio = require('socket.io')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.compress());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/static',express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', index.mainIndex);
app.get('/users', user.list);
app.get('/loadScript',function(req,res){
  res.render('test',{});
});
app.get('/Navi',navi.mainNavi);

app.get('/outerHtml',function(req,res){
  var reqJosnData = JSON.stringify(req.body);
  var postheaders = {  
      'Content-Type' : 'application/json; charset=UTF-8',  
      'Content-Length' : Buffer.byteLength(reqJosnData, 'utf8')  
  };  
  var options = {
    host: '10.180.120.7',
    port: 80,
    path: '/mashup/pc/appcenter',
    method: 'GET',
    headers :postheaders
  };

  var postRq = http.request(options, function(postres){
    console.log(postres.statusCode);
    postres.on('data',function(d){
      res.send(d);
    });
  }).on('error',function(e){
    console.log(e.message);
  });

  postRq.write(reqJosnData);
  postRq.end();
  // http.get("http://10.180.120.7/mashup/pc/mainnav", function(postres){
  //   postres.on('data',function(d){
  //     res.send(d);
  //   })
  // }).on('error',function(e){
  //   console.log(e);
  // });
});

var host = http.createServer(app);
host.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = socketio.listen(host);

io.sockets.on('connection',function(socket){
  console.log("Websocket connect ok ...");
  socket.emit('sSayhello',{hi:'Happy new year.'});    //'sSayhello'是我们自定义的，客户端听取的时候要指定同样的事件名
  var times = 0;
  var sayHello = -1
    sayHello = setInterval(function(){
      times++;
      socket.emit('sSayhello',{timeStr:Date.now()});
    },1000);
    socket.on('cSayhello',function(data){           //'cSayhello'需要和客户端发送时定义的事件名相同
        console.log('[CLIENT]Client say hi:' );
        console.log(data);
        socket.emit('sSayhello',{hi:"What's wrong? "+ data});
        if(sayHello != -1){
          clearInterval(sayHello);    
          sayHello = -1;      
        }else{
          sayHello = setInterval(function(){
            times++;
            socket.emit('sSayhello',{timeStr:Date.now()});
          },1000);
        }
    });
});
