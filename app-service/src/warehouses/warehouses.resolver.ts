import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Query, ResolveField, Resolver, Parent, Int, Mutation, Args, ID } from '@nestjs/graphql';
import { Warehouse } from './models/warehouse.model.js';
import { WarehousesService } from './warehouses.service.js';
import { WarehouseProductsService } from '../warehouse-products/warehouse-products.service.js';
import { CalculationsService } from '../calculations/calculations.service.js';
import { firstValueFrom, from } from 'rxjs';
import { WarehouseProduct } from '../warehouse-products/models/warehouse-product.model.js';
import { ImportProductInput } from './inputs/ImportProductInput.js';
import { ProductsService } from '../products/products.service.js';
import { WarehouseEntity } from './models/warehouse.entity.js';
import { HazardousState } from './models/hazardous-state.js';
import { LogisticsHistoryService } from '../logistics-history/logistics-history.service.js';
import { LogisticsType } from '../logistics-history/models/logistics-type.js';
import { ProductAmount } from 'src/products/models/product-amount.js';
import { Product } from 'src/products/models/product.model.js';

@Resolver(of => Warehouse)
export class WarehousesResolver {
    constructor(
        private readonly warehousesService: WarehousesService,
        private readonly warehouseProductsService: WarehouseProductsService,
        private readonly calculationsService: CalculationsService,
        private readonly productsService: ProductsService,
        private readonly logisticsHistoryService: LogisticsHistoryService,
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
    async freeSpace(@Parent() warehouse: Warehouse) {
        return warehouse.size - warehouse.stockAmount;
    }

    @Mutation(() => [WarehouseProduct])
    async import(
        @Args('toId', { type: () => Int }) toId: number,
        @Args('products', { type: () => [ImportProductInput] }) products: ImportProductInput[],
        @Args('fromId', { type: () => Int, nullable: true }) fromId?: number,
    ) {
        if (products.length === 0) {
            throw new BadRequestException('No products provided.');
        }

        const warehouseTarget = await this.getValidatedWarehouse(toId);

        const productEntities = await this.productsService.getProductsByIds(products.map(p => p.productId));
        if (productEntities.length !== products.length) {
            throw new NotFoundException(`Some products cannot be found.`);
        }

        const firstIsHazardous = productEntities[0].isHazardous;
        for (let product of productEntities) {
            if (product.isHazardous !== firstIsHazardous) {
                throw new BadRequestException(`Products differ in hazardous state.`);
            }
        }

        if (firstIsHazardous && warehouseTarget.hazardousState === HazardousState.NonHazardous) {
            throw new BadRequestException(`Hazardous products cannot be imported in a waarehouse that contains non-hazardous products.`);
        } else if (!firstIsHazardous && warehouseTarget.hazardousState === HazardousState.Hazardous) {
            throw new BadRequestException(`Non-hazardous products cannot be imported in a waarehouse that contains hazardous products.`);
        } else if (warehouseTarget.hazardousState === HazardousState.Neutral) {
            // Empty warehouse, update hazardous state to match products
            await this.warehousesService.updateHazardousState(
                firstIsHazardous ? HazardousState.Hazardous : HazardousState.NonHazardous,
                [warehouseTarget.id]);
        }

        const requiredSpace = await this.calculationsService.getRequiredSpace(this.mapProductAmounts(products, productEntities));

        if (requiredSpace > warehouseTarget.freeSpace) {
            throw new BadRequestException(
                `The target warehouse doesn't have enough free space. Required: ${requiredSpace}, Available: ${warehouseTarget.freeSpace}`);
        }

        const importedProducts = await this.warehousesService.import(toId, products, requiredSpace, fromId);

        await this.logisticsHistoryService.recordOperation(warehouseTarget.id, LogisticsType.Import, products);

        return importedProducts;
    }

    @Mutation(() => [WarehouseProduct])
    async export(
        @Args('fromId', { type: () => Int }) fromId: number,
        @Args('products', { type: () => [ImportProductInput] }) products: ImportProductInput[],
        @Args('toId', { type: () => Int, nullable: true }) toId?: number,
    ) {
        const _ = await this.getValidatedWarehouse(fromId);

        // Validate product availability
        const warehouseProducts = await this.warehouseProductsService.getProductsByWarehouseId(fromId);
        for (let product of products) {
            const warehouseProduct = warehouseProducts.find(p => p.productId === product.productId);
            if (warehouseProduct === undefined) {
                throw new NotFoundException(
                    `Product with id ${product.productId} is not available in warehouse with id ${fromId}`);
            }

            if (product.amount > warehouseProduct.amount) {
                throw new BadRequestException(
                    `Not enough stock for product with id ${product.productId}. Requested: ${product.amount}, Available: ${warehouseProduct.amount}`);
            }
        }

        const productEntities = await this.productsService.getProductsByIds(products.map(p => p.productId));
        const freedSpace = await this.calculationsService.getRequiredSpace(this.mapProductAmounts(products, productEntities));

        const stockLeft = await this.warehousesService.export(fromId, products, freedSpace, toId);
        const productsLeft = await this.warehouseProductsService.getProductsByWarehouseId(fromId);
        if (productsLeft.length === 0) {
            await this.warehousesService.updateHazardousState(HazardousState.Neutral, [fromId]);
        }

        await this.logisticsHistoryService.recordOperation(fromId, LogisticsType.Export, products);

        return stockLeft;
    }

    private async getValidatedWarehouse(id: number): Promise<WarehouseEntity> {
        const warehouse = await this.warehousesService.getWarehouse(id);
        if (!warehouse) {
            throw new NotFoundException(`Warehouse with id ${id} not found.`);
        }

        return warehouse;
    }

    private mapProductAmounts(products: ImportProductInput[], productEntities: Product[]) {
        const productsMap = products.reduce<Record<string, ImportProductInput>>((map, product) => {
            map[product.productId] = product;
            return map;
        }, {});

        const productAmounts = productEntities.map<ProductAmount>(p => ({
            id: p.id,
            sizePerUnit: p.sizePerUnit,
            amount: productsMap[p.id].amount,
        }));

        return productAmounts;
    }
}
