const { HttpStatusCode } = require('../../utils/http-error');

function routes(path, app) {
  app.post(path, (req, res) => {
    //TODO: implem this: create a comment
    res.statusCode = HttpStatusCode.NOT_IMPLEMENTED;
    res.end();
  });

  app.put(path, (req, res) => {
    //TODO: implem this: edit a comment
    res.statusCode = HttpStatusCode.NOT_IMPLEMENTED;
    res.end();
  });

  app.delete(path, (req, res) => {
    //TODO: implem this: delete a comment
    res.statusCode = HttpStatusCode.NOT_IMPLEMENTED;
    res.end();
  });
}

module.exports.routes = routes;
