'use strict';

const { sign, verify } = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require('./constant');

const createAccessToken = (userId) => {
  return sign({ userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: '20m',
  });
};

// Create Refresh Token using the KEY
const createRefreshToken = (userId) => {
  return sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

const isAuthenticated = (req) => {
  if (!req.headers['authorization']) throw new Error('You need to login.');
  return verify(authorization.split(' ')[1], ACCESS_TOKEN_SECRET).userId;
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  isAuthenticated
};
