import { app } from '../src/app'
import * as supertest from 'supertest'

it('Can not access protected content when not authenticated', async () => {
    const requestAgent = supertest.agent(app, null)
    expect((await requestAgent.get('/clients')).status).toBe(403)
    expect((await requestAgent.get('/invoices')).status).toBe(403)
})

it("Can access all content when authenticated", async () => {
  const TEST_USER_EMAIL = `tarzan@jungle.com`;
  const TEST_USER_PASS = `123456`;
  const TEST_USER_ID = `1111111`;
  
  const requestAgent = supertest.agent(app, null)

  const response = await requestAgent
    .post('/login')
    .set('Content-Type', 'application/json')
    .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS })

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('user_id', TEST_USER_ID);
  expect(response.body).toHaveProperty('token');
  expect(response.body).toHaveProperty('email');
  expect(response.body).toHaveProperty('name');

  const dashboardResponse = await requestAgent.get('/dashboard').set("x-access-token", response.body.token)

  expect(dashboardResponse.status).toBe(200)
})


it("Can resigtered new user and log in with them", async () => {
  const requestAgent = supertest.agent(app, null)
  const NEW_TEST_USER_EMAIL = `unique-testnewuser@test.com`
  const NEW_PASS_TEST = `123__123`
  const registerResponse = await requestAgent
    .post('/register')
    .set('Content-Type', 'application/json')
    .send({ 
      name: "John Doe",
      email: NEW_TEST_USER_EMAIL, 
      password: NEW_PASS_TEST,
      confirmPassword: NEW_PASS_TEST,
    })

  expect(registerResponse.status).toBe(200);

  const loginResponse = await requestAgent
    .post('/login')
    .set('Content-Type', 'application/json')
    .send({ email: NEW_TEST_USER_EMAIL, password: NEW_PASS_TEST })

  expect(loginResponse.status).toBe(200);
  expect(loginResponse.body.token).toBeTruthy();
    
  const dashboardResponse = await requestAgent.get('/dashboard').set("x-access-token", loginResponse.body.token)

  expect(dashboardResponse.status).toBe(200)
})

it("Cannot register twice with the same email", async () => {
  const requestAgent = supertest.agent(app, null)
  const NEW_TEST_USER_EMAIL = `doubleuser@test.com`
  const NEW_PASS_TEST = `123__123`


  const response1 = await requestAgent
    .post('/register')
    .set('Content-Type', 'application/json')
    .send({ 
      name: "John Doe",
      email: NEW_TEST_USER_EMAIL, 
      password: NEW_PASS_TEST,
      confirmPassword: NEW_PASS_TEST,
    })

  expect(response1.status).toBe(200);

  const response2 = await requestAgent
    .post('/register')
    .set('Content-Type', 'application/json')
    .send({ 
      name: "Some other John Doe",
      email: NEW_TEST_USER_EMAIL, 
      password: NEW_PASS_TEST,
      confirmPassword: NEW_PASS_TEST,
    })

  expect(response2.status).not.toBe(200);

})
