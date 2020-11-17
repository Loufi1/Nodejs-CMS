const { client } = require('./utils/client-axios');
const { HttpStatusCode } = require('./utils/http-status-code');

const article_get = async (slug) => {
  try {
    return await client.get('/article/' + slug);
  } catch (e) {
    return e.response;
  }
};

const article_post = async (data) => {
  try {
    return await client.post('/article', data);
  } catch (e) {
    return e.response;
  }
};

const article_put = async (slug, data) => {
  try {
    return await client.put('/article/' + slug, data);
  } catch (e) {
    return e.response;
  }
};

const article_delete = async (slug) => {
  try {
    return await client.delete('/article/' + slug);
  } catch (e) {
    return e.response;
  }
};

const article_delete_comment = async (slug, commentId) => {
  try {
    return await client.delete('/article/' + slug + '/' + commentId);
  } catch (e) {
    return e.response;
  }
};

const articles_get = async () => {
  try {
    return await client.get('/articles');
  } catch (e) {
    return e.response;
  }
};

module.exports = {
  article_get,
  article_post,
  article_put,
  article_delete,
  article_delete_comment,
  articles_get,
};
