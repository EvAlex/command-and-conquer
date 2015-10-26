
interface IGameLevel {
    /** 'gdi1' */
    id: string;
    mapGrid: string[][];
    mapImage: HTMLImageElement;
    obstructionGrid: number[][];
    team: string;
    overlay: IOverlay[];
}