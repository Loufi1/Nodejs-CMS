const HomemadeExpress = require('./utils/api-controller.js').api;
const routes = require('./routes').routes;
const bodyParser = require('./middlewares/body-parser');
const queryParser = require('./middlewares/query-parser');
const cookieParser = require('./middlewares/cookie-parser');

const port = 3000;
const hostname = '127.0.0.1';
const app = new HomemadeExpress();

app.use(queryParser);
app.use(bodyParser);
app.use(cookieParser);

app.get('/ping', async (req, res) => {
  res.statusCode = 200;
  res.end();
});

app.routing('/', routes);

app.listen(port, hostname, () => {
  console.log('Server running on port: ' + port);
});
