import { ClientData, ClientsRepository } from "./clientsRepository";
import { InvoiceData, InvoicesRepository } from "./invoicesRepository";

type InvoiceWithClientDetails = {
    invoice: InvoiceData
    client: ClientData
}

export type InvoiceListingFilterByKeys = 'date' | 'price' | 'companyName' | 'dueDate' | 'creation'
export type ClientListingSortKeys = 'clientName' | 'companyName' | 'totalBilled' | 'invoicesCount' | 'creation'

export type GetInvoiceParams = {
    userId: string;
    clientId?: string;
    projectCode?: string;
    startDate?: number;
    endDate?: number;
    startDueDate?: number;
    endDueDate?: number;
    sort?: 'asc' | 'desc';
    sortBy?: InvoiceListingFilterByKeys;
    offset?: number;
    limit?: number;
};

export type GetClientsParams = {
    userId: string;
    sortBy?: ClientListingSortKeys;
    sort?: 'asc' | 'desc';
    offset?: number;
    limit?: number;
};

export class ClientInvoicesRepoAggregate {
    private static _instance: ClientInvoicesRepoAggregate;

    static async getInstance () {
        if (!ClientInvoicesRepoAggregate._instance) {
            ClientInvoicesRepoAggregate._instance = new ClientInvoicesRepoAggregate();
            ClientInvoicesRepoAggregate._instance.invoicesRepo = await InvoicesRepository.getInstance();
            ClientInvoicesRepoAggregate._instance.clientsRepo = await ClientsRepository.getInstance();
        }
        return ClientInvoicesRepoAggregate._instance;
    }

    private invoicesRepo: InvoicesRepository;
    private clientsRepo: ClientsRepository;

    async getInvoices(params: GetInvoiceParams) {
        const { 
            clientId, 
            projectCode,
            startDate,
            endDate,
            startDueDate,
            endDueDate,
            sort = 'asc', 
            sortBy, 
            userId, 
            offset = 0, 
            limit = 20 
        } = params;

        const allInvoices = this.invoicesRepo.getByUserId(userId)
        const allResults: InvoiceWithClientDetails[] = [];
        for ( let i = 0; i < allInvoices.length; i += 1 ) {
            allResults.push({
                invoice: allInvoices[i],
                client: await this.clientsRepo.getById(allInvoices[i].client_id)
            })
        }

        let filteredResults = allResults;

        if ( clientId ) {
            filteredResults = filteredResults.filter((item) => {
                return item.client.id === clientId
            })
        }


        if ( projectCode ) {
            filteredResults = filteredResults.filter((item) => {
                return item.invoice.projectCode === projectCode
            })
        }

        if ( startDate ) {
            filteredResults = filteredResults.filter((item) => {
                return item.invoice.date >= startDate;
            })
        }

        if ( endDate ) {
            filteredResults = filteredResults.filter((item) => {
                return item.invoice.date < endDate
            })
        }

        if ( startDueDate ) {
            filteredResults = filteredResults.filter((item) => {
                return item.invoice.dueDate >= startDueDate;
            })
        }

        if ( endDueDate ) {
            filteredResults = filteredResults.filter((item) => {
                return item.invoice.dueDate < endDueDate
            })
        }

        let sortedResults = filteredResults;

        const coef = sort === 'asc' ? 1 : -1

        switch (sortBy) {
            case "creation":
                sortedResults = sortedResults.sort((a,b) => {
                    if ( a.invoice.createdAt > b.invoice.createdAt ) {
                        return coef;
                    }
                    return -coef;
                })
            case "date":
                sortedResults = sortedResults.sort((a,b) => {
                    if ( a.invoice.date > b.invoice.date ) {
                        return coef;
                    }
                    return -coef;
                })
                break;
            case "dueDate":
                sortedResults = sortedResults.sort((a,b) => {
                    if ( a.invoice.dueDate > b.invoice.dueDate ) {
                        return coef;
                    }
                    return -coef;
                })
                break;
            case "companyName":
                sortedResults = sortedResults.sort((a, b) => {
                    if ( a.client.companyDetails.name > b.client.companyDetails.name ) {
                        return coef;
                    }
                    return -coef;
                })
                break;
            case "price":
                sortedResults = sortedResults.sort((a, b) => {
                    if ( a.invoice.value > b.invoice.value ) {
                        return coef;
                    }
                    return -coef;
                })
                break;
        }

        return { result: sortedResults.slice(offset, offset+limit), total: sortedResults.length }
    }


    async getClients(params: GetClientsParams) {
        const { sort, sortBy, userId, offset = 0, limit = 20 } = params;
        const allClients = await this.clientsRepo.getByUserId(userId)
        const allInvoices = await this.invoicesRepo.getByUserId(userId)

        const allClientsWithTotalBilledAndNumberOfInvoices = allClients.map((client) => {

            const [totalBilled, invoicesCount] = allInvoices.reduce((acc, item) => {
                if ( item.client_id === client.id) {
                    return [acc[0] + item.value, ++acc[1]]
                }
                return acc;
            }, [0,0]);

            return {
                ...client,
                totalBilled,
                invoicesCount
            }
        })

        let filteredResults = allClientsWithTotalBilledAndNumberOfInvoices;

        let sortedResults = filteredResults;
        if ( sort === 'desc' ) {
            sortedResults = sortedResults.reverse();
        }
        const coef = sort === 'asc' ? 1 : -1

        switch (sortBy) {
            case "clientName":
                sortedResults = sortedResults.sort((a,b) => {
                    if ( a.name > b.name ) {
                        return coef;
                    }
                    return -coef;
                });
                break;

            case "companyName":
                sortedResults = sortedResults.sort((a,b) => {
                    if ( a.companyDetails.name > b.companyDetails.name ) {
                        return coef;
                    }
                    return -coef;
                });
                break;
            case "totalBilled":
                sortedResults = sortedResults.sort((a, b) => {
                    if ( a.totalBilled > b.totalBilled ) {
                        return coef;
                    }
                    return -coef;
                })
                break;
            
            case "invoicesCount":
                sortedResults = sortedResults.sort((a, b) => {
                    if ( a.invoicesCount > b.invoicesCount ) {
                        return coef;
                    }
                    return -coef;
                })
                break
            case "creation": 
                sortedResults = sortedResults.sort((a, b) => {
                    if ( a.createdAt > b.createdAt ) {
                        return coef;
                    }
                    return -coef;
                })
            break
        }

        return { result: sortedResults.slice(offset, offset+limit), total: sortedResults.length }
    }



    async addInvoice (params: { user_id: string, invoiceData: Partial<InvoiceData> } ) {
        const {
            invoice_number,
            client_id,
            date,
            dueDate,
            value,
            projectCode = 'default',
            meta = {}
         } = params.invoiceData

         if (
            !(invoice_number && client_id && date && value)
         ) {
            throw new Error("Invalid invoice payload. Need invoice_number && client_id && date && value")
         }

         const clientExists = await this.clientsRepo.getById(client_id)

         if ( !clientExists ) {
            throw new Error("Client does not exist for specified user id")
         }

         const userId = params.user_id;

         // pretend that the client does not exist, as it belongs to a different user
         if ( clientExists.user_id !== userId ) {
            throw new Error("Client does not exist for spcified user id")
         }

         const validDueDate = dueDate || date + (30*24*60*60*1000)

         const createdInvoice = await this.invoicesRepo.add({
            user_id: userId,
            invoice_number,
            client_id,
            date,
            dueDate: validDueDate,
            projectCode,
            meta,
            value,
            createdAt: new Date().getTime()
         })

         return createdInvoice;
    }
}
