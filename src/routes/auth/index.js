const { HttpStatusCode } = require('../../utils/http-status-code');
const { client, ObjectId } = require('../../utils/mongo-client');
const hash = require('../../utils/hash');
const {
  createAccessToken,
  createRefreshToken,
  isAuthenticated,
  verifyRefresh,
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
    const roles = ['Author'];
    const isAdmin = (await collection.estimatedDocumentCount()) === 0;
    if (isAdmin) roles.push('Admin');
    const user = {
      email,
      password: hashedPasswd,
      roles,
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
    accessDate.setMinutes(accessDate.getMinutes() + 20);
    const refresh_token = createRefreshToken(user._id);
    const refreshDate = new Date();
    refreshDate.setDate(refreshDate.getDate() + 7);

    const filter = { email };
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
      access_token: { token: access_token, expires: accessDate },
    });
  });

  app.get(path + '/me', async (req, res) => {
    const userId = isAuthenticated(req);
    if (!userId) {
      res.statusCode = HttpStatusCode.UNAUTHORIZED;
      res.end();
      return;
    }
    const user = await client
      .db()
      .collection('users')
      .findOne({ _id: ObjectId(userId) }, { projection: { password: 0 } });
    if (!user) {
      res.statusCode = HttpStatusCode.NOT_FOUND;
      res.end();
      return;
    }
    res.statusCode = HttpStatusCode.OK;
    res.send(user);
  });

  app.put(path + '/me', async (req, res) => {
    const userId = isAuthenticated(req);
    if (!userId) {
      res.statusCode = HttpStatusCode.UNAUTHORIZED;
      res.end();
      return;
    }
    const users = client.db().collection('users');
    const user = await users.findOne({ _id: ObjectId(userId) });
    if (!user) {
      res.statusCode = HttpStatusCode.NOT_FOUND;
      res.end();
      return;
    }
    const { oldPassword, newPassword, profilPic } = req.body;
    const data = {};
    if (profilPic) data.profilPic = profilPic;
    if (oldPassword && newPassword) {
      if (!hash.compare(oldPassword, user.password)) {
        res.statusCode = HttpStatusCode.UNAUTHORIZED;
        res.end();
        return;
      }
      data.password = hash.hash512(newPassword);
    } else if (oldPassword || newPassword) {
      res.statusCode = HttpStatusCode.BAD_REQUEST;
      res.send({
        error: 'Need oldPassword & newPassword fields to change password',
      });
      return;
    }
    const result = await users.findOneAndUpdate(
      { _id: ObjectId(userId) },
      {
        $set: {
          ...user,
          ...data,
        },
      },
      { returnOriginal: false }
    );

    res.statusCode = HttpStatusCode.OK;
    res.send({ ...result.value, password: undefined, _id: undefined });
  });

  app.get(path + '/refresh', async (req, res) => {
    const token = req.cookies.refresh_token || '';
    const userId = verifyRefresh(token);
    if (!token || !userId) {
      res.statusCode = HttpStatusCode.UNAUTHORIZED;
      res.end();
      return;
    }
    const collection = client.db().collection('users');
    const user = await collection.findOne({ _id: ObjectId(userId) });
    if (!user || !user.refresh_token) {
      res.statusCode = HttpStatusCode.NOT_FOUND;
      res.end();
      return;
    }
    if (token !== user.refresh_token.token) {
      res.statusCode = HttpStatusCode.UNAUTHORIZED;
      res.end();
      return;
    }

    const access_token = createAccessToken(user._id);
    const accessDate = new Date();
    accessDate.setMinutes(accessDate.getMinutes() + 20);
    const refresh_token = createRefreshToken(user._id);
    const refreshDate = new Date();
    refreshDate.setDate(refreshDate.getDate() + 7);

    const filter = { _id: ObjectId(userId) };
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
    res.send({ access_token: { token: access_token, expires: accessDate } });
  });
}

module.exports.routes = routes;
