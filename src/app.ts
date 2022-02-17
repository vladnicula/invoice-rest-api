import express from "express"
import cors from 'cors'
import { authRoutes } from "./routes/auth"
import { mainRoutes } from "./routes/main"

// DI 
import { ClientInvoicesRepoAggregate } from './repositories/clientInvoicesRepoAggregate'
import { ClientsRepository } from './repositories/clientsRepository'
import { InvoicesRepository } from './repositories/invoicesRepository'
import { UsersRepository } from "./repositories/usersRepository"


// export needed for unit/integration testing
export const app = express()

app.use(cors())

// parse JSON when content type is application/json
app.use(express.json())

authRoutes(app)
mainRoutes(app)

export const setup = async () => {
    const invoiceRepo = await InvoicesRepository.getInstance();
    app.set("invoicesRepo", invoiceRepo);
    const invoiceClientAggregate = await ClientInvoicesRepoAggregate.getInstance();
    app.set("invoiceClientAggregate", invoiceClientAggregate);
    const clientsRepo = await ClientsRepository.getInstance();
    app.set("clientsRepo", clientsRepo);
    const usersRepo = await UsersRepository.getInstance();
    app.set("usersRepo", usersRepo);
}