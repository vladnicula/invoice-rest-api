import jwt from 'jsonwebtoken'
import { RequestHandler } from "express";
import { decode } from 'punycode';

export const verifyTokenMiddleware: RequestHandler = (req, res, next) => {
    let token =
        req.body.token || req.query.token || req.headers["x-access-token"];

    if ( req.headers['authorization'] ) {
        token = req.headers['authorization'].replace('Bearer ', '')
    }

    /**
     * Add a quick access hack for work done in Week 02-04 for office hours.
     * Allows bypassing user login for these 4 hardcodes users.
     */
    if (token === '111' || token === '222' || token === '333' || token === '444' ) {
        // @ts-ignore because we don't have time to 
        // write safe types for req objects
        req.user = {
            user_id: token,
            email: `fake_user${token[0]}@officehourtesting.com`
        }
        return next();
    }

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        // @ts-ignore because we don't have time to 
        // write safe types for req objects
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    next();
};