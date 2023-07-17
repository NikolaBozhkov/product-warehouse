import { DbClient } from './db.js';

const typeDefs = `#graphql
  type Product {
    id: ID!
    name: String!
    sizePerUnit: Int!
    isHazardous: Boolean!
  }

  type Warehouse {
    id: ID!
    size: Int!
    products: [Product]
  }

  type Query {
    products: [Product]
    warehouses: [Warehouse]
  }

  type Mutation {
    createProduct(name: String!, isHazardous: Boolean!, sizePerUnit: Int!): Product!
    updateProduct(id: ID!, name: String, isHazardous: Boolean, sizePerUnit: Int): Product
    deleteProduct(id: ID!): Product
  }
`;

const resolvers = {
    Query: {
        products: async (_, __, { dbClient }: { dbClient: DbClient }) => {
            const result = await dbClient.query('SELECT id, name, is_hazardous AS "isHazardous", size_per_unit AS "sizePerUnit" FROM products');
            return result.rows;
        },
    },
    Mutation: {
        createProduct: async (_, { name, isHazardous, sizePerUnit }, { dbClient }: { dbClient: DbClient }) => {
            const result = await dbClient.query(`
            INSERT INTO products (name, is_hazardous, size_per_unit)
            VALUES ($1, $2, $3)
            RETURNING id, name, is_hazardous AS "isHazardous", size_per_unit AS "sizePerUnit"`,
                [name, isHazardous, sizePerUnit]);
            return result.rows[0];
        },
        updateProduct: async (_, { id, name, isHazardous, sizePerUnit }, { dbClient }: { dbClient: DbClient }) => {
            let updates: { [key: string]: any }[] = [
                { name },
                { is_hazardous: isHazardous },
                { size_per_unit: sizePerUnit },
            ].filter(u => Object.values(u).every(v => v !== undefined));

            const setQuery = updates.reduce<string>((result, current, i) => {
                result += `${i !== 0 ? ',' : ''}${Object.keys(current)[0]} = $${i + 1}`;
                return result;
            }, '');

            const values = updates.map(u => Object.values(u)[0]).concat([id]);

            const result = await dbClient.query(`
            UPDATE products
            SET ${setQuery}
            WHERE id = $${values.length}
            RETURNING id, name, is_hazardous AS "isHazardous", size_per_unit AS "sizePerUnit"`,
                values);

            return result.rows[0];
        },
        deleteProduct: async (_, { id }, { dbClient }: { dbClient: DbClient }) => {
            const result = await dbClient.query(`
            DELETE FROM products
            WHERE id = $1
            RETURNING id, name, is_hazardous AS "isHazardous", size_per_unit AS "sizePerUnit"`,
                [id]);

            return result.rows[0];
        }
    }
};

export { typeDefs, resolvers };
