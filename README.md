# Invoice API

## Quick setup

After checking out this repo:

```
npm i 
```

Then, make a copy of the `.env.example` file as `.env`
Then, make a copy of the `.env.example` file as `.env.test`

Update the `.env.test` file to contain the line:
```
PATH_TO_JSON_DIR=./fake-database-testing
```

This makes the testing env point to a different folder when running tests.

## Running the project

We are using typescript, so we need to bundle the code first and then run it.

```
npm run build && npm run start
```

## Running tests

All endpoints and operations are tested. To run the tests you can:

```
npm run test
```

## DB Reset

A database reset command is implemented which will copy over the original fixtures 
of the fake database over into the main files.

```
npm run reset-dev-db
```