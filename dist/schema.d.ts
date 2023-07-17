import { DbClient } from './db.js';
declare const typeDefs = "#graphql\n  type Product {\n    id: ID!\n    name: String!\n    sizePerUnit: Int!\n    isHazardous: Boolean!\n  }\n\n  type Warehouse {\n    id: ID!\n    size: Int!\n    products: [Product]\n  }\n\n  type Query {\n    products: [Product]\n    warehouses: [Warehouse]\n  }\n\n  type Mutation {\n    createProduct(name: String!, isHazardous: Boolean!, sizePerUnit: Int!): Product!\n    updateProduct(id: ID!, name: String, isHazardous: Boolean, sizePerUnit: Int): Product\n    deleteProduct(id: ID!): Product\n  }\n";
declare const resolvers: {
    Query: {
        products: (_: any, __: any, { dbClient }: {
            dbClient: DbClient;
        }) => Promise<any[]>;
    };
    Mutation: {
        createProduct: (_: any, { name, isHazardous, sizePerUnit }: {
            name: any;
            isHazardous: any;
            sizePerUnit: any;
        }, { dbClient }: {
            dbClient: DbClient;
        }) => Promise<any>;
        updateProduct: (_: any, { id, name, isHazardous, sizePerUnit }: {
            id: any;
            name: any;
            isHazardous: any;
            sizePerUnit: any;
        }, { dbClient }: {
            dbClient: DbClient;
        }) => Promise<any>;
        deleteProduct: (_: any, { id }: {
            id: any;
        }, { dbClient }: {
            dbClient: DbClient;
        }) => Promise<any>;
    };
};
export { typeDefs, resolvers };
