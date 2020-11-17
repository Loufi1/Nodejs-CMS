const { HttpStatusCode } = require('../../utils/http-status-code');
const { isAuthenticated } = require('../../utils/auth-token');
const { client } = require('../../utils/mongo-client');

function routes(path, app) {
  app.get(path + '/', async (req, res) => {
    const collection = client.db().collection('posts');
    let articles = [];
    const result = await collection.find(
      { type: 'ARTICLE' },
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
    await result.forEach((e) => articles.push(e));
    if (!isAuthenticated(req)) {
      articles = articles.filter(
        (f) => f.publishDate !== null && new Date(f.publishDate) < new Date()
      );
    }
    const { per_page = 20, page } = req.query;
    if (page) {
      articles = articles.slice((page - 1) * per_page, page * per_page);
    }

    res.statusCode = HttpStatusCode.OK;
    res.send(articles);
  });
}

module.exports.routes = routes;
