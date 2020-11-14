'use strict';

const cors = (config) => (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', config?.origin || '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next(req, res);
};

module.exports = cors;
