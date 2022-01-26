import path from 'path'
import { InvoicesRepository } from '../src/repositories/invoicesRepository'


let repo: InvoicesRepository;
beforeAll(async () => {
    repo = new InvoicesRepository();
    const fullPath = path.resolve(__dirname, `../${process.env.PATH_TO_JSON_DIR}`)
    await repo.init(fullPath);
})

it("Adds invoice to repository", async () => {
    const newInvoice = await repo.add({
        invoice_number: "1234",
        user_id: "123",
        client_id: "123",
        date: new Date().getTime(),
        value: 1234
    })

    expect(repo.getById(newInvoice.id)).toBeTruthy();
});

it("Does not add invoice if same client and invoice number already exists", async () => {
    const newInvoice = await repo.add({
        invoice_number: "12345",
        user_id: "123",
        client_id: "123",
        date: new Date().getTime(),
        value: 1234
    })

    expect(repo.getById(newInvoice.id)).toBeTruthy();


    let caughtError = false;
    try {

        await repo.add({
            invoice_number: "12345",
            user_id: "123",
            client_id: "123",
            date: new Date().getTime(),
            value: 1234
        })

    } catch(err) {
        caughtError = err;
    }

    expect(caughtError).toBeTruthy();
});
