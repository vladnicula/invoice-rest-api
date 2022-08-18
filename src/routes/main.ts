import path from 'path'
import { Express } from 'express'
import { ClientInvoicesRepoAggregate } from '../repositories/clientInvoicesRepoAggregate'
import { verifyTokenMiddleware } from "../middleware/verifyTokenMiddleware"
import { ClientsRepository } from '../repositories/clientsRepository'
import { InvoiceData, InvoicesRepository } from '../repositories/invoicesRepository'
import { UsersRepository } from '../repositories/usersRepository'

import multer from 'multer'
import fs from 'fs'


export const mainRoutes = (app: Express ) => {

    const uploadMiddleware = multer({ dest: 'temp/' })

    app.get("/invoices", verifyTokenMiddleware, async (req, res) => {
        try {
            let {
                clientId, startDueDate, endDueDate, startDate, endDate, projectCode,
                sort, sortBy, offset, limit 
            } = req.query as Record<string, any>;

            if ( typeof limit === 'string' ) {
                limit = parseInt(limit, 10)
            }

            if ( typeof offset === 'string' ) {
                offset = parseInt(offset, 10)
            }

            const invoiceAggregate = app.get("invoiceClientAggregate") as ClientInvoicesRepoAggregate
            const userId = (req as any).user.user_id;
            const { result, total } = await invoiceAggregate.getInvoices({
                userId, sortBy, sort, offset, limit, clientId, startDueDate, endDueDate, startDate, endDate, projectCode
            })
            return res.json({invoices: result, total })
        } catch (err) {
            res.status(500).send(err.message)
        }
    })


    app.get("/invoices/:id", verifyTokenMiddleware, async (req, res) => {
        const { id } = req.params;

        try {
            const invoicesRepo = app.get("invoicesRepo") as InvoicesRepository
            const userId = (req as any).user.user_id;
            const result = await invoicesRepo.getById(id)

            if ( result && result.user_id === userId ) {
                return res.json({success: true, invoice: result})
            } else {
                return res.status(404).send("Invoice not found")
            }
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

    app.put("/invoices", verifyTokenMiddleware, async (req, res) => {
        try {
            const invoicesRepo = app.get("invoicesRepo") as InvoicesRepository
            const userId = (req as any).user.user_id as string;
            const invoiceData = await invoicesRepo.getById(req.body.id)

            if ( !invoiceData ) {
                res.status(404).send("Invoice not found. Cannot update.")
            }

            if ( invoiceData.user_id !== userId ) {
                res.status(404).send("Invoice not found. Cannot update.")
            }

            const result = await invoicesRepo.update({user_id: userId, ...req.body})
            return res.json({success: true, invoice: result})
           } catch (err) {
               res.status(500).send(err.message)
           }
     })

    app.get("/clients", verifyTokenMiddleware, async (req, res) => {
        const invoiceAggregate = app.get("invoiceClientAggregate") as ClientInvoicesRepoAggregate
        try {
            let { sort, sortBy, offset, limit } = req.query as Record<string, any>;
            if ( typeof limit === 'string' ) {
                limit = parseInt(limit, 10)
            }

            if ( typeof offset === 'string' ) {
                offset = parseInt(offset, 10)
            }
            const userId = (req as any).user.user_id;
            const { result, total } = await invoiceAggregate.getClients({
                userId, sort, sortBy, offset, limit
            })
            setTimeout(() => {
                res.json({clients: result, total})
            }, 1000)
            return
        } catch (err) {
            console.log(err.message);
            res.status(500).send(err.message)
        }
    })



    app.get("/clients/names", verifyTokenMiddleware, async (req, res) => {
        try {
            const clientsRepo = app.get("clientsRepo") as ClientsRepository
            const userId = (req as any).user.user_id;
            const results = await clientsRepo.getClientCompanyNames(userId)
            return res.json({success: true, clients: results})
        } catch(err) {
            res.status(500).send(err.message)
        }
    })

    app.get("/clients/:id", verifyTokenMiddleware, async (req, res) => {
        const { id } = req.params;
        try {
            const clientsRepo = app.get("clientsRepo") as ClientsRepository
            const userId = (req as any).user.user_id;
            const result = await clientsRepo.getById(id)
            if ( userId === result?.user_id ) {
                return res.json({success: true, client: result})
            } else {
                return res.status(404).send("Client not found")
            }
        } catch (err) {
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

     app.put("/clients", verifyTokenMiddleware, async (req, res) => {
        try {
            const clientsRepo = app.get("clientsRepo") as ClientsRepository
            const userId = (req as any).user.user_id as string;
            const userOwningClient = await clientsRepo.getById(req.body.id)

            if ( !userOwningClient ) {
                res.status(404).send("Client not found. Cannot update.")
            }

            if ( userOwningClient.user_id !== userId ) {
                res.status(404).send("Client not found. Cannot update.")
            }

            const result = await clientsRepo.update({user_id: userId, ...req.body})
            return res.json({success: true, client: result})
           } catch (err) {
               res.status(500).send(err.message)
           }
     })

     app.get("/me", verifyTokenMiddleware, async (req, res) => {
        try {
            const usersRepo = app.get("usersRepo") as UsersRepository
            const userId = (req as any).user.user_id as string;
            const foundUser = await usersRepo.getById(userId)
            foundUser.companyDetails ??= null;
            return res.json(foundUser)
        } catch (err) {
            res.status(500).send(err.message)
        }
     })

     app.put('/me/avatar', verifyTokenMiddleware, uploadMiddleware.single('avatar'), async (req, res) => {
        try {
            const { file } = req
            const userId = (req as any).user.user_id as string;
            const usersRepo = app.get("usersRepo") as UsersRepository
            if ( file ) {
                const newPath = `public/avatar_${userId}_${file.originalname}`
                fs.renameSync(
                    path.resolve(__dirname, `../../${file.path}`), 
                    path.resolve(__dirname, `../../${newPath}`)
                )
                const updatedUser = await usersRepo.setUserProfile(userId, newPath)
                return res.status(200).json({success: true, updatedUser})
            } else {
                const updatedUser = await usersRepo.setUserProfile(userId, null)
                return res.status(200).json({success: true, updatedUser})
            }
        } catch(err) {
            return res.status(500).send(err.message)
        }
        
     })

     app.put("/me/company", verifyTokenMiddleware, async (req,res) => {
        
        try {
            const usersRepo = app.get("usersRepo") as UsersRepository
            const userId = (req as any).user.user_id as string;
            const updatedUser = await usersRepo.updateCompanyDetails(userId, req.body)
            return res.status(200).json({success: true, user: updatedUser})
        } catch (err) {
            res.status(500).send(err.message)
        }
     })

     app.get('/reset', (req, res) => {
        // console.log("reseting api data")
        const currentPath = path.resolve(__dirname, '../../scripts/reset-service')
        const { run } = require(currentPath)  
        const pathToFixtures = `${process.env.PATH_TO_JSON_DIR}/fixtures`;
        run(pathToFixtures)
        const usersRepo = app.get("usersRepo") as UsersRepository
        const clientsRepo = app.get("clientsRepo") as ClientsRepository
        const invoicesRepo = app.get("invoicesRepo") as InvoicesRepository;
        usersRepo.init(process.env.PATH_TO_JSON_DIR)
        clientsRepo.init(process.env.PATH_TO_JSON_DIR)
        invoicesRepo.init(process.env.PATH_TO_JSON_DIR)
        res.status(200).send("OK")
     })
}
