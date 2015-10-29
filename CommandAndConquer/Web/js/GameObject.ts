
import GameScreen = require('./GameScreen');
import Sidebar = require('./Sidebar');
import Rectangle = require('./Rectangle');

abstract class GameObject implements IGameObject {

    //abstract draw(): void;

    pixelLeft: number;
    pixelTop: number;
    pixelOffsetX: number;
    pixelOffsetY: number;

    underPoint(x, y, gridSize: number): boolean {
        var xo = this.x * gridSize + this.pixelOffsetX;
        var yo = this.y * gridSize + this.pixelOffsetY;

        var x1 = xo + this.pixelLeft;
        var y1 = yo + this.pixelTop;
        var x2 = x1 + this.pixelWidth;
        var y2 = y1 + this.pixelHeight;
        //
        
        return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    }

    selected: boolean;

    drawSelection(context: CanvasRenderingContext2D, gridSize: number, screen: GameScreen, sidebar: Sidebar) {
        if (this.selected) {
            context.strokeStyle = 'white';
            //context.strokeWidth = 4;
            
            var selectBarSize = 5;
                        
            var bounds = this.getSelectionBounds(gridSize, screen);
            
            // First draw the white bracket
            context.beginPath();
            //alert(x1);
            context.moveTo(bounds.left, bounds.top + selectBarSize);
            context.lineTo(bounds.left, bounds.top);
            context.lineTo(bounds.left + selectBarSize, bounds.top);

            context.moveTo(bounds.right - selectBarSize, bounds.top);
            context.lineTo(bounds.right, bounds.top);
            context.lineTo(bounds.right, bounds.top + selectBarSize);

            context.moveTo(bounds.right, bounds.bottom - selectBarSize);
            context.lineTo(bounds.right, bounds.bottom);
            context.lineTo(bounds.right - selectBarSize, bounds.bottom);

            context.moveTo(bounds.left + selectBarSize, bounds.bottom);
            context.lineTo(bounds.left, bounds.bottom);
            context.lineTo(bounds.left, bounds.bottom - selectBarSize);

            context.stroke();
        }

    }

    protected getSelectionBounds(gridSize: number, screen: GameScreen): Rectangle {
        var x = this.x * gridSize + screen.viewportAdjust.x + this.pixelOffsetX;
        var y = this.y * gridSize + screen.viewportAdjust.y + this.pixelOffsetY;

        var x1 = x + this.pixelLeft;
        var y1 = y + this.pixelTop;

        return new Rectangle(x1, y1, this.pixelWidth, this.pixelHeight);
    }

    pixelWidth: number;
    pixelHeight: number;
    name: string;
    imagesToLoad: { count: number, name: string }[];
    spriteArray: { count: number, name: string, offset: number }[];
    spriteCanvas: HTMLCanvasElement;
    spriteCount: number;
    spriteImage: HTMLImageElement;
    type: string;
    x: number;
    y: number;

}

export = GameObject;