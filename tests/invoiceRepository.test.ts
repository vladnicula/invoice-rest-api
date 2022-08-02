import { InvoicesRepository } from '../src/repositories/invoicesRepository'


let repo: InvoicesRepository;
beforeAll(async () => {
    repo = await InvoicesRepository.getInstance()
    repo.disableAutoWriteToDisk = true;
})

it("Adds invoice to repository", async () => {
    const newInvoice = await repo.add({
        invoice_number: "1234",
        createdAt: new Date().getTime(),
        user_id: "123",
        client_id: "123",
        date: new Date().getTime(),
        projectCode: "#Toptal2022EnterpriseClient",
        dueDate: new Date().getTime() + (30*24*60*60*1000),
        value: 1234
    })

    expect(repo.getById(newInvoice.id)).toBeTruthy();
});

it("Add invoice with permisive meta field that can be used for invoice items", async () => {
    const newInvoice = await repo.add({
        invoice_number: "newInvoiceNumberWithCustomMetaContent",
        user_id: "123",
        createdAt: new Date().getTime(),
        client_id: "123",
        projectCode: "#Toptal2022EnterpriseClient",
        date: new Date().getTime(),
        dueDate: new Date().getTime() + (30*24*60*60*1000),
        value: 1234,
        meta: {
            "someKeyThatCanContainWhateverWeWant": "anything"
        }
    })

    expect(await repo.getById(newInvoice.id)).toBeTruthy();
    expect((await repo.getById(newInvoice.id))!.meta).toHaveProperty("someKeyThatCanContainWhateverWeWant", "anything");
})

it("Does not add invoice if same client and invoice number already exists", async () => {
    const newInvoice = await repo.add({
        invoice_number: "12345",
        user_id: "123",
        createdAt: new Date().getTime(),
        client_id: "123",
        date: new Date().getTime(),
        projectCode: "#Toptal2022EnterpriseClient",
        dueDate: new Date().getTime() + (30*24*60*60*1000),
        value: 1234
    })

    expect(repo.getById(newInvoice.id)).toBeTruthy();


    let caughtError = false;
    try {

        await repo.add({
            invoice_number: "12345",
            user_id: "123",
            createdAt: new Date().getTime(),
            client_id: "123",
            projectCode: "#Toptal2022EnterpriseClient",
            date: new Date().getTime(),
            dueDate: new Date().getTime() + (30*24*60*60*1000),
            value: 1234
        })

    } catch(err) {
        caughtError = err;
    }

    expect(caughtError).toBeTruthy();
});
