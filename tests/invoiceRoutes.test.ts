import { app } from '../src/app'
import * as supertest from 'supertest'

it('Rejects access when not logged in', async () => {
    const requestAgent = supertest.agent(app, null)

    expect((await requestAgent.get('/invoices')).status).toBe(403)
})

it('Gets a list of latest invoices when no params specified', async () => {
    const TEST_USER_EMAIL = `tarzan@jungle.com`;
    const TEST_USER_PASS = `123456`;
    
    const requestAgent = supertest.agent(app, null)

    const response = await requestAgent
        .post('/login')
        .set('Content-Type', 'application/json')
        .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS })

    const invoicesResponse = await requestAgent.get('/invoices').set("x-access-token", response.body.token)

    expect(invoicesResponse.status).toBe(200)
})