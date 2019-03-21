<?php
if (isset($_SERVER['HTTPS'])) {
	$node_scheme = $_SERVER['HTTPS'];
} else {
	$node_scheme = '';
}
if (($node_scheme) && ($node_scheme != 'off')) {
	$node_scheme = 'https';
} else {
	$node_scheme = 'http';
}
$node_server = $node_scheme . '://' . $_SERVER['SERVER_NAME'] . ':4000';
?>
<!DOCTYPE HTML>
<html>
<head>
	<meta charset="UTF-8">
	<!-- https://www.eyecon.ro/colorpicker/#about -->
	<link rel="stylesheet" media="screen" type="text/css" href="css/fontawesome-all.css" />
    <link rel="stylesheet" media="screen" type="text/css" href="css/jquery.mb.YTPlayer.min.css" />
	<script type="text/javascript" src="js/jquery.min.js"></script>
	<script type="text/javascript" src="js/jquery.event.drag-2.0.js"></script>
	<script src="<?= $node_server ?>/socket.io/socket.io.js"></script>
	<!--<script src="js/siofu/client.js"></script>-->
    <script src="js/delivery/delivery.js"></script>
    <script src="js/jquery.mb.YTPlayer.js"></script>
	<script type="text/javascript" src="scripts.js"></script>
	<link rel="stylesheet" href="css/style.css" />

	<title>Совместная доска для рисования</title>
</head>
<body onclick="console.log('clicked');">
<div id="app-main-body">
    <div id="player-container">
        <div id="player"></div>
    </div>
	<canvas id="canvas-board"></canvas>
	<canvas id="canvas-board-temp" style="display: none;"></canvas>
	<div id="canvas-pointer-remote" title="Ваш собеседник сейчас находиться здесь">
		<i class="fas fa-hand-pointer"></i>
		<span class="badge badge-primary pointer-user"></span>
	</div>
	<textarea id="canvas-text-container" style="width: 0; height: 0;"></textarea>
	<div id="canvas-editor-buttons">
		<button id="clear-canvas">Очистить экран</button>
		<input type="file" id="file-bg-canvas-board">
		<a href="javascript:void(0)" id="show-settings-canvas">
			<i class="fas fa-cog"></i>
		</a>
		<input type="hidden" value="pen" id="canvas_tools">
		<a href="javascript:void(0)" class="tools active"
		   title="Выбрать инструмент Перо" id="canvas_tools_pen">
			<i class="fas fa-pencil-alt"></i>
		</a>
		<a href="javascript:void(0)" class="tools"
		   title="Выбрать инструмент Линия" id="canvas_tools_line">
			<i class="fas fa-chart-line"></i>
		</a>
		<a href="javascript:void(0)" class="tools"
		   title="Выбрать инструмент Овал" id="canvas_tools_circle">
			<i class="fas fa-circle"></i>
		</a>
		<a href="javascript:void(0)" class="tools"
		   title="Выбрать инструмент Прямоугольник" id="canvas_tools_square">
			<i class="fas fa-square"></i>
		</a>
		<a href="javascript:void(0)" class="tools"
		   title="Выбрать инструмент Текст" id="canvas_tools_text">
			<i class="fas fa-font"></i>
		</a>
		<a href="javascript:void(0)" title="Отменить операцию" id="canvas_undo">
			<i class="fas fa-undo"></i>
		</a>
		<a href="javascript:void(0)" title="Повторить операцию" id="canvas_redo">
			<i class="fas fa-redo"></i>
		</a>
	</div>
	<div id="canvas-editor-settings" style="display: none;">
		<div id="canvas-editor-settings-panel">
			<div id="drawing-mode-options">
				<label for="drawing-line-width">Ширина линий:</label>
				<span class="info line-width">5</span>
				<input type="range" value="5" min="0" max="150" id="drawing-line-width">
				<br>
				<label for="drawing-color">Цвет:</label>
				<input type="color" value="#ECD018" id="drawing-color">
				<br>
				<label for="drawing-font-size">Размер шрифта:</label>
				<span class="info font-size">14</span>
				<input type="range" value="14" min="1" max="64" id="drawing-font-size">
				<br>
			</div>
		</div>
	</div>
    <div id="video-bg-controls">
        <input type="text" placeholder="youtube ID" id="youtube-video-id">
        <input type="button" value="Загрузить видео" id="youtube-load">
        <input type="button" value="PLAY" id="youtube-play">
        <input type="button" value="STOP" id="youtube-stop">
        <input id="youtube-volume" type="range" min="0" max="100" step="1" value="100" title="Громкость">
        <input id="youtube-progress" type="range" min="0" max="100" step="1" value="0" title="Прогресс">
    </div>

</div>

<!--<p>
    <button id="yt_btn" onclick="check1();">check</button>
</p>-->
<div>
 <!--   <iframe src="https://www.youtube.com/embed/QH2-TGUlwu4?rel=0" width="800" height="600" frameborder="0"></iframe>-->
 <!--   <iframe id="frame_yt" width="800" height="600" src="https://www.youtube-nocookie.com/embed/rnNUAkHjjLE?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
 -->
</div>

<script type="text/javascript">
   /* $(document).ready(function () {
        console.log('ssss');
        var elem = $("#frame_yt").contents().find('body').html('Hey, i`ve changed content of <body>! Yay!!!');
        console.log('elem',elem);
    });
    function check1() {
        var elem = $("#frame_yt").contents().find(".ytp-pause-overlay").remove();
        console.log('elem',elem);
        elem.hide();
    }*/
</script>
</body>

