const HomemadeExpress = require('./utils/api-controller.js').api;
const routes = require('./routes').routes;
const bodyParser = require('./middlewares/body-parser');
const queryParser = require('./middlewares/query-parser');

const { client } = require('./utils/mongo-client');
const { compare, hash512 } = require('./utils/hash');

const port = 3000;
const hostname = '127.0.0.1';
const app = new HomemadeExpress();

app.use(queryParser);
app.use(bodyParser);

app.get('/test', (req, res) => {
  console.log('/test');
  res.statusCode = 200;
  res.end();
});

app.routing('/', routes);

app.listen(port, hostname, () => {
  console.log('Server running on port: ' + port);
});
