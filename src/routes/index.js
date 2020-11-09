const auth = require('./auth').routes;
const article = require('./article').routes;
const articles = require('./articles').routes;
const page = require('./page').routes;
const pages = require('./pages').routes;
const comment = require('./comment').routes;

function routes(path, app) {
  app.routing(path + 'auth', auth);
  app.routing(path + 'article', article);
  app.routing(path + 'articles', articles);
  app.routing(path + 'page', page);
  app.routing(path + 'pages', pages);
  app.routing(path + 'comment', comment);
}

module.exports.routes = routes;
