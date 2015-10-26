
interface IOverlay {
    count: number;
    draw(): void;
    gridOffsetX: number;
    gridOffsetY: number;
    imagesToLoad: { count: number, name: string }[];
    name: string;
    pixelWidth: number;
    pixelHeight: number;
    spriteArray: { count: number, name: string, offset: number }[];
    spriteCanvas: HTMLCanvasElement;
    spriteCount: number;
    spriteImage: HTMLImageElement;
    stage: number;
    stageCount: number;
    type: number;
    x: number;
    y: number;
}