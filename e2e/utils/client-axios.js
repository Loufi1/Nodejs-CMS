const axios = require('axios');

const client = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

client.defaults.headers['authorization'] = 'Bearer foobar';

let storedToken;

const setToken = (token) => {
  storedToken = token;
  client.defaults.headers['authorization'] = `Bearer ${token}`;
};

const getToken = () => storedToken;

const email = 'Headless@cms.com';
const password = 'devdevdev';

module.exports = {
  client,
  email,
  password,
  getToken,
  setToken,
};
