
import Building = require('./Building');
import GameScreen = require('./GameScreen');

class Fog {

    constructor() {
        this.fogCanvas = document.createElement('canvas');
        this.canvasWidth = 128;
        this.canvasHeight = 128;
    }

    private fogCanvas: HTMLCanvasElement;
    private fogContext: CanvasRenderingContext2D;

    isOver(x, y, mapImage: HTMLImageElement) {
        var currentMap = mapImage;

        var pixel = this.fogContext.getImageData(x * this.canvasWidth / currentMap.width, y * this.canvasHeight / currentMap.height, 1, 1).data;
        //alert("fog "+x+","+y+" "+pixel[0]+" "+pixel[1]+" "+pixel[2]+" "+pixel[3]);
        return (pixel[3] == 255);
    }

    canvasWidth: number;
    canvasHeight: number;

    init() {
        this.fogContext = this.fogCanvas.getContext('2d'),
        this.fogContext.fillStyle = 'rgba(0,0,0,1)';
        this.fogContext.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    }

    draw(
        context: CanvasRenderingContext2D,
        mapImage: HTMLImageElement,
        units: IUnit[],
        gridSize: number,
        currentTeam: string,
        buildings: Building[], turrets: ITurret[],
        screen: GameScreen) {

        var fogCanvas = this.fogCanvas;
        var fogContext = this.fogContext;
        var currentMap = mapImage;
        fogContext.save();

        fogContext.scale(this.canvasWidth / currentMap.width, this.canvasHeight / currentMap.height);

        fogContext.fillStyle = 'rgba(200,200,200,1)';

        for (var i = units.length - 1; i >= 0; i--) {
            var unit = units[i];
            if (unit.team == currentTeam || unit.bulletFiring) {
                fogContext.beginPath();
                fogContext.globalCompositeOperation = "destination-out";
                fogContext.arc((Math.floor(unit.x) + 0.5) * gridSize, (Math.floor(unit.y) + 0.5) * gridSize,
                    //fogContext.arc(((unit.x)+0.5)*game.gridSize,((unit.y)+0.5)*game.gridSize,
                    (unit.sight + 0.5) * gridSize, 0, 2 * Math.PI, false);
                //fogContext.globalAlpha = 0.2;
                fogContext.fill()
            }
        };
        for (var i = buildings.length - 1; i >= 0; i--) {

            var build = buildings[i];

            if (build.team == currentTeam) {
                fogContext.beginPath();
                fogContext.globalCompositeOperation = "destination-out";
                fogContext.arc(
                    (Math.floor(build.x)) * gridSize + build.pixelWidth / 2,
                    (Math.floor(build.y)) * gridSize + build.pixelHeight / 2,
                    build.sight * gridSize, 0, 2 * Math.PI, false);
                fogContext.fill()
            }
        };

        for (var i = turrets.length - 1; i >= 0; i--) {

            var turret = turrets[i];

            if (turret.team == currentTeam || turret.bulletFiring) {
                fogContext.beginPath();
                fogContext.globalCompositeOperation = "destination-out";
                fogContext.arc(
                    (Math.floor(turret.x)) * gridSize + turret.pixelWidth / 2,
                    (Math.floor(turret.y)) * gridSize + turret.pixelHeight / 2,
                    turret.sight * gridSize, 0, 2 * Math.PI, false);
                fogContext.fill()
            }
        };

        fogContext.restore();
        context.drawImage(this.fogCanvas, 0 + screen.viewportOffset.x * this.canvasWidth / currentMap.width, 0 + screen.viewportOffset.y * this.canvasHeight / currentMap.height,
            screen.viewport.width * this.canvasWidth / currentMap.width, screen.viewport.height * this.canvasHeight / currentMap.height,
            screen.viewport.left, screen.viewport.top, screen.viewport.width, screen.viewport.height)
    }


}

export = Fog;