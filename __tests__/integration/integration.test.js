const app = require('../../app.js');
const supertest = require('supertest');
// Controllers can be imported for testing functions directly
const httpCtrl = require('../../controllers/http.ctrl');

// Integration tests have dependencies on external components and services
// in this example this test calls the internal api route /example/${exampleId}
// the internal api route calls an external API url
describe('Test Example API', () => {
  // Initialize supertest agent with app.js
  let testsAgent = supertest.agent(app);

  it('Should return successful response from external api url', (done) => {
    testsAgent
      .get('/example/123')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        expect.anything(res);
        expect(res.status).toBe(200)
        done();
      });
  });

  it('Should return 400 response invalid parameters', (done) => {
    testsAgent
      .get('/example/test123!')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(400)
      .end((err, res) => {
        if (err) {
          console.error(err);
          done(err);
        }
        expect.anything(res);
        expect(res.status).toBe(400)
        done();
      });
  });

});

describe('Application controllers', () => {

  let exampleId = 123;
  let url = process.env.API_URL_EXTERNAL_EXAMPLE ? `${process.env.API_URL_EXTERNAL_EXAMPLE}/${exampleId}` : `https://jsonplaceholder.typicode.com/todos/${exampleId}`;

  it('HTTP Controller HTTPS Reject Unauthorized requestOptionsData.rejectUnauthorized true', async () => {

    const requestOptionsData = {
      method: 'GET',
      url: url,
      rejectUnauthorized: true
    };

    let response;
    try {
      response = await httpCtrl.makeRequest(requestOptionsData);
    } catch (e) {
      const errorMsg = `Unable to make request error: ${e}`;
      console.error(errorMsg);
    }

    expect(response.status).toBe(200);
    // Check axios request options value was set correctly
    expect(response.request.socket._rejectUnauthorized).toBe(true);

  });

  it('HTTP Controller HTTPS Reject Unauthorized requestOptionsData.rejectUnauthorized false', async () => {

    const requestOptionsData = {
      method: 'GET',
      url: url,
      rejectUnauthorized: false
    };

    let response;
    try {
      response = await httpCtrl.makeRequest(requestOptionsData);
    } catch (e) {
      const errorMsg = `Unable to make request error: ${e}`;
      console.error(errorMsg);
    }

    expect(response.status).toBe(200);
    // Check axios request options value was set correctly
    expect(response.request.socket._rejectUnauthorized).toBe(false);

  });

});
