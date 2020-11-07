const { HttpStatusCode } = require('../../utils/http-status-code');
const { client } = require('../../utils/mongo-client');
const hash = require('../../utils/hash');

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
    res.end(
      JSON.stringify({
        ...result.ops[0],
        password: undefined,
      })
    );
  });

  app.post(path + '/signin', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.statusCode = HttpStatusCode.BAD_REQUEST;
      res.end();
      return;
    }

    const collection = client.db().collection('users');
    const result = await collection.findOne({ email });
    if (!result) {
      res.statusCode = HttpStatusCode.BAD_REQUEST;
      res.send({ error: 'Bad credentials' });
      return;
    }
    if (!hash.compare(password, result.password)) {
      res.statusCode = HttpStatusCode.BAD_REQUEST;
      res.send({ error: 'Bad credentials' });
      return;
    }

    //TODO: implem token system (jwt)
    res.statusCode = HttpStatusCode.NOT_IMPLEMENTED;
    res.send({ ...result, password: undefined });
  });
}

module.exports.routes = routes;
