import { expect } from '@playwright/test';
import { test } from '../../utils/fixtures';
import { APILogger } from '../../utils/logger';

// model: get list of aticles: https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0
export type ArticlesResponseArray = {
  articles: Array<Article>;
  articlesCount: number;
};

// model: post new article OR update article: https://conduit-api.bondaracademy.com/api/articles/
export type Author = {
  username: string;
  bio: string | null;
  image: string;
  following: boolean;
};
export type Article = {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: Array<string>;
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Author;
};
export type ArticleResponse = {
  article: Article;
};

//model: login and get token: https://conduit-api.bondaracademy.com/api/users/login
let authToken: string;
export type LoginResponse = {
  user: {
    email: string;
    username: string;
    bio: string | null;
    image: string;
    token: string;
  };
};



test.beforeAll('Get Token', async ({ api }) => {
      const creds = {
    user: {
      email: 'lenasoldatova@test.com',
      password: 'CoA3D973PJKF@',
    },
  };

  const tokenResponse = await api
    .path('/users/login')
    .body(creds)
    .postRequest<LoginResponse>(200);

  authToken = `Token ${tokenResponse.user.token}`;
});

test('logger', () => {
    const logger = new APILogger();
    const logger2 = new APILogger();
    logger.logRequest('POST', 'https://api.example.com/11', { Authorization: authToken }, { foo: 'bar' });
    logger.logResponse(200, {foo: 'bar' });
    logger2.logRequest('GET', 'https://api.example.com/123', { Authorization: authToken }, { foo: 'bar' });
    logger2.logResponse(200, {foo: 'bar' });
    const logs = logger.getRecentLogs();
    const logs2 = logger2.getRecentLogs();
    console.log(logs);
    console.log(logs2);
});

test('Get articles', async({api}) => {

    const response = await api
        .path('/articles')
        .params({limit: 10, offset: 0})
        .getRequest<ArticlesResponseArray>(200);

    expect(response.articles.length).toBeLessThanOrEqual(10);
    expect(response.articlesCount).toEqual(10);

});

test('Get test tags', async ({ api }) => {
const response = await api
        .path('/tags')
        .getRequest<{ tags: string[] }>(200);

    expect(response.tags[0]).toEqual('Test');
    expect(response.tags.length).toEqual(10);
});

test('Create and Delete Article', async ({ api }) => {
    const body = {
       "article": {
        "title": "Test TWO",
        "description": "Test Description",
        "body": "Test Body",
        "tagList": [
            "TC"
        ]
        }
    };
    const createArticleResponse = await api
        .path('/articles')
        .headers({ Authorization: authToken })
        .body(body)
        .postRequest<ArticleResponse>(201);

    expect(createArticleResponse.article.title).toEqual('Test TWO');
    const slugId = createArticleResponse.article.slug;

    
    const articleResponse = await api
        .path('/articles')
        .headers({ Authorization: authToken })
        .params({limit: 10, offset: 0})
        .getRequest<ArticlesResponseArray>(200);
    
        expect(articleResponse.articles[0].title).toEqual('Test TWO');
    
    const deleteArticleResponse = await api
        .path(`/articles/${slugId}`)
        .headers({ Authorization: authToken })
        .deleteRequest(204);

    const isArticleDeletedResponse = await api
        .path('/articles')
        .headers({ Authorization: authToken })
        .params({limit: 10, offset: 0})
        .getRequest<ArticlesResponseArray>(200);
    
    const isArticleDeleted = isArticleDeletedResponse.articles.filter((article: { title: string; }) => article.title === body.article.title);
    expect(isArticleDeleted.length).toEqual(0);
    expect(isArticleDeletedResponse.articles[0].title).not.toEqual('Test TWO');
});

test('Create Updateand Delete Article', async ({ api }) => {
    let body = {
       "article": {
        "title": "Test TWO",
        "description": "Test Description",
        "body": "Test Body",
        "tagList": [
            "TC"
        ]
        }
    };
    const createArticleResponse = await api
        .path('/articles')
        .headers({ Authorization: authToken })
        .body(body)
        .postRequest<ArticleResponse>(201);

    expect(createArticleResponse.article.title).toEqual('Test TWO');
    let slugId = createArticleResponse.article.slug;

    
    const articleResponse = await api
        .path('/articles')
        .headers({ Authorization: authToken })
        .params({limit: 10, offset: 0})
        .getRequest<ArticlesResponseArray>(200);
    
        expect(articleResponse.articles[0].title).toEqual('Test TWO');

        body.article.title ="Test TWO updated";

    const updateArticleResponse = await api
        .path(`/articles/${slugId}`)
        .headers({ Authorization: authToken })
        .body(body)
        .putRequest<ArticleResponse>(200);

    expect(updateArticleResponse.article.title).toEqual(body.article.title);
    
    slugId = updateArticleResponse.article.slug;
    const deleteArticleResponse = await api
        .path(`/articles/${slugId}`)
        .headers({ Authorization: authToken })
        .deleteRequest(204);

    const isArticleDeletedResponse = await api
        .path('/articles')
        .headers({ Authorization: authToken })
        .params({limit: 10, offset: 0})
        .getRequest<ArticlesResponseArray>(200);
    
    const isArticleDeleted = isArticleDeletedResponse.articles.filter((article: { title: string; }) => article.title === body.article.title);
    expect(isArticleDeleted.length).toEqual(0);
    expect(isArticleDeletedResponse.articles[0].title).not.toEqual(body.article.title);
});