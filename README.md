Совместная доска для рисование - наброски
================

По статье https://wesbos.com/html5-canvas-websockets-nodejs/ (гитхаб https://github.com/wesbos/websocket-canvas-draw)

Загрузка изображений: https://github.com/liamks/Delivery.js - работают только jpg/jpeg, остальные типы надо подключать.
При этом передачу изображения методами Delivery с сервера на клиент не смог заставить заработать.
Пришлось использовать преобразование в base64.
Также проверил вариант загрузки файла через https://github.com/sffc/socketio-file-upload 
В этом случае файл сохраняется на сервер на диск и потом его надо читать.


Какой-то старенький color picker https://www.eyecon.ro/colorpicker/

Простейшее рисование на канве: http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/

Для загрузки фонового видео использован этот видеоплеер: https://github.com/pupunzi/jquery.mb.YTPlayer/wiki

## Installation

npm install

В canvas/config.js указать свой домен и путь до ключей ssl 

## Usage

node server.js

Далее запускам index.php через nginx/apache

Пример вызова: http://site.ru/?chat=main&name=dima

Здесь chat - это айди чата, name - имя пользователя

Кнопка выбора файла - грузит выбранный файл на сервер и отсылает его прочим участникам. 
Файл прогружается на канву (масштабирование на размеры канвы) плюс для отладки в элемент img (без масштабирования) 

Выбор цвета - меняет цвет кисти всем участникам.

