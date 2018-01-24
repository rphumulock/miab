var express = require('express');
var helpers = require('./node.helpers');
var app = express();

app.use(express.static(helpers.root('./pub')));
app.get(
    '*',
    function (req, res) {
        res.sendFile(helpers.root('./pub/index.html'));
    });
var isProd = process.env.NODE_ENV === 'production';
if (isProd) {
    app.listen(process.env.PORT);
} else {
    app.listen(8000);
    console.log('Server On: 8000');
}

