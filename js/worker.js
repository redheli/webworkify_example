var gamma = require('gamma');

module.exports = function (self) {
    self.addEventListener('message',function (ev){
        console.log('workers: '+ev.data);
        var startNum = parseInt(ev.data); // ev.data=4 from main.js

        var count=0;
        setInterval(function () {
            console.log('workers setInterval fun');
            var r = startNum / Math.random() - 1;
            startNum++;
            self.postMessage([ startNum, r, gamma(r) ]);
        }, 500);
    });
};
