import { Express } from 'express'
import { verifyTokenMiddleware } from "../middleware/verifyTokenMiddleware"

export const mainRoutes = (app: Express ) => {
    app.get("/dashboard", verifyTokenMiddleware, (req, res) => {
        res.json({message: 'dashboard pass!'})
    })
}
