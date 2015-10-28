
/**
 *  May represent tree or tiberium
 */
interface IOverlay extends IGameObject {
    draw(): void;
    count: number;
    gridOffsetX: number;
    gridOffsetY: number;
    stage: number;
    stageCount: number;
}