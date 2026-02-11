import { test, expect } from '@playwright/test';

let token = '';
test.beforeAll(async({ request })=>{
  const creds = {user: {
        email: "lenasoldatova@test.com",
        password: "CoA3D973PJKF@"
    }
  };
  const tokenResponse = await request.post('https://conduit-api.bondaracademy.com/api/users/login', { data: creds });
  const tokenResponseBody = await tokenResponse.json();
  token = 'Token '+tokenResponseBody.user.token;
});
// test.afterAll(async({})=>{

// });

test('get test tags', async ({ request }) => {
  const responce = await request.get('https://conduit-api.bondaracademy.com/api/tags');
  const responceBody = await responce.json();

  expect(responce.status()).toBe(200);
  expect(responceBody.tags[0]).toEqual('Test');
  expect(responceBody.tags.length).toBeLessThanOrEqual(10);
});

test('Get All Articals', async ({ request }) => {
  const articleResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0');
  const articleResponseBody = await articleResponse.json();

  expect(articleResponse.status()).toBe(200);
  expect(articleResponseBody.articles.length).toEqual(10);

});

test('Create Article', async ({ request }) =>{



  const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data:{
       "article": {
        "title": "Test TWO",
        "description": "Test Description",
        "body": "Test Body",
        "tagList": [
            "TC"
        ]
    }
    },
    headers: { Authorization: token}
  });
  const newArticleResponseBody = await newArticleResponse.json();
  expect(newArticleResponse.status()).toBe(201);
  expect(newArticleResponseBody.article.title).toEqual("Test TWO");

  const slugId = newArticleResponseBody.article.slug;

  const articleResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0',{headers:{Authorization: token}});
  expect(articleResponse.status()).toBe(200);
  const articleResponseBody = await articleResponse.json();
  const isArticleCreated = articleResponseBody.articles.filter((article: { title: string; }) => article.title === "Test TWO");
  expect(isArticleCreated.length).toEqual(1);

  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`,{headers:{Authorization: token}});
  expect(deleteArticleResponse.status()).toBe(204);
  const delArticleResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0',{headers:{Authorization: token}});
  expect(delArticleResponse.status()).toBe(200);
  const delArticleResponseBody = await delArticleResponse.json();
  const isDelArticleCreated = delArticleResponseBody.articles.filter((article: { title: string; }) => article.title === "Test TWO");
  expect(isDelArticleCreated.length).toEqual(0);
});

test("Update Article", async ({ request }) => {
  //Create Article
  const newArticleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data:{
       "article": {
        "title": "Test three",
        "description": "Test Description",
        "body": "Test Body",
        "tagList": [
            "TC"
        ]
    }
    },
    headers: { Authorization: token}
  });
  const newArticleResponseBody = await newArticleResponse.json();
  expect(newArticleResponse.status()).toBe(201);
  expect(newArticleResponseBody.article.title).toEqual("Test three");

  let slugId = newArticleResponseBody.article.slug;
  console.log(slugId);

  //Check Article is created
  const articleResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0',{headers:{Authorization: token}});
  expect(articleResponse.status()).toBe(200);
  const articleResponseBody = await articleResponse.json();
  const isArticleCreated = articleResponseBody.articles.filter((article: { title: string; }) => article.title === "Test three");
  expect(isArticleCreated.length).toEqual(1);
  //expect(articleResponseBody.articles[0].title).toEqual("Test three");



//Update Article
  const updateArticleResponse = await request.put(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
    data: {
          "article": {
        "title": "Test rrrrr",
        "description": "Test Description",
        "body": "Test Body rr",
        "tagList": [
            "TC"
        ],
        "slug": slugId
    }
    },
    headers: { Authorization: token}
  });
expect(updateArticleResponse.status()).toBe(200);
const updateArticleResponseBody = await updateArticleResponse.json();
slugId = updateArticleResponseBody.article.slug;
expect(updateArticleResponseBody.article.title).toEqual("Test rrrrr");

//Check Article is updated
const isArticleUpdatedResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0',{headers:{Authorization: token}});
  expect(isArticleUpdatedResponse.status()).toBe(200);
  const isArticleUpdatedResponseBody = await isArticleUpdatedResponse.json();
  const isArticleUpdated = isArticleUpdatedResponseBody .articles.filter((article: { title: string; }) => article.title === updateArticleResponseBody.article.title);
  console.log(isArticleUpdated .length);
  expect(isArticleUpdated .length).toEqual(1);
  expect(isArticleUpdatedResponseBody.articles[0].title).toEqual(updateArticleResponseBody.article.title);

//Delete Article
  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`,{headers:{Authorization: token}});
  expect(deleteArticleResponse.status()).toBe(204);
  const delArticleResponse = await request.get('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0',{headers:{Authorization: token}});
  expect(delArticleResponse.status()).toBe(200);
  const delArticleResponseBody = await delArticleResponse.json();
  const isDelArticleCreated = delArticleResponseBody.articles.filter((article: { title: string; }) => article.title === "Test rrrrr");
  expect(isDelArticleCreated.length).toEqual(0);

});