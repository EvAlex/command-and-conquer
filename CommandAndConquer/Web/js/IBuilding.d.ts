
interface IBuilding {
    animationIndex: number;
    animationSpeed: number;
    bibImage: HTMLImageElement;
    cost: number;
    defaults: IBuilding;
    draw: () => any;
    drawSelection: () => any;
    getLife: () => any;
    gridHeight: number;
    gridWidth: number;
    gridShape: number[][];
    health: number;
    hitPoints: number;
    imagesToLoad: { count: number, name: string }[];
    label: string;
    life: string;
    name: string;
    pixelHeight: number;
    pixelLeft: number;
    pixelOffsetX: number;
    pixelOffsetY: number;
    pixelTop: number;
    pixelWidth: number;
    powerIn: number;
    powerOut: number;
    sight: number;
    spriteArray: any[];
    spriteCanvas: HTMLCanvasElement;
    spriteCount: number;
    spriteImage: HTMLImageElement;
    status: string;
    team: string;
    tiberiumStorage: number;
    type: string; //    'building', 'turret'
    underPoint: (a, b) => any;
    x: number;
    y: number;
}