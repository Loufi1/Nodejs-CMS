const HomemadeExpress = require('./api-controller.js').api;

const port = 3000;
const hostname = '127.0.0.1';
const app = new HomemadeExpress();

app.get('/test', (req, res) => {
    console.log('test');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify('OK'));
});

app.listen(port, hostname, () => {
    console.log('Server running on port: ' + port);
});