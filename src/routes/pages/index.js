const { HttpStatusCode } = require('../../utils/http-status-code');
const { isAuthenticated } = require('../../utils/auth-token');
const { client } = require('../../utils/mongo-client');

function routes(path, app) {
  app.get(path + '/', async (req, res) => {
    const collection = client.db().collection('posts');
    let pages = [];
    const result = await collection.find(
      { type: 'PAGE' },
      {
        projection: {
          _id: 0,
          slug: 1,
          title: 1,
          content: 1,
          publishDate: 1,
          author: 1,
        },
      }
    );
    await result.forEach((e) => {
      pages.push(e);
    });
    if (!isAuthenticated(req)) {
      pages = pages.filter(
        (f) => f.publishDate !== null && new Date(f.publishDate) < new Date()
      );
    }
    const { per_page = 20, page } = req.query;
    if (page) {
      pages = pages.slice((page - 1) * per_page, page * per_page);
    }

    res.statusCode = HttpStatusCode.OK;
    res.send(pages);
  });
}
module.exports.routes = routes;
