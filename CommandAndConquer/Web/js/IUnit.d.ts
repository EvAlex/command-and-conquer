
interface IUnit {
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
    draw: () => void;
    drawSelection: () => void;
    getLife: () => any;
    health: number;
    hitPoints: number;
    imagesToLoad: { count: number, name: string }[];
    instructions: IInstruction[];
    label: string;
    life: string;
    move: () => any;
    moveDirection: number;
    moveImageCount: number;
    moveTo: (a, b) => any;
    movementSpeed: number;
    moving: boolean;
    name: string;
    orders: Object;
    path: IPoint[];
    pixelHeight: number;
    pixelLeft: number;
    pixelOffsetX: number
    pixelOffsetY: number;
    pixelTop: number;
    pixelWidth: number;
    primaryWeapon: number;
    processOrders: () => any;
    reloadTime: number;
    sight: number;
    softCollisionRadius: number;
    speed: number;
    spriteArray: any[];
    spriteCanvas: HTMLCanvasElement;
    spriteCount: number;
    spriteImage: HTMLImageElement;
    status: string;
    team: string;
    turnSpeed: number;
    turretDirection: number;
    turretImageCount: number;
    type: string;
    underPoint: (a, b) => any;
    x: number;
    y: number;
}