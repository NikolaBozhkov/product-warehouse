import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Resolver, Query, Args, Int, ID, Mutation } from '@nestjs/graphql';
import { Product } from './models/product.model.js';
import { ProductsService } from './products.service.js';
import { WarehouseProductsService } from '../warehouse-products/warehouse-products.service.js';
import { WarehousesService } from '../warehouses/warehouses.service.js';
import { HazardousState } from '../warehouses/models/hazardous-state.js';

@Resolver(of => Product)
export class ProductsResolver {
    constructor(
        private readonly productsService: ProductsService,
        private readonly warehouseProductsService: WarehouseProductsService,
        private readonly warehousesService: WarehousesService,
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
        const product = (await this.productsService.getProductsByIds([id]))[0];
        if (!product) {
            throw new NotFoundException(`Product with id ${id} cannnot be found.`);
        }

        const productWarehouses = await this.warehouseProductsService.getProductsCountPerWarehouseContainingProduct(id);

        // Size per unit validation
        const warehouseStockAmounts: Record<number, number> = {};
        if (sizePerUnit !== undefined) {
            for (let productWarehouse of productWarehouses) {
                const sizeDiff = productWarehouse.productAmount * (sizePerUnit - productWarehouse.sizePerUnit);
                warehouseStockAmounts[productWarehouse.warehouseId] = sizeDiff + productWarehouse.stockAmount;

                if (warehouseStockAmounts[productWarehouse.warehouseId] > productWarehouse.size) {
                    throw new BadRequestException(
                        `The size per unit cannot be changed because warehouse with id ${productWarehouse.warehouseId} containing the product doesn't have enough capacity.`);
                }
            }
        }

        // Hazardous validation
        if (isHazardous !== undefined && product.isHazardous !== isHazardous) {
            const incompatibleWarehouses = productWarehouses.filter(w => w.distinctProductsCount !== 1);
            if (incompatibleWarehouses.length > 0) {
                throw new BadRequestException(
                    `Warehouses with ids (${incompatibleWarehouses.map(w => w.warehouseId).join(', ')}) that contain product with id ${id} also contain other ${product.isHazardous ? 'hazardous' : 'non-hazardous'} products.`);
            }

            // Update all warehouses where the product is solely present
            await this.warehousesService.updateHazardousState(
                isHazardous ? HazardousState.Hazardous : HazardousState.NonHazardous,
                productWarehouses.map(w => w.warehouseId));
        }

        const updatedProduct = await this.productsService.updateProduct(id, name, isHazardous, sizePerUnit);

        await this.warehousesService.updateStockAmounts(warehouseStockAmounts);

        return updatedProduct || product;
    }

    @Mutation(() => Product)
    async deleteProduct(
        @Args('id', { type: () => ID }) id: number,
    ) {
       return this.productsService.deleteProduct(id);
    }
}
