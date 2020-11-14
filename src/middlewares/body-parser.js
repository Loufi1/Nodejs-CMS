'use strict';

const bodyParser = () => (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  res.send = (pack) => res.end(JSON.stringify(pack));
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    let body = [];
    req
      .on('data', (d) => {
        body.push(d);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        req.body = JSON.parse(body);
        next(req, res);
      });
  } else {
    next(req, res);
  }
};

module.exports = bodyParser;
