const { HttpStatusCode } = require('../../utils/http-status-code');

function routes(path, app) {
  app.get(path + '/', (req, res) => {
    //TODO: implem this: get a list of pages
    res.statusCode = HttpStatusCode.NOT_IMPLEMENTED;
    res.end();
  });
}

module.exports.routes = routes;
