
interface ITurret extends IBuilding {
    defaults: ITurret;
    instructions: IInstruction[];
    move: () => any;
    orders: { type: string };
    primaryWeapon: number;
    processOrders: () => any;
    reloadTime: number;
    turnSpeed: number;
    turretDirection: number;
}