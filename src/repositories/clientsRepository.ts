import { BaseRepository } from './baseRepository';
import { CompanyDetails } from './company';

type ClientData = {
    id: string
    user_id: string
    email: string
    name: string
    companyDetails: CompanyDetails
};

export class ClientsRepository extends BaseRepository<ClientData> {
    constructor () {
        super("clients.json");
    }

    async getByEmailForUser (email: string, user_id: string) {
        return this.inMemoryData.find((item) => item.email === email)
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
        return super.add(client);
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
}