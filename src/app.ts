import express from "express"
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import { authRoutes } from "./routes/auth"
import { mainRoutes } from "./routes/main"

// DI 
import { ClientInvoicesRepoAggregate } from './repositories/clientInvoicesRepoAggregate'
import { ClientsRepository } from './repositories/clientsRepository'
import { InvoicesRepository } from './repositories/invoicesRepository'
import { UsersRepository } from "./repositories/usersRepository"
import { graphQLRoute } from "./graphql/main"


// export needed for unit/integration testing
export const app = express()

app.use(function (req, res, next) {
    if (req.headers["access-control-request-private-network"]) {
        res.setHeader("access-control-allow-private-network", "true");
    }
    next(null);
})
app.use(cors())


// parse JSON when content type is application/json
app.use(express.json())

authRoutes(app)
mainRoutes(app)
graphQLRoute(app)

export const setup = async () => {

    const dir = path.resolve(path.join(__dirname, '../public'))
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    const publicPath = path.resolve(__dirname, '../public')
    app.use('/public', express.static(publicPath))

    const invoiceRepo = await InvoicesRepository.getInstance();
    app.set("invoicesRepo", invoiceRepo);
    const invoiceClientAggregate = await ClientInvoicesRepoAggregate.getInstance();
    app.set("invoiceClientAggregate", invoiceClientAggregate);
    const clientsRepo = await ClientsRepository.getInstance();
    app.set("clientsRepo", clientsRepo);
    const usersRepo = await UsersRepository.getInstance();
    app.set("usersRepo", usersRepo);
}