import { app, setup } from '../src/app'
import * as supertest from 'supertest'

import { ClientsRepository, ClientData } from '../src/repositories/clientsRepository'
import { InvoicesRepository } from '../src/repositories/invoicesRepository'
import { UsersRepository } from '../src/repositories/usersRepository';
import { GetInvoiceParams } from '../src/repositories/clientInvoicesRepoAggregate';

// Setup for invoices used for api testing
let invoiceRepo: InvoicesRepository;
let clientsRepo: ClientsRepository
let usersRepo: UsersRepository

// this is hardcoded in the test fixtures, it's a user
// that exists by default
const TEST_USER_EMAIL = `tarzan@jungle.com`;
const TEST_USER_PASS = `123456`;
const TEST_USER_ID = '1111111'
let client1Model: ClientData
let client2Model: ClientData

type InvoicesQueryParams = Omit<GetInvoiceParams, 'userId'>

beforeAll(async () => {
    await setup();
    
    invoiceRepo = await InvoicesRepository.getInstance();
    invoiceRepo.disableAutoWriteToDisk = true;
    clientsRepo = await ClientsRepository.getInstance();
    clientsRepo.disableAutoWriteToDisk = true;
    usersRepo = await UsersRepository.getInstance();
    usersRepo.disableAutoWriteToDisk = true;

    const client1 = await clientsRepo.add({
        name: "Client 1",
        user_id: TEST_USER_ID,
        createdAt: new Date().getTime(),
        email: "client1@gmail.com",
        companyDetails: {
            name: "Acme",
            address: "Home",
            regNumber: "regNumber1",
            vatNumber: "vatNumber1"
        }
    })

    client1Model = client1;

    await new Promise((resolve) => setTimeout(resolve, 100));

    const client2 = await clientsRepo.add({
        name: "Client 2",
        user_id: TEST_USER_ID,
        createdAt: new Date().getTime(),
        email: "client2@gmail.com",
        companyDetails: {
            name: "Incorporated",
            address: "Office",
            regNumber: "regNumber2",
            vatNumber: "vatNumber2"
        }
    })

    client2Model = client2;


    const firstInvoice = await invoiceRepo.add({
        invoice_number: "FirstInvoiceByTime",
        user_id: TEST_USER_ID,
        createdAt: new Date().getTime(),
        client_id: client1.id,
        projectCode: "#Toptal2022EnterpriseClient",
        date: 1000,
        dueDate: 12000,
        value: 1000,
        meta: {
            "projectCodeKeyWeAreFreeToChooseOurselves": "#Toptal2022EnterpriseClient"
        }
    })

    const secondInvoice = await invoiceRepo.add({
        invoice_number: "SecondInvoiceByTime",
        user_id: TEST_USER_ID,
        createdAt: new Date().getTime(),
        client_id: client1.id,
        projectCode: "#Toptal2022EnterpriseClient",
        date: 5000,
        dueDate: 12000,
        value: 1000
    })

    const thirdInvoice = await invoiceRepo.add({
        invoice_number: "ThirdInvoiceByTime",
        user_id: TEST_USER_ID,
        createdAt: new Date().getTime(),
        client_id: client2.id,
        projectCode: "#Toptal2022EnterpriseClient",
        date: 7500,
        dueDate: 12000,
        value: 2000
    })

    const latestInvoice = await invoiceRepo.add({
        invoice_number: "LatestInvoiceByTime",
        user_id: TEST_USER_ID,
        createdAt: new Date().getTime(),
        client_id: client1.id,
        projectCode: "#Toptal2022EnterpriseClient",
        date: 10000,
        dueDate: 12000,
        value: 1500
    })
})

it('Rejects access when not logged in', async () => {
    const requestAgent = supertest.agent(app)

    expect((await requestAgent.get('/invoices')).status).toBe(403)
})

it('Gets a list of latest invoices when no params specified', async () => {
    
    const requestAgent = supertest.agent(app)

    const response = await requestAgent
        .post('/login')
        .set('Content-Type', 'application/json')
        .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS })

    const invoicesResponse = await requestAgent.get('/invoices').set("x-access-token", response.body.token)
    
    expect(invoicesResponse.status).toBe(200)
    expect(invoicesResponse.body.invoices).toHaveLength(4)
    expect(invoicesResponse.body.invoices[0]).toHaveProperty("invoice");
    expect(invoicesResponse.body.invoices[0]).toHaveProperty("client");
})

it('Gets list by client id', async () => {
    const requestAgent = supertest.agent(app)

    const response = await requestAgent
        .post('/login')
        .set('Content-Type', 'application/json')
        .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS })


    const queryParams: InvoicesQueryParams = {
        clientId: client2Model.id
    }
     
    const invoicesResponse = await requestAgent.get(`/invoices?${new URLSearchParams(queryParams as Record<string, string>).toString()}`)
         .set("x-access-token", response.body.token)

    expect(invoicesResponse.status).toBe(200)
    expect(invoicesResponse.body.invoices).toHaveLength(1)
})

it('Gets list by client id, paginiated using limit and offset', async () => {
    const requestAgent = supertest.agent(app)

    const response = await requestAgent
        .post('/login')
        .set('Content-Type', 'application/json')
        .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS })

    const queryParams: InvoicesQueryParams = {
        clientId: client1Model.id,
        limit: 2,
        offset: 0
    }
     
    const invoicesResponse = await requestAgent.get(`/invoices?${new URLSearchParams(queryParams as Record<string, string>).toString()}`)
         .set("x-access-token", response.body.token)

    expect(invoicesResponse.status).toBe(200)
    expect(invoicesResponse.body.invoices).toHaveLength(2)
})


it('Limit larger than full result set does not break query', async () => {
    const requestAgent = supertest.agent(app)

    const response = await requestAgent
        .post('/login')
        .set('Content-Type', 'application/json')
        .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS })

    const queryParams: InvoicesQueryParams = {
        clientId: client2Model.id,
        limit: 30,
    }
     
    const invoicesResponse = await requestAgent.get(`/invoices?${new URLSearchParams(queryParams as Record<string, string>).toString()}`)
         .set("x-access-token", response.body.token)

    expect(invoicesResponse.status).toBe(200)
    expect(invoicesResponse.body.invoices).toHaveLength(1)
})

it('Offset larger than full result set does not break query', async () => {
    const requestAgent = supertest.agent(app)

    const response = await requestAgent
        .post('/login')
        .set('Content-Type', 'application/json')
        .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS })

    const queryParams: InvoicesQueryParams = {
        clientId: client2Model.id,
        offset: 30,
    }
     
    const invoicesResponse = await requestAgent.get(`/invoices?${new URLSearchParams(queryParams as Record<string, string>).toString()}`)
         .set("x-access-token", response.body.token)

    expect(invoicesResponse.status).toBe(200)
    expect(invoicesResponse.body.invoices).toHaveLength(0)
})

it('Gets list by client id, sorted by price, desc', async () => {
    const requestAgent = supertest.agent(app)

    const response = await requestAgent
        .post('/login')
        .set('Content-Type', 'application/json')
        .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS })

    const queryParams: InvoicesQueryParams = {
        clientId: client1Model.id,
        sortBy: "price",
        sort: "desc"
    }
     
    const invoicesResponse = await requestAgent.get(`/invoices?${new URLSearchParams(queryParams as Record<string, string>).toString()}`)
         .set("x-access-token", response.body.token)

    expect(invoicesResponse.status).toBe(200)
    expect(invoicesResponse.body.invoices).toHaveLength(3)
    expect(invoicesResponse.body.invoices[0].invoice).toHaveProperty("value", 1500);
})

it("Adds an invoice", async () => {

    const creationDate = new Date().getTime();

    const requestAgent = supertest.agent(app)

    const response = await requestAgent
        .post('/login')
        .set('Content-Type', 'application/json')
        .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS })

    const invoicesResponse = await requestAgent
        .post('/invoices')
        .set("x-access-token", response.body.token)
        .set('Content-Type', 'application/json')
        .send({
            invoice_number: "1234",
            user_id: "123",
            client_id: client1Model.id,
            date: creationDate,
            value: 1234,
            meta: {
                "test": "meta here"
            }
        })

    expect(invoicesResponse.status).toBe(200)
    expect(invoicesResponse.body).toHaveProperty("success", true);
    expect(invoicesResponse.body).toHaveProperty("invoice");
    expect(invoicesResponse.body.invoice).toHaveProperty("id");
    expect(invoicesResponse.body.invoice).toHaveProperty("meta", {
        "test": "meta here"
    });

    const invoiceFetchResponse = await requestAgent
        .get(`/invoices/${invoicesResponse.body.invoice.id}`)
        .set("x-access-token", response.body.token)
        .set('Content-Type', 'application/json')

    expect(invoiceFetchResponse.status).toBe(200)
    expect(invoiceFetchResponse.body).toHaveProperty("success", true);
    expect(invoiceFetchResponse.body).toHaveProperty("invoice");
    expect(invoiceFetchResponse.body.invoice).toHaveProperty("id");
    expect(invoiceFetchResponse.body.invoice).toHaveProperty("meta", {
        "test": "meta here"
    });
});

it("Updates an invoice", async () => {

    // login and create an invoice
    const creationDate = new Date().getTime();

    const requestAgent = supertest.agent(app)

    const response = await requestAgent
        .post('/login')
        .set('Content-Type', 'application/json')
        .send({ email: TEST_USER_EMAIL, password: TEST_USER_PASS })

    const invoicesResponse = await requestAgent
        .post('/invoices')
        .set("x-access-token", response.body.token)
        .set('Content-Type', 'application/json')
        .send({
            invoice_number: "123456",
            user_id: "123",
            client_id: client1Model.id,
            date: creationDate,
            value: 1234
        })

    const TARGET_INVOICE_ID = invoicesResponse.body.invoice.id;
    const NEW_DATE = new Date().getTime() - 60 * 60 * 1000
    const NEW_VALUE = 5555;
    const invoicesUpdateResponse = await requestAgent
        .put('/invoices')
        .set("x-access-token", response.body.token)
        .set('Content-Type', 'application/json')
        .send({
            id: TARGET_INVOICE_ID,
            invoice_number: "123456",
            user_id: "123",
            client_id: client1Model.id,
            date: NEW_DATE,
            value: NEW_VALUE
        })

    expect(invoicesUpdateResponse.status).toBe(200)
    expect(invoicesUpdateResponse.body).toHaveProperty("success", true);
    expect(invoicesUpdateResponse.body).toHaveProperty("invoice");
    expect(invoicesUpdateResponse.body.invoice).toHaveProperty("id", TARGET_INVOICE_ID);
    expect(invoicesUpdateResponse.body.invoice).toHaveProperty("value", NEW_VALUE);
    expect(invoicesUpdateResponse.body.invoice).toHaveProperty("date", NEW_DATE);
    
})