import { Express } from 'express'
import { graphqlHTTP } from 'express-graphql'

import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLFloat,
    GraphQLInputObjectType,
    GraphQLEnumType,
} from 'graphql'
import { ClientsRepository } from '../repositories/clientsRepository'
import { verifyTokenMiddleware } from '../middleware/verifyTokenMiddleware'
import { ClientInvoicesRepoAggregate } from '../repositories/clientInvoicesRepoAggregate'
  
export const graphQLRoute = (app: Express) => {

    const ClientCompanyDetailsSchema = new GraphQLObjectType({
        name: "ClientCompanyDetails",
        fields: () => ({
            name: { type: GraphQLString },
            vatNumber: { type: GraphQLString },
            regNumber: { type: GraphQLString },
            address: { type: GraphQLString },
        })
    })

    const ClientSchema = new GraphQLObjectType({
        name: "Client",
        fields: () => ({
            id: { type: GraphQLString },
            user_id: { type: GraphQLString },
            email: { type: GraphQLString },
            name: { type: GraphQLString },
            companyDetails: { type: ClientCompanyDetailsSchema },
            totalBilled: { type: GraphQLFloat },
            invoicesCount: { type: GraphQLFloat },
            invoices: {
                type: new GraphQLList(InvoiceSchema)
            }
        }),
    })

    const ClientListSchema = new GraphQLObjectType({
        name: "ClientList",
        fields: () => ({
            results: {
                type: new GraphQLList(ClientSchema),
            },
            total: {
                type: GraphQLInt
            }
        }),
    })

    const InvoiceSchema = new GraphQLObjectType({
        name: "Invoice",
        fields: () => ({
            id: { type: GraphQLString },
            user_id: { type: GraphQLString },
            invoice_number: { type: GraphQLString },
            date: { type: GraphQLInt },
            dueDate: { type: GraphQLInt },
            value: { type: GraphQLFloat },
        }),
    })

    const sortEnum = new GraphQLEnumType({
        name: "SortOrder",
        description: "In which order to sort a given key",
        values: {
            asc: {
                description: "Sort in ascending order",
            },
            desc: {
                description: "Sort in descending order"
            }
        }
    })

    const ClientListSortSchema = new GraphQLInputObjectType({
        name: "ClientListSortSchema",
        fields: () => ({
            creation: { type: sortEnum },
            totalBilled: { type: sortEnum },
            clientName: { type: sortEnum },
            companyName: { type: sortEnum },
            invoicesCount: { type: sortEnum }
        }),
    })


    const RootMutationType = new GraphQLObjectType({
        name: "Mutation",
        description: "Root Mutation",
        fields: () => ({
            addClient: {
                type: ClientSchema,
                description: "Adds a new client",
                args: {
                    email: { type: GraphQLString },
                    name: { type: GraphQLString },
                    companyDetails: {
                        type: new GraphQLInputObjectType({
                            name: "CompanyDetails",
                            fields: {
                                name: { type: GraphQLString },
                                vatNumber: { type: GraphQLString },
                                regNumber: { type: GraphQLString },
                                address: { type: GraphQLString },
                            }
                        })
                    }
                },
                resolve: async (parent, args, {req}) => {
                    const clientsRepo = app.get("clientsRepo") as ClientsRepository
                    const userId = (req as any)?.user?.user_id as string ?? "555";
                    const clientById = await clientsRepo.getById(req.body.id)

                    // console.log("args", args)

                    if ( clientById  ) {
                        if ( clientById.user_id !== userId ) {
                            throw new Error("Client not found. Cannot update.")
                        }
                        const result = await clientsRepo.update({user_id: userId, ...args})   
                        return result
                    }

                    const result = await clientsRepo.add({user_id: userId, ...args})   
                    return result
                }
            }
        })
    })

    const RootQueryType =  new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
            clients: {
                type: ClientListSchema,
                args: {
                    sort: {
                        type: ClientListSortSchema,
                        description: "Sort the results"
                    },
                    limit: {
                        type: GraphQLInt,
                        description: "Limit results to"
                    },
                    offset: {
                        type: GraphQLInt,
                        description: "Skip offset number of results"
                    },
                },
                async resolve (parent, args, {req}, info) {
                    const invoiceAggregate = app.get("invoiceClientAggregate") as ClientInvoicesRepoAggregate
                    const { sort, offset, limit } = args
                    const userId = (req as any)?.user?.user_id ?? "555";
                    const { result: results, total } = await invoiceAggregate.getClients({
                        userId, sort, offset, limit
                    })
                    return { results, total }
                }
            }
        },
    })

    const AppGraphQLRoot = new GraphQLSchema({
        mutation: RootMutationType,
        query: RootQueryType
    });

    app.use(
        '/graphql',
        // disable auth when DEBUG_GRAPH_QL
        ...process.env.DEBUG_GRAPH_QL ? [] : [verifyTokenMiddleware],
        (req,res) => graphqlHTTP({
            schema: AppGraphQLRoot,
            graphiql: true,
            context: {req, res}
        })(req, res),
    );
}
