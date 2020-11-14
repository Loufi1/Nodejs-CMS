'use strict';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const setCookie = (res) => (name, value, options = {}) => {
  let str = `${name}=${value}`;
  const optionArray = Object.entries(options).map(
    ([key, value]) => capitalize(key) + '=' + value
  );
  if (optionArray.length !== 0) {
    str = [str, ...optionArray].join('; ') + ';';
  }
  res.writeHead(res.statusCode, {
    'Set-Cookie': str,
  });
};

const clearCookie = (res) => (name) => {
  res.writeHead(res.statusCode, {
    'Set-Cookie': `${name}=value; Expires=${new Date(0)}`,
  });
};

const cookieParser = () => (req, res, next) => {
  res.setCookie = setCookie(res);
  res.clearCookie = clearCookie(res);
  req.cookies = {};
  if (req.headers.cookie) {
    req.headers.cookie.split(';').forEach((e) => {
      const [field, value] = e.trim().split('=');
      req.cookies[field] = value;
    });
  }
  next(req, res);
}

module.exports = cookieParser;
