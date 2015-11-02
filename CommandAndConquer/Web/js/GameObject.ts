
import GameScreen = require('./GameScreen');
import Sidebar = require('./Sidebar');
import Rectangle = require('./Rectangle');

abstract class GameObject implements IGameObject {

    constructor(type: string) {
        this.type = type;
    }

    abstract draw(
        context: CanvasRenderingContext2D,
        curPlayerTeam: string,
        gridSize: number,
        screen: IGameScreen,
        units: IUnit[],
        vehiclesFactory: IVehiclesFactory,
        sidebar: ISidebar,
        enemy: IPlayer,
        debugMode: boolean): void;

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

    drawSelection(context: CanvasRenderingContext2D, gridSize: number, screen: IGameScreen, sidebar: ISidebar) {
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

    protected getSelectionBounds(gridSize: number, screen: IGameScreen): Rectangle {
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


    protected findAngle(object: IPoint, unit: { x: number, y: number, type?: string } = this, base: number = 32) {
        var dy = object.y - unit.y;
        var dx = object.x - unit.x;
        if (unit.type == 'turret') {
            dy = dy - 0.5;
            dx = dx - 0.5;
        }
        var angle = base / 2 + Math.round(Math.atan2(dx, dy) * base / (2 * Math.PI));

        if (angle < 0) {
            angle += base;
        }
        if (angle >= base) {
            angle -= base;
        }
        return angle;
    }

    protected addAngle(angle: number, increment: number, base: number): number {
        angle = Math.round(angle) + increment;
        if (angle > base - 1) {
            angle -= base;
        }
        if (angle < 0) {
            angle += base;
        }
        return angle;
    }

    protected angleDiff(angle1: number, angle2: number, base: number): number {
        angle1 = Math.floor(angle1);
        angle2 = Math.floor(angle2)
        if (angle1 >= base / 2) {
            angle1 = angle1 - base;
        }
        if (angle2 >= base / 2) {
            angle2 = angle2 - base
        }
        var diff = angle2 - angle1;
        if (diff < -base / 2) {
            diff += base;
        }
        if (diff > base / 2) {
            diff -= base;
        }
        return diff;
    }
}

export = GameObject;