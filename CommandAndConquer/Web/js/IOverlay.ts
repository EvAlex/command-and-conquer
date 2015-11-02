
/**
 *  May represent tree or tiberium
 */
interface IOverlay extends IGameObject {
    draw(context: CanvasRenderingContext2D, gridSize: number, screen: IGameScreen): void;
    count: number;
    gridOffsetX: number;
    gridOffsetY: number;
}

interface ITiberium extends IOverlay {
    stage: number;
    stageCount: number;
}