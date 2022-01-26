import { BaseRepository } from './baseRepository';

type InvoiceData = {
    id: string
    invoice_number: string
    user_id: string
    client_id: string
    date: number
    value: number
};

export class InvoicesRepository extends BaseRepository<InvoiceData> {
    constructor () {
        super("invoices.json");
    }

    async getByInvoiceNumberAndUserId (id: string, user_id: string) {
        return this.inMemoryData.find((item) => item.id === id)
    }

    async add(invoice: Omit<InvoiceData, "id">) {
        const { user_id, invoice_number } = invoice;
        const existingInvoiceByNumberAndUser = await this.getByInvoiceNumberAndUserId(invoice_number, user_id)
        if ( existingInvoiceByNumberAndUser ) {
            throw new Error(`invoice with that number already exists`);
        }
        return super.add(invoice);
    }
}