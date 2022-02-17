import { jsonDir } from '../config';
import { BaseRepository } from './baseRepository';
import { CompanyDetails } from './company';

type UserData = {
    id: string
    name: string
    email: string
    password: string
    companyDetails?: CompanyDetails
};

export class UsersRepository extends BaseRepository<UserData> {
    private static _instance: UsersRepository;
    
    static async getInstance () {
        if (!UsersRepository._instance) {
            UsersRepository._instance = new UsersRepository();
            await UsersRepository._instance.init(jsonDir);
        }
        return UsersRepository._instance;
    }
    
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