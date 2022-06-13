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

If you want to have access to `/graphql` for debugging and query/mutation building,
start the server with `npm run build && DEBUG_GRAPH_QL=true npm run start`. Otherwise
you won't be able to pass a auth token the graphql layer. When `DEBUG_GRAPH_QL=true` 
there will be no token check. All resolvers should default to `111` user id.

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