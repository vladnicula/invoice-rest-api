import { jsonDir } from '../config';
import { BaseRepository } from './baseRepository';
import { CompanyDetails } from './company';

type UserData = {
    id: string
    name: string
    email: string
    password: string
    avatar?: string
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

    async updateCompanyDetails(id: string, companyDetails: CompanyDetails & {
        iban: string
        swift: string
    }) {
        const existingUser =  await this.getById(id);
        if ( !existingUser ) {
            throw new Error('User company details update failed because user is not found')
        }
        this.update({
            ...existingUser,
            companyDetails
        })
        return existingUser;
    }

    async setUserProfile (id: string, filePath: string) {
        const existingUser =  await this.getById(id);
        if ( !existingUser ) {
            throw new Error('User avatar update failed because user is not found')
        }

        this.update({
            ...existingUser,
            avatar: filePath
        })

        return existingUser
    }
}
