const { HttpStatusCode } = require('../../utils/http-status-code');
const { isAuthenticated } = require('../../utils/auth-token');
const { client } = require('../../utils/mongo-client');

function routes(path, app) {
  app.get(path + '/:slug', async (req, res) => {
    const slug = req.params.slug;
    const collection = client.db().collection('posts');
    const article = await collection.findOne({ slug, type: 'ARTICLE' });

    if (!article) {
      res.statusCode = HttpStatusCode.NOT_FOUND;
      res.send({ error: 'Article not found' });
      return;
    }

    res.statusCode = HttpStatusCode.OK;
    res.send(article);
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

  app.put(path + '/', async (req, res) => {
    if (!isAuthenticated(req)) {
      res.statusCode = HttpStatusCode.UNAUTHORIZED;
      res.end();
      return;
    }

    const slug = req.params.slug;
    const collection = client.db().collection('posts');
    const page = await collection.findOne({ type: 'ARTICLE', slug });
    if (!page) {
      res.statusCode = HttpStatusCode.NOT_FOUND;
      res.end();
      return;
    }

    const { title, content, author, publishDate } = req.body;
    const data = { title, content, author, publishDate };
    Object.keys(data).forEach((e) => {
      if (data[e] === undefined) delete data[e];
    });
    if (data.title !== undefined && data.title.trim().length === 0) {
      res.statusCode = HttpStatusCode.BAD_REQUEST;
      res.send({ error: 'Title cannot be empty' });
      return;
    }

    if (data.title !== undefined) {
      const formatedTitle = data.title
          .trim()
          .split(' ')
          .filter((f) => !!f)
          .join(' ');
      data.slug = formatedTitle.split(' ').join('-').toLowerCase();
      const alreadyOne = await collection.findOne({
        type: 'ARTICLE',
        slug: data.slug,
      });
      if (alreadyOne) {
        res.statusCode = HttpStatusCode.NOT_FOUND;
        res.send({ error: `new slug ${data.slug} already exist` });
        return;
      }
    }
    const result = await collection.findOneAndUpdate(
        { type: 'ARTICLE', slug },
        {
          $set: {
            ...data,
            updatedAt: new Date(),
          },
        },
        { returnOriginal: false }
    );
    res.statusCode = HttpStatusCode.OK;
    res.send({ ...result.value, type: undefined });
  });

  app.delete(path + '/:slug', async (req, res) => {
    const slug = req.params.slug;

    const collection = client.db().collection('posts');
    const result = await collection.deleteOne({ slug, type: 'ARTICLE' });

    if (result.deletedCount === 1) {
      res.statusCode = HttpStatusCode.OK;
      res.end();
    } else {
      res.statusCode = HttpStatusCode.NOT_FOUND;
      res.end();
    }
  });
}

module.exports.routes = routes;
