import { HazardousState } from './hazardous-state.js';

export interface WarehouseEntity {
    id: number;
    size: number;
    hazardousState: HazardousState;
    stockAmount: number;
    freeSpace: number;
}
