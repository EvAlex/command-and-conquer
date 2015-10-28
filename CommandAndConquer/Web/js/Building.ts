
import DestructibleObject = require('./DestructibleObject');
import GameScreen = require('./GameScreen');
import Sidebar = require('./Sidebar');
import Vehicles = require('./Vehicles');
import Player = require('./Player');

class Building extends DestructibleObject implements IBuilding {

    constructor() {
        super();
        this.type = 'building';
        this.animationSpeed = 2;
        this.status = '';
    }

    cost: number;
    defaults: IBuilding;
    gridWidth: number;
    gridHeight: number;
    gridShape: number[][];
    label: string;
    pixelLeft: number;
    pixelOffsetX: number;
    pixelOffsetY: number;
    pixelTop: number;
    animationIndex: number;
    animationSpeed: number;
    bibImage: HTMLImageElement;
    powerIn: number;
    primaryBuilding: boolean = false;
    sight: number;
    status: string;
    selected: boolean;
    repairing: boolean;
    team: string;
    tiberiumStorage: number;

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

    drawSelection(context: CanvasRenderingContext2D, gridSize: number, screen: GameScreen, sidebar: Sidebar) {
        if (this.selected) {
            context.strokeStyle = 'white';
            //context.strokeWidth = 4;
            
            var selectBarSize = 5;

            var x = this.x * gridSize + screen.viewportAdjust.x + this.pixelOffsetX;
            var y = this.y * gridSize + screen.viewportAdjust.y + this.pixelOffsetY;

            var x1 = x + this.pixelLeft;
            var y1 = y + this.pixelTop;
            var x2 = x1 + this.pixelWidth;
            var y2 = y1 + this.pixelHeight;

            
            // First draw the white bracket
            context.beginPath();
            //alert(x1);
            context.moveTo(x1, y1 + selectBarSize);
            context.lineTo(x1, y1);
            context.lineTo(x1 + selectBarSize, y1);

            context.moveTo(x2 - selectBarSize, y1);
            context.lineTo(x2, y1);
            context.lineTo(x2, y1 + selectBarSize);

            context.moveTo(x2, y2 - selectBarSize);
            context.lineTo(x2, y2);
            context.lineTo(x2 - selectBarSize, y2);

            context.moveTo(x1 + selectBarSize, y2);
            context.lineTo(x1, y2);
            context.lineTo(x1, y2 - selectBarSize);

            context.stroke();

            // Now draw the health bar
            this.getLife();

            context.beginPath();
            context.rect(x1, y1 - selectBarSize - 2, this.pixelWidth * this.health / this.hitPoints, selectBarSize);
            if (this.life == 'healthy') {
                context.fillStyle = 'lightgreen';
            } else if (this.life == 'damaged') {
                context.fillStyle = 'yellow';
            } else {
                context.fillStyle = 'red';
            }
            context.fill();
            context.beginPath();
            context.strokeStyle = 'black';
            context.rect(x1, y1 - selectBarSize - 2, this.pixelWidth, selectBarSize);
            context.stroke();

            if (this.primaryBuilding) {
                context.drawImage(sidebar.primaryBuildingImage, (x1 + x2 - sidebar.primaryBuildingImage.width) / 2, y2 - sidebar.primaryBuildingImage.height);
            }
        }

    }

    draw(
        context: CanvasRenderingContext2D,
        curPlayerTeam: string,
        gridSize: number,
        screen: GameScreen,
        units: IUnit[],
        vehiclesFactory: Vehicles,
        sidebar: Sidebar,
        enemy: Player) {

        var teamYOffset = 0;
        if (this.team != curPlayerTeam) {
            teamYOffset = this.pixelHeight;
        }
            
        //First draw the bottom grass
        context.drawImage(this.bibImage, this.x * gridSize + screen.viewportAdjust.x, (this.y + this.gridHeight - 1) * gridSize + screen.viewportAdjust.y);




        var life = this.getLife(),
            imageCategory: string;
        if (this.status == "build" || this.status == "sell") {
            imageCategory = 'build';
        } else if (this.status == "" || this.life == "ultra-damaged") {
            imageCategory = this.life;
        } else {
            imageCategory = this.life + "-" + this.status;
        }


        var imageWidth = this.gridShape[0].length * gridSize;
        var imageHeight = this.spriteImage.height;
            
        // Then draw the base with baseOffset
        var baseImage = this.spriteArray[this.life + "-base"];
        if (baseImage && this.status != 'build' && this.status != 'sell') {
            context.drawImage(this.spriteCanvas, baseImage.offset * imageWidth, teamYOffset, imageWidth, imageHeight, gridSize * (this.x) + screen.viewportAdjust.x, (this.y) * gridSize + screen.viewportAdjust.y, imageWidth, imageHeight);
        }
	        
	        
        // Finally draw the top part with appropriate animation
	        
        var imageList = this.spriteArray[imageCategory];
        if (!this.animationIndex) {
            this.animationIndex = 0;
        }
        if (imageList.count >= Math.floor(this.animationIndex / this.animationSpeed)) {
            var imageIndex = Math.floor(this.animationIndex / this.animationSpeed);
            if (this.status == 'sell') {
                imageIndex = imageList.count - 1 - Math.floor(this.animationIndex / this.animationSpeed);
            }
            context.drawImage(this.spriteCanvas, (imageList.offset + imageIndex) * imageWidth, teamYOffset, imageWidth, imageHeight, gridSize * (this.x) + screen.viewportAdjust.x, (this.y) * gridSize + screen.viewportAdjust.y, imageWidth, imageHeight);
        }


        this.animationIndex++;
        if (this.animationIndex / this.animationSpeed >= imageList.count) {
            this.animationIndex = 0;
            this.applyStatusDuringDraw(curPlayerTeam, units, vehiclesFactory, sidebar, enemy);
        }

        this.drawSelection(context, gridSize, screen, sidebar);
        if (this.repairing) {
            //alert('repairing');
            context.globalAlpha = sidebar.textBrightness;
            context.drawImage(sidebar.repairImageBig, (this.x + this.gridShape[0].length / 2 - 1) * gridSize + screen.viewportAdjust.x, (this.y + this.gridShape.length / 2 - 1) * gridSize + screen.viewportAdjust.y);
            context.globalAlpha = 1;

            if (this.health >= this.hitPoints) {
                this.repairing = false;
                this.health = this.hitPoints;
            } else {
                var cashSpent = 1;
                if (sidebar.cash > cashSpent) {
                    sidebar.cash -= cashSpent;
                    this.health += (cashSpent * 2 * this.hitPoints / this.cost);
                    //console.log (this.health + " " +2*cashSpent*this.hitPoints/this.cost)     
                }
            }
        }

    }

    protected applyStatusDuringDraw(
        curPlayerTeam: string,
        units: IUnit[],
        vehiclesFactory: Vehicles,
        sidebar: Sidebar,
        enemy: Player): void {

        if (this.status == "build" || this.status == "construct" || this.status == "unload") {
            this.status = "";
        } else if (this.status == 'sell') {
            this.status = 'destroy';
        }
    }
}

export = Building;