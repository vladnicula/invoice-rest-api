import { ClientInvoicesRepoAggregate } from '../src/repositories/clientInvoicesRepoAggregate'
import { ClientsRepository, ClientData } from '../src/repositories/clientsRepository'
import { InvoicesRepository } from '../src/repositories/invoicesRepository'

// This needs to be a new repository, that is not using the base repo
let aggregated: ClientInvoicesRepoAggregate;
let invoiceRepo: InvoicesRepository;
let clientsRepo: ClientsRepository

const targetUserId = 'user1'
let client1Model: ClientData
let client2Model: ClientData

beforeAll(async () => {
    aggregated = await ClientInvoicesRepoAggregate.getInstance();
    invoiceRepo = await InvoicesRepository.getInstance();
    invoiceRepo.disableAutoWriteToDisk = true;
    clientsRepo = await ClientsRepository.getInstance();
    clientsRepo.disableAutoWriteToDisk = true;

    const client1 = await clientsRepo.add({
        name: "Client 1",
        user_id: targetUserId,
        email: "client1@gmail.com",
        createdAt: new Date().getTime(),
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
        user_id: targetUserId,
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
        user_id: targetUserId,
        createdAt: new Date().getTime(),
        client_id: client1.id,
        projectCode: "test",
        date: 1000,
        dueDate: 12000,
        value: 1000
    })

    const secondInvoice = await invoiceRepo.add({
        invoice_number: "SecondInvoiceByTime",
        user_id: targetUserId,
        createdAt: new Date().getTime(),
        client_id: client1.id,
        projectCode: "test",
        date: 5000,
        dueDate: 12000,
        value: 1000
    })

    const thirdInvoice = await invoiceRepo.add({
        invoice_number: "ThirdInvoiceByTime",
        user_id: targetUserId,
        createdAt: new Date().getTime(),
        client_id: client2.id,
        projectCode: "test",
        date: 7500,
        // very large due date
        dueDate: 200000,
        value: 2000
    })

    const latestInvoice = await invoiceRepo.add({
        invoice_number: "LatestInvoiceByTime",
        user_id: targetUserId,
        createdAt: new Date().getTime(),
        client_id: client1.id,
        projectCode: "test",
        date: 10000,
        dueDate: 12000,
        value: 1000
    })
})

it("Gets invoices by user id sorted by creation date DESC", async () => {

    const response = await aggregated.getInvoices({
        userId: targetUserId,
        sortBy: 'date',
        sort: "desc"
    });

    expect(response.result).toHaveLength(4)
    expect(response.result[0].invoice).toHaveProperty('invoice_number', 'LatestInvoiceByTime')
    expect(response.result[3].invoice).toHaveProperty('invoice_number', 'FirstInvoiceByTime')
})

it("Gets invoices by user id sorted by company name ASC", async () => {

    const response = await aggregated.getInvoices({
        userId: targetUserId,
        sortBy: 'companyName',
        sort: "asc"
    })

    expect(response.result).toHaveLength(4)
    expect(response.result[0].client).toHaveProperty('id', client1Model.id)
    expect(response.result[3].client).toHaveProperty('id', client2Model.id)
})

it("Gets invoices by user id filtered by company name", async () => {
    const response = await aggregated.getInvoices({
        userId: targetUserId,
        clientId: client2Model.id
    })

    expect(response.result).toHaveLength(1)
    expect(response.result[0].client).toHaveProperty('id', client2Model.id)
})

it("Gets invoices by user id filterd by date, sorted by price DESC", async () => {
    const response = await aggregated.getInvoices({
        userId: targetUserId,
        sortBy: "price",
        sort: "desc",
        startDate: 5000,
        endDate: 7501
    })

    expect(response.result).toHaveLength(2)
    expect(response.result[0].invoice.date).toBeGreaterThanOrEqual(5000)
    expect(response.result[0].invoice.date).toBeLessThan(7501)
    expect(response.result[1].invoice.date).toBeGreaterThanOrEqual(5000)
    expect(response.result[1].invoice.date).toBeLessThan(7501)
    expect(response.result[0].invoice.value).toBeGreaterThanOrEqual(response.result[1].invoice.value)
    
})

it("Gets invoices by user id sorted by due date ASC", async () => {
    const response = await aggregated.getInvoices({
        userId: targetUserId,
        sortBy: "dueDate",
        sort: "asc"
    })

    expect(response.result).toHaveLength(4)
    expect(response.result[3].invoice.dueDate).toBeGreaterThanOrEqual(response.result[2].invoice.dueDate)
    expect(response.result[2].invoice.dueDate).toBeGreaterThanOrEqual(response.result[1].invoice.dueDate)
    expect(response.result[1].invoice.dueDate).toBeGreaterThanOrEqual(response.result[0].invoice.dueDate)
})

it("Gets invoices by user id where due date is less than a specific value", async () => {
    const response = await aggregated.getInvoices({
        userId: targetUserId,
        sortBy: "dueDate",
        sort: "asc",
        endDueDate: 200000
    })

    expect(response.result).toHaveLength(3)
    expect(response.result[2].invoice.dueDate).toBeGreaterThanOrEqual(response.result[1].invoice.dueDate)
    expect(response.result[1].invoice.dueDate).toBeGreaterThanOrEqual(response.result[0].invoice.dueDate)
})

it("Add new invoice for valid user_id, client combination", async () => {
    const creationDate = new Date().getTime();
    const expectedDueDate = creationDate + 30 * 24 * 60 * 60 * 1000;
    const response = await aggregated.addInvoice({
        user_id: targetUserId,
        invoiceData: {
            invoice_number: "1234",
            client_id: client1Model.id,
            date: creationDate,
            value: 1234
        }
    })

    expect(response).toHaveProperty("dueDate", expectedDueDate);
})

it("Does not add new invoice for in-valid user_id, client combination", async () => {
    const creationDate = new Date().getTime();
    let didThrowError = null;
    try {
        const response = await aggregated.addInvoice({
            user_id: targetUserId,
            invoiceData: {
                invoice_number: "1234",
                client_id: "randomInvalidID",
                date: creationDate,
                value: 1234
            }
        })      
    } catch (err) {
        didThrowError = err;
    }

    expect(didThrowError).toBeTruthy();
})