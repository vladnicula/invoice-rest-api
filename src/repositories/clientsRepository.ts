import { BaseRepository } from './baseRepository';
import { CompanyDetails } from './company';
import { jsonDir } from '../config'

export type ClientData = {
    id: string
    user_id: string
    email: string
    name: string
    companyDetails: CompanyDetails
    createdAt: number
};

export class ClientsRepository extends BaseRepository<ClientData> {

    private static _instance: ClientsRepository;

    static async getInstance () {
        if (!ClientsRepository._instance) {
            ClientsRepository._instance = new ClientsRepository();
            await ClientsRepository._instance.init(jsonDir);
        }
        return ClientsRepository._instance;
    }

    constructor () {
        super("clients.json");
    }

    async getByEmailForUser (email: string, user_id: string) {
        return this.inMemoryData.find((item) => item.email === email && item.user_id === user_id)
    }

    async add(client: Omit<ClientData, "id">) {
        const { email, user_id, companyDetails } = client;
        const existingClientForUser = await this.getByEmailForUser(email, user_id)
        if ( existingClientForUser ) {
            throw new Error(`email already used by another client`);
        }

        const companyByRegIdOrTaxId = await this.getCompanyByTaxOrVatId(companyDetails, user_id)

        if ( companyByRegIdOrTaxId ) {
            throw new Error(`company details (vat or reg number) already exist in another client company`);
        }
        return super.add({...client, createdAt: new Date().getTime() });
    }

    getCompanyByTaxOrVatId(companyDetails: CompanyDetails, user_id: string) {
        const { regNumber, vatNumber } = companyDetails;
        return this.inMemoryData.find((item) => (
            item.user_id === user_id
            && (
                item.companyDetails.regNumber === regNumber
                || item.companyDetails.vatNumber === vatNumber
            )
        ))
    }

    getClientCompanyNames(user_id: string) {
        return this.inMemoryData.filter((item) => (
            item.user_id === user_id
        )).map((client) => {
            return {
                id: client.id,
                companyName: client.companyDetails.name
            }
        })
    }
}
