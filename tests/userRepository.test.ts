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
        name: "John Doe",
        email: "userRepositoryTest.user@test.com",
        password: "123_123",
    });

    expect(result).toHaveProperty('id');

    const byIdResult = await repo.getById(result.id);
    expect(byIdResult).toEqual(result)
    expect(result).toHaveProperty("id")
    expect(result).toHaveProperty("name")
    expect(result).toHaveProperty("email")
});

it("Adds user to repository with the same name as another existing user, but different email addresse", async () => {

    const result = await repo.add({
        name: "John Doe",
        email: "uniqueEmail1.user@test.com",
        password: "123_123",
    });

    const result2 = await repo.add({
        name: "John Doe",
        email: "uniqueEmail2.user@test.com",
        password: "123_123",
    });

    expect(result).toHaveProperty('id');
    expect(result2).toHaveProperty('id');

    const byIdResult = await repo.getById(result.id);
    expect(byIdResult).toEqual(result)
    const byIdResult2 = await repo.getById(result2.id);
    expect(byIdResult2).toEqual(result2)
});

it("Does not add user to repository if email already exists", async () => {

    const result = await repo.add({
        name: "John Doe",
        email: "unique_test.user@test.com",
        password: "123_123",
    });

    expect(result).toHaveProperty('id');


    let caughtError = false;
    try {

        await repo.add({
            name: "John Doe",
            email: "unique_test.user@test.com",
            password: "123_123",
        });

    } catch(err) {
        caughtError = err;
    }

    expect(caughtError).toBeTruthy();
});
