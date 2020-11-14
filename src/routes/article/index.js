const { HttpStatusCode } = require('../../utils/http-status-code');
const { isAuthenticated } = require('../../utils/auth-token');
const { client, generateId, ObjectId } = require('../../utils/mongo-client');

function routes(path, app) {
  app.get(path + '/:slug', async (req, res) => {
    const slug = req.params.slug;
    const collection = client.db().collection('posts');
    const article = await collection.findOne(
      { slug, type: 'ARTICLE' },
      { projection: { type: 0 } }
    );

    if (
      !article ||
      (!isAuthenticated(req) &&
        article.publishDate &&
        new Date(article.publishDate) > new Date())
    ) {
      res.statusCode = HttpStatusCode.NOT_FOUND;
      res.send({ error: 'Article not found' });
      return;
    }

    res.statusCode = HttpStatusCode.OK;
    res.send(article);
  });

  app.post(path, async (req, res) => {
    const userId = isAuthenticated(req);
    if (!userId) {
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
    const user = await client
      .db()
      .collection('users')
      .findOne({ _id: ObjectId(userId) });

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
      comments: [],
    };
    const result = await collection.insertOne(post);
    res.statusCode = HttpStatusCode.CREATED;
    res.send({ ...result.ops[0], type: undefined });
  });

  app.put(path + '/:slug', async (req, res) => {
    if (!isAuthenticated(req)) {
      res.statusCode = HttpStatusCode.UNAUTHORIZED;
      res.end();
      return;
    }

    const slug = req.params.slug;
    const collection = client.db().collection('posts');
    const article = await collection.findOne({ type: 'ARTICLE', slug });
    if (!article) {
      res.statusCode = HttpStatusCode.NOT_FOUND;
      res.end();
      return;
    }

    const { title, content, publishDate } = req.body;
    const data = { title, content, publishDate };
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
    if (!isAuthenticated(req)) {
      res.statusCode = HttpStatusCode.UNAUTHORIZED;
      res.end();
      return;
    }
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

  app.post(path + '/:slug/comment', async (req, res) => {
    if (isAuthenticated(req) !== undefined) {
      res.statusCode = HttpStatusCode.UNAUTHORIZED;
      res.send({ error: 'Authors are not allowed to write comments.' });
      return;
    }
    const { slug } = req.params;
    const { username, content } = req.body;
    if (!username.trim() || !content.trim()) {
      res.statusCode = HttpStatusCode.BAD_REQUEST;
      res.send({ error: 'you need to provide at title & content' });
      return;
    }

    const filter = { slug, type: 'ARTICLE' };
    const collection = client.db().collection('posts');
    const article = await collection.findOne(filter);
    if (!article) {
      res.statusCode = HttpStatusCode.NOT_FOUND;
      res.end();
      return;
    }
    const _id = generateId().toString();
    const comment = {
      _id,
      author: username.trim(),
      content: content.trim(),
      createdAt: new Date(),
    };
    const result = await collection.findOneAndUpdate(filter, {
      $push: {
        comments: comment,
      },
    });

    res.statusCode = HttpStatusCode.OK;
    res.send(comment);
  });

  app.delete(path + '/:slug/:commentId', async (req, res) => {
    if (!isAuthenticated(req)) {
      res.statusCode = HttpStatusCode.UNAUTHORIZED;
      res.end();
      return;
    }

    const { slug, commentId } = req.params;
    const filter = { slug, type: 'ARTICLE' };
    const collection = client.db().collection('posts');
    const article = await collection.findOne(filter);
    if (
      !article ||
      article.comments.findIndex((f) => f._id === commentId) === -1
    ) {
      res.statusCode = HttpStatusCode.NOT_FOUND;
      res.end();
      return;
    }

    const comments = article.comments.filter((f) => f._id !== commentId);
    const result = await collection.findOneAndUpdate(filter, {
      $set: {
        comments,
      },
    });
    res.statusCode = HttpStatusCode.OK;
    res.end();
  });
}

module.exports.routes = routes;
