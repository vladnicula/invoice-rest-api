import { Express } from 'express'

import jwt from 'jsonwebtoken'
import { UsersRepository } from '../repositories/usersRepository';

export const authRoutes = (app: Express) => {

    app.post("/login", async (req, res) => {
        try {
            // Get user input
            const { email, password } = req.body;
        
            // Validate user input
            if (!(email && password)) {
                return res.status(400).send("All input is required");
            }

            const usersRepo = app.get("usersRepo") as UsersRepository
            const user = await usersRepo.getByEmail(email);
            if ( user && user.password === password ) {
                const token = jwt.sign(
                    { user_id: user.id, email },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "1h",
                    }
                )

                return res.status(200).json({
                    "user_id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "token": token,
                    "companyDetails": user.companyDetails
                });

            }

            res.status(400).send("Invalid Credentials");
        } catch (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        }
    })

    app.post("/register", async (req, res) => {
        try {
            // Get user input
            const { name, email, password, confirmPassword } = req.body;

            // Validate user input
            if (!(name && email && password && confirmPassword)) {
                res.status(400).send("All inputs are required");
            }

            if ( password !== confirmPassword ) {
                return res.status(400).send("Password and Confirm Password do not match");
            }

            try {
                const usersRepo = app.get("usersRepo") as UsersRepository
                const user = await usersRepo.add({
                    name,
                    email,
                    password
                })
                
                return res.status(200).json({
                    "user_id": user.id,
                })
            } catch (err) {
                return res.status(400).send("Email already used by another account");
            }
        } catch (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        }
    });
}
