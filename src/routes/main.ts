import { Express } from 'express'
import { ClientInvoicesRepoAggregate } from '../repositories/clientInvoicesRepoAggregate'
import { verifyTokenMiddleware } from "../middleware/verifyTokenMiddleware"



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

    app.get("/clients", verifyTokenMiddleware, (req, res) => {
        res.json({message: 'invoices pass!'})
    })
}
