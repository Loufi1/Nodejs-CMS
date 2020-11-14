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
  try {
    if (!req.headers['authorization']) return undefined;
    const authArray = req.headers.authorization.split(' ');
    if (authArray[0] !== 'Bearer') return undefined;
    return verify(authArray[1], ACCESS_TOKEN_SECRET).userId;
  } catch (e) {
    return undefined;
  }
};

const verifyRefresh = (token) => {
  try {
    return verify(token, REFRESH_TOKEN_SECRET).userId;
  } catch (e) {
    return undefined;
  }
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  isAuthenticated,
  verifyRefresh
};
