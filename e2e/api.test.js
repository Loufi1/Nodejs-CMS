const axios = require('axios');
const { sign_In, sign_Up, me, change_me, refresh } = require('./auth');
const {
  page_get,
  page_post,
  page_put,
  page_delete,
  pages_get,
} = require('./page');
const {
  article_get,
  article_post,
  article_put,
  article_delete,
  article_delete_comment,
  articles_get,
} = require('./article');

const { email, password, setToken, getToken } = require('./utils/client-axios');
const { HttpStatusCode } = require('./utils/http-status-code');
const { client } = require('./utils/mongo-client');

afterAll(async () => {
  return await client.close();
});

describe('Authentification tests', () => {
  beforeAll(async () => {
    const users = client.db().collection('users');
    await users.deleteOne({ email });
    return true;
  });

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

  test('Invalid sign in #6', async () => {
    const response = await sign_In(
      'not-an-existing-email',
      'a-very-string-password'
    );
    expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
  });
});

describe('JsonWebToken management tests', () => {
  const tmpPassword = 'temporaryPassword';

  beforeAll(async () => {
    const result_sign_up = await sign_Up(email, password);
    const result_sign_in = await sign_In(email, password);
    setToken(result_sign_in.data.access_token.token);
  });

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

  test('invalid GET /auth/me #5', async () => {
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

describe('Page feature tests', () => {
  const newTitle = 'Headless new title page test e2e';
  const newSlug = 'headless-new-title-page-test-e2e';
  const page = {
    one: {
      slug: 'headless-cms-testing-e2e',
      body: {
        title: 'Headless Cms Testing e2e',
        content: 'This is a page especially created to do some e2e testing',
        picture: 'https://placekitten.com/200/300',
      },
    },
    two: {
      slug: 'headless-cms-testing-e2e-future-publish',
      body: {
        title: 'Headless Cms Testing e2e future publish',
        content: 'This is a page especially created to do some e2e testing',
        publishDate: (() => {
          const date = new Date();
          date.setDate(date.getDate() + 7);
          return date;
        })(),
      },
    },
  };

  beforeAll(async () => {
    const posts = client.db().collection('posts');
    await posts.deleteOne({ type: 'PAGE', slug: page.one.slug });
    await posts.deleteOne({ type: 'PAGE', slug: page.two.slug });
    await posts.deleteOne({ type: 'PAGE', slug: newSlug });
    if (getToken() === undefined) {
      const result_sign_up = await sign_Up(email, password);
      const result_sign_in = await sign_In(email, password);
      setToken(result_sign_in.data.access_token.token);
    }
  });

  test('Valid creation of a published page', async () => {
    const result = await page_post(page.one.body);
    expect(result.status).toBe(HttpStatusCode.CREATED);
    expect(result.data.title).toBe(page.one.body.title);
    expect(result.data.content).toBe(page.one.body.content);
    expect(result.data.picture).toBe(page.one.body.picture);
    expect(result.data.author).toBe(email);
  });

  test('Invalid creation of a page (slug already used)', async () => {
    const result = await page_post(page.one.body);
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a page (body) #1', async () => {
    const result = await page_post({});
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a page (body) #2', async () => {
    const result = await page_post({
      title: null,
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a page (body) #3', async () => {
    const result = await page_post({
      title: '',
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a page (body) #4', async () => {
    const result = await page_post({
      title: '     ',
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a page (body) #5', async () => {
    const result = await page_post({
      content: null,
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a page (body) #6', async () => {
    const result = await page_post({
      content: '',
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a page (body) #7', async () => {
    const result = await page_post({
      content: '     ',
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a page (body) #8', async () => {
    const result = await page_post({
      content: null,
      title: null,
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a page (body) #9', async () => {
    const result = await page_post({
      content: '',
      title: '',
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a page (body) #10', async () => {
    const result = await page_post({
      content: '     ',
      title: '     ',
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Valid GET of a published page (auth)', async () => {
    const result = await page_get(page.one.slug);
    expect(result.status).toBe(HttpStatusCode.OK);
    expect(result.data.title).toBe(page.one.body.title);
    expect(result.data.content).toBe(page.one.body.content);
    expect(result.data.author).toBe(email);
  });

  test('Valid GET of a published page (non-auth)', async () => {
    try {
      const result = await axios.get(
        'http://localhost:3000/page/' + page.one.slug
      );
      expect(result.status).toBe(HttpStatusCode.OK);
      expect(result.data.title).toBe(page.one.body.title);
      expect(result.data.content).toBe(page.one.body.content);
      expect(result.data.author).toBe(email);
    } catch (e) {
      fail('it should not reach here');
    }
  });

  test('Valid creation of a page not published', async () => {
    const result = await page_post(page.two.body);
    expect(result.status).toBe(HttpStatusCode.CREATED);
    expect(result.data.title).toBe(page.two.body.title);
    expect(result.data.content).toBe(page.two.body.content);
    expect(result.data.author).toBe(email);
  });

  test('Valid GET of a page not published (auth)', async () => {
    const result = await page_get(page.two.slug);
    expect(result.status).toBe(HttpStatusCode.OK);
    expect(result.data.title).toBe(page.two.body.title);
    expect(result.data.content).toBe(page.two.body.content);
    expect(result.data.author).toBe(email);
  });

  test('Valid GET of a page not published (non-auth)', async () => {
    try {
      await axios.get('http://localhost:3000/page/' + page.two.slug);
      fail('it should not reach here');
    } catch (e) {
      expect(e.response.status).toBe(HttpStatusCode.NOT_FOUND);
    }
  });

  test('Invalid GET of a page', async () => {
    try {
      await axios.get('http://localhost:3000/page/page-that-doesnt-exist !');
      fail('it should not reach here');
    } catch (e) {
      expect(e.response.status).toBe(HttpStatusCode.NOT_FOUND);
    }
  });

  test('Valid GET of page list (non-auth)', async () => {
    try {
      const result = await axios.get('http://localhost:3000/pages');
      expect(result.status).toBe(HttpStatusCode.OK);
      expect(
        result.data.find((f) => f.slug === page.one.slug) !== undefined
      ).toBe(true);
      expect(
        result.data.find((f) => f.slug === page.two.slug) !== undefined
      ).toBe(false);
    } catch (e) {
      fail('it should not reach here');
    }
  });

  test('Valid GET of page list (auth)', async () => {
    const result = await pages_get();
    expect(result.status).toBe(HttpStatusCode.OK);
    expect(
      result.data.find((f) => f.slug === page.one.slug) !== undefined
    ).toBe(true);
    expect(
      result.data.find((f) => f.slug === page.two.slug) !== undefined
    ).toBe(true);
  });

  test('Valid PUT modification of page (content)', async () => {
    const newContent = 'another content that s pretty sick';
    const result = await page_put(page.one.slug, {
      content: newContent,
    });
    expect(result.status).toBe(HttpStatusCode.OK);
    expect(result.data.content).toBe(newContent);
  });

  test('Valid PUT modification of page (title)', async () => {
    let result = await page_put(page.one.slug, {
      title: newTitle,
    });
    expect(result.status).toBe(HttpStatusCode.OK);
    expect(result.data.title).toBe(newTitle);
    expect(result.data.slug).toBe(newSlug);
    result = await page_put(newSlug, {
      title: page.one.body.title,
    });
    expect(result.status).toBe(HttpStatusCode.OK);
    expect(result.data.title).toBe(page.one.body.title);
    expect(result.data.slug).toBe(page.one.slug);
  });

  test('PUT page, early publish a page (date)', async () => {
    try {
      await axios.get('http://localhost:3000/page/' + page.two.slug);
      fail('it should not reach here');
    } catch (e) {
      expect(e.response.status).toBe(HttpStatusCode.NOT_FOUND);
    }
    const result = await page_put(page.two.slug, {
      publishDate: new Date(),
    });
    expect(result.status).toBe(HttpStatusCode.OK);
    try {
      const pageResult = await axios.get(
        'http://localhost:3000/page/' + page.two.slug
      );
      expect(pageResult.status).toBe(HttpStatusCode.OK);
      expect(pageResult.data.title).toBe(page.two.body.title);
    } catch (e) {
      fail('it should not reach here');
    }
  });

  test('PUT page, hide a page (date)', async () => {
    try {
      const resultPage = await axios.get(
        'http://localhost:3000/page/' + page.two.slug
      );
      expect(resultPage.status).toBe(HttpStatusCode.OK);
    } catch (e) {
      fail('it should not reach here');
    }
    const result = await page_put(page.two.slug, {
      publishDate: null,
    });
    expect(result.status).toBe(HttpStatusCode.OK);
    try {
      await axios.get('http://localhost:3000/page/' + page.two.slug);
      fail('it should not reach here');
    } catch (e) {
      expect(e.response.status).toBe(HttpStatusCode.NOT_FOUND);
    }
  });

  test('Delete a page', async () => {
    expect((await page_get(page.one.slug)).status).toBe(HttpStatusCode.OK);
    expect((await page_delete(page.one.slug)).status).toBe(HttpStatusCode.OK);
    expect((await page_get(page.one.slug)).status).toBe(
      HttpStatusCode.NOT_FOUND
    );
  });
});

describe('Article feature tests', () => {
  const newTitle = 'Headless new title article test e2e';
  const newSlug = 'headless-new-title-article-test-e2e';
  const article = {
    one: {
      slug: 'headless-cms-testing-e2e',
      body: {
        title: 'Headless Cms Testing e2e',
        content: 'This is a article especially created to do some e2e testing',
        picture: 'https://placekitten.com/200/300',
      },
    },
    two: {
      slug: 'headless-cms-testing-e2e-future-publish',
      body: {
        title: 'Headless Cms Testing e2e future publish',
        content: 'This is a article especially created to do some e2e testing',
        publishDate: (() => {
          const date = new Date();
          date.setDate(date.getDate() + 7);
          return date;
        })(),
      },
    },
  };

  beforeAll(async () => {
    const posts = client.db().collection('posts');
    await posts.deleteOne({ type: 'ARTICLE', slug: article.one.slug });
    await posts.deleteOne({ type: 'ARTICLE', slug: article.two.slug });
    await posts.deleteOne({ type: 'ARTICLE', slug: newSlug });
    if (getToken() === undefined) {
      const result_sign_up = await sign_Up(email, password);
      const result_sign_in = await sign_In(email, password);
      setToken(result_sign_in.data.access_token.token);
    }
  });

  test('Valid creation of a published article', async () => {
    const result = await article_post(article.one.body);
    expect(result.status).toBe(HttpStatusCode.CREATED);
    expect(result.data.title).toBe(article.one.body.title);
    expect(result.data.content).toBe(article.one.body.content);
    expect(result.data.picture).toBe(article.one.body.picture);
    expect(result.data.author).toBe(email);
  });

  test('Invalid creation of a article (slug already used)', async () => {
    const result = await article_post(article.one.body);
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a article (body) #1', async () => {
    const result = await article_post({});
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a article (body) #2', async () => {
    const result = await article_post({
      title: null,
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a article (body) #3', async () => {
    const result = await article_post({
      title: '',
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a article (body) #4', async () => {
    const result = await article_post({
      title: '     ',
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a article (body) #5', async () => {
    const result = await article_post({
      content: null,
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a article (body) #6', async () => {
    const result = await article_post({
      content: '',
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a article (body) #7', async () => {
    const result = await article_post({
      content: '     ',
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a article (body) #8', async () => {
    const result = await article_post({
      content: null,
      title: null,
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a article (body) #9', async () => {
    const result = await article_post({
      content: '',
      title: '',
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Invalid creation of a article (body) #10', async () => {
    const result = await article_post({
      content: '     ',
      title: '     ',
    });
    expect(result.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  test('Valid GET of a published article (auth)', async () => {
    const result = await article_get(article.one.slug);
    expect(result.status).toBe(HttpStatusCode.OK);
    expect(result.data.title).toBe(article.one.body.title);
    expect(result.data.content).toBe(article.one.body.content);
    expect(result.data.author).toBe(email);
  });

  test('Valid GET of a published article (non-auth)', async () => {
    try {
      const result = await axios.get(
        'http://localhost:3000/article/' + article.one.slug
      );
      expect(result.status).toBe(HttpStatusCode.OK);
      expect(result.data.title).toBe(article.one.body.title);
      expect(result.data.content).toBe(article.one.body.content);
      expect(result.data.author).toBe(email);
    } catch (e) {
      fail('it should not reach here');
    }
  });

  test('Valid creation of a article not published', async () => {
    const result = await article_post(article.two.body);
    expect(result.status).toBe(HttpStatusCode.CREATED);
    expect(result.data.title).toBe(article.two.body.title);
    expect(result.data.content).toBe(article.two.body.content);
    expect(result.data.author).toBe(email);
  });

  test('Valid GET of a article not published (auth)', async () => {
    const result = await article_get(article.two.slug);
    expect(result.status).toBe(HttpStatusCode.OK);
    expect(result.data.title).toBe(article.two.body.title);
    expect(result.data.content).toBe(article.two.body.content);
    expect(result.data.author).toBe(email);
  });

  test('Valid GET of a article not published (non-auth)', async () => {
    try {
      await axios.get('http://localhost:3000/article/' + article.two.slug);
      fail('it should not reach here');
    } catch (e) {
      expect(e.response.status).toBe(HttpStatusCode.NOT_FOUND);
    }
  });

  test('Invalid GET of a article', async () => {
    try {
      await axios.get(
        'http://localhost:3000/article/article-that-doesnt-exist !'
      );
      fail('it should not reach here');
    } catch (e) {
      expect(e.response.status).toBe(HttpStatusCode.NOT_FOUND);
    }
  });

  test('Valid GET of article list (non-auth)', async () => {
    try {
      const result = await axios.get('http://localhost:3000/articles');
      expect(result.status).toBe(HttpStatusCode.OK);
      expect(
        result.data.find((f) => f.slug === article.one.slug) !== undefined
      ).toBe(true);
      expect(
        result.data.find((f) => f.slug === article.two.slug) !== undefined
      ).toBe(false);
    } catch (e) {
      fail('it should not reach here');
    }
  });

  test('Valid GET of article list (auth)', async () => {
    const result = await articles_get();
    expect(result.status).toBe(HttpStatusCode.OK);
    expect(
      result.data.find((f) => f.slug === article.one.slug) !== undefined
    ).toBe(true);
    expect(
      result.data.find((f) => f.slug === article.two.slug) !== undefined
    ).toBe(true);
  });

  test('Valid comment on article', async () => {
    const user = 'john smith';
    const content = 'great content';
    await axios.post(
      `http://localhost:3000/article/${article.one.slug}/comment`,
      {
        username: user,
        content: content,
      }
    );
    const result = await axios.get(
      'http://localhost:3000/article/' + article.one.slug
    );
    expect(result.status).toBe(HttpStatusCode.OK);
    expect(
      result.data.comments.find(
        (f) => f.author === user && f.content === content
      ) !== undefined
    ).toBe(true);
  });

  test('Valid comment on article', async () => {
    const user = 'Jonathan Ermits';
    const content = 'another really great content';
    const resultComment = await axios.post(
      `http://localhost:3000/article/${article.one.slug}/comment`,
      {
        username: user,
        content: content,
      }
    );
    expect(resultComment.status).toBe(HttpStatusCode.OK);
    expect(
      (await article_delete_comment(article.one.slug, resultComment.data._id))
        .status
    ).toBe(HttpStatusCode.OK);
    const result = await axios.get(
      'http://localhost:3000/article/' + article.one.slug
    );
    expect(result.status).toBe(HttpStatusCode.OK);
    expect(
      result.data.comments.find(
        (f) => f.author === user && f.content === content
      ) === undefined
    ).toBe(true);
  });

  test('Invalid comment on article (not published)', async () => {
    const user = 'john smith';
    const content = 'great content';
    try {
      await axios.post(
        `http://localhost:3000/article/${article.two.slug}/comment`,
        {
          username: user,
          content: content,
        }
      );
      fail('it should not reach here');
    } catch (e) {
      expect(e.response.status).toBe(HttpStatusCode.NOT_FOUND);
    }
  });

  test('Valid PUT modification of article (content)', async () => {
    const newContent = 'another content that s pretty sick';
    const result = await article_put(article.one.slug, {
      content: newContent,
    });
    expect(result.status).toBe(HttpStatusCode.OK);
    expect(result.data.content).toBe(newContent);
  });

  test('Valid PUT modification of article (title)', async () => {
    let result = await article_put(article.one.slug, {
      title: newTitle,
    });
    expect(result.status).toBe(HttpStatusCode.OK);
    expect(result.data.title).toBe(newTitle);
    expect(result.data.slug).toBe(newSlug);
    result = await article_put(newSlug, {
      title: article.one.body.title,
    });
    expect(result.status).toBe(HttpStatusCode.OK);
    expect(result.data.title).toBe(article.one.body.title);
    expect(result.data.slug).toBe(article.one.slug);
  });

  test('PUT article, early publish a article (date)', async () => {
    try {
      await axios.get('http://localhost:3000/article/' + article.two.slug);
      fail('it should not reach here');
    } catch (e) {
      expect(e.response.status).toBe(HttpStatusCode.NOT_FOUND);
    }
    const result = await article_put(article.two.slug, {
      publishDate: new Date(),
    });
    expect(result.status).toBe(HttpStatusCode.OK);
    try {
      const articleResult = await axios.get(
        'http://localhost:3000/article/' + article.two.slug
      );
      expect(articleResult.status).toBe(HttpStatusCode.OK);
      expect(articleResult.data.title).toBe(article.two.body.title);
    } catch (e) {
      fail('it should not reach here');
    }
  });

  test('PUT article, hide a article (date)', async () => {
    try {
      const resultPage = await axios.get(
        'http://localhost:3000/article/' + article.two.slug
      );
      expect(resultPage.status).toBe(HttpStatusCode.OK);
    } catch (e) {
      fail('it should not reach here');
    }
    const result = await article_put(article.two.slug, {
      publishDate: null,
    });
    expect(result.status).toBe(HttpStatusCode.OK);
    try {
      await axios.get('http://localhost:3000/article/' + article.two.slug);
      fail('it should not reach here');
    } catch (e) {
      expect(e.response.status).toBe(HttpStatusCode.NOT_FOUND);
    }
  });

  test('Delete a article', async () => {
    expect((await article_get(article.one.slug)).status).toBe(
      HttpStatusCode.OK
    );
    expect((await article_delete(article.one.slug)).status).toBe(
      HttpStatusCode.OK
    );
    expect((await article_get(article.one.slug)).status).toBe(
      HttpStatusCode.NOT_FOUND
    );
  });
});
