import { Express } from 'express'
import { verifyTokenMiddleware } from "../middleware/verifyTokenMiddleware"

export const mainRoutes = (app: Express ) => {
    app.get("/dashboard", verifyTokenMiddleware, (req, res) => {
        res.json({message: 'dashboard pass!'})
    })

    app.get("/invoices", verifyTokenMiddleware, (req, res) => {
        res.json({message: 'invoices pass!'})
    })

    app.get("/clients", verifyTokenMiddleware, (req, res) => {
        res.json({message: 'invoices pass!'})
    })
}
