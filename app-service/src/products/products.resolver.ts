import { Resolver, Query, Args, Int, ID, Mutation } from '@nestjs/graphql';
import { Product } from './models/product.model.js';
import { ProductsService } from './products.service.js';

@Resolver(of => Product)
export class ProductsResolver {
    constructor(
        private readonly productsService: ProductsService,
    ) {
    }

    @Query(() => [Product])
    async products() {
        return this.productsService.getProducts();
    }

    @Mutation(() => Product)
    async createProduct(
        @Args('name') name: string,
        @Args('isHazardous') isHazardous: boolean,
        @Args('sizePerUnit', { type: () => Int }) sizePerUnit: number,
    ) {
        return this.productsService.createProduct(name, isHazardous, sizePerUnit);
    }

    @Mutation(() => Product)
    async updateProduct(
        @Args('id', { type: () => ID }) id: number,
        @Args('name', { nullable: true }) name?: string,
        @Args('isHazardous', { nullable: true }) isHazardous?: boolean,
        @Args('sizePerUnit', { nullable: true, type: () => Int }) sizePerUnit?: number,
    ) {
        return this.productsService.updateProduct(id, name, isHazardous, sizePerUnit);
    }

    @Mutation(() => Product)
    async deleteProduct(
        @Args('id', { type: () => ID }) id: number,
    ) {
       return this.productsService.deleteProduct(id);
    }
}
