import { app, setup } from '../src/app'
import * as supertest from 'supertest'
import { ClientsRepository, ClientData } from '../src/repositories/clientsRepository';
import { InvoicesRepository } from '../src/repositories/invoicesRepository';

const TEST_USER_EMAIL = `tarzan@jungle.com`;
const TEST_USER_PASS = `123456`;

let invoiceRepo: InvoicesRepository;
let clientsRepo: ClientsRepository

const targetUserId = '1111111'
let client1Model: ClientData
let client2Model: ClientData

beforeAll(async () => {
    await setup();

    invoiceRepo = await InvoicesRepository.getInstance();
    invoiceRepo.disableAutoWriteToDisk = true;
    clientsRepo = await ClientsRepository.getInstance();
    clientsRepo.disableAutoWriteToDisk = true;

    const client1 = await clientsRepo.add({
        name: "Client 1",
        user_id: targetUserId,
        email: "client1@gmail.com",
        companyDetails: {
            name: "Incorporated",
            address: "Home",
            regNumber: "regNumber1",
            vatNumber: "vatNumber1"
        }
    })

    client1Model = client1;

    await new Promise((resolve) => setTimeout(resolve, 100));

    const client2 = await clientsRepo.add({
        name: "Client 2",
        user_id: targetUserId,
        email: "client2@gmail.com",
        companyDetails: {
            name: "Acme",
            address: "Office",
            regNumber: "regNumber2",
            vatNumber: "vatNumber2"
        }
    })

    client2Model = client2;


    const firstInvoice = await invoiceRepo.add({
        invoice_number: "FirstInvoiceByTime",
        user_id: targetUserId,
        client_id: client1.id,
        date: 1000,
        dueDate: 12000,
        value: 1000
    })

    const secondInvoice = await invoiceRepo.add({
        invoice_number: "SecondInvoiceByTime",
        user_id: targetUserId,
        client_id: client1.id,
        date: 5000,
        dueDate: 12000,
        value: 1000
    })

    const thirdInvoice = await invoiceRepo.add({
        invoice_number: "ThirdInvoiceByTime",
        user_id: targetUserId,
        client_id: client2.id,
        date: 7500,
        dueDate: 12000,
        value: 2000
    })

    const latestInvoice = await invoiceRepo.add({
        invoice_number: "LatestInvoiceByTime",
        user_id: targetUserId,
        client_id: client1.id,
        date: 10000,
        dueDate: 12000,
        value: 1000
    })
})

it('Rejects access when not logged in', async () => {
    const requestAgent = supertest.agent(app, null)

    expect((await requestAgent.get('/clients')).status).toBe(403)
})

it('Gets a list of latest clients when no params specified', async () => {
    
    const requestAgent = supertest.agent(app, null)

    const response = await requestAgent
        .post('/login')
        .set('Content-Type', 'application/json')
        .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS })

    const clientsResponse = await requestAgent.get('/clients').set("x-access-token", response.body.token)

    expect(clientsResponse.status).toBe(200)
    expect(clientsResponse.body.clients).toBeTruthy();
    expect(clientsResponse.body.clients).toHaveLength(2);
})

it('Gets a list of latest clients ordered by name ASC', async () => {
    const requestAgent = supertest.agent(app, null)

    const response = await requestAgent
        .post('/login')
        .set('Content-Type', 'application/json')
        .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS })

    const clientsResponse = await requestAgent.get('/clients')
        .set("x-access-token", response.body.token)
        .send({
            sort: {
                clientName: 'asc',
            }
        })

    expect(clientsResponse.status).toBe(200)
    expect(clientsResponse.body.clients[0].name).toEqual(client1Model.name)
    expect(clientsResponse.body.clients[1].name).toEqual(client2Model.name)
})

it('Gets a list of latest clients ordered by compandy name ASC', async () => {
    const requestAgent = supertest.agent(app, null)

    const response = await requestAgent
        .post('/login')
        .set('Content-Type', 'application/json')
        .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS })

    const clientsResponse = await requestAgent.get('/clients')
        .set("x-access-token", response.body.token)
        .send({
            sort: {
                companyName: 'asc',
            }
        })

    expect(clientsResponse.status).toBe(200)
    expect(clientsResponse.body.clients[0].name).toEqual(client2Model.name)
    expect(clientsResponse.body.clients[1].name).toEqual(client1Model.name)
})


it('Gets a list of latest clients ordered by total billed ASC', async () => {
    const requestAgent = supertest.agent(app, null)

    const response = await requestAgent
        .post('/login')
        .set('Content-Type', 'application/json')
        .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS })

    const clientsResponse = await requestAgent.get('/clients')
        .set("x-access-token", response.body.token)
        .send({
            sort: {
                totalBilled: 'asc',
            }
        })

    expect(clientsResponse.status).toBe(200)
    expect(clientsResponse.body.clients[0].name).toEqual(client2Model.name)
    expect(clientsResponse.body.clients[1].name).toEqual(client1Model.name)
})


it('Creates a new client for logged in user' , async () => {

    const requestAgent = supertest.agent(app, null)

    const response = await requestAgent
        .post('/login')
        .set('Content-Type', 'application/json')
        .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS })


    const clientJSONDetails = {
        email: 'newUser@test.com',
        name: 'John',
        companyDetails: {
            name: "company",
            vatNumber: "123",
            regNumber: '123',
            address: "Home"
        }
    }
    const clientsResponse = await requestAgent.post('/clients')
        .set("x-access-token", response.body.token)
        .set('Content-Type', 'application/json')
        .send(clientJSONDetails)

    expect(clientsResponse.status).toBe(200)
    expect(clientsResponse.body).toHaveProperty("success", true);
    expect(clientsResponse.body).toHaveProperty("client");
    expect(clientsResponse.body.client).toHaveProperty("id");
})