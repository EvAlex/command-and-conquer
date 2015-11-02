
import DestructibleObject = require('./DestructibleObject');
import GameScreen = require('./GameScreen');
import Sidebar = require('./Sidebar');
import Vehicles = require('./Vehicles');
import Player = require('./Player');

class Building extends DestructibleObject implements IBuilding {

    constructor() {
        super('building');
        this.animationSpeed = 2;
        this.status = '';
    }

    cost: number;
    defaults: IBuilding;
    gridWidth: number;
    gridHeight: number;
    gridShape: number[][];
    label: string;
    animationIndex: number;
    animationSpeed: number;
    bibImage: HTMLImageElement;
    powerIn: number;
    primaryBuilding: boolean = false;
    sight: number;
    status: string;
    repairing: boolean;
    team: string;
    tiberiumStorage: number;

    draw(
        context: CanvasRenderingContext2D,
        curPlayerTeam: string,
        gridSize: number,
        screen: IGameScreen,
        units: IUnit[],
        vehiclesFactory: IVehiclesFactory,
        sidebar: ISidebar,
        enemy: IPlayer) {

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

            if (this.hitPoints >= this.maxHitPoints) {
                this.repairing = false;
                this.hitPoints = this.maxHitPoints;
            } else {
                var cashSpent = 1;
                if (sidebar.cash > cashSpent) {
                    sidebar.cash -= cashSpent;
                    this.hitPoints += (cashSpent * 2 * this.maxHitPoints / this.cost);
                    //console.log (this.health + " " +2*cashSpent*this.hitPoints/this.cost)     
                }
            }
        }

    }

    drawSelection(context: CanvasRenderingContext2D, gridSize: number, screen: IGameScreen, sidebar: ISidebar) {
        super.drawSelection(context, gridSize, screen, sidebar);

        if (this.selected) {
            if (this.primaryBuilding) {
                var bounds = this.getSelectionBounds(gridSize, screen);
                context.drawImage(sidebar.primaryBuildingImage, (bounds.left + bounds.right - sidebar.primaryBuildingImage.width) / 2, bounds.bottom - sidebar.primaryBuildingImage.height);
            }
        }
    }

    protected applyStatusDuringDraw(
        curPlayerTeam: string,
        units: IUnit[],
        vehiclesFactory: IVehiclesFactory,
        sidebar: ISidebar,
        enemy: IPlayer): void {

        if (this.status == "build" || this.status == "construct" || this.status == "unload") {
            this.status = "";
        } else if (this.status == 'sell') {
            this.status = 'destroy';
        }
    }
}

export = Building;