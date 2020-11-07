const crypto = require('crypto');

const genSalt = () =>
  crypto
    .randomBytes(Math.ceil(10 / 2))
    .toString('hex')
    .slice(0, 10);

const hash512 = (password, salt) => {
  if (!salt) salt = genSalt();
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  return {
    salt: salt,
    hashedPassword: hash.digest('hex'),
  };
};

const compare = (password, hash) =>
  hash512(password, hash.salt).hashedPassword === hash.hashedPassword;

module.exports = {
  hash512,
  compare,
};
