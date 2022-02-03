import { jsonDir } from '../config';
import { BaseRepository } from './baseRepository';

export type InvoiceData = {
    id: string
    invoice_number: string
    user_id: string
    client_id: string
    date: number
    dueDate: number
    value: number
};

export class InvoicesRepository extends BaseRepository<InvoiceData> {
    private static _instance: InvoicesRepository;
    
    static async getInstance () {
        if (!InvoicesRepository._instance) {
            InvoicesRepository._instance = new InvoicesRepository();
            await InvoicesRepository._instance.init(jsonDir);
        }
        return InvoicesRepository._instance;
    }

    constructor () {
        super("invoices.json");
    }

    async getByInvoiceNumberAndUserId (invoice_number: string, user_id: string) {
        return this.inMemoryData.find((item) => item.invoice_number === invoice_number && item.user_id === user_id)
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