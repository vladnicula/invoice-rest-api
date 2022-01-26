import { BaseRepository } from './baseRepository';
import { CompanyDetails } from './company';

type ClientData = {
    id: string
    user_id: string
    email: string
    name: number
    companyDetails?: CompanyDetails
};

export class ClientsRepository extends BaseRepository<ClientData> {
    constructor () {
        super("clients.json");
    }

    async getByEmailForUser (email: string, user_id: string) {
        return this.inMemoryData.find((item) => item.email === email)
    }

    async add(client: Omit<ClientData, "id">) {
        const { email, user_id } = client;
        const existingClientForUser = await this.getByEmailForUser(email, user_id)
        if ( existingClientForUser ) {
            throw new Error(`email already used by another client`);
        }
        return super.add(client);
    }
}