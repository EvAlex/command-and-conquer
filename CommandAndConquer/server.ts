import http = require('http');
import express = require('express');
import logger = require('winston');

var port = process.env.port || 1337,
    app = express();

app.use(express.static('./Web'));
app.use('/bower_components', express.static('./bower_components'));

var server = app.listen(port, 'localhost', () => {
    var address = server.address(),
        host = address.address,
        port = address.port;

    logger.info(`Server is listening at http://${host}:${port}`);
});