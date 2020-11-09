const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || 'secretely-secret-token';
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'very-secret-token';

module.exports = {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
};
