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
        client_id: client1.id,
        date: 1000,
        value: 1000
    })

    const secondInvoice = await invoiceRepo.add({
        invoice_number: "SecondInvoiceByTime",
        user_id: targetUserId,
        client_id: client1.id,
        date: 5000,
        value: 1000
    })

    const thirdInvoice = await invoiceRepo.add({
        invoice_number: "ThirdInvoiceByTime",
        user_id: targetUserId,
        client_id: client2.id,
        date: 7500,
        value: 2000
    })

    const latestInvoice = await invoiceRepo.add({
        invoice_number: "LatestInvoiceByTime",
        user_id: targetUserId,
        client_id: client1.id,
        date: 10000,
        value: 1000
    })
})

it("Gets invoices by user id sorted by creation date DESC", async () => {

    const response = await aggregated.getInvoices({
        userId: targetUserId,
        sort: {
            date: "desc"
        }
    });

    expect(response).toHaveLength(4)
    expect(response[0].invoice).toHaveProperty('invoice_number', 'LatestInvoiceByTime')
    expect(response[3].invoice).toHaveProperty('invoice_number', 'FirstInvoiceByTime')
})

it("Gets invoices by user id sorted by company name ASC", async () => {

    const response = await aggregated.getInvoices({
        userId: targetUserId,
        sort: {
            companyName: "asc"
        }
    })

    expect(response).toHaveLength(4)
    expect(response[0].client).toHaveProperty('id', client1Model.id)
    expect(response[3].client).toHaveProperty('id', client2Model.id)
})

it("Gets invoices by user id filtered by company name", async () => {
    const response = await aggregated.getInvoices({
        userId: targetUserId,
        filter: {
            clientId:  client2Model.id
        }
    })

    expect(response).toHaveLength(1)
    expect(response[0].client).toHaveProperty('id', client2Model.id)
})

it("Gets invoices by user id filterd by date, sorted by price DESC", async () => {
    const response = await aggregated.getInvoices({
        userId: targetUserId,
        sort: {
            price: "desc"
        },
        filter: {
            date:  {
                start: 5000,
                end: 7501
            }
        }
    })

    expect(response).toHaveLength(2)
    expect(response[0].invoice.date).toBeGreaterThanOrEqual(5000)
    expect(response[0].invoice.date).toBeLessThan(7501)
    expect(response[1].invoice.date).toBeGreaterThanOrEqual(5000)
    expect(response[1].invoice.date).toBeLessThan(7501)
    expect(response[0].invoice.value).toBeLessThanOrEqual(response[1].invoice.value)
    
})