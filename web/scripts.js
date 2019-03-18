(function() {
  var App;
  App = {
    canvas : {},
    ctx: {},
    canvasTemp : {},
    ctxTemp: {},
    socket: {},
    rectText: {x: 0, y: 0, stage: 0},
    activeTool: 'pen'
  };
  /*
  	Init 
  */
  App.init = function() {
    console.log('Canvas init');

    App.canvas = $('#canvas-board');
    App.canvasTemp = $('#canvas-board-temp');
    console.log('Canvas loaded');
    if (Object.keys(App.socket).length != 0) {
      if (App.socket.connected) {
        App.socket.disconnect();
      }
    }
    var url_string = window.location.href
    var url = new URL(url_string);
    var chat = url.searchParams.get("chat");
    var name = url.searchParams.get("name");
    App.chatId = chat;
    App.name = name;
    App.socket = io.connect(location.protocol + '//' + window.location.hostname + ':4000');
    App.ctx = App.canvas[0].getContext("2d");
    App.ctx.canvas.width = App.canvas.width();
    App.ctx.canvas.height = App.canvas.height();
    App.ctxTemp = App.canvasTemp[0].getContext("2d");
    App.ctxTemp.canvas.width = App.canvasTemp.width();
    App.ctxTemp.canvas.height = App.canvasTemp.height();
    App.activeTool = $('#canvas_tools').val();
    //      App.ctx.fillStyle = "solid";
    App.ctx.strokeStyle = App.ctxTemp.strokeStyle = "#ECD018";
    App.ctx.lineWidth = App.ctxTemp.lineWidth = 5;
    App.ctx.lineCap = App.ctxTemp.lineCap = "round";
    App.ctx.fillStyle = App.ctxTemp.fillStyle = "#ECD018";
    App.ctx.font = App.ctx.font = '14px sans-serif';
    $('#canvas-text-container').css('fontFamily', 'sans-serif');
    $('#canvas-text-container').css('fontSize', '14px').css('color', App.ctx.strokeStyle);
    $('#canvas-text-container').css('top', '-1000px').css('left', '-1000px');
    App.ctx.clearRect(0, 0, App.canvas.width(), App.canvas.height());
    App.xOld = App.xOldTemp = 0;
    App.yOld = App.yOldTemp = 0;
    App.xStart = 0; // прямоугольник
    App.yStart = 0; // прямоугольник
    App.pointerRemoteTime = new Date();
    App.isStartedTool = false;

    var cPushArray = [];
    var cStep = -1;
    var maxHistory = 1;

    function cPush() {
      // console.log('cPushArray', cPushArray);
      if (cStep >= maxHistory){
        //    console.log('cStep', cStep);
        cStep = maxHistory;
        for (var i = 1; i<=maxHistory; i++) {
          cPushArray[i-1] = cPushArray[i];
        }
        //    console.log('cPushArray', cPushArray);
        delete cPushArray[maxHistory];
      }else{
        cStep++;
      }
      if (cStep < cPushArray.length) { cPushArray.length = cStep; }
      cPushArray.push(document.getElementById('canvas-board').toDataURL());
    }

    function cUndo() {
      if (cStep > 0) {
        cStep--;
        var canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        App.socket.emit('historyImage', {room_id: App.chatId, image: canvasPic.src });
        canvasPic.onload = function () {
          App.ctx.clearRect(0,0, App.canvas.width(), App.canvas.height());
          App.ctx.drawImage(canvasPic,0,0);
        }
      }
    }

    function cRedo() {
      if (cStep < cPushArray.length-1) {
        cStep++;
        var canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        App.socket.emit('historyImage', {room_id: App.chatId, image: canvasPic.src });
        canvasPic.onload = function () { App.ctx.drawImage(canvasPic,0,0); }
      }
    }

    App.canvasMouseDownStart = function (x, y) {
      App.xStart = x;
      App.yStart = y;
      // App.ctxTemp.strokeStyle = App.ctx.strokeStyle;
      // App.ctxTemp.fillStyle = App.ctx.fillStyle;
      // App.ctxTemp.lineWidth = App.ctx.lineWidth;
      // App.ctxTemp.font = App.ctx.font;
      App.canvasTemp.show();
      App.isStartedTool = true;

    };

    // рисование на временном канвасе для собственных линий
    App.drawTemp = function(x, y, type) {
      if (type === "mousedown") {
        App.canvasTemp.show();
        App.ctxTemp.beginPath();
        App.xOldTemp = x;
        App.yOldTemp = y;
        return App.ctxTemp.moveTo(x, y);
      } else if (type === "mousemove") {
//                App.ctx.lineTo(x, y);
        App.ctxTemp.arcTo(x,y,App.xOldTemp,App.yOldTemp,10);
        App.xOldTemp = x;
        App.yOldTemp = y;
        return App.ctxTemp.stroke();
      } else {
        var res = App.ctxTemp.closePath();
        App.ctx.drawImage(App.canvasTemp[0], 0, 0);
        App.ctxTemp.clearRect(0, 0, App.canvasTemp[0].width, App.canvasTemp[0].height);
        cPush();
        App.canvasTemp.hide();
        return res;

      }
    };

    // рисование на основном канвасе для линий собесдника
    App.draw = function(x, y, type) {
      if (type === "mousedown") {
        App.ctx.beginPath();
        App.xOld = x;
        App.yOld = y;
        return App.ctx.moveTo(x, y);
      } else if (type === "mousemove") {
//                App.ctx.lineTo(x, y);
        App.ctx.arcTo(x,y,App.xOld,App.yOld,10);
        App.xOld = x;
        App.yOld = y;
        return App.ctx.stroke();
      } else {
        return App.ctx.closePath();
      }
    };

    App.drawLine = function(x, y, type) {
      //   console.log('drawLine x='+x+' y='+y+'type='+type);
      if (type === "mousedown") {
        App.canvasMouseDownStart(x, y);
        return true;
      } else if (type === "mousemove") {
        App.ctxTemp.clearRect(0, 0, App.canvasTemp.width(), App.canvasTemp.height());
        App.ctxTemp.beginPath();
        App.ctxTemp.moveTo(App.xStart, App.yStart);
        App.ctxTemp.lineTo(x, y);
        App.ctxTemp.stroke();
        App.ctxTemp.closePath();
        return true;
      } else {
        App.isStartedTool = false;
        App.ctxTemp.clearRect(0, 0, App.canvas.width(), App.canvas.height());
        App.ctxTemp.beginPath();
        App.ctxTemp.moveTo(App.xStart, App.yStart);
        App.ctxTemp.lineTo(x, y);
        App.ctxTemp.stroke();
        App.ctxTemp.closePath();
        App.ctx.drawImage(App.canvasTemp[0], 0, 0);
        App.ctxTemp.clearRect(0, 0, App.canvasTemp[0].width, App.canvasTemp[0].height);
        App.canvasTemp.hide();
        cPush();
        App.socket.emit('drawLine', {
          room_id: App.chatId,
          xStart: App.xStart,
          yStart: App.yStart,
          x: x,
          y: y,
          color: App.ctx.strokeStyle,
          lineWidth: App.ctx.lineWidth
        });
        return true;
      }
    };

    App.drawRect = function(x, y, type) {
      var dx,dy,dxClear,dyClear;
      if (type === "mousedown") {
        App.canvasMouseDownStart(x, y);
        return true;
      } else if (type === "mousemove") {
        App.ctxTemp.clearRect(0, 0, App.canvasTemp[0].width, App.canvasTemp[0].height);
        dx = x - App.xStart;
        dy = y - App.yStart;
        App.ctxTemp.fillRect(App.xStart,App.yStart,dx,dy);
        return true;
      } else {
        App.ctxTemp.clearRect(0, 0, App.canvasTemp[0].width, App.canvasTemp[0].height);
        dx = x - App.xStart;
        dy = y - App.yStart;
        App.ctxTemp.fillRect(App.xStart,App.yStart,dx,dy);
        App.ctx.drawImage(App.canvasTemp[0], 0, 0);
        App.ctxTemp.clearRect(0, 0, App.canvasTemp[0].width, App.canvasTemp[0].height);
        App.canvasTemp.hide();
        cPush();
        App.socket.emit('drawRect', {
          room_id: App.chatId,
          xStart: App.xStart,
          yStart: App.yStart,
          dx: dx,
          dy: dy,
          color: App.ctx.strokeStyle,
          lineWidth: App.ctx.lineWidth
        });
        return true;
      }
    };
    App.drawText = function(x, y, type) {
      if (App.rectText.stage != 2) {
        if (type === "mousedown") {
          App.rectText.x = x;
          App.rectText.y = y;
          App.rectText.width = 0;
          App.rectText.height = 0;
          App.rectText.stage = 1;
          //    App.canvasTemp.show();
          $('#canvas-text-container').css('top', y).css('left', x);
        } else if (type === "mousemove") {
          if (App.rectText.stage == 1) {
            App.rectText.width = Math.abs(x-App.rectText.x);
            App.rectText.height = Math.abs(y-App.rectText.y);
            $('#canvas-text-container').css('width', App.rectText.width+'px');
            $('#canvas-text-container').css('height', App.rectText.height+'px');
          }
        } else {
          if (App.rectText.stage == 1) {
            App.rectText.width = Math.abs(x - App.rectText.x);
            App.rectText.height = Math.abs(y - App.rectText.y);
            if (App.rectText.width == 0) {
              App.rectText.width = 50;
            }
            if (App.rectText.height == 0) {
              App.rectText.height = 30;
            }
            $('#canvas-text-container').css('width', App.rectText.width + 'px');
            $('#canvas-text-container').css('height', App.rectText.height + 'px');
            $('#canvas-text-container').focus();
            App.rectText.stage = 2;
            //   App.canvasTemp.hide();

          }
        }
      }
    };

    $('#canvas-text-container').on('mouseup', function(e) {
      if (App.rectText.stage == 1) {
        if (App.rectText.width == 0) {
          App.rectText.width = 50;
          $('#canvas-text-container').css('width', App.rectText.width + 'px');
        }
        if (App.rectText.height == 0) {
          App.rectText.height = 30;
          $('#canvas-text-container').css('height', App.rectText.height + 'px');
        }
        $('#canvas-text-container').focus();
        App.rectText.stage = 2;
      }
    });


    App.drawEllipse = function(ctx, x1, y1, x2, y2) {
      var radiusX = (x2 - x1) * 0.5,   /// radius for x based on input
          radiusY = (y2 - y1) * 0.5,   /// radius for y based on input
          centerX = x1 + radiusX,      /// calc center
          centerY = y1 + radiusY,
          step = 0.01,                 /// resolution of ellipse
          a = step,                    /// counter
          pi2 = Math.PI * 2 - step;    /// end angle

      /// start a new path
      ctx.beginPath();

      /// set start point at angle 0
      ctx.moveTo(centerX + radiusX * Math.cos(0),
          centerY + radiusY * Math.sin(0));

      /// create the ellipse
      for(; a < pi2; a += step) {
        ctx.lineTo(centerX + radiusX * Math.cos(a),
            centerY + radiusY * Math.sin(a));
      }

      ctx.fill();
      /// close it and stroke it for demo
      ctx.closePath();
//            ctx.strokeStyle = '#000';
      ctx.stroke();
    };


    App.socket.on('connect', function() {
      console.log('connect server');
      // клик срабатывает после того, как был изменен статус.
      $('#video-chat-box').on('click', '.js-video-btn', function (evt) {
        console.log('videoStatus', videoChat.videoStatus);
        if (videoChat.videoStatus) {
          App.canvasCommand('videoOn');
        } else {
          App.canvasCommand('videoOff');
        }
        evt.preventDefault();
      });
      $('#video-chat-box').on('click', '.js-board-btn', function (evt) {
        console.log('boardStatus', videoChat.boardStatus);
        if (videoChat.boardStatus) {
          App.canvasCommand('boardOn');
        } else {
          App.canvasCommand('boardOff');
        }
        evt.preventDefault();
      });
      $('#video-chat-box').on('click', '.js-video-bg-btn', function (evt) {
        console.log('videoBgStatus', videoChat.videoBgStatus);
        if (videoChat.videoBgStatus) {
          App.canvasCommand('videoBgOn');
        } else {
          App.canvasCommand('videoBgOff');
        }
        evt.preventDefault();
      });
      $('#video-chat-box').on('click', '.js-record-btn', function (evt) {
        console.log('recordStatus', videoChat.recordStatus);
        if (videoChat.recordStatus) {
          App.canvasCommand('recordOn');
        } else {
          App.canvasCommand('recordOff');
        }
        evt.preventDefault();
      });
      $('#clear-canvas').on('click', function() {
        console.log('clearCanvas');
        App.ctx.clearRect(0, 0, App.canvas.width(), App.canvas.height());
        App.socket.emit('clearCanvas', {room_id: App.chatId});
      });
      $('#show-settings-canvas').on('click', function() {
        $('#canvas-editor-settings').toggle();
      });
      $('#canvas_tools_pen').on('click', function() {
        $('#canvas_tools').val('pen');
        App.activeTool = 'pen';
        $('#canvas-editor-buttons .tools').removeClass('active');
        $(this).addClass('active');
      });
      $('#canvas_tools_line').on('click', function() {
        $('#canvas_tools').val('line');
        App.activeTool = 'line';
        $('#canvas-editor-buttons .tools').removeClass('active');
        $(this).addClass('active');
      });
      $('#canvas_tools_circle').on('click', function() {
        $('#canvas_tools').val('circle');
        App.activeTool = 'circle';
        $('#canvas-editor-buttons .tools').removeClass('active');
        $(this).addClass('active');
      });
      $('#canvas_tools_square').on('click', function() {
        $('#canvas_tools').val('square');
        App.activeTool = 'square';
        $('#canvas-editor-buttons .tools').removeClass('active');
        $(this).addClass('active');
      });
      $('#canvas_tools_text').on('click', function() {
        $('#canvas_tools').val('text');
        App.activeTool = 'text';
        $('#canvas-editor-buttons .tools').removeClass('active');
        $(this).addClass('active');
      });
      $('#canvas_undo').on('click', function() {
        cUndo();
      });
      $('#canvas_redo').on('click', function() {
        cRedo();
      });
      $('#drawing-line-width').on('change', function() {
        console.log('lineWidth', this.value);
        App.ctx.lineWidth = App.ctxTemp.lineWidth = this.value;
        $('#drawing-mode-options .line-width').text(this.value);
      });
      $('#drawing-color').on('change', function() {
        console.log('colorLine', this.value);
        App.ctx.strokeStyle = App.ctxTemp.strokeStyle = this.value;
        App.ctx.fillStyle = App.ctxTemp.fillStyle = this.value;
        $('#canvas-text-container').css('color', this.value);
      });
      $('#drawing-font-size').on('change', function() {
        console.log('font-size', this.value);
        App.ctx.font = App.ctxTemp.font = this.value+'px sans-serif';
        $('#drawing-mode-options .font-size').text(this.value);
        $('#canvas-text-container').css('fontSize', this.value+'px');
      });
      $('#canvas-text-container').on('focusout', function() {
        if (App.rectText.stage == 2) {
          var fontSize = $(this).css('fontSize');
          var lineHeight = Math.floor(parseInt(fontSize.replace('px','')) * 1.5) - 10;
          App.ctx.fillText(
              $(this).val(),
              App.rectText.x,
              App.rectText.y + lineHeight
              //   App.rectText.width
          );
          cPush();
          App.socket.emit('drawText', {
            room_id: App.chatId,
            text: $(this).val(),
            x: App.rectText.x,
            y: App.rectText.y + lineHeight,
            color: App.ctx.strokeStyle,
            font:  App.ctx.font
          });
          App.rectText.stage = 0;
          $(this).val('');
          $(this).css('top', '-1000px').css('left', '-1000px');
          $(this).css('width', 0).css('height', 0);
        }
      });

      App.canvasMouseEvent = function(e) {
        var type, x, y;
        type = e.handleObj.type;
        if (e.layerX || e.layerX == 0) { // Firefox
          x = e.layerX;
          y = e.layerY;
        } else if (e.offsetX || e.offsetX == 0) { // Opera
          x = e.offsetX;
          y = e.offsetY;
        }
        if (e.handleObj.type == 'mousedown' ||
            (e.handleObj.type == 'mousemove' && e.buttons == 1) ||
            e.handleObj.type == 'mouseup') {
          var res = false;
          //    console.log('tool',App.activeTool);
          switch(App.activeTool) {
            case 'line':
              res = App.drawLine(x, y, type);
              break;
            case 'circle':
              if (type == 'mousedown') {
                App.canvasMouseDownStart(x, y);
              } else if (type == 'mousemove') {
                App.ctxTemp.clearRect(
                    0,
                    0,
                    App.canvasTemp[0].width,
                    App.canvasTemp[0].height
                );
                App.drawEllipse(App.ctxTemp, App.xStart, App.yStart, x ,y);

              } else {
                App.ctxTemp.clearRect(
                    0,
                    0,
                    App.canvasTemp[0].width,
                    App.canvasTemp[0].height
                );
                App.drawEllipse(App.ctxTemp, App.xStart, App.yStart, x ,y);
                App.ctx.drawImage(App.canvasTemp[0], 0, 0);
                cPush();
                App.socket.emit('drawCircle', {
                  room_id: App.chatId,
                  xStart: App.xStart,
                  yStart: App.yStart,
                  x: x,
                  y: y,
                  color: App.ctx.strokeStyle,
                  lineWidth: App.ctx.lineWidth
                });
                App.isStartedTool = false;
                App.canvasTemp.hide();
              }
              res = true;
              break;
            case 'square':
              res = App.drawRect(x, y, type);
              break;
            case 'text':
              res = App.drawText(x, y, type);
              break;
            default:
              res = App.drawTemp(x, y, type);
              break;
          }
          //App.drawRect(x, y, type);
          if (App.activeTool == 'pen') {
            App.socket.emit('drawClick', {
              room_id: App.chatId,
              x: x,
              y: y,
              type: type,
              strokeStyle: App.ctx.strokeStyle,
              lineWidth: App.ctx.lineWidth,
              font:  App.ctx.font,
              tool: App.activeTool
            });
          }
        }
        if (type == 'mousemove') {
          var now = new Date();
          if ((now - App.pointerRemoteTime) >= 100) {
      //      console.log(App.chatId);
      //      console.log(App.name);
            App.socket.emit('pointerRemote', {
              room_id: App.chatId,
              x: x,
              y: y,
              name: App.name
            });
            App.pointerRemoteTime = now;
          }
        }
      };

      App.canvas.on('mousedown mousemove mouseup', function(e) {
        App.canvasMouseEvent(e);
      });

      App.canvasTemp.on('mousedown mousemove mouseup', function(e) {
        App.canvasMouseEvent(e);
      });

      var delivery = new Delivery(App.socket);
      delivery.on('delivery.connect',function(delivery){
        $("#file-bg-canvas-board").change(function(evt){
          var file = $(this)[0].files[0];
          var extraParams = {foo: 'bar'};
          delivery.send(file, extraParams);
          $(this).val('');
          evt.preventDefault();
        });
        delivery.on('send.success',function(fileUID){
          console.log("file was successfully sent.");
        });
      });

      App.socket.emit('joinRoom', {room_id: App.chatId});

      App.socket.on('errorServer', function(data) {
        console.log('error socket, action=' + data.action + ', message=' + data.message);
        if (data.action == 'receive.success') {
          alert(data.message);
        }
      });

      App.socket.on('command', function(data) {
        console.log('server command', data.command);
        videoChat[data.command]();
      });

      App.socket.on('image', function(data) {
        if (data.image) {
          var img = new Image();
          img.src = 'data:image/jpeg;base64,' + data.buffer;
          img.addEventListener('load', function () {
            App.ctx.drawImage(img, 0, 0, App.ctx.canvas.width, App.ctx.canvas.height);
          });
        }
      });

      App.socket.on('clearCanvas', function(data) {
        App.ctx.clearRect(0, 0, App.canvas.width(), App.canvas.height());
      });

      App.socket.on('draw', function(data) {
        var oldStrokeStyle = App.ctx.strokeStyle;
        var oldLineWidth = App.ctx.lineWidth;
        var oldFont = App.ctx.font;

        App.ctx.strokeStyle = data.strokeStyle;
        App.ctx.fillStyle = data.strokeStyle;
        var res = false;
        switch(data.tool) {
          case 'line':
            res = App.drawLine(data.x, data.y, data.type);
            break;
          case 'circle':
            res = App.draw(data.x, data.y, data.type);
            break;
          case 'square':
            res = App.drawRect(data.x, data.y, data.type);
            break;
          case 'text':
            res = App.drawText(data.x, data.y, data.type);
            break;
          default:
            res = App.draw(data.x, data.y, data.type);
            break;
        }
        App.ctx.strokeStyle = oldStrokeStyle;
        App.ctx.fillStyle = oldStrokeStyle;
        App.ctx.lineWidth = oldLineWidth;
        App.ctx.font = oldFont;

        return res;
      });

      App.socket.on('drawLine', function(data) {
        var oldStrokeStyle = App.ctx.strokeStyle;
        var oldLineWidth = App.ctx.lineWidth;
        App.ctx.fillStyle = data.color;
        App.ctx.strokeStyle = data.color;
        App.ctx.lineWidth = data.lineWidth;
        App.ctx.beginPath();
        App.ctx.moveTo(data.xStart, data.yStart);
        App.ctx.lineTo(data.x, data.y);
        App.ctx.stroke();
        App.ctx.closePath();
        App.ctx.strokeStyle = oldStrokeStyle;
        App.ctx.fillStyle = oldStrokeStyle;
        App.ctx.lineWidth = oldLineWidth;
      });

      App.socket.on('drawRect', function(data) {
        var oldStrokeStyle = App.ctx.strokeStyle;
        var oldLineWidth = App.ctx.lineWidth;
        App.ctx.fillStyle = data.color;
        App.ctx.strokeStyle = data.color;
        App.ctx.lineWidth = data.lineWidth;
        App.ctx.fillRect(data.xStart,data.yStart, data.dx, data.dy);
        App.ctx.strokeStyle = oldStrokeStyle;
        App.ctx.fillStyle = oldStrokeStyle;
        App.ctx.lineWidth = oldLineWidth;
      });

      App.socket.on('drawCircle', function(data) {
        var oldStrokeStyle = App.ctx.strokeStyle;
        var oldLineWidth = App.ctx.lineWidth;
        App.ctx.fillStyle = data.color;
        App.ctx.strokeStyle = data.color;
        App.ctx.lineWidth = data.lineWidth;
        App.drawEllipse(App.ctx, data.xStart, data.yStart, data.x, data.y);
        App.ctx.strokeStyle = oldStrokeStyle;
        App.ctx.fillStyle = oldStrokeStyle;
        App.ctx.lineWidth = oldLineWidth;
      });

      App.socket.on('drawText', function(data) {
        //  console.log('drawText', data);
        var oldStrokeStyle = App.ctx.strokeStyle;
        var oldFont = App.ctx.font;
        App.ctx.fillStyle = data.color;
        App.ctx.strokeStyle = data.color;
        App.ctx.font = data.font;
        App.ctx.fillText(data.text, data.x, data.y);
        App.ctx.strokeStyle = oldStrokeStyle;
        App.ctx.fillStyle = oldStrokeStyle;
        App.ctx.font = oldFont;
      });

      App.socket.on('pointerRemote', function(data) {
        $('#canvas-pointer-remote').css('left', data.x).css('top', data.y);
        $('#canvas-pointer-remote .pointer-user').text(data.name);
      });

      App.socket.on('historyImage', function(data) {
        var canvasPic = new Image();
        canvasPic.src = data.image;
//                console.log('historyImage', data.image);
        canvasPic.onload = function () {
          App.ctx.clearRect(0,0, App.canvas.width(), App.canvas.height());
          App.ctx.drawImage(canvasPic,0,0);
        }
      });
    });
  };
  $(function() {
    return App.init();
  });
}).call(this);
