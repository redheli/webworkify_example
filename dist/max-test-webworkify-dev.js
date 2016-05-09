(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.maxTestWebworkify = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var work = require('webworkify');

var w = work(require('./worker.js'));
w.addEventListener('message', function (ev) {
    console.log((ev.data).toString());
    var s = (ev.data).toString()
    $('#output').append(s + "<br/>");
});

w.postMessage(4); // send the worker a message

},{"./worker.js":2,"webworkify":4}],2:[function(require,module,exports){
var gamma = require('gamma');

module.exports = function (self) {
    self.addEventListener('message',function (ev){
        var startNum = parseInt(ev.data); // ev.data=4 from main.js
        
        setInterval(function () {
            var r = startNum / Math.random() - 1;
            self.postMessage([ startNum, r, gamma(r) ]);
        }, 500);
    });
};

},{"gamma":3}],3:[function(require,module,exports){
// transliterated from the python snippet here:
// http://en.wikipedia.org/wiki/Lanczos_approximation

var g = 7;
var p = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
];

var g_ln = 607/128;
var p_ln = [
    0.99999999999999709182,
    57.156235665862923517,
    -59.597960355475491248,
    14.136097974741747174,
    -0.49191381609762019978,
    0.33994649984811888699e-4,
    0.46523628927048575665e-4,
    -0.98374475304879564677e-4,
    0.15808870322491248884e-3,
    -0.21026444172410488319e-3,
    0.21743961811521264320e-3,
    -0.16431810653676389022e-3,
    0.84418223983852743293e-4,
    -0.26190838401581408670e-4,
    0.36899182659531622704e-5
];

// Spouge approximation (suitable for large arguments)
function lngamma(z) {

    if(z < 0) return Number('0/0');
    var x = p_ln[0];
    for(var i = p_ln.length - 1; i > 0; --i) x += p_ln[i] / (z + i);
    var t = z + g_ln + 0.5;
    return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x)-Math.log(z);
}

module.exports = function gamma (z) {
    if (z < 0.5) {
        return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    }
    else if(z > 100) return Math.exp(lngamma(z));
    else {
        z -= 1;
        var x = p[0];
        for (var i = 1; i < g + 2; i++) {
            x += p[i] / (z + i);
        }
        var t = z + g + 0.5;

        return Math.sqrt(2 * Math.PI)
            * Math.pow(t, z + 0.5)
            * Math.exp(-t)
            * x
        ;
    }
};

module.exports.log = lngamma;

},{}],4:[function(require,module,exports){
var bundleFn = arguments[3];
var sources = arguments[4];
var cache = arguments[5];

var stringify = JSON.stringify;

module.exports = function (fn) {
    var keys = [];
    var wkey;
    var cacheKeys = Object.keys(cache);

    for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        var exp = cache[key].exports;
        // Using babel as a transpiler to use esmodule, the export will always
        // be an object with the default export as a property of it. To ensure
        // the existing api and babel esmodule exports are both supported we
        // check for both
        if (exp === fn || exp.default === fn) {
            wkey = key;
            break;
        }
    }

    if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};
        for (var i = 0, l = cacheKeys.length; i < l; i++) {
            var key = cacheKeys[i];
            wcache[key] = key;
        }
        sources[wkey] = [
            Function(['require','module','exports'], '(' + fn + ')(self)'),
            wcache
        ];
    }
    var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);

    var scache = {}; scache[wkey] = wkey;
    sources[skey] = [
        Function(['require'], (
            // try to call default if defined to also support babel esmodule
            // exports
            'var f = require(' + stringify(wkey) + ');' +
            '(f.default ? f.default : f)(self);'
        )),
        scache
    ];

    var src = '(' + bundleFn + ')({'
        + Object.keys(sources).map(function (key) {
            return stringify(key) + ':['
                + sources[key][0]
                + ',' + stringify(sources[key][1]) + ']'
            ;
        }).join(',')
        + '},{},[' + stringify(skey) + '])'
    ;

    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    return new Worker(URL.createObjectURL(
        new Blob([src], { type: 'text/javascript' })
    ));
};

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImpzL21haW4uanMiLCJqcy93b3JrZXIuanMiLCJub2RlX21vZHVsZXMvZ2FtbWEvaW5kZXguanMiLCJub2RlX21vZHVsZXMvd2Vid29ya2lmeS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciB3b3JrID0gcmVxdWlyZSgnd2Vid29ya2lmeScpO1xuXG52YXIgdyA9IHdvcmsocmVxdWlyZSgnLi93b3JrZXIuanMnKSk7XG53LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICBjb25zb2xlLmxvZygoZXYuZGF0YSkudG9TdHJpbmcoKSk7XG4gICAgdmFyIHMgPSAoZXYuZGF0YSkudG9TdHJpbmcoKVxuICAgICQoJyNvdXRwdXQnKS5hcHBlbmQocyArIFwiPGJyLz5cIik7XG59KTtcblxudy5wb3N0TWVzc2FnZSg0KTsgLy8gc2VuZCB0aGUgd29ya2VyIGEgbWVzc2FnZVxuIiwidmFyIGdhbW1hID0gcmVxdWlyZSgnZ2FtbWEnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc2VsZikge1xuICAgIHNlbGYuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsZnVuY3Rpb24gKGV2KXtcbiAgICAgICAgdmFyIHN0YXJ0TnVtID0gcGFyc2VJbnQoZXYuZGF0YSk7IC8vIGV2LmRhdGE9NCBmcm9tIG1haW4uanNcbiAgICAgICAgXG4gICAgICAgIHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciByID0gc3RhcnROdW0gLyBNYXRoLnJhbmRvbSgpIC0gMTtcbiAgICAgICAgICAgIHNlbGYucG9zdE1lc3NhZ2UoWyBzdGFydE51bSwgciwgZ2FtbWEocikgXSk7XG4gICAgICAgIH0sIDUwMCk7XG4gICAgfSk7XG59O1xuIiwiLy8gdHJhbnNsaXRlcmF0ZWQgZnJvbSB0aGUgcHl0aG9uIHNuaXBwZXQgaGVyZTpcbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGFuY3pvc19hcHByb3hpbWF0aW9uXG5cbnZhciBnID0gNztcbnZhciBwID0gW1xuICAgIDAuOTk5OTk5OTk5OTk5ODA5OTMsXG4gICAgNjc2LjUyMDM2ODEyMTg4NTEsXG4gICAgLTEyNTkuMTM5MjE2NzIyNDAyOCxcbiAgICA3NzEuMzIzNDI4Nzc3NjUzMTMsXG4gICAgLTE3Ni42MTUwMjkxNjIxNDA1OSxcbiAgICAxMi41MDczNDMyNzg2ODY5MDUsXG4gICAgLTAuMTM4NTcxMDk1MjY1NzIwMTIsXG4gICAgOS45ODQzNjk1NzgwMTk1NzE2ZS02LFxuICAgIDEuNTA1NjMyNzM1MTQ5MzExNmUtN1xuXTtcblxudmFyIGdfbG4gPSA2MDcvMTI4O1xudmFyIHBfbG4gPSBbXG4gICAgMC45OTk5OTk5OTk5OTk5OTcwOTE4MixcbiAgICA1Ny4xNTYyMzU2NjU4NjI5MjM1MTcsXG4gICAgLTU5LjU5Nzk2MDM1NTQ3NTQ5MTI0OCxcbiAgICAxNC4xMzYwOTc5NzQ3NDE3NDcxNzQsXG4gICAgLTAuNDkxOTEzODE2MDk3NjIwMTk5NzgsXG4gICAgMC4zMzk5NDY0OTk4NDgxMTg4ODY5OWUtNCxcbiAgICAwLjQ2NTIzNjI4OTI3MDQ4NTc1NjY1ZS00LFxuICAgIC0wLjk4Mzc0NDc1MzA0ODc5NTY0Njc3ZS00LFxuICAgIDAuMTU4MDg4NzAzMjI0OTEyNDg4ODRlLTMsXG4gICAgLTAuMjEwMjY0NDQxNzI0MTA0ODgzMTllLTMsXG4gICAgMC4yMTc0Mzk2MTgxMTUyMTI2NDMyMGUtMyxcbiAgICAtMC4xNjQzMTgxMDY1MzY3NjM4OTAyMmUtMyxcbiAgICAwLjg0NDE4MjIzOTgzODUyNzQzMjkzZS00LFxuICAgIC0wLjI2MTkwODM4NDAxNTgxNDA4NjcwZS00LFxuICAgIDAuMzY4OTkxODI2NTk1MzE2MjI3MDRlLTVcbl07XG5cbi8vIFNwb3VnZSBhcHByb3hpbWF0aW9uIChzdWl0YWJsZSBmb3IgbGFyZ2UgYXJndW1lbnRzKVxuZnVuY3Rpb24gbG5nYW1tYSh6KSB7XG5cbiAgICBpZih6IDwgMCkgcmV0dXJuIE51bWJlcignMC8wJyk7XG4gICAgdmFyIHggPSBwX2xuWzBdO1xuICAgIGZvcih2YXIgaSA9IHBfbG4ubGVuZ3RoIC0gMTsgaSA+IDA7IC0taSkgeCArPSBwX2xuW2ldIC8gKHogKyBpKTtcbiAgICB2YXIgdCA9IHogKyBnX2xuICsgMC41O1xuICAgIHJldHVybiAuNSpNYXRoLmxvZygyKk1hdGguUEkpKyh6Ky41KSpNYXRoLmxvZyh0KS10K01hdGgubG9nKHgpLU1hdGgubG9nKHopO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdhbW1hICh6KSB7XG4gICAgaWYgKHogPCAwLjUpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguUEkgLyAoTWF0aC5zaW4oTWF0aC5QSSAqIHopICogZ2FtbWEoMSAtIHopKTtcbiAgICB9XG4gICAgZWxzZSBpZih6ID4gMTAwKSByZXR1cm4gTWF0aC5leHAobG5nYW1tYSh6KSk7XG4gICAgZWxzZSB7XG4gICAgICAgIHogLT0gMTtcbiAgICAgICAgdmFyIHggPSBwWzBdO1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGcgKyAyOyBpKyspIHtcbiAgICAgICAgICAgIHggKz0gcFtpXSAvICh6ICsgaSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHQgPSB6ICsgZyArIDAuNTtcblxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KDIgKiBNYXRoLlBJKVxuICAgICAgICAgICAgKiBNYXRoLnBvdyh0LCB6ICsgMC41KVxuICAgICAgICAgICAgKiBNYXRoLmV4cCgtdClcbiAgICAgICAgICAgICogeFxuICAgICAgICA7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMubG9nID0gbG5nYW1tYTtcbiIsInZhciBidW5kbGVGbiA9IGFyZ3VtZW50c1szXTtcbnZhciBzb3VyY2VzID0gYXJndW1lbnRzWzRdO1xudmFyIGNhY2hlID0gYXJndW1lbnRzWzVdO1xuXG52YXIgc3RyaW5naWZ5ID0gSlNPTi5zdHJpbmdpZnk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICB2YXIgd2tleTtcbiAgICB2YXIgY2FjaGVLZXlzID0gT2JqZWN0LmtleXMoY2FjaGUpO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjYWNoZUtleXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBrZXkgPSBjYWNoZUtleXNbaV07XG4gICAgICAgIHZhciBleHAgPSBjYWNoZVtrZXldLmV4cG9ydHM7XG4gICAgICAgIC8vIFVzaW5nIGJhYmVsIGFzIGEgdHJhbnNwaWxlciB0byB1c2UgZXNtb2R1bGUsIHRoZSBleHBvcnQgd2lsbCBhbHdheXNcbiAgICAgICAgLy8gYmUgYW4gb2JqZWN0IHdpdGggdGhlIGRlZmF1bHQgZXhwb3J0IGFzIGEgcHJvcGVydHkgb2YgaXQuIFRvIGVuc3VyZVxuICAgICAgICAvLyB0aGUgZXhpc3RpbmcgYXBpIGFuZCBiYWJlbCBlc21vZHVsZSBleHBvcnRzIGFyZSBib3RoIHN1cHBvcnRlZCB3ZVxuICAgICAgICAvLyBjaGVjayBmb3IgYm90aFxuICAgICAgICBpZiAoZXhwID09PSBmbiB8fCBleHAuZGVmYXVsdCA9PT0gZm4pIHtcbiAgICAgICAgICAgIHdrZXkgPSBrZXk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICghd2tleSkge1xuICAgICAgICB3a2V5ID0gTWF0aC5mbG9vcihNYXRoLnBvdygxNiwgOCkgKiBNYXRoLnJhbmRvbSgpKS50b1N0cmluZygxNik7XG4gICAgICAgIHZhciB3Y2FjaGUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjYWNoZUtleXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gY2FjaGVLZXlzW2ldO1xuICAgICAgICAgICAgd2NhY2hlW2tleV0gPSBrZXk7XG4gICAgICAgIH1cbiAgICAgICAgc291cmNlc1t3a2V5XSA9IFtcbiAgICAgICAgICAgIEZ1bmN0aW9uKFsncmVxdWlyZScsJ21vZHVsZScsJ2V4cG9ydHMnXSwgJygnICsgZm4gKyAnKShzZWxmKScpLFxuICAgICAgICAgICAgd2NhY2hlXG4gICAgICAgIF07XG4gICAgfVxuICAgIHZhciBza2V5ID0gTWF0aC5mbG9vcihNYXRoLnBvdygxNiwgOCkgKiBNYXRoLnJhbmRvbSgpKS50b1N0cmluZygxNik7XG5cbiAgICB2YXIgc2NhY2hlID0ge307IHNjYWNoZVt3a2V5XSA9IHdrZXk7XG4gICAgc291cmNlc1tza2V5XSA9IFtcbiAgICAgICAgRnVuY3Rpb24oWydyZXF1aXJlJ10sIChcbiAgICAgICAgICAgIC8vIHRyeSB0byBjYWxsIGRlZmF1bHQgaWYgZGVmaW5lZCB0byBhbHNvIHN1cHBvcnQgYmFiZWwgZXNtb2R1bGVcbiAgICAgICAgICAgIC8vIGV4cG9ydHNcbiAgICAgICAgICAgICd2YXIgZiA9IHJlcXVpcmUoJyArIHN0cmluZ2lmeSh3a2V5KSArICcpOycgK1xuICAgICAgICAgICAgJyhmLmRlZmF1bHQgPyBmLmRlZmF1bHQgOiBmKShzZWxmKTsnXG4gICAgICAgICkpLFxuICAgICAgICBzY2FjaGVcbiAgICBdO1xuXG4gICAgdmFyIHNyYyA9ICcoJyArIGJ1bmRsZUZuICsgJykoeydcbiAgICAgICAgKyBPYmplY3Qua2V5cyhzb3VyY2VzKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ2lmeShrZXkpICsgJzpbJ1xuICAgICAgICAgICAgICAgICsgc291cmNlc1trZXldWzBdXG4gICAgICAgICAgICAgICAgKyAnLCcgKyBzdHJpbmdpZnkoc291cmNlc1trZXldWzFdKSArICddJ1xuICAgICAgICAgICAgO1xuICAgICAgICB9KS5qb2luKCcsJylcbiAgICAgICAgKyAnfSx7fSxbJyArIHN0cmluZ2lmeShza2V5KSArICddKSdcbiAgICA7XG5cbiAgICB2YXIgVVJMID0gd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMIHx8IHdpbmRvdy5tb3pVUkwgfHwgd2luZG93Lm1zVVJMO1xuXG4gICAgcmV0dXJuIG5ldyBXb3JrZXIoVVJMLmNyZWF0ZU9iamVjdFVSTChcbiAgICAgICAgbmV3IEJsb2IoW3NyY10sIHsgdHlwZTogJ3RleHQvamF2YXNjcmlwdCcgfSlcbiAgICApKTtcbn07XG4iXX0=
