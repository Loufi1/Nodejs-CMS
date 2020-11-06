const HomemadeExpress = require('./api-controller.js').api;
const routes = require('./routes').routes;

const port = 3000;
const hostname = '127.0.0.1';
const app = new HomemadeExpress();

app.routing('/', routes);

app.listen(port, hostname, () => {
  console.log('Server running on port: ' + port);
});
