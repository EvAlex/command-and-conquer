
import Point = require('./Point');
import Rectangle = require('./Rectangle');

class GameScreen implements IGameScreen {

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.viewport = new Rectangle(0, 0, 0, 0);
        this.viewportOffset = new Point(0, 0);
        this.viewportDelta = new Point(0, 0);
        this.viewportAdjust = new Point(0, 0);
    }

    width: number;
    height: number;

    mapImageSize: {
        width: number,
        height: number
    } = {
        width: 0, height: 0
    };

    viewport: Rectangle;
    viewportOffset: Point;
    viewportDelta: Point;
    viewportAdjust: Point;
}

export = GameScreen;