const { HttpStatusCode } = require('../../utils/http-status-code');
const { isAuthenticated } = require('../../utils/auth-token');
const { client } = require('../../utils/mongo-client');

function routes(path, app) {
  app.get(path, (req, res) => {
    //TODO: implem this: get an article from it's slug
    res.statusCode = HttpStatusCode.NOT_IMPLEMENTED;
    res.end();
  });

  app.post(path, async (req, res) => {
    const email = isAuthenticated(req);
    if (!email) {
      res.statusCode = HttpStatusCode.UNAUTHORIZED;
      res.end();
      return;
    }

    const { title, content, publishDate = new Date(), picture } = req.body;
    if (!title || title.trim() === '' || !content) {
      res.statusCode = HttpStatusCode.BAD_REQUEST;
      res.send({ error: 'you need to provide at least title & content' });
      return;
    }
    const formatedTitle = title
      .trim()
      .split(' ')
      .filter((f) => !!f)
      .join(' ');
    const slug = formatedTitle.split(' ').join('-').toLowerCase();
    const user = await client.db().collection('users').findOne({ email });

    const collection = client.db().collection('posts');
    const alreadyOne = await collection.findOne({ slug, type: 'ARTICLE' });
    if (alreadyOne) {
      res.statusCode = HttpStatusCode.BAD_REQUEST;
      res.send({ error: 'title already exist' });
      return;
    }

    const post = {
      title: formatedTitle,
      content,
      author: user.email,
      picture,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishDate,
      type: 'ARTICLE',
      comment: [],
    };
    const result = await collection.insertOne(post);
    res.statusCode = HttpStatusCode.CREATED;
    res.send(result.ops[0]);
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
