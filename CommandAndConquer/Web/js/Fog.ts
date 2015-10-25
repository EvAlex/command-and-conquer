
class Fog {

    constructor() {
        this.fogCanvas = document.createElement('canvas');
        this.canvasWidth = 128;
        this.canvasHeight = 128;
    }

    private fogCanvas: HTMLCanvasElement;
    private fogContext: CanvasRenderingContext2D;

    isOver(x, y) {
        var currentMap = game.currentLevel.mapImage;

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

    draw() {
        var fogCanvas = this.fogCanvas;
        var fogContext = this.fogContext;
        var currentMap = game.currentLevel.mapImage;
        fogContext.save();

        fogContext.scale(this.canvasWidth / currentMap.width, this.canvasHeight / currentMap.height);

        fogContext.fillStyle = 'rgba(200,200,200,1)';

        for (var i = game.units.length - 1; i >= 0; i--) {
            var unit = game.units[i];
            if (unit.team == game.currentLevel.team || unit.bulletFiring) {
                fogContext.beginPath();
                fogContext.globalCompositeOperation = "destination-out";
                fogContext.arc((Math.floor(unit.x) + 0.5) * game.gridSize, (Math.floor(unit.y) + 0.5) * game.gridSize,
                    //fogContext.arc(((unit.x)+0.5)*game.gridSize,((unit.y)+0.5)*game.gridSize,
                    (unit.sight + 0.5) * game.gridSize, 0, 2 * Math.PI, false);
                //fogContext.globalAlpha = 0.2;
                fogContext.fill()
            }
        };
        for (var i = game.buildings.length - 1; i >= 0; i--) {

            var build = game.buildings[i];

            if (build.team == game.currentLevel.team) {
                fogContext.beginPath();
                fogContext.globalCompositeOperation = "destination-out";
                fogContext.arc(
                    (Math.floor(build.x)) * game.gridSize + build.pixelWidth / 2,
                    (Math.floor(build.y)) * game.gridSize + build.pixelHeight / 2,
                    build.sight * game.gridSize, 0, 2 * Math.PI, false);
                fogContext.fill()
            }
        };

        for (var i = game.turrets.length - 1; i >= 0; i--) {

            var turret = game.turrets[i];

            if (turret.team == game.currentLevel.team || turret.bulletFiring) {
                fogContext.beginPath();
                fogContext.globalCompositeOperation = "destination-out";
                fogContext.arc(
                    (Math.floor(turret.x)) * game.gridSize + turret.pixelWidth / 2,
                    (Math.floor(turret.y)) * game.gridSize + turret.pixelHeight / 2,
                    turret.sight * game.gridSize, 0, 2 * Math.PI, false);
                fogContext.fill()
            }
        };

        fogContext.restore();
        context.drawImage(this.fogCanvas, 0 + game.viewportX * this.canvasWidth / currentMap.width, 0 + game.viewportY * this.canvasHeight / currentMap.height,
            game.viewportWidth * this.canvasWidth / currentMap.width, game.viewportHeight * this.canvasHeight / currentMap.height,
            game.viewportLeft, game.viewportTop, game.viewportWidth, game.viewportHeight)
    }


}

export = Fog;