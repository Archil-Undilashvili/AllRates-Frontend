const test = require('node:test');
const assert = require('node:assert/strict');

test('Netlify serves original and rewritten paths without query parameters', async () => {
  const originalFetch = global.fetch;
  // Offline fixture proves a deployment can retain HTML during upstream failures.
  global.fetch = async () => { throw new Error('Offline regression fixture'); };
  const {handler} = require('../netlify/functions/rate-page');
  global.fetch = originalFetch;
  for (const route of ['/', '/rates', '/official', '/official-rates/usd-gel', '/.netlify/functions/rate-page/home', '/.netlify/functions/rate-page/eur-gel']) {
    const response = await handler({httpMethod:'GET',path:route,queryStringParameters:null});
    assert.equal(response.statusCode,200,route);
    assert.equal(response.headers['X-Rate-HTML'],'server-rendered',route);
    assert.match(response.body,/<h1\b/);
    assert.match(response.body,/initial-page-snapshot/);
  }
  assert.equal((await handler({httpMethod:'GET',path:'/unknown'})).statusCode,404);
  assert.equal((await handler({httpMethod:'POST',path:'/'})).statusCode,405);
  assert.equal((await handler({httpMethod:'HEAD',path:'/'})).body,'');
});
