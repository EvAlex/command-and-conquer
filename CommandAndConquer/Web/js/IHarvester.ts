
interface IHarvester extends IUnit {
    tiberium: number;
    orders: IHarvestOrder | IHarvestReturnOrder;
}