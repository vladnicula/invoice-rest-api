// Allow more .env files to be loaded, based on ENVIRONMENT. 
// Testing will load separated node environment file.
// https://github.com/motdotla/dotenv/issues/272
import path from 'path'
import dotenv from "dotenv"
const envFile = process.env.ENVIRONMENT ? `.env.${process.env.ENVIRONMENT}` : '.env'
console.log("PATH", path.resolve(__dirname, `../${envFile}`))
dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) })

import { app } from './app'

const port = process.env.PORT || 8080  // default port to listen

app.listen(port, () => {
    console.log( `server started at http://localhost:${ port }` )
})
