var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Resolver, Query, Args, Int, ID, Mutation } from '@nestjs/graphql';
import { Product } from './models/product.model.js';
import { ProductsService } from './products.service.js';
export let ProductsResolver = class ProductsResolver {
    constructor(productsService) {
        this.productsService = productsService;
    }
    async products() {
        return this.productsService.getProducts();
    }
    async createProduct(name, isHazardous, sizePerUnit) {
        return this.productsService.createProduct(name, isHazardous, sizePerUnit);
    }
    async updateProduct(id, name, isHazardous, sizePerUnit) {
        return this.productsService.updateProduct(id, name, isHazardous, sizePerUnit);
    }
    async deleteProduct(id) {
        return this.productsService.deleteProduct(id);
    }
};
__decorate([
    Query(() => [Product]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "products", null);
__decorate([
    Mutation(() => Product),
    __param(0, Args('name')),
    __param(1, Args('isHazardous')),
    __param(2, Args('sizePerUnit', { type: () => Int })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Number]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "createProduct", null);
__decorate([
    Mutation(() => Product),
    __param(0, Args('id', { type: () => ID })),
    __param(1, Args('name', { nullable: true })),
    __param(2, Args('isHazardous', { nullable: true })),
    __param(3, Args('sizePerUnit', { nullable: true, type: () => Int })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean, Number]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "updateProduct", null);
__decorate([
    Mutation(() => Product),
    __param(0, Args('id', { type: () => ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "deleteProduct", null);
ProductsResolver = __decorate([
    Resolver(of => Product),
    __metadata("design:paramtypes", [ProductsService])
], ProductsResolver);
//# sourceMappingURL=products.resolver.js.map