
interface IGameObject {
    draw(
        context: CanvasRenderingContext2D,
        curPlayerTeam: string,
        gridSize: number,
        screen: IGameScreen,
        units: IUnit[],
        vehiclesFactory: IVehiclesFactory,
        sidebar: ISidebar,
        enemy: IPlayer,
        debugMode: boolean): void;
    pixelWidth: number;
    pixelHeight: number;
    name: string;
    imagesToLoad: { count: number, name: string }[];
    spriteArray: { count: number, name: string, offset: number }[];
    spriteCanvas: HTMLCanvasElement;
    spriteCount: number;
    spriteImage: HTMLImageElement;
    type: string;
    status: string;
    x: number;
    y: number;
}