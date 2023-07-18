import { HttpException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Query, ResolveField, Resolver, Parent, Int, Mutation, Args, ID } from '@nestjs/graphql';
import { Warehouse } from './models/warehouse.model.js';
import { WarehousesService } from './warehouses.service.js';
import { WarehouseProductsService } from '../warehouse-products/warehouse-products.service.js';
import { CalculationsService } from '../calculations.service.js';
import { firstValueFrom } from 'rxjs';
import { WarehouseProduct } from '../warehouse-products/models/warehouse-product.model.js';
import { ImportProductInput } from './inputs/ImportProductInput.js';
import { ProductsService } from '../products/products.service.js';

@Resolver(of => Warehouse)
export class WarehousesResolver {
    constructor(
        private readonly warehousesService: WarehousesService,
        private readonly warehouseProductsService: WarehouseProductsService,
        private readonly calculationsService: CalculationsService,
        private readonly productsService: ProductsService,
    ) {
    }

    @Query(() => [Warehouse])
    async warehouses() {
        return this.warehousesService.getWarehouses();
    }

    @Query(() => Int)
    async combinedStockAmount() {
        return this.calculationsService.getWarehouseCombinedStockAmount();
    }

    @ResolveField()
    async warehouseProducts(@Parent() warehouse: Warehouse) {
        const { id: warehouseId } = warehouse;
        return this.warehouseProductsService.getProductsByWarehouseId(warehouseId);
    }

    @ResolveField()
    async stockAmount(@Parent() warehouse: Warehouse) {
        const { id: warehouseId } = warehouse;
        return this.calculationsService.getWarehouseStockAmount(warehouseId);
    }

    @ResolveField()
    async freeSpace(@Parent() warehouse: Warehouse) {
        const stockAmount = await firstValueFrom(await this.stockAmount(warehouse));
        return warehouse.size - stockAmount;
    }

    @Mutation(() => [WarehouseProduct])
    async import(
        @Args('toId', { type: () => ID }) toId: string,
        @Args('products', { type: () => [ImportProductInput] }) products: ImportProductInput[],
        @Args('fromId', { type: () => ID, nullable: true }) fromId?: string,
    ) {
        const warehouseTarget = await this.warehousesService.getWarehouse(toId);
        if (!warehouseTarget) {
            throw new NotFoundException(`Warehouse with id ${toId} not found.`);
        }

        const productsMap = products.reduce<Record<string, ImportProductInput>>((map, product) => {
            map[product.productId] = product;
            return map;
        }, {});

        const productEntities = await this.productsService.getProductsByIds(products.map(p => p.productId));
        if (productEntities.length !== products.length) {
            throw new NotFoundException(`Some products cannot be found.`);
        }

        const requiredSpace = productEntities.reduce((space, product) => {
            space += product.sizePerUnit * productsMap[product.id].amount;
            return space;
        }, 0);

        const freeSpace = await firstValueFrom(await this.calculationsService.getWarehouseFreeSpace(warehouseTarget.id));
        if (requiredSpace > freeSpace) {
            throw new BadRequestException(`The target warehouse doesn't have enough free space. Required: ${requiredSpace}, Available: ${freeSpace}`);
        }



        return this.warehousesService.import(toId, products, fromId);
    }

}
