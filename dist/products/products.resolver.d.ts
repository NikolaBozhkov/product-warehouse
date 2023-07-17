import { Product } from './models/product.model.js';
import { ProductsService } from './products.service.js';
export declare class ProductsResolver {
    private readonly productsService;
    constructor(productsService: ProductsService);
    products(): Promise<Product[]>;
    createProduct(name: string, isHazardous: boolean, sizePerUnit: number): Promise<Product>;
    updateProduct(id: string, name?: string, isHazardous?: boolean, sizePerUnit?: number): Promise<Product>;
    deleteProduct(id: string): Promise<Product>;
}
