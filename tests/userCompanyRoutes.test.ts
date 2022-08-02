import { app, setup } from '../src/app'
import * as supertest from 'supertest'
import { UsersRepository } from '../src/repositories/usersRepository';

beforeAll(async () => {
    const repo = await UsersRepository.getInstance()
    repo.disableAutoWriteToDisk = true;
    await setup();
})

it('Can get account details for logged in user, even if null', async () => {
    const TEST_USER_EMAIL = `tarzan@jungle.com`;
    const TEST_USER_PASS = `123456`;

    const requestAgent = supertest.agent(app)

    const loginResponse = await requestAgent
        .post('/login')
        .set('Content-Type', 'application/json')
        .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS })

    expect(loginResponse.status).toBe(200)
    expect(loginResponse.body.token).toBeTruthy();
    
    const response = await requestAgent
        .get('/me')
        .set("x-access-token", loginResponse.body.token)
        .set('Content-Type', 'application/json')

    expect(response.body).toHaveProperty("companyDetails")

})

it("Can update company details for logged in user", async () => {
    const TEST_USER_EMAIL = `tarzan@jungle.com`;
    const TEST_USER_PASS = `123456`;

    const requestAgent = supertest.agent(app)

    const loginResponse = await requestAgent
        .post('/login')
        .set('Content-Type', 'application/json')
        .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS })


    const companyDetails = {
        name: "New Company",
        address: "21st Brook Street",
        vatNumber: "uniqueJustForThisCompany1234",
        regNumber: "yetanotheruniquenumber",
        iban: "12345",
        swift: "12345",
    }

    const updateCompanyResponse = await requestAgent
        .put('/me/company')
        .set("x-access-token", loginResponse.body.token)
        .set('Content-Type', 'application/json')
        .send(companyDetails)

    expect(updateCompanyResponse.body).toHaveProperty("success", true);

    const userMeDetailsResponse = await requestAgent
        .get('/me')
        .set("x-access-token", loginResponse.body.token)
        .set('Content-Type', 'application/json')

    expect(userMeDetailsResponse.body).toHaveProperty("companyDetails", companyDetails)
})
