import { Express } from 'express'
import path from 'path'

import jwt from 'jsonwebtoken'
import { UsersRepository } from "../repositories/usersRepository"

export const authRoutes = (app: Express) => {

    app.get("/login", (req, res) => {
        res.json({message: 'login pass!'})
    })

    const userRepo = new UsersRepository()
    userRepo.init(path.resolve(__dirname, `../../${process.env.PATH_TO_JSON_DIR}`))

    app.post("/login", async (req, res) => {
        try {
            // Get user input
            const { email, password } = req.body;
        
            // Validate user input
            if (!(email && password)) {
            res.status(400).send("All input is required");
            }

            const user = await userRepo.getByEmail(email);
            if ( user && user.password === password ) {
            const token = jwt.sign(
                { user_id: user.id, email },
                process.env.TOKEN_KEY,
                {
                expiresIn: "2h",
                }
            )

            return res.status(200).json({
                "user_id": user.id,
                "token": token,
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
            const { email, password, confirmPassword } = req.body;

            // Validate user input
            if (!(email && password && confirmPassword)) {
            res.status(400).send("All input is required");
            }

            if ( password !== confirmPassword ) {
            return res.status(500).send("Password and Confirm Password do not match");
            }

            try {
            const user = await userRepo.add({
                email: email,
                password: password
            })
            
            return res.status(200).json({
                "user_id": user.id,
            })
            } catch (err) {
            return res.status(500).send("Email already used by another account");
            }
        } catch (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        }
    });
}
