import { DbClient } from '../db.js';
import { Product } from './models/product.model.js';
export declare class ProductsService {
    private readonly dbClient;
    constructor(dbClient: DbClient);
    getProducts(): Promise<Product[]>;
    createProduct(name: string, isHazardous: boolean, sizePerUnit: number): Promise<Product>;
    updateProduct(id: string, name?: string, isHazardous?: boolean, sizePerUnit?: number): Promise<Product>;
    deleteProduct(id: string): Promise<Product>;
}
