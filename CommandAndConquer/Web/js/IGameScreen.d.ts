
interface IGameScreen {
    width: number;
    height: number;

    mapImageSize: {
        width: number,
        height: number
    };

    viewport: IRectangle;
    viewportOffset: IPoint;
    viewportDelta: IPoint;
    viewportAdjust: IPoint;
}