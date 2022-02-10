import { Express } from 'express'
import { ClientInvoicesRepoAggregate } from '../repositories/clientInvoicesRepoAggregate'
import { verifyTokenMiddleware } from "../middleware/verifyTokenMiddleware"
import { ClientsRepository } from '../repositories/clientsRepository'
import { InvoiceData, InvoicesRepository } from '../repositories/invoicesRepository'

export const mainRoutes = (app: Express ) => {
    app.get("/dashboard", verifyTokenMiddleware, (req, res) => {
        res.json({message: 'dashboard pass!'})
    })

    app.get("/invoices", verifyTokenMiddleware, async (req, res) => {
        const { filter, sort } = req.body
        try {
            const invoiceAggregate = app.get("invoiceClientAggregate") as ClientInvoicesRepoAggregate
            const userId = (req as any).user.user_id;
            const result = await invoiceAggregate.getInvoices({
                userId, filter, sort
            })
            return res.json({invoices: result})
        } catch (err) {
            res.status(500).send(err.message)
        }
    })

    app.post("/invoices", verifyTokenMiddleware, async (req, res) => {
       try {
        const invoiceAggregate = app.get("invoiceClientAggregate") as ClientInvoicesRepoAggregate
        const userId = (req as any).user.user_id as string;
        const result = await invoiceAggregate.addInvoice({user_id: userId, invoiceData: req.body as Partial<InvoiceData> })
        return res.json({success: true, invoice: result})
       } catch (err) {
           res.status(500).send(err.message)
       }
    })

    app.get("/clients", verifyTokenMiddleware, async (req, res) => {
        const invoiceAggregate = app.get("invoiceClientAggregate") as ClientInvoicesRepoAggregate
        const { filter, sort } = req.body
        try {
            const userId = (req as any).user.user_id;
            const result = await invoiceAggregate.getClients({
                userId, filter, sort
            })
            setTimeout(() => {
                res.json({clients: result})
            }, 1000)
            return 
        } catch (err) {
            console.log(err.message);
            res.status(500).send(err.message)
        }
    })

    app.post("/clients", verifyTokenMiddleware, async (req, res) => {
        try {
         const clientsRepo = app.get("clientsRepo") as ClientsRepository
         const userId = (req as any).user.user_id as string;
         const result = await clientsRepo.add({user_id: userId, ...req.body})
         return res.json({success: true, client: result})
        } catch (err) {
            res.status(500).send(err.message)
        }
     })
}
