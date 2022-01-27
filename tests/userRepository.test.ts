import path from 'path'
import { UsersRepository } from '../src/repositories/usersRepository'


let repo: UsersRepository;
beforeAll(async () => {
    repo = await UsersRepository.getInstance()
    repo.disableAutoWriteToDisk = true;
})

it("Loads repository from JSON file", async () => {
    const result = await repo.getByEmail(`tarzan@jungle.com`);
    expect(result).not.toBeFalsy();
    expect(result).toHaveProperty("id")
})

it("Adds user to repository", async () => {

    const result = await repo.add({
        email: "userRepositoryTest.user@test.com",
        password: "123_123",
    });

    expect(result).toHaveProperty('id');

    const byIdResult = await repo.getById(result.id);
    expect(byIdResult).toEqual(result)
});

it("Does not add user to repository if email already exists", async () => {

    const result = await repo.add({
        email: "unique_test.user@test.com",
        password: "123_123",
    });

    expect(result).toHaveProperty('id');


    let caughtError = false;
    try {

        await repo.add({
            email: "unique_test.user@test.com",
            password: "123_123",
        });

    } catch(err) {
        caughtError = err;
    }

    expect(caughtError).toBeTruthy();
});
