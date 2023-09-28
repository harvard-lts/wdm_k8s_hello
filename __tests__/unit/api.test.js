const app = require('../../app.js');
const supertest = require('supertest');

// Unit tests are isolated tests that can be run within this container
// and must not have any dependencies on any other services
describe('API routes', () => {
  // Initialize supertest agent with app.js
  let testsAgent = supertest.agent(app);

  it('Should return healthcheck', (done) => {
    testsAgent
      .get('/healthcheck')
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

});
