'use strict';
const { HttpStatusCode } = require('../utils/http-status-code');

const cors = (config) => (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', config?.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Max-Age', 60 * 60 * 24 * 365);
  if(req.headers['access-control-request-method']) {
    res.setHeader('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
  }
  if(req.headers['access-control-request-headers']) {
    res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
  }

  if (req.method === 'OPTIONS') {
    const date = new Date().toLocaleString('en-GB', { timeZone: 'UTC' });
    res.statusCode = HttpStatusCode.OK;
    res.end();
    if (process.env.SHOW_OPTIONS_REQUESTS === "true")
      console.log(`${date}: \x1b[33m[${req.method}]\x1b[0m - ${req.url} - \x1b[32m${HttpStatusCode.OK} OK\x1b[0m`);
    return;
  }
  next(req, res);
};

module.exports = cors;
