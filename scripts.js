(function() {
  var App;
  App = {};
  /*
  	Init 
  */
  App.init = function() {
    App.canvas = document.createElement('canvas');
    App.canvas.height = 400;
    App.canvas.width = 800;
    document.getElementsByTagName('article')[0].appendChild(App.canvas);
    App.ctx = App.canvas.getContext("2d");
    App.ctx.fillStyle = "solid";
    App.ctx.strokeStyle = "#ECD018";
    App.ctx.lineWidth = 5;
    App.ctx.lineCap = "round";
    App.socket = io.connect('http://localhost:4000');
//    App.uploader = new SocketIOFileUpload(App.socket);
//    App.uploader.listenOnInput(document.getElementById("siofu_input"));

    App.socket.on('connect', function(){
      var delivery = new Delivery(App.socket);

      delivery.on('delivery.connect',function(delivery){
        $("#file-bg-img").change(function(evt){
          console.log('change');
          var file = $("#file-bg-img")[0].files[0];
          var extraParams = {foo: 'bar'};
          delivery.send(file, extraParams);
          evt.preventDefault();
        });
        delivery.on('send.success',function(fileUID){
          console.log("file was successfully sent.");
        });

      });

     /* delivery.on('receive.start',function(fileUID){
        console.log('receiving a file!');
      });

      delivery.on('receive.success',function(file){
        console.log('receive.success');
        var params = file.params;
        if (file.isImage()) {
          $('#img_bg').attr('src', file.dataURL());
        };
      });*/

      $('#btn-send').click(function () {
        console.log('sending click');
        App.socket.emit('btnClick', {
        });
      });

    });

    App.socket.on('image', function(data) {
      console.log('image loaded', data);
      if (data.image) {
        var img = new Image();
        img.src = 'data:image/jpeg;base64,' + data.buffer;
        img.addEventListener('load', function () {
          App.ctx.drawImage(img, 0, 0, 800, 400);
          $('#img_bg').attr('src', img.src);
        });
      }
    });

    App.socket.on('draw', function(data) {
      return App.draw(data.x, data.y, data.type);
    });
    App.socket.on('setColor', function(data) {
      console.log('setColor');
      App.ctx.strokeStyle = data.color;
      $('#colorpickerHolder').ColorPickerSetColor(data.color);
    });

    App.draw = function(x, y, type) {
      if (type === "dragstart") {
        App.ctx.beginPath();
        return App.ctx.moveTo(x, y);
      } else if (type === "drag") {
        App.ctx.lineTo(x, y);
        return App.ctx.stroke();
      } else {
        return App.ctx.closePath();
      }
    };
    $('#colorpickerHolder').ColorPicker({
      flat: true,
      color: '#ECD018',
      onChange: function (hsb, hex, rgb) {
        App.ctx.strokeStyle = '#' + hex;
        App.socket.emit('setColor', {'color': App.ctx.strokeStyle  });
      }
    });
  };
  /*
  	Draw Events
  */
  $('canvas').live('drag dragstart dragend', function(e) {
    var offset, type, x, y;
    type = e.handleObj.type;
    offset = $(this).offset();
    e.offsetX = e.layerX /*- offset.left*/;
    e.offsetY = e.layerY /*- offset.top*/;
    x = e.offsetX;
    y = e.offsetY;
    App.draw(x, y, type);
    App.socket.emit('drawClick', {
      x: x,
      y: y,
      type: type
    });
  });
  $(function() {
    return App.init();
  });
}).call(this);
