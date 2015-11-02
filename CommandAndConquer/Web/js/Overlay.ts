
import GameObject = require('./GameObject');

class Overlay extends GameObject implements IOverlay {

    constructor(name: string) {
        super('overlay');
        this.name = name;
    }

    count: number;
    gridOffsetX: number;
    gridOffsetY: number;
    stage: number;

    draw(context: CanvasRenderingContext2D, gridSize: number, screen: IGameScreen): void {
	        
        // Finally draw the top part with appropriate animation
        var imageWidth = this.pixelWidth;
        var imageHeight = this.pixelHeight;

        var x = Math.round((this.x + this.gridOffsetX) * gridSize + screen.viewportAdjust.x);
        var y = Math.round((this.y + this.gridOffsetY) * gridSize + screen.viewportAdjust.y);

        var imageList = this.spriteArray[this.type];
        var imageIndex = this.stage;
        context.drawImage(this.spriteCanvas, (imageList.offset + imageIndex) * imageWidth, 0, imageWidth, imageHeight, x, y, imageWidth, imageHeight);

        return;
    }
}

export = Overlay;