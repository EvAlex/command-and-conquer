
interface IUnit extends IDestructibleObject {
    animationSpeed: number;
    attacking: boolean;
    bulletFiring: boolean;
    selected: boolean;
    colliding: boolean
    collision: (other) => boolean;
    collisionDistance: number;
    collisionRadius: number;
    collisionType: string;
    collisionWith: number;
    cost: number;
    defaults: IUnit;
    drawSelection: () => void;
    label: string;
    move: () => any;
    moveDirection: number;
    moveImageCount: number;
    moveTo: (a, b) => any;
    movementSpeed: number;
    moving: boolean;
    orders: Object;
    path: IPoint[];
    pixelLeft: number;
    pixelOffsetX: number
    pixelOffsetY: number;
    pixelTop: number;
    instructions: IInstruction[];
    primaryWeapon: number;
    processOrders: () => any;
    reloadTime: number;
    turnSpeed: number;
    turretDirection: number;
    sight: number;
    softCollisionRadius: number;
    speed: number;
    status: string;
    team: string;
    turretImageCount: number;
    underPoint: (a, b) => any;
}