const axios = require('axios');
const { sign_In, sign_Up, me, change_me, refresh } = require('./auth');
const { email, password, setToken, getToken } = require('./utils/client-axios');
const { HttpStatusCode } = require('./utils/http-status-code');

const tmpPassword = 'temporaryPassword';

beforeAll(async () => {
  const result_sign_up = await sign_Up(email, password);
  const result_sign_in = await sign_In(email, password);
  setToken(result_sign_in.data.access_token.token);
});

describe('JsonWebToken management tests', () => {
  test('valid GET /auth/me', async () => {
    const result = await me();
    expect(result.data.email).toBe(email);
  });

  test('Invalid GET /auth/me #1', async () => {
    try {
      const result = await axios.get('http://localhost:3000/auth/me');
      fail('it should not reach here');
    } catch (e) {
      expect(e.response.status).toBe(HttpStatusCode.UNAUTHORIZED);
    }
  });

  test('invalid GET /auth/me #2', async () => {
    try {
      const result = await axios.get('http://localhost:3000/auth/me', {
        headers: {
          authorization: 'Bearer toto',
        },
      });
      fail('it should not reach here');
    } catch (e) {
      expect(e.response.status).toBe(HttpStatusCode.UNAUTHORIZED);
    }
  });

  test('invalid GET /auth/me #3', async () => {
    try {
      const result = await axios.get('http://localhost:3000/auth/me', {
        headers: {
          Authorization: 'Failure ' + getToken(),
        },
      });
      fail('it should not reach here');
    } catch (e) {
      expect(e.response.status).toBe(HttpStatusCode.UNAUTHORIZED);
    }
  });

  test('invalid GET /auth/me #4', async () => {
    try {
      const result = await axios.get('http://localhost:3000/auth/me', {
        headers: {
          Authorization: getToken(),
        },
      });
      fail('it should not reach here');
    } catch (e) {
      expect(e.response.status).toBe(HttpStatusCode.UNAUTHORIZED);
    }
  });

  test('invalid GET /auth/me #4', async () => {
    try {
      const result = await axios.get('http://localhost:3000/auth/me', {
        headers: {
          Authorization: '',
        },
      });
      fail('it should not reach here');
    } catch (e) {
      expect(e.response.status).toBe(HttpStatusCode.UNAUTHORIZED);
    }
  });

  test('valid GET /auth/refresh', async () => {
    const result = await refresh();
    expect(result.status).toBe(HttpStatusCode.OK);
    expect(result.data.access_token !== undefined).toBe(true);
  });

  test('invalid GET /auth/refresh', async () => {
    try {
      const result = await axios.get('http://localhost:3000/auth/refresh');
      fail('it should not reach here');
    } catch (e) {
      expect(e.response.status).toBe(HttpStatusCode.UNAUTHORIZED);
    }
  });

  test('valid PUT /auth/me (Nothing)', async () => {
    const result = await change_me({});
    expect(result.status).toBe(HttpStatusCode.OK);
  });

  test('valid PUT /auth/me (Password)', async () => {
    let result_change = await change_me({
      oldPassword: password,
      newPassword: tmpPassword,
    });
    expect(result_change.status).toBe(HttpStatusCode.OK);

    let result_sign_in = await sign_In(email, password);
    expect(result_sign_in.status).toBe(HttpStatusCode.BAD_REQUEST);

    result_sign_in = await sign_In(email, tmpPassword);
    expect(result_sign_in.status).toBe(HttpStatusCode.OK);

    result_change = await change_me({
      oldPassword: tmpPassword,
      newPassword: password,
    });
    expect(result_change.status).toBe(HttpStatusCode.OK);

    result_sign_in = await sign_In(email, password);
    expect(result_sign_in.status).toBe(HttpStatusCode.OK);
  });

  test('Invalid PUT /auth/me (Authorization)', async () => {
    try {
      const result = await axios.put('http://localhost:3000/auth/me', {});
      fail('it should not reach here');
    } catch (e) {
      expect(e.response.status).toBe(HttpStatusCode.UNAUTHORIZED);
    }
  });

  test('Invalid PUT /auth/me (password) #1', async () => {
    const result = await change_me({ newPassword: tmpPassword });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid PUT /auth/me (password) #2', async () => {
    const result = await change_me({ oldPassword: password });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });
});
