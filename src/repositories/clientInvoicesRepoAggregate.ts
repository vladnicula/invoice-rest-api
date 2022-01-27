import { ClientData, ClientsRepository } from "./clientsRepository";
import { InvoiceData, InvoicesRepository } from "./invoicesRepository";

type InvoiceWithClientDetails = {
    invoice: InvoiceData
    client: ClientData
}

type SortingByArgs = {
    date?: "asc" | "desc"
    price?: "asc" | "desc"
    companyName?: "asc" | "desc"
}

type FilterByArgs = {
    clientId?: string
    date?: {
        start?: number
        end?: number
    }
}

export class ClientInvoicesRepoAggregate {
    private static _instance: ClientInvoicesRepoAggregate;
    
    static async getInstance () {
        if (!ClientInvoicesRepoAggregate._instance) {
            ClientInvoicesRepoAggregate._instance = new ClientInvoicesRepoAggregate();
            ClientInvoicesRepoAggregate._instance.invoicesRepo = await InvoicesRepository.getInstance();
            ClientInvoicesRepoAggregate._instance.clientsRepo = await ClientsRepository.getInstance();
            // await ClientInvoicesRepoAggregate._instance.init(jsonDir);
        }
        return ClientInvoicesRepoAggregate._instance;
    }

    private invoicesRepo: InvoicesRepository;
    private clientsRepo: ClientsRepository;

    async getInvoices(params: {userId:string, filter?: FilterByArgs, sort?: SortingByArgs, offset?: number}) {
        const { filter = {}, sort = {}, userId, offset = 0 } = params;
        
        const allInvoices = this.invoicesRepo.getByUserId(userId)
        const allResults: InvoiceWithClientDetails[] = [];
        for ( let i = 0; i < allInvoices.length; i += 1 ) {
            allResults.push({
                invoice: allInvoices[i],
                client: await this.clientsRepo.getById(allInvoices[i].client_id)
            })
        }

        let filteredResults = allResults;
        if ( Object.keys(filter).length ) {
            if ( filter.clientId ) {
                filteredResults = filteredResults.filter((item) => {
                    return item.client.id === filter.clientId
                })
            }

            if ( filter.date ) {
                const startDate = filter.date.start ?? -Infinity;
                const endDate = filter.date.end ?? Infinity;
                filteredResults = filteredResults.filter((item) => {
                    return item.invoice.date >= startDate && item.invoice.date < endDate;
                })
            }
           
        }

        let sortedResults = filteredResults;
        if ( Object.keys(sort).length ) {
            if ( sort.date ) {
                const coef = sort.date === 'asc' ? 1 : -1
                sortedResults = sortedResults.sort((a,b) => {
                    if ( a.invoice.date > b.invoice.date ) {
                        return coef;
                    } 
                    return -coef;
                });
            }

            if ( sort.companyName ) {
                const coef = sort.companyName === 'asc' ? 1 : -1;
                sortedResults = sortedResults.sort((a, b) => {
                    if ( a.client.companyDetails.name > b.client.companyDetails.name ) {
                        return coef;
                    } 
                    return -coef;
                })
            }

            if ( sort.price ) {
                const coef = sort.price === 'asc' ? 1 : -1;
                sortedResults = sortedResults.sort((a, b) => {
                    if ( a.invoice.value < b.invoice.value ) {
                        return coef;
                    } 
                    return -coef;
                })
            }
        }

        return sortedResults;
    }
}