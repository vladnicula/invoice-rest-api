import path from 'path'
import { ClientsRepository } from '../src/repositories/clientsRepository'


let repo: ClientsRepository;
beforeAll(async () => {
    repo = await ClientsRepository.getInstance()
    repo.disableAutoWriteToDisk = true;
})

it("Adds client to repository", async () => {
    const newClient = await repo.add({
        user_id: '123',
        email: 'testcreation123@test.com',
        name: 'John',
        companyDetails: {
            name: "company",
            vatNumber: "123",
            regNumber: '123',
            address: "Home"
        }
    })

    expect(repo.getById(newClient.id)).toBeTruthy();
});

it("Does not add add client with same email or company reg or vat", async () => {
    const newClient = await repo.add({
        user_id: '123',
        email: '123',
        name: 'John',
        companyDetails: {
            name: "testnewcompany",
            vatNumber: "newcompany123",
            regNumber: 'newcompany123',
            address: "Home"
        }
    })

    expect(repo.getById(newClient.id)).toBeTruthy();


    let caughtError = false;
    try {

        await repo.add({
            user_id: '123',
            email: 'different123',
            name: 'John',
            companyDetails: {
                name: "company",
                vatNumber: "123",
                regNumber: '123',
                address: "Home"
            }
        })

    } catch(err) {
        caughtError = err;
    }

    expect(caughtError).toBeTruthy();


    caughtError = false;
    try {

        await repo.add({
            user_id: '123',
            email: '123',
            name: 'John',
            companyDetails: {
                name: "company",
                vatNumber: "differnt123",
                regNumber: 'different123',
                address: "Home"
            }
        })

    } catch(err) {
        caughtError = err;
    }

    expect(caughtError).toBeTruthy();
});
