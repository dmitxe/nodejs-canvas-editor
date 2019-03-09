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

## Installation

npm install


## Usage

node server.js

Далее запускам index.html через nginx/apache

Кнопка выбора файла - грузит выбранный файл на сервер и отсылает его прочим участникам. 
Файл прогружается на канву (масштабирование на размеры канвы) плюс для отладки в элемент img (без масштабирования) 

Выбор цвета - меняет цвет кисти всем участникам.

