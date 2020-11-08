const { HttpStatusCode } = require('../../utils/http-status-code');
const { client } = require('../../utils/mongo-client');
const hash = require('../../utils/hash');
const {
  createAccessToken,
  createRefreshToken,
} = require('../../utils/auth-token');

function routes(path, app) {
  app.post(path + '/signup', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.statusCode = HttpStatusCode.BAD_REQUEST;
      res.end();
      return;
    }
    const hashedPasswd = hash.hash512(password);
    const collection = client.db().collection('users');

    const alreadyInUse = await collection.findOne({ email });
    if (alreadyInUse) {
      res.statusCode = HttpStatusCode.BAD_REQUEST;
      res.send({ error: 'Email already in use' });
      return;
    }

    const user = {
      email,
      password: hashedPasswd,
      roles: ['User'],
      profilPic:
        'https://cms.qz.com/wp-content/uploads/2017/03/twitter_egg_blue.png',
    };
    const result = await collection.insertOne(user);
    res.statusCode = HttpStatusCode.CREATED;
    res.send({
      ...result.ops[0],
      password: undefined,
    });
  });

  app.post(path + '/signin', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.statusCode = HttpStatusCode.BAD_REQUEST;
      res.end();
      return;
    }

    const collection = client.db().collection('users');
    const user = await collection.findOne({ email });
    if (!user || !hash.compare(password, user.password)) {
      res.statusCode = HttpStatusCode.BAD_REQUEST;
      res.send({ error: 'Bad credentials' });
      return;
    }

    const access_token = createAccessToken(user._id);
    const accessDate = new Date();
    accessDate.setDate(accessDate.getMinutes() + 20);
    const refresh_token = createRefreshToken(user._id);
    const refreshDate = new Date();
    refreshDate.setDate(refreshDate.getDate() + 7);

    const filter = { _id: user._id };
    const updateOrder = {
      $set: {
        refresh_token: {
          token: refresh_token,
          expires: refreshDate,
        },
      },
    };
    await collection.updateOne(filter, updateOrder);
    res.setCookie('refresh_token', refresh_token, { expires: refreshDate });
    res.statusCode = HttpStatusCode.OK;
    res.send({
      ...user,
      access_token: { token: access_token, expires: accessDate },
      refresh_token: undefined,
      password: undefined,
    });
  });
}

module.exports.routes = routes;
