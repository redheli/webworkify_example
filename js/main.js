'use strict';

var WebWorkify = require('webworkify');

var w = WebWorkify(require('./worker.js'));
w.addEventListener('message', function (ev) {
    console.log('main: '+(ev.data).toString());
    var s = (ev.data).toString()
    $('#output').append(s + "<br/>");
});

// w send message '4' to worker.js
// worker.js keep post message '5 xxxx' '6 xxxx '
// w receive message '5 xxxx' ...
w.postMessage(4); // send the worker a message
