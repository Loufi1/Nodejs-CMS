const { HttpStatusCode } = require('../../utils/http-error');

function routes(path, app) {
  app.post(path + '/signup', (req, res) => {
    const { username, passwd } = req.body;
    if (!username || !passwd) {
      res.statusCode = HttpStatusCode.BAD_REQUEST;
      res.end();
      return;
    }

    //TODO: implem signup
    res.statusCode = HttpStatusCode.NOT_IMPLEMENTED;
    res.end();
  });

  app.post(path + '/signin', (req, res) => {
    const { username, passwd } = req.body;
    if (!username || !passwd) {
      res.statusCode = HttpStatusCode.BAD_REQUEST;
      res.end();
      return;
    }

    //TODO: implem signup
    res.statusCode = HttpStatusCode.NOT_IMPLEMENTED;
    res.end();
  });
}

module.exports.routes = routes;
