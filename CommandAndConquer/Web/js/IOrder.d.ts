
interface IOrder {
    type: string;
}

interface IMoveOrder extends IOrder {
    from?: IPoint;
    to: IPoint;
}

/**
 *  type="patrol"
 */
interface IPatrolOrder extends IOrder {
    from: IPoint;
    to: IPoint;
}

interface IProtectOrder extends IOrder {
    target: IUnit
}

interface IGuardOrder extends IOrder {
}

/**
 * type: "harvest"
 */
interface IHarvestOrder extends IOrder {
    from: ITiberiumRefinery;
    to: ITiberium;
}

/**
 * type: "harvest-return"
 */
interface IHarvestReturnOrder extends IOrder {
    from: ITiberium;
    to?: ITiberiumRefinery;
}

/**
 *  type="attack"
 */
interface IAttackOrder extends IOrder {
    target: IUnit;
    lastOrders: IOrder;
}