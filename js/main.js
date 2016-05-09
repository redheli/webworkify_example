'use strict';

var work = require('webworkify');

var w = work(require('./worker.js'));
w.addEventListener('message', function (ev) {
    console.log((ev.data).toString());
    var s = (ev.data).toString()
    $('#output').append(s + "<br/>");
});

w.postMessage(4); // send the worker a message
