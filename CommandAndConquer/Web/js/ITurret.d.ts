
interface ITurret extends IBuilding {
    //defaults: ITurret;
    instructions: IInstruction[];
    move(sounds: ISoundsManager, bulletDrawer: IBulletDrawer): any;
    orders: IOrder;
    primaryWeapon: number;
    processOrders(gridSize: number, units: IUnit[], buildings: IBuilding[], turrets: ITurret[]): any;
    reloadTime: number;
    turnSpeed: number;
    turretDirection: number;
    bulletFiring: boolean;
}