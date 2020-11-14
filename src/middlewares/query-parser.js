'use strict';
const url = require('url');

const queryParser = () => (req, res, next) => {
  const { pathname, query } = url.parse(req.url, true);
  req.url = pathname;
  req.query = query;
  next(req, res);
};

module.exports = queryParser;
