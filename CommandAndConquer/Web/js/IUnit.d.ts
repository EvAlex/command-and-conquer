
interface IUnit extends IDestructibleObject, ICollidingObject {
    animationSpeed: number;
    attacking: boolean;
    bulletFiring: boolean;
    selected: boolean;
    cost: number;
    defaults: IUnit;
    //drawSelection: () => void;
    underPoint(x: number, y: number, gridSize: number): boolean;
    label: string;
    move(speedAdjustmentFactor: number, gridSize: number, sounds: ISoundsManager, bulletDrawer: IBulletDrawer): any;
    moveDirection: number;
    moveImageCount: number;
    //moveTo: (a, b) => any;
    movementSpeed: number;
    moving: boolean;
    orders: Object;
    path: IPoint[];
    pixelLeft: number;
    pixelTop: number;
    pixelOffsetX: number
    pixelOffsetY: number;
    gridHeight: number;
    gridWidth: number;
    instructions: IInstruction[];
    primaryWeapon: number;
    processOrders(
        speedAdjustmentFactor: number,
        units: IUnit[],
        buildings: IBuilding[],
        turrets: ITurret[],
        allOverlays: IOverlay[],
        buildingsFactory: IBuildingsFactory,
        fog: IFog,
        sounds: ISoundsManager,
        curPlayerTeam: string,
        obstructionGrid: number[][],
        heroObstructionGrid: number[][],
        debugMode: boolean,
        context: CanvasRenderingContext2D,
        gridSize: number,
        screen: IGameScreen): any;
    reloadTime: number;
    turnSpeed: number;
    turretDirection: number;
    sight: number;
    speed: number;
    status: string;
    team: string;
    turretImageCount: number;
}