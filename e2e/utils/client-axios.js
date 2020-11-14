const axios = require('axios');

const client = axios.create({
  baseURL: 'http://localhost:3000',
});

client.defaults.headers['test'] = 'toto';

let token;

const setToken = (token) => {
  token = `Bearer ${token}`;
};

const email = 'Headless@cms.com';
const password = 'devdevdev';

module.exports = {
  client,
  email,
  password,
  setToken,
};
