const { client } = require('./utils/client-axios');
const { HttpStatusCode } = require('./utils/http-status-code');

const sign_Up = async (email, password) => {
  try {
    return await client.post('/auth/signup', {
      email,
      password,
    });
  } catch (e) {
    return e.response;
  }
};

const sign_In = async (email, password) => {
  try {
    return await client.post('/auth/signin', {
      email,
      password,
    });
  } catch (e) {
    return e.response;
  }
};

const me = async () => {
  try {
    return await client.get('/auth/me');
  } catch (e) {
    return e.response;
  }
};

const refresh = async () => {
  try {
    return await client.get('/auth/me');
  } catch (e) {
    return e.response;
  }
};

module.exports = {
  sign_Up,
  sign_In,
  me,
  refresh,
};
