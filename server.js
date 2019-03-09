(function() {
  var io;
  io = require('socket.io').listen(4000);
  var dl  = require('delivery');
  var fs  = require('fs');
//  var siofu = require("socketio-file-upload");
  io.sockets.on('connection', function(socket, err) {
    if (err)
      throw err;
   /* var uploader = new siofu();
    uploader.dir = __dirname+"/uploads";
    uploader.on("error", function(event){
      console.log("Error from uploader", event);
    });
    uploader.on("start", function(event){
      if (/\.exe$/.test(event.file.name)) {
        uploader.abort(event.file.id, socket);
      }
    });
    uploader.on("saved", function(event){
      if (event.file.success) {
        console.log('file '+event.file.name+' success loaded');
      }
    });
    uploader.listen(socket);*/

    var delivery = dl.listen(socket);
    delivery.on('receive.success',function(file){
      var params = file.params;
        // it's possible to embed binary data
        // within arbitrarily-complex objects
        var file_base64 = file.buffer.toString('base64');
        socket.emit('image', { image: true, buffer: file_base64 });
        socket.broadcast.emit('image', { image: true, buffer: file_base64 });
        console.log('image file is initialized');
     /* fs.writeFile( __dirname+"/uploads/"+file.name,file.buffer, function(err){
        if(err){
          console.log('File could not be saved.');
        }else{
          console.log('File saved.');

        };
      });*/
    });

   /* delivery.on('delivery.connect',function(delivery){
      console.log('Send file.');

      delivery.send({
        name: 'music.jpg',
        path : __dirname+"/uploads/"+'music.jpg',
        params: {foo: 'bar'}
      });

      delivery.on('send.success',function(file){
        console.log('File successfully sent to client!');
      });

    });*/

    socket.on('btnClick', function(data) {
      console.log('Send file.');
      fs.readFile(__dirname + '/uploads/music.jpg', function(err, buf){
        var file_base64 = buf.toString('base64');
        socket.emit('image', { image: true, buffer: file_base64 });
        socket.broadcast.emit('image', { image: true, buffer: file_base64 });
        console.log('image file is initialized');
      });
    });

    socket.on('setColor', function(data) {
      socket.broadcast.emit('setColor', {
        color: data.color
      });
    });

    socket.on('drawClick', function(data) {
      socket.broadcast.emit('draw', {
        x: data.x,
        y: data.y,
        type: data.type
      });
    });
  });
}).call(this);
