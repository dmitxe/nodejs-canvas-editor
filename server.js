const config = require('./canvas/config');
var dl  = require('delivery');
var fs = require('fs');
var path = require('path');

var PORT = config.serverPort;
var HOST = config.serverHost;
var IS_SSL = config.serverSSL;
var FRAME_RATE = 1000.0 / 60.0;
var MAIN_SERVER = 'main_server';

var options = {
  wsEngine: 'ws'
};
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var app = require('./canvas/app');
var io;
if (IS_SSL) {
  var https = require('https');
  httpsOptions = {
    key: fs.readFileSync(config.httpsKey), // путь к ключу
    cert: fs.readFileSync(config.httpsCert) // путь к сертификату
  }
  var server = https.createServer(httpsOptions, app);
  io = require('socket.io')(https);
} else {
  var http = require('http');
  var server = http.createServer(app);
  io = require('socket.io')(http);
}

io.listen(server, options);
var redis = require('socket.io-redis');

io.adapter(redis(process.env.REDISTOGO_URL));

// Count requests
function messageMaster(msg) {
  console.log(msg);
  if (msg.cmd && msg.cmd === 'notifyRequest') {
    console.log('this is message master from worker');
  }
}

// Count requests
function messageWorker(msg) {
  if (msg.cmd && msg.cmd === 'notifyRequest') {
    console.log('this is message worker from master');
  }  else if (msg.cmd = 'gameTick') {
    console.log( 'game tick');
  }
}

if (cluster.isMaster){
  console.log('Master '+process.pid+' is running');
//    cluster.on('message', messageMaster);
  var worker = cluster.fork();
  worker.on('message', messageMaster);
}
else {
  process.on('message', messageWorker);
  server.listen(PORT, HOST);
  console.log('Worker '+process.pid+' started');
}

//mysql
//todo включить, если потребуется
/*var mysql = require('mysql');
 var pool  = mysql.createPool({
 host: config.dbHost,
 user: config.dbUser,
 password: config.dbPassword,
 database: config.dbDatabase
 });*/

//pool.getConnection(function(err, db) {
io.sockets.on('connection', function (client) {
  var socket_id = client.id;
  var ip = client.request.connection.remoteAddress;
  var delivery = dl.listen(client);
  delivery.on('receive.success',function(file){
    var ext = path.extname(file.name).toLowerCase();
    console.log('receive ext', ext);
    if ((ext == '.jpg') || (ext == '.jpeg') || (ext == '.png') || (ext == '.gif')) {
      var params = file.params;
      var file_base64 = file.buffer.toString('base64');
      client.emit('image', { image: true, buffer: file_base64 });
      client.broadcast.to(client.room).emit('image', { image: true, buffer: file_base64 });
    } else {
      client.emit('errorServer', {action: 'receive.success', message: 'Не верный формат файла'  });
    }
    console.log('image file is initialized');
  });

  client.on('joinRoom', function(data) {
    if ('room_id' in data) {
      client.room = 'room_'+data.room_id;
      client.join(client.room);
      console.log('join room_id', client.room);
      client.broadcast.to(client.room).emit('joinRoom', { room_id: data.room_id });
    } else {
      client.emit('errorServer', {action: 'joinRoom', message: 'Нет обязательных параметров'  });
    }
  });

  client.on('command', function(data) {
    console.log('command', data);
    if (('room_id' in data) && ('command' in data)) {
      client.to('room_'+data.room_id).emit('command', { command: data.command });
    } else {
      client.emit('errorServer', {action: 'command', message: 'Нет обязательных параметров'  });
    }
  });

  client.on('historyImage', function(data) {
    if (('room_id' in data) && ('image' in data)) {
      client.to('room_' + data.room_id).emit('historyImage', {
        'image': data.image
      });
    } else {
      client.emit('errorServer', {action: 'historyImage', message: 'Нет обязательных параметров'  });
    }
  });

  client.on('clearCanvas', function(data) {
    if ('room_id' in data) {
      client.to('room_' + data.room_id).emit('clearCanvas', { });
    } else {
      client.emit('errorServer', {action: 'clearCanvas', message: 'Нет обязательных параметров'  });
    }
  });

  client.on('drawClick', function(data) {
    if (
        ('room_id' in data) &&
        ('x' in data) &&
        ('y' in data) &&
        ('type' in data)  &&
        ('strokeStyle' in data) &&
        ('lineWidth' in data) &&
        ('font' in data) &&
        ('tool' in data)
    ) {
      client.to('room_' + data.room_id).emit('draw', {
        x: data.x,
        y: data.y,
        type: data.type,
        strokeStyle: data.strokeStyle,
        lineWidth: data.lineWidth,
        font: data.font,
        tool: data.tool
      });
    } else {
      client.emit('errorServer', {action: 'drawClick', message: 'Нет обязательных параметров'  });
    }
  });

  client.on('drawLine', function(data) {
    if (
        ('room_id' in data) &&
        ('xStart' in data) &&
        ('yStart' in data) &&
        ('x' in data)  &&
        ('y' in data) &&
        ('color' in data) &&
        ('lineWidth' in data)
    ) {
      client.to('room_' + data.room_id).emit('drawLine', {
        text: data.text,
        xStart: data.xStart,
        yStart: data.yStart,
        x: data.x,
        y: data.y,
        color: data.color,
        lineWidth: data.lineWidth
      });
    } else {
      client.emit('errorServer', {action: 'drawLine', message: 'Нет обязательных параметров'  });
    }
  });

  client.on('drawCircle', function(data) {
    if (
        ('room_id' in data) &&
        ('xStart' in data) &&
        ('yStart' in data) &&
        ('x' in data)  &&
        ('y' in data) &&
        ('color' in data) &&
        ('lineWidth' in data)
    ) {
      client.to('room_' + data.room_id).emit('drawCircle', {
        xStart: data.xStart,
        yStart: data.yStart,
        x: data.x,
        y: data.y,
        color: data.color,
        lineWidth: data.lineWidth
      });
    } else {
      client.emit('errorServer', {action: 'drawCircle', message: 'Нет обязательных параметров'  });
    }
  });

  client.on('drawRect', function(data) {
    if (
        ('room_id' in data) &&
        ('xStart' in data) &&
        ('yStart' in data) &&
        ('dx' in data)  &&
        ('dy' in data) &&
        ('color' in data) &&
        ('lineWidth' in data)
    ) {
      client.to('room_' + data.room_id).emit('drawRect', {
        xStart: data.xStart,
        yStart: data.yStart,
        dx: data.dx,
        dy: data.dy,
        color: data.color,
        lineWidth: data.lineWidth
      });
    } else {
      client.emit('errorServer', {action: 'drawRect', message: 'Нет обязательных параметров'  });
    }
  });

  client.on('drawText', function(data) {
    if (
        ('room_id' in data) &&
        ('text' in data) &&
        ('x' in data) &&
        ('y' in data) &&
        ('color' in data) &&
        ('font' in data)
    ) {
      client.to('room_' + data.room_id).emit('drawText', {
        text: data.text,
        x: data.x,
        y: data.y,
        color: data.color,
        font: data.font
      });
    } else {
      client.emit('errorServer', {action: 'drawText', message: 'Нет обязательных параметров'  });
    }
  });

  client.on('pointerRemote', function(data) {
    //  console.log('pointerRemote', Object.keys(io.sockets.sockets));
    if (('room_id' in data) && ('x' in data) && ('y' in data) && ('name' in data)) {
      client.to('room_' + data.room_id).emit('pointerRemote', {x: data.x, y: data.y, name: data.name});
    } else {
      client.emit('errorServer', {action: 'pointerRemote', message: 'Нет обязательных параметров'  });
    }
  });
});

function messageHandler(msg) {
  if (msg.cmd && msg.cmd === 'notifyRequest') {
    numReqs += 1;
  }
}

// Server side game loop, runs at 60Hz and sends out update packets to all
// clients every tick.
if (cluster.isMaster) {
  /*   setInterval(function () {
   worker.send({cmd: 'mainTick', data: {'date_period': date_period}});
   }, FRAME_RATE);*/
}
//  });
//});

