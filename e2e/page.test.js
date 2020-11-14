const { sign_In, sign_Up } = require('./auth');
const {
  page_get,
  page_post,
  page_put,
  page_delete,
  pages_get,
} = require('./page');
const { client } = require('./utils/mongo-client');
const { email, password, getToken, setToken } = require('./utils/client-axios');
const { HttpStatusCode } = require('./utils/http-status-code');

const pageOneSlug = 'headless-cms-testing-e2e';
const pageOne = {
  title: 'Headless Cms Testing e2e',
  content: 'This is a page especially created to do some e2e testing',
};

const getFutureDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
};
const pageTwoSlug = 'headless-cms-testing-e2e-future-publish';
const pageTwo = {
  title: 'Headless Cms Testing e2e future publish',
  content: 'This is a page especially created to do some e2e testing',
  publishDate: getFutureDate(),
};

beforeAll(async () => {
  const posts = client.db().collection('posts');
  await posts.deleteOne({ type: 'PAGE', slug: pageOneSlug });
  await posts.deleteOne({ type: 'PAGE', slug: pageTwoSlug });
  if (getToken() === undefined) {
    const result_sign_up = await sign_Up(email, password);
    const result_sign_in = await sign_In(email, password);
    setToken(result_sign_in.data.access_token.token);
  }
});

afterAll(async () => {
  return await client.close();
});

describe('Page feature tests', () => {
  test('Valid creation of page', async () => {
    const result = await page_post(pageOne);
    expect(result.status).toBe(HttpStatusCode.CREATED);
    expect(result.data.title).toBe(pageOne.title);
    expect(result.data.content).toBe(pageOne.content);
    expect(result.data.author).toBe(email);
  });
});
