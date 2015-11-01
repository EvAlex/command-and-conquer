
interface IUnit extends IDestructibleObject, ICollidable {
    animationSpeed: number;
    attacking: boolean;
    bulletFiring: boolean;
    selected: boolean;
    collision(other: IUnit, gridSize: number): ICollisionType;
    colliding: boolean
    collisionDistance: number;
    collisionType: string;
    collisionWith: ICollisionPoint;
    cost: number;
    defaults: IUnit;
    //drawSelection: () => void;
    //underPoint: (a, b) => any;
    label: string;
    //move(speedAdjustmentFactor: number, gridSize: number, sounds: Sounds): any;
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
    //processOrders: () => any;
    reloadTime: number;
    turnSpeed: number;
    turretDirection: number;
    sight: number;
    speed: number;
    status: string;
    team: string;
    turretImageCount: number;
}