const HomemadeExpress = require('./utils/api-controller.js').api;
const routes = require('./routes').routes;
const bodyParser = require('./middlewares/body-parser');
const queryParser = require('./middlewares/query-parser');
const cookieParser = require('./middlewares/cookie-parser');
const cors = require('./middlewares/cors');

const port = process.env.PORT || 3000;
const hostname = '0.0.0.0';
const app = new HomemadeExpress();

app.use(queryParser());
app.use(bodyParser());
app.use(cookieParser());
app.use(cors());

app.get('/ping', async (req, res) => {
  res.statusCode = 200;
  res.end();
});

app.routing('/', routes);

app.listen(port, hostname, () => {
  console.log('Server running on port: ' + port);
});
