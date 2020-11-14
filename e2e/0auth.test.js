const { sign_In, sign_Up, me, refresh } = require('./auth');
const { client } = require('./utils/mongo-client');
const { email, password } = require('./utils/client-axios');
const { HttpStatusCode } = require('./utils/http-status-code');

beforeAll(async () => {
  const users = client.db().collection('users');
  await users.deleteOne({ email });
  return true;
});

afterAll(async () => {
  return await client.close();
});

describe('Authentification tests', () => {
  test('Valid sign up', async () => {
    const response = await sign_Up(email, password);
    expect(response.status).toBe(HttpStatusCode.CREATED);
  });

  test('Invalid sign up #1', async () => {
    const response = await sign_Up('', undefined);
    expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid sign up #2', async () => {
    const response = await sign_Up(undefined, '');
    expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid sign up #3', async () => {
    const response = await sign_Up(undefined, undefined);
    expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid sign up #4', async () => {
    const response = await sign_Up('', '');
    expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid sign up #5', async () => {
    const response = await sign_Up(email, password);
    expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Valid sign in', async () => {
    const response = await sign_In(email, password);
    expect(response.status).toBe(HttpStatusCode.OK);
  });

  test('Invalid sign in #1', async () => {
    const response = await sign_In('', undefined);
    expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid sign in #2', async () => {
    const response = await sign_In(undefined, '');
    expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  it('Invalid sign in #2', async () => {
    const response = await sign_In(undefined, '');
    expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid sign in #3', async () => {
    const response = await sign_In(undefined, undefined);
    expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid sign in #4', async () => {
    const response = await sign_In('', '');
    expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid sign in #5', async () => {
    const response = await sign_In(
      'zertyuieruezuoryuzairyue',
      'euzaoryeoreotryetryztruetryterz'
    );
    expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
  });
});
