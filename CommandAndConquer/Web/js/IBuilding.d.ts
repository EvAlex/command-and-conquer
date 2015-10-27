
interface IBuilding extends IDestructibleObject {
    animationIndex: number;
    animationSpeed: number;
    bibImage: HTMLImageElement;
    cost: number;
    defaults: IBuilding;
    drawSelection: () => any;    
    gridHeight: number;
    gridWidth: number;
    gridShape: number[][];
    label: string;
    pixelLeft: number;
    pixelOffsetX: number;
    pixelOffsetY: number;
    pixelTop: number;
    powerIn: number;
    sight: number;
    status: string;
    team: string;
    tiberiumStorage: number;
    underPoint: (a, b) => any;
}