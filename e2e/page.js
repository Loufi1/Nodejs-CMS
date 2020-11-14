const { client } = require('./utils/client-axios');
const { HttpStatusCode } = require('./utils/http-status-code');

const page_get = async (slug) => {
  try {
    return await client.get('/page/' + slug);
  } catch (e) {
    return e.response;
  }
};

const page_post = async (data) => {
  try {
    return await client.post('/page', data);
  } catch (e) {
    return e.response;
  }
};

const page_put = async (slug, data) => {
  try {
    return await client.put('/page/' + slug, data);
  } catch (e) {
    return e.response;
  }
};

const page_delete = async (slug) => {
  try {
    return await client.delete('/page/' + slug);
  } catch (e) {
    return e.response;
  }
};

const pages_get = async () => {
  try {
    return await client.get('/pages');
  } catch (e) {
    return e.response;
  }
};

module.exports = {
  page_get,
  page_post,
  page_put,
  page_delete,
  pages_get,
};
