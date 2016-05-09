# webworkify example
example of using [webworkify](https://github.com/substack/webworkify). 
[browserifying](http://browserify.org) cmd: 
```bash
browserify -d js/main.js --standalone max-test-webworkify > dist/max-test-webworkify-dev.js
```

# install
npm install

# run
1. setup a simple web server
```bash
   python -m SimpleHTTPServer 8000
```
2. open http://localhost:8000/test.html in browser

you shall see output in webpage
```
4,7.73861741792747,2989.6434661329836
4,3.463177605631233,3.1917763248469853
4,5.247136328082968,35.054693294361215
4,4.399449006610608,10.128489022555895
.....
```

# Notes:
   dont try to run main.js under node. you will get error.
