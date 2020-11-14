const { sign_In, sign_Up, me, refresh } = require('./auth');
const { email, password, setToken } = require('./utils/client-axios');
const { HttpStatusCode } = require('./utils/http-status-code');

let token;

beforeAll(async () => {
  const result_sign_up = await sign_Up(email, password);
  if (result_sign_up.statusCode === HttpStatusCode.CREATED)
    console.log('%s successfully created', email);
  const result_sign_in = await sign_In(email, password);
  if (result_sign_in.status === HttpStatusCode.OK)
    console.log('%s logged', email);
  setToken(token);
});


describe('Authentification tests', () => {
  test('valid Get /auth/me', async () => {
    const result = await me();
    expect(result.data.email).toBe(email);
  });
});
