
import VisualObject = require('./VisualObject');
import GameScreen = require('./GameScreen');
import Sidebar = require('./Sidebar');
import Buildings = require('./Buildings');
import Turrets = require('./Turrets');
import InfantryFactory = require('./InfantryFactory');
import Vehicles = require('./Vehicles');
import Fog = require('./Fog');

class Cursor {
    x: number; 
    y: number; 
    name: string; 
    count: number;
    spriteOffset: number; 
    cursorSpeed: number;
}

class Mouse extends VisualObject {

    constructor() {
        super();
    }
    
    x: number;
    y: number;
    gridX: number;
    gridY: number;
    gameX: number;
    gameY: number;
    insideCanvas: boolean;
    isOverFog: boolean;
    buttonPressed: boolean;
    panDirection: string;
    panningThreshold: number = 48;
    panningVelocity: number = 24;
    dragX: number;
    dragY: number;
    dragSelect: any;
    cursorLoop: number;

    handlePanning(screen: GameScreen, mapImageSize: ISize, sidebar: Sidebar) {
        var panDirection = "";
        if (this.insideCanvas) {
            if (this.y <= screen.viewport.top + this.panningThreshold && this.y >= screen.viewport.top) {
                screen.viewportDelta.y = -this.panningVelocity;
                panDirection += "_top";
            } else if (this.y >= screen.viewport.top + screen.viewport.height - this.panningThreshold && this.y <= screen.viewport.top + screen.viewport.height) {
                screen.viewportDelta.y = this.panningVelocity;
                panDirection += "_bottom";
            } else {
                screen.viewportDelta.y = 0;
                panDirection += "";
            }

            if (this.x < this.panningThreshold && this.y >= screen.viewport.top && this.y <= screen.viewport.top + screen.viewport.height) {
                screen.viewportDelta.y = -this.panningVelocity;
                panDirection += "_left";
            } else if (this.x > screen.width - this.panningThreshold && this.y >= screen.viewport.top && this.y <= screen.viewport.top + screen.viewport.height) {
                screen.viewportDelta.y = this.panningVelocity;
                panDirection += "_right";
            } else {
                screen.viewportDelta.y = 0;
                panDirection += "";
            }
        }

        if ((screen.viewportOffset.x + screen.viewportDelta.y < 0)
            || (screen.viewportOffset.x + screen.viewportDelta.y + screen.width + (sidebar.visible ? -sidebar.width : 0) > mapImageSize.width)) {
            screen.viewportDelta.y = 0;
            //console.log (screen.viewportOffset.x+screen.viewportDelta.y +screen.width+(this.sidebar.visible?-this.sidebar.width:0));
            //console.log (this.game.currentLevel.mapImage.width);
        }

        if (!sidebar.visible && (screen.viewportOffset.x + screen.width > mapImageSize.width)) {
            screen.viewportOffset.x = mapImageSize.width - screen.width;
            screen.viewportDelta.y = 0;
        }

        if ((screen.viewportOffset.y + screen.viewportDelta.y < 0)
            || (screen.viewportOffset.y + screen.viewportDelta.y + screen.viewport.height > mapImageSize.height)) {
            screen.viewportDelta.y = 0;
        }

        if (panDirection != "") {
            if (screen.viewportDelta.y == 0 && screen.viewportDelta.y == 0) {
                panDirection = "no_pan" + panDirection;
            } else {
                panDirection = "pan" + panDirection;
            }
        }
        this.panDirection = panDirection;
        screen.viewportOffset.x += screen.viewportDelta.y;
        screen.viewportOffset.y += screen.viewportDelta.y;
        this.gameX = this.x + screen.viewportOffset.x - screen.viewport.left;
        this.gameY = this.y + screen.viewportOffset.y - screen.viewport.top;

        screen.viewportAdjust.x = screen.viewport.left - screen.viewportOffset.x;
        screen.viewportAdjust.y = screen.viewport.top - screen.viewportOffset.y;

    }

    drawCursor(context: CanvasRenderingContext2D, screen: GameScreen) {
        if (!this.insideCanvas) {
            return;
        }
        this.cursorLoop++;
        if (this.cursorLoop >= this.cursor.cursorSpeed * this.cursor.count) {
            this.cursorLoop = 0;
        }
        //alert(this.spriteImage)
        // If drag selecting, draw a white selection rectangle
        if (this.dragSelect) {
            var x = Math.min(this.gameX, this.dragX);
            var y = Math.min(this.gameY, this.dragY);
            var width = Math.abs(this.gameX - this.dragX)
            var height = Math.abs(this.gameY - this.dragY)
            context.strokeStyle = 'white';
            context.strokeRect(x + screen.viewportAdjust.x, y + screen.viewportAdjust.y, width, height);
        }
    	    
        //var image = this.cursor.images[Math.floor(this.cursorLoop/this.cursor.cursorSpeed)];
        var imageNumber = this.cursor.spriteOffset + Math.floor(this.cursorLoop / this.cursor.cursorSpeed);
        context.drawImage(this.spriteImage, 30 * (imageNumber), 0, 30, 24, this.x - this.cursor.x, this.y - this.cursor.y, 30, 24);
    }

    checkOverObject(
        overlayObjects: IOverlay[],
        buildings: IBuilding[],
        turrets: ITurret[],
        units: IUnit[],
        gridSize: number) {
        var overObject = null;
        for (var i = overlayObjects.length - 1; i >= 0; i--) {
            var overlay = overlayObjects[i];

            if (overlay.name == 'tiberium' && this.gridX == overlay.x && this.gridY == overlay.y) {
                //
                //console.log(overlay.name + ' ' +overlay.x + ' ' +overlay.y + ' '+this.gridX + ' '+this.gridY )
                overObject = overlay;
                //alert('overlay')
            }
        };
        for (var i = buildings.length - 1; i >= 0; i--) {
            if (buildings[i].underPoint(this.gameX, this.gameY, gridSize)) {
                overObject = buildings[i];
                break;
            }
        };

        for (var i = turrets.length - 1; i >= 0; i--) {
            if (turrets[i].underPoint(this.gameX, this.gameY, gridSize)) {
                overObject = turrets[i];
                break;
            }
        };

        for (var i = units.length - 1; i >= 0; i--) {
            if (units[i]['underPoint'] && units[i].underPoint(this.gameX, this.gameY, gridSize)) {
                overObject = units[i];
                break;
            }
        };


        return overObject;
    }

    draw(
        context: CanvasRenderingContext2D,
        screen: GameScreen,
        currentLevel: IGameLevel,
        overlayObjects: IOverlay[],
        sidebar: Sidebar,
        buildingsFactory: Buildings,
        buildings: IBuilding[],
        turretsFactory: Turrets,
        turrets: ITurret[],
        vehicles: Vehicles,
        infantry: InfantryFactory,
        units: IUnit[],
        selectedUnits: IUnit[],
        selectedAttackers: IUnit[],
        buildingObstructionGrid: number[][],
        obstructionGrid: number[][],
        gridSize: number,
        highlightGrid: (i: number, j: number, width: number, height: number, optionalImage?: HTMLImageElement) => void) {

        this.cursor = this.cursors['default'];
        var selectedObject = this.checkOverObject(overlayObjects, buildings, turrets, units, gridSize);

        if (this.y < screen.viewport.top || this.y > screen.viewport.top + screen.viewport.height) {
            // default cursor if too much to the top
        } else if (sidebar.deployMode) {
            var buildingType = buildingsFactory.types[sidebar.deployBuilding] || turretsFactory.types[sidebar.deployBuilding];
            var grid = $.extend([], buildingType.gridShape);
            grid.push(grid[grid.length - 1]);
            //grid.push(grid[1]);
            for (var y = 0; y < grid.length; y++) {
                for (var x = 0; x < grid[y].length; x++) {
                    if (grid[y][x] == 1) {
                        if (this.gridY + y < 0 || this.gridY + y >= buildingObstructionGrid.length || this.gridX + x < 0 || this.gridX + x >= buildingObstructionGrid[this.gridY + y].length || buildingObstructionGrid[this.gridY + y][this.gridX + x] == 1) {
                            //if (this.game.buildingObstructionGrid[this.gridY+y][this.gridX+x] == 1){
                            highlightGrid(this.gridX + x, this.gridY + y, 1, 1, sidebar.placementRedImage);
                        } else {
                            highlightGrid(this.gridX + x, this.gridY + y, 1, 1, sidebar.placementWhiteImage);
                        }
                    }
                }
            }
        } else if (sidebar.repairMode) {
            if (selectedObject && selectedObject.team == currentLevel.team
                && (selectedObject.type == 'building' || selectedObject.type == 'turret') && (selectedObject.health < selectedObject.hitPoints)) {
                this.cursor = this.cursors['repair'];
            } else {
                this.cursor = this.cursors['no_repair'];
            }
        } else if (sidebar.sellMode) {
            if (selectedObject && selectedObject.team == currentLevel.team
                && (selectedObject.type == 'building' || selectedObject.type == 'turret')) {
                this.cursor = this.cursors['sell'];
            } else {
                this.cursor = this.cursors['no_sell'];
            }
        } else if (sidebar.visible && this.x > sidebar.left) {
            //over a button
            var hovButton = sidebar.hoveredButton(this);
            if (hovButton) {
                var tooltipName = hovButton.type;
                switch (hovButton.type) {
                    case 'infantry':
                        tooltipName = infantry.types[hovButton.name].label;
                        break;
                    case 'building':
                        tooltipName = buildingsFactory.types[hovButton.name].label;
                        break;
                    case 'turret':
                        tooltipName = turretsFactory.types[hovButton.name].label;
                        break;
                    case 'vehicle':
                        tooltipName = vehicles.types[hovButton.name].label;
                        break;

                }
                var tooltipCost = "$" + hovButton.cost;
                //context.fillRect()
                    
                context.fillStyle = 'black';
                context.fillRect(Math.round(this.x), Math.round(this.y + 16), tooltipName.length * 5.5 + 8, 32);
                context.strokeStyle = 'darkgreen';
                context.strokeRect(Math.round(this.x), Math.round(this.y + 16), tooltipName.length * 5.5 + 8, 32);
                context.fillStyle = 'darkgreen';

                context.font = '12px "Command and Conquer"';
                context.fillText(tooltipName, Math.round(this.x + 4), Math.round(this.y + 30));
                context.fillText(tooltipCost, Math.round(this.x + 4), Math.round(this.y + 44));
            }
        } else if (this.dragSelect) {
            this.cursor = this.cursors['default'];
        } else if (selectedObject && !this.isOverFog) {
            if (selectedObject.team && selectedObject.team != currentLevel.team && selectedAttackers.length > 0) {
                this.cursor = this.cursors['attack'];
            } else if (selectedUnits.length == 1 && selectedUnits[0].name == 'harvester'
                && selectedUnits[0].team == currentLevel.team
                && (selectedObject.name == 'tiberium' || selectedObject.name == 'refinery')) {
                //My team's harvester is selected alone
                if (selectedObject.name == 'tiberium') {
                    this.cursor = this.cursors['attack']; // Harvester attacks tiberium 
                }
                if (selectedObject.name == 'refinery' && selectedObject.team == currentLevel.team) {
                    this.cursor = this.cursors['load_vehicle']; // Harvester enters my refinery
                }
            } else if (selectedUnits.length == 1 && selectedObject.selected && selectedObject.team == currentLevel.team) {
                if (selectedObject.name == 'mcv') {
                    this.cursor = this.cursors['build_command'];
                }
            } else if (!selectedObject.selected && selectedObject.name != 'tiberium') {
                this.cursor = this.cursors['select'];
            } else if (selectedObject.name == 'tiberium') {
                if (obstructionGrid[this.gridY] && obstructionGrid[this.gridY][this.gridX] == 1) {
                    this.cursor = this.cursors['no_move'];
                } else {
                    this.cursor = this.cursors['move'];
                }

            }
        } else if (this.panDirection && this.panDirection != "") {
            this.cursor = this.cursors[this.panDirection];
        }
        else if (selectedUnits.length > 0) {
            if (obstructionGrid[this.gridY] && obstructionGrid[this.gridY][this.gridX] == 1 && !this.isOverFog) {
                this.cursor = this.cursors['no_move'];
            } else {
                this.cursor = this.cursors['move'];
            }

        }



        if (this.insideCanvas) {
            this.drawCursor(context, screen);
        }


    }

    click(ev, rightClick, sidebar: Sidebar, screen: GameScreen, soundsManager: ISoundsManager, onClick: (ev, rightClick) => void) {
        if (this.y <= screen.viewport.top && this.y > screen.viewport.top - 15) {
            // Tab Area Clicked    
            if (this.x >= 0 && this.x < 160) {
                // Options button clicked
                //alert ('No Options yet.');
            } else if (this.x >= 320 && this.x < 480) {
                // Score button clicked
                //alert ('Score button clicked');
            } else if (this.x >= 480 && this.x < 640) {
                // Sidebar button clicked
                //alert ('Sidebar button clicked');
                sidebar.visible = !sidebar.visible;
            }
        } else if (this.y >= screen.viewport.top && this.y <= screen.viewport.top + screen.viewport.height) {
            //Game Area Clicked
            if (sidebar.visible && this.x > sidebar.left) {
                //alert ('sidebar clicked');
                sidebar.click(ev, rightClick, this, soundsManager);
            } else {
                onClick(ev, rightClick);
                //alert('game area clicked');
            }

        }
    }
    
    loaded: boolean = false;
    preloadCount: number = 0;
    loadedCount: number = 0;
    spriteImage: HTMLImageElement = null;
    cursor: Cursor;
    cursors: Object;
    cursorCount: number = 0;

    loadCursor(name: string, x: number = 0, y: number = 0, imageCount: number = 1, cursorSpeed: number = 1) {
        this.cursors[name] = { x: x, y: y, name: name, count: imageCount, spriteOffset: this.cursorCount, cursorSpeed: cursorSpeed };
        this.cursorCount += imageCount;
    };

    loadAllCursors() {
        this.spriteImage = this.preloadImage('cursors.png');
        this.loadCursor('attack', 15, 12, 8);
        this.loadCursor('big_detonate', 15, 12, 3);
        this.loadCursor('build_command', 15, 12, 9);
        this.loadCursor('default');
        this.loadCursor('detonate', 15, 12, 3);
        this.loadCursor('load_vehicle', 15, 12, 3, 2);

        this.loadCursor('unknown');
        this.loadCursor('unknown');
        this.loadCursor('move', 15, 12);
        this.loadCursor('no_default');
        this.loadCursor('no_move', 15, 12);

        this.loadCursor('no_pan_bottom', 15, 24);
        this.loadCursor('no_pan_bottom_left', 0, 24);
        this.loadCursor('no_pan_bottom_right', 30, 24);
        this.loadCursor('no_pan_left', 0, 12);
        this.loadCursor('no_pan_right', 30, 12);
        this.loadCursor('no_pan_top', 15, 0);
        this.loadCursor('no_pan_top_left', 0, 0);
        this.loadCursor('no_pan_top_right', 30, 0);

        this.loadCursor('no_repair', 15, 0);
        this.loadCursor('no_sell', 15, 12);

        this.loadCursor('pan_bottom', 15, 24);
        this.loadCursor('pan_bottom_left', 0, 24);
        this.loadCursor('pan_bottom_right', 30, 24);
        this.loadCursor('pan_left', 0, 12);
        this.loadCursor('pan_right', 30, 12);
        this.loadCursor('pan_top', 15, 0);
        this.loadCursor('pan_top_left', 0, 0);
        this.loadCursor('pan_top_right', 30, 0);
        this.loadCursor('repair', 15, 0, 24);
        this.loadCursor('select', 15, 12, 6, 2);
        this.loadCursor('sell', 15, 12, 24);
    }
} 

export = Mouse;