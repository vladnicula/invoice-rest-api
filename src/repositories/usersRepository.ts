import { BaseRepository } from './baseRepository';
import { CompanyDetails } from './company';

type UserData = {
    id: string
    email: string
    password: string
    companyDetails?: CompanyDetails
};

export class UsersRepository extends BaseRepository<UserData> {
    constructor () {
        super("users.json");
    }


    async getByEmail (email: string) {
        return this.inMemoryData.find((item) => item.email === email)
    }

    async add(user: Omit<UserData, "id">) {
        const { email } = user;
        const existingUser = await this.getByEmail(email)
        if ( existingUser ) {
            throw new Error(`email already used by another account`);
        }
        return super.add(user);
    }
}