const fs = require('fs')
const path = require('path')
const dotenv = require("dotenv")
const envFile = process.env.ENVIRONMENT ? `.env.${process.env.ENVIRONMENT}` : '.env'
dotenv.config({ path: path.resolve(__dirname, `../${envFile}`) })

const { PATH_TO_JSON_DIR } = process.env;

const clientsFixtures = fs.readFileSync(
    `${PATH_TO_JSON_DIR}/clients.fixtures.json`
);

const usersFixtures = fs.readFileSync(
    `${PATH_TO_JSON_DIR}/users.fixtures.json`
);

const invoicesFixtures = fs.readFileSync(
    `${PATH_TO_JSON_DIR}/invoices.fixtures.json`
);

fs.writeFileSync(`${PATH_TO_JSON_DIR}/clients.json`, clientsFixtures)
fs.writeFileSync(`${PATH_TO_JSON_DIR}/users.json`, usersFixtures)
fs.writeFileSync(`${PATH_TO_JSON_DIR}/invoices.json`, clientsFixtures)