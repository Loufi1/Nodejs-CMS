const { HttpStatusCode } = require('../../utils/http-error');

function routes(path, app) {
  app.get(path + '/', (req, res) => {
    //TODO: implem this: get an article from it's slug
    res.statusCode = HttpStatusCode.NOT_IMPLEMENTED;
    res.end();
  });

  app.post(path + '/', (req, res) => {
    //TODO: implem this: create an article
    res.statusCode = HttpStatusCode.NOT_IMPLEMENTED;
    res.end();
  });

  app.put(path + '/', (req, res) => {
    //TODO: implem this: modify field of an article
    res.statusCode = HttpStatusCode.NOT_IMPLEMENTED;
    res.end();
  });

  app.delete(path + '/', (req, res) => {
    //TODO: implem this: delete an article
    res.statusCode = HttpStatusCode.NOT_IMPLEMENTED;
    res.end();
  });
}

module.exports.routes = routes;
