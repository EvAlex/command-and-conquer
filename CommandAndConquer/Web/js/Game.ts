
import GameScreen = require('./GameScreen');
import Sidebar = require('./Sidebar');
import Fog = require('./Fog');
import Mouse = require('./Mouse');
import Levels = require('./Levels');
import Buildings = require('./Buildings');
import Turrets = require('./Turrets');
import Infantry = require('./Infantry');
import Vehicles = require('./Vehicles');
import Sounds = require('./Sounds');
import Overlay = require('./Overlay');
import Player = require('./Player');

class Game {

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.screen = new GameScreen(canvas.width, canvas.height);
        this.screen.viewport.top = 35;
        this.gridSize = 24;
        this.animationTimeout = 50;
        this.debugMode = false;
        this.speedAdjustmentFactor = 0.2;

        this.sidebar = new Sidebar();
        this.fog = new Fog();
        this.mouse = new Mouse();
        this.levels = new Levels();
        this.buildingsFactory = new Buildings;
        this.infantry = new Infantry();
        this.vehicles = new Vehicles();
        this.sounds = new Sounds();
        this.overlayFactory = new Overlay();
    }

    private sidebar: Sidebar;
    private fog: Fog;
    private mouse: Mouse;
    private levels: Levels;
    private buildingsFactory: Buildings;
    private turretsFactory: Turrets;
    private infantry: Infantry;
    private vehicles: Vehicles;
    private sounds: Sounds;
    private overlayFactory: Overlay;

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private currentPlayer: Player;
    private enemyPlayer: Player;

    private screen: GameScreen;
    //  Below is moved to GameScreen
    //screenWidth: number;
    //screenHeight: number;
    //viewportTop: number;
    //viewportLeft: number = 0;
    //viewportHeight: number = 0;
    //viewportWidth: number = 0;
    //viewportX: number = 0;
    //viewportY: number = 0;
    //viewportDeltaX: number = 0;
    //viewportDeltaY: number = 0;
    //viewportAdjustX: number = 0;
    //viewportAdjustY: number = 0;

    currentLevel: IGameLevel;
    gridSize: number;
    obstructionGrid: number[][] = [];
    buildingObstructionGrid: number[][] = [];
    heroObstructionGrid: number[][] = [];
    private animationLoop: NodeJS.Timer = null;
    private tiberiumLoop: NodeJS.Timer = null;
    private statusLoop: NodeJS.Timer = null;
    animationTimeout: number;
    debugMode: boolean;
    speedAdjustmentFactor: number;

    setViewport() {
        this.context.beginPath();
        this.screen.viewport.width = (this.sidebar.visible) ? (this.screen.width - this.sidebar.width) : this.screen.width;
        this.screen.viewport.height = 480;
        this.context.rect(this.screen.viewport.left, this.screen.viewport.top, this.screen.viewport.width - this.screen.viewport.left, this.screen.viewport.height);
        this.context.clip();
    }

    drawMap() {
        //context.drawImage(this.currentLevel.mapImage,0,0);
        this.mouse.handlePanning(this.screen, this.currentLevel.mapImage, this.sidebar);
        this.context.drawImage(this.currentLevel.mapImage,
            this.screen.viewportOffset.x, this.screen.viewportOffset.y, this.screen.viewport.width, this.screen.viewport.height,
            this.screen.viewport.left, this.screen.viewport.top, this.screen.viewport.width, this.screen.viewport.height);
    	    
    	    
        // Create an obstruction grid from the level 
        this.obstructionGrid = []; // normal obstructions
        this.heroObstructionGrid = []; // Cannot see in fog, so pretend
        this.buildingObstructionGrid = [];  // Cannot build on fog; Cannot build on bib
    	    
        for (var y = 0; y < this.currentLevel.obstructionGrid.length; y++) {
            this.obstructionGrid[y] = [];
            this.heroObstructionGrid[y] = [];
            this.buildingObstructionGrid[y] = [];
            for (var x = 0; x < this.currentLevel.obstructionGrid[y].length; x++) {
                this.obstructionGrid[y][x] = this.currentLevel.obstructionGrid[y][x];
                this.heroObstructionGrid[y][x] = this.currentLevel.obstructionGrid[y][x];
                this.buildingObstructionGrid[y][x] = this.currentLevel.obstructionGrid[y][x];
            }
        }

        for (var i = this.buildings.length - 1; i >= 0; i--) {
            var bldng = this.buildings[i];
            for (var y = 0; y < bldng.gridShape.length; y++) {
                for (var x = 0; x < bldng.gridShape[y].length; x++) {
                    if (bldng.gridShape[y][x] == 1) {
                        this.obstructionGrid[y + bldng.y][x + bldng.x] = 1;
                        this.heroObstructionGrid[y + bldng.y][x + bldng.x] = 1;
                        this.buildingObstructionGrid[y + bldng.y][x + bldng.x] = 1;

                        //include an extra row for bib as a no building zone
                        if (y == bldng.gridShape.length - 1) {
                            this.buildingObstructionGrid[y + 1 + bldng.y][x + bldng.x] = 1;
                        }
                    }
                }
            }

        };
        for (var i = this.turrets.length - 1; i >= 0; i--) {
            this.obstructionGrid[this.turrets[i].y][this.turrets[i].x] = 1;
            this.heroObstructionGrid[y + bldng.y][x + bldng.x] = 1;
            this.buildingObstructionGrid[y + bldng.y][x + bldng.x] = 1;
        };


        for (var i = this.units.length - 1; i >= 0; i--) {
            var unit = this.units[i];

            var x: number = unit.x;
            var y: number = unit.y;
            //var collisionRadius = unit.collisionRadius/this.gridSize;
            this.buildingObstructionGrid[Math.floor(y)][Math.floor(x)] = 1;
            //this.obstructionGrid[Math.floor(y-collisionRadius)][Math.floor(x-collisionRadius)] = 1;
            //this.obstructionGrid[Math.floor(y-collisionRadius)][Math.floor(x+collisionRadius)] = 1;
            //this.obstructionGrid[Math.floor(y+collisionRadius)][Math.floor(x-collisionRadius)] = 1;
            //this.obstructionGrid[Math.floor(y+collisionRadius)][Math.floor(x+collisionRadius)] = 1;
    	        
        };

        for (var i = this.overlay.length - 1; i >= 0; i--) {
            var over = this.overlay[i];
            if (over.name == 'tree') {
                this.obstructionGrid[over.y][over.x] = 1;
                this.heroObstructionGrid[over.y][over.x] = 1;
                this.buildingObstructionGrid[over.y][over.x] = 1;
            } else if (over.name == 'trees') {
                this.obstructionGrid[over.y][over.x] = 1;
                this.obstructionGrid[over.y][over.x + 1] = 1;
                this.heroObstructionGrid[over.y][over.x] = 1;
                this.heroObstructionGrid[over.y][over.x + 1] = 1;
                this.buildingObstructionGrid[over.y][over.x] = 1;
                this.buildingObstructionGrid[over.y][over.x + 1] = 1;
            } else if (over.name == 'tiberium') {
                this.buildingObstructionGrid[over.y][over.x] = 1;
            }
        };
    	    
    	    
        // If hero cannot see under fog, he assumes he can travel there... 
        // when he sees the building, he goes oops!!! and then starts avoiding it....
    	    
        // Buildings can't be built on fog either
        for (var y = 0; y < this.heroObstructionGrid.length; y++) {
            for (var x = 0; x < this.heroObstructionGrid[y].length; x++) {
                if (this.fog.isOver((x + 0.5) * this.gridSize, (y + 0.5) * this.gridSize, this.currentLevel.mapImage)) {
                    //this.heroObstructionGrid[y][x] = 0;
                    this.buildingObstructionGrid[y][x] = 1;
                }
            }
        }

    }

    controlGroups = [];

    keyPressed(ev) {
        var keyCode = ev.which;
        var ctrlPressed = ev.ctrlKey;
        //keys from 0 to 9 pressed
        if (keyCode >= 48 && keyCode <= 57) {
            var keyNumber = (keyCode - 48)
            if (ctrlPressed) {
                if (this.selectedItems.length > 0) {
                    this.controlGroups[keyNumber] = $.extend([], this.selectedItems);
                    //console.log(keyNumber + ' now has ' +this.controlGroups[keyNumber].length +' items');
                }
                //console.log ("Pressed Ctrl"+ (keyNumber-48));   
            } else {
                if (this.controlGroups[keyNumber]) {
                    this.clearSelection();
                    //console.log ("Pressed"+ (keyNumber));
                    //console.log(this.controlGroups[keyNumber].length)
                    for (var i = this.controlGroups[keyNumber].length - 1; i >= 0; i--) {
                        if (this.controlGroups[keyNumber][i].status == 'destroy') {
                            this.controlGroups[keyNumber].splice(i, 1);
                        } else {
                            this.selectItem(this.controlGroups[keyNumber][i]);
                        }
    	                    
                        //console.log ('selecting '+this.controlGroups[keyNumber][i].name)
                    };
                }

            }

        }
    }

    highlightGrid(i: number, j: number, width: number, height: number, optionalImage?: string | HTMLImageElement): void {
        //alert('('+i+','+j+')');
        var gridSize = this.gridSize;

        if (optionalImage && $(optionalImage).is('img')) {
            this.context.drawImage(<HTMLImageElement>optionalImage, i * gridSize + this.screen.viewportAdjust.x, j * gridSize + this.screen.viewportAdjust.y, width * gridSize, height * gridSize);
        } else {
            if (optionalImage) {
                this.context.fillStyle = optionalImage;
            } else {
                this.context.fillStyle = 'rgba(225,225,225,0.5)';
            }
            this.context.fillRect(i * gridSize + this.screen.viewportAdjust.x, j * gridSize + this.screen.viewportAdjust.y, width * gridSize, height * gridSize);
        }
    }

    drawGrid() {
        var gridSize = this.gridSize;
        var mapWidth = this.currentLevel.mapImage.width;
        var mapHeight = this.currentLevel.mapImage.height;
        var viewportX = this.screen.viewportOffset.x;
        var viewportY = this.screen.viewportOffset.y;

        var gridWidth = mapWidth / gridSize;
        var gridHeight = mapHeight / gridSize;
        this.context.beginPath();
        this.context.strokeStyle = 'rgba(30,0,0,.6)';
        for (var i = 0; i < gridWidth; i++) {
            this.context.moveTo(i * gridSize - viewportX + this.screen.viewport.left, 0 - viewportY + this.screen.viewport.top);
            this.context.lineTo(i * gridSize - viewportX + this.screen.viewport.left, mapHeight - viewportY + this.screen.viewport.top);
        }
        for (var i = 0; i < gridHeight; i++) {
            this.context.moveTo(0 - viewportX + this.screen.viewport.left, i * gridSize - viewportY + this.screen.viewport.top);
            this.context.lineTo(mapWidth - viewportX + this.screen.viewport.left, i * gridSize - viewportY + this.screen.viewport.top);
        }
        this.context.stroke();



        for (var i = this.obstructionGrid.length - 1; i >= 0; i--) {
            for (var j = this.obstructionGrid[i].length - 1; j >= 0; j--) {
                if (this.heroObstructionGrid[i][j] == 1) {
                    this.highlightGrid(j, i, 1, 1, 'rgba(100,0,0,0.5)');
                }
            };
        };

    }

    units = [];
    buildings: IBuilding[] = [];
    turrets: ITurret[] = [];
    overlay: IOverlay[] = [];
    bullets = [];

    fireBullet(bullet) {
        bullet.x = bullet.x - 0.5 * Math.sin(bullet.angle);
        bullet.y = bullet.y - 0.5 * Math.cos(bullet.angle);
        bullet.range = bullet.range - 0.5;
        //alert(bullet.x +' '+bullet.y)
        this.bullets.push(bullet);
        setTimeout(function () { bullet.source.bulletFiring = false; }, bullet.source.reloadTime);
    }

    drawBullets() {

        for (var j = this.bullets.length - 1; j >= 0; j--) {
            var bullet = this.bullets[j];

            bullet.speed = 5;
            bullet.range = bullet.range - 0.1 * bullet.speed;
            bullet.x = bullet.x - 0.1 * bullet.speed * Math.sin(bullet.angle);
            bullet.y = bullet.y - 0.1 * bullet.speed * Math.cos(bullet.angle);


            var x = (bullet.x * this.gridSize);
            var y = (bullet.y * this.gridSize);
            //alert(x + ' ' + y)
                
            if (!bullet.dead) {
                var overObject;
                for (var i = this.units.length - 1; i >= 0; i--) {
                    if (this.units[i].underPoint && this.units[i].underPoint(x, y) && this.units[i].team != bullet.source.team) {
                        overObject = this.units[i];
                        break;
                    }
                };
                for (var i = this.buildings.length - 1; i >= 0; i--) {
                    if (this.buildings[i].underPoint(x, y, this.gridSize)) {
                        overObject = this.buildings[i];
                        break;
                    }
                };

                for (var i = this.turrets.length - 1; i >= 0; i--) {
                    if (this.turrets[i].underPoint(x, y, this.gridSize)) {
                        overObject = this.turrets[i];
                        break;
                    }
                };

                if (overObject) {
                    bullet.dead = true;
                    //alert(overObject.health);
                    overObject.health = overObject.health - Math.floor((bullet.damage ? bullet.damage : 10) + 10 * Math.random());
                    if (overObject.health <= 0) {
                        overObject.status = 'destroy';
                    }
                }

                this.context.fillStyle = 'red';
                this.context.fillRect(x + this.screen.viewportAdjust.x, y + this.screen.viewportAdjust.y, 2, 2);
            }
    	        
            //alert(x +' '+y)
            if (bullet.range <= 0) {
                //bullet.source.bulletFiring = false;
                this.bullets.splice(j, 1);
            }

        };
    }

    drawObjects() {
        var objects = [];
        for (var i = this.buildings.length - 1; i >= 0; i--) {
            if (this.buildings[i].status == 'destroy') {
                this.buildings.splice(i, 1);
            }
        };

        for (var i = this.units.length - 1; i >= 0; i--) {
            if (this.units[i].status == 'destroy') {
                this.units.splice(i, 1);
            }
        };

        for (var i = this.turrets.length - 1; i >= 0; i--) {
            if (this.turrets[i].status == 'destroy') {
                this.turrets.splice(i, 1);
            }
        };

        for (var i = this.selectedItems.length - 1; i >= 0; i--) {
            if (this.selectedItems[i].status == 'destroy') {
                this.selectedItems.splice(i, 1);
            }
        };

        for (var i = this.selectedAttackers.length - 1; i >= 0; i--) {
            if (this.selectedAttackers[i].status == 'destroy') {
                this.selectedAttackers.splice(i, 1);
            }
        };

        for (var i = this.selectedUnits.length - 1; i >= 0; i--) {
            if (this.selectedUnits[i].status == 'destroy') {
                this.selectedUnits.splice(i, 1);
            }
        };

        $.merge(objects, this.units);
        $.merge(objects, this.buildings);
        $.merge(objects, this.overlay);
        $.merge(objects, this.turrets);

        var cgY = function (obj) {
            if (obj.type == "building") {
                return obj.y + obj.gridShape.length / 2;
            }
            return obj.y
        }
        objects.sort(function (a, b) {
            return cgY(b) - cgY(a);
            //return b.y - a.y;
        });

        for (var i = this.overlay.length - 1; i >= 0; i--) {
            var overlay = this.overlay[i];
            if (overlay.name == 'tiberium') {
                overlay.draw();
            }
        };

        for (var i = objects.length - 1; i >= 0; i--) {
            if (objects[i].name != 'tiberium') {
                objects[i].draw();
            }

        };
    	    
    	    
        /*for (var i = this.units.length - 1; i >= 0; i--){
           this.units[i].draw();
        };
        
        for (var i = this.buildings.length - 1; i >= 0; i--){
           this.buildings[i].draw();
        };*/
    }

    moveObjects() {
        for (var i = this.units.length - 1; i >= 0; i--) {
            if (this.units[i].processOrders) {
                this.units[i].processOrders();
            }
            this.units[i].move();
        };
        for (var i = this.turrets.length - 1; i >= 0; i--) {
            if (this.turrets[i].processOrders) {
                this.turrets[i].processOrders();
            }
            this.turrets[i].move();
        };
    }

    showDebugger() {
        var getKeys = function (item) {
            var html = '<ul>';
            for (var key in item) {
                if (item.hasOwnProperty(key)) {
                    var o = item[key];
                    if (typeof o != "function" || o === null) {

                        if (typeof o == "object") {
                            html += "<li>" + key + " : ";
                            if (o instanceof HTMLImageElement) {
                                html += (o.src).replace(/^.+images\//, '');
                            } else if (o instanceof Array) {
                                html += 'Array[' + o.length + ']';
                            } else {
                                html += 'Object';//getKeys(o);
                            }
                        } else {
                            html += "<li>" + key + " : " + o + "</li>";
                        }

                    }

                }
            }
            html += "</ul>";
            return html;
        };
        var html = "";

        html += "Level";
        html += getKeys(this.levels);
        html += "Mouse";
        html += getKeys(this.mouse);
        if (this.selectedItems.length == 1) {
            html += "Selected Item";
            html += getKeys(this.selectedItems[0]);
        }
        html += "Game";
        html += getKeys(this);
        html += "Sidebar";
        html += getKeys(this.sidebar);
        html += "Vehicles";
        html += getKeys(this.vehicles);
        html += "Buildings";
        html += getKeys(this.buildings);

        html += "Infantry";
        html += getKeys(this.infantry);

        $('#debugger').html(html);
    }

    animate() {
        // main animation loop once game has started
        if (this.debugMode) {
            this.showDebugger();
        }

        if (!this.levels.loaded || !this.sidebar.loaded
            || !this.vehicles.loaded || !this.infantry.loaded || !this.buildingsFactory.loaded) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;

        }

        this.context.save();
        // Draw the top panels
        // Draw sidebar if appropriate
        // set viewport

        this.sidebar.draw(this.context);
        this.setViewport();

        this.drawMap();
        if (this.debugMode) {
            this.drawGrid();

        }
    	    
        // Draw the map
        //////////////
        // Test scripted events and handle
        // Draw the overlay
        // Draw the buildings
        // Any animation if necessary
        this.moveObjects();
        // Draw the units
        this.drawObjects();
    	    
        //
    	    
        this.drawBullets();
        if (!this.debugMode) {
            this.fog.draw(this.context, this.currentLevel.mapImage, this.units, this.gridSize, this.currentPlayer.team, this.buildings, this.turrets, this.screen);
        }

        this.context.restore();


        this.drawMessage();
        // show appropriate mouse cursor
        this.mouse.draw(
            this.context,
            this.screen,
            this.currentLevel,
            this.overlay,
            this.sidebar,
            this.buildingsFactory,
            this.buildings,
            this.turretsFactory,
            this.turrets,
            this.vehicles,
            this.infantry,
            this.units,
            this.selectedUnits,
            this.selectedAttackers,
            this.buildingObstructionGrid,
            this.obstructionGrid,
            (i, j, w, h, img) => this.highlightGrid(i, j, w, h, img));
    	    
        ///this.missionStatus();
        //
    	    
    }

    messageVisible: boolean = true;
    messageHeadingVisible: boolean = true;
    messageText: string = '\nCreate a base by deploying your MCV. Build a power plant and weapons factory.\n\nUse your tanks to get rid of all enemy presence in the area.';

    drawMessage() {
        if (!this.messageVisible) {
            return;
        }
        this.context.drawImage(this.sidebar.messageBox, this.screen.viewport.left + 22, this.screen.viewport.top + 150);
        if (!this.messageHeadingVisible) {
            this.context.fillStyle = 'black';
            this.context.fillRect(265, 198, 120, 20)
        }


        this.context.fillStyle = 'green';
        this.context.font = '16px "Command and Conquer"';
        var msgs = this.messageText.split('\n');
        for (var i = 0; i < msgs.length; i++) {
            this.context.fillText(msgs[i], this.screen.viewport.left + 80, this.screen.viewport.top + 200 + i * 18)
        };

    }

    displayMessage(text, displayHeader?: boolean) {
        this.messageText = text;
        this.messageVisible = true;
        this.messageHeadingVisible = !!displayHeader;
    }

    missionStatus() {
        var item,
            heroUnits = [], heroBuildings = [], heroTurrets = [], villainBuildings = [], villainUnits = [], villainTurrets = [];
        for (var i = this.units.length - 1; i >= 0; i--) {
            item = this.units[i];
            if (item.team == this.currentLevel.team) {
                heroUnits.push(item);
            } else {
                villainUnits.push(item);
            }
        };
        for (var i = this.buildings.length - 1; i >= 0; i--) {
            item = this.buildings[i];
            if (item.team == this.currentLevel.team) {
                heroBuildings.push(item);
            } else {
                villainBuildings.push(item);
            }
        };
        for (var i = this.turrets.length - 1; i >= 0; i--) {
            item = this.turrets[i];
            if (item.team == this.currentLevel.team) {
                heroTurrets.push(item);
            } else {
                villainTurrets.push(item);
            }
        };
    	    
        //alert(heroBuildings.length)
        if (heroUnits.length == 0 && heroBuildings.length == 0) {
            //mission failed;
            this.sounds.play('mission_failure');
            this.end();
            //alert('Game over \n If you liked this, please share with your friends using the Like button and leave me a comment');
        }
        if (villainTurrets.length == 0 && villainBuildings.length == 0 && villainUnits.length == 0) {
            //mission accomplished
            this.sounds.play('mission_accomplished');
            this.end();
            //alert('Game over \n If you liked this, please share with your friends using the Like button and leave me a comment');
        }
    }

    selectedItems: IUnit[] = [];
    selectedAttackers: IUnit[] = [];
    selectedUnits: IUnit[] = [];

    clearSelection() {
        for (var i = this.selectedItems.length - 1; i >= 0; i--) {
            this.selectedItems[i].selected = false;
            this.selectedItems.splice(i, 1);
        };
        this.selectedAttackers = [];
        this.selectedUnits = []
    }

    selectItem(item, shiftPressed?: boolean) {
        if (shiftPressed && item.selected) {
            // deselect item
            item.selected = false;
            var i = this.selectedItems.indexOf(item);
            if (i >= 0)
                this.selectedItems.splice(i, 1);
            else if ((i = this.selectedUnits.indexOf(item)) >= 0)
                this.selectedUnits.splice(i, 1);
            else if ((i = this.selectedAttackers.indexOf(item)) >= 0)
                this.selectedAttackers.splice(i, 1);
            return;
        }

        item.selected = true;
        this.selectedItems.push(item);
        //alert(1)
        if (item.type != 'building' && item.team == this.currentLevel.team) {
            this.selectedUnits.push(item);
            this.sounds.play(item.type + '_select');
            if (item.primaryWeapon) {
                this.selectedAttackers.push(item);
            }
        }
    }

    click(ev, rightClick) {

        if (this.messageVisible) {
            if (this.mouse.x >= 290 && this.mouse.x <= 350 && this.mouse.y >= 310 && this.mouse.y <= 325) {
                this.messageVisible = false;
                return;
            }
        }
        var selectedObject = this.mouse.checkOverObject(this.overlay, this.buildings, this.turrets, this.units);
        if (rightClick) {
            this.clearSelection();
            this.sidebar.repairMode = false;
            this.sidebar.deployMode = false;
            this.sidebar.sellMode = false;
            return;
        }
        if (this.sidebar.repairMode) {
            if (selectedObject && selectedObject.team == this.currentLevel.team
                && (selectedObject.type == 'building' || selectedObject.type == 'turret') && (selectedObject.health < selectedObject.hitPoints)) {
                // do repair
                //alert('repairing')
                selectedObject.repairing = true;
            }
        } else if (this.sidebar.deployMode) {
            //if (buildings.canConstruct(sidebar.deployBuilding,mouse.gridX,mouse.gridY)){
            var buildingType = this.buildingsFactory.types[this.sidebar.deployBuilding] || this.turretsFactory.types[this.sidebar.deployBuilding];
            var grid = $.extend([], buildingType.gridShape);
            grid.push(grid[grid.length - 1]);
            //grid.push(grid[1]);
            for (var y = 0; y < grid.length; y++) {
                for (var x = 0; x < grid[y].length; x++) {

                    if (grid[y][x] == 1) {
                        //console.log("mouse.gridX+x"+(mouse.gridX+x)+"mouse.gridY+y:"+(mouse.gridY+y))
                        if (this.mouse.gridY + y < 0 || this.mouse.gridY + y >= this.buildingObstructionGrid.length || this.mouse.gridX + x < 0 || this.mouse.gridX + x >= this.buildingObstructionGrid[this.mouse.gridY + y].length || this.buildingObstructionGrid[this.mouse.gridY + y][this.mouse.gridX + x] == 1) {
                            this.sounds.play('cannot_deploy_here');
                            return;
                        }
                    }
                }
            }
            this.sidebar.finishDeployingBuilding();                        
            //} else {
            //    sounds.play('cannot_deploy_here');
            //}
        } else if (this.sidebar.sellMode) {
            if (selectedObject && selectedObject.team == this.currentLevel.team
                && (selectedObject.type == 'building' || selectedObject.type == 'turret')) {
                if (selectedObject.name == 'refinery' && selectedObject.status == 'unload') {
                    this.units.push(this.vehicles.add({
                        name: 'harvester', team: selectedObject.team, x: selectedObject.x + 0.5,
                        y: selectedObject.y + 2, health: selectedObject.harvester.health, moveDirection: 14, orders: { type: 'guard' }
                    }));
                    selectedObject.harvester = null;
                }
                selectedObject.status = 'sell';
                this.sounds.play('sell');
                this.sidebar.cash += selectedObject.cost / 2;
            }
        } else if (!rightClick && !this.mouse.dragSelect) {
            if (selectedObject) {
                if (this.selectedUnits.length == 1 && selectedObject.selected && selectedObject.team == this.currentLevel.team) {
                    if (selectedObject.name == 'mcv') {
                        // check building deployment
                        this.clearSelection();
                        selectedObject.orders = { type: 'build' };
                        //alert('put a building here')
                    }
                } else if (this.selectedUnits.length == 1 && this.selectedUnits[0].name == 'harvester'
                    && this.selectedUnits[0].team == this.currentLevel.team
                    && (selectedObject.name == 'tiberium' || selectedObject.name == 'refinery') && !this.mouse.isOverFog) {
                    //My team's harvester is selected alone
                    if (selectedObject.name == 'tiberium') {
                        this.selectedUnits[0].orders = { type: 'harvest', to: { x: selectedObject.x, y: selectedObject.y } };
                        this.sounds.play('vehicle_move');
                    }
                    if (selectedObject.name == 'refinery' && selectedObject.team == this.currentLevel.team) {
                        this.selectedUnits[0].orders = { type: 'harvest-return', to: selectedObject };
                        this.sounds.play('vehicle_move');
                    }
                } else if (selectedObject.team == this.currentLevel.team) {
                    if (!ev.shiftKey) {
                        this.clearSelection();
                    }
                    this.selectItem(selectedObject, ev.shiftKey);
                } else if (this.selectedAttackers.length > 0 && selectedObject.name != 'tiberium' && !this.mouse.isOverFog) {
                    for (var i = this.selectedAttackers.length - 1; i >= 0; i--) {
                        if (this.selectedAttackers[i].primaryWeapon) {
                            this.selectedAttackers[i].orders = { type: 'attack', target: selectedObject };
                            this.sounds.play(this.selectedAttackers[i].type + '_move');
                        }

                    };
                } else if (selectedObject.name == 'tiberium') {
                    if (this.selectedUnits.length > 0) {
                        if (this.obstructionGrid[this.mouse.gridY] && this.obstructionGrid[this.mouse.gridY][this.mouse.gridX] == 1 && !this.mouse.isOverFog) {
                            // Don't do anything
                        } else {
                            for (var i = this.selectedUnits.length - 1; i >= 0; i--) {
                                this.selectedUnits[i].orders = { type: 'move', to: { x: this.mouse.gridX, y: this.mouse.gridY } };
                                this.sounds.play(this.selectedUnits[i].type + '_move');
                            };
                        }
                    }
                } else {
                    if (!ev.shiftKey) {
                        this.clearSelection();
                    }
                    this.selectItem(selectedObject, ev.shiftKey);
                }
            } else { // no object under mouse
                if (this.selectedUnits.length > 0) {
                    if (this.obstructionGrid[this.mouse.gridY] && this.obstructionGrid[this.mouse.gridY][this.mouse.gridX] == 1 && !this.mouse.isOverFog) {
                        // Don't do anything
                    } else {
                        for (var i = this.selectedUnits.length - 1; i >= 0; i--) {
                            this.selectedUnits[i].orders = { type: 'move', to: { x: this.mouse.gridX, y: this.mouse.gridY } };
                            this.sounds.play(this.selectedUnits[i].type + '_move');
                        };
                    }
                }
            }
        }
    }

    start() {
        // Show main menu screen
        // Wait for level click
        //$(canvas).css("cursor", "cursor:url(cursors/blank.png),none !important;");
        // load all sounds
        // load level
        this.mouse.loadAllCursors();
        this.sounds.loadAll();
        this.overlayFactory.loadAll();

        this.currentLevel = this.levels.load('gdi1', this.buildingsFactory, this.turretsFactory, this.vehicles, this.infantry, this.overlayFactory);
        this.currentPlayer = new Player(this.currentLevel.team, this.currentLevel.startingCash);
        this.enemyPlayer = new Player(this.currentLevel.enemyTeam, this.currentLevel.startingEnemyCash);
        this.overlay = this.currentLevel.overlay;
        //this.team = this.currentLevel.team;
        this.sidebar.load(this.currentPlayer.cash);

        this.listenEvents();
        this.fog.init();

        this.screen.viewportOffset.x = 96;
        this.screen.viewportOffset.y = 264;
        this.sidebar.visible = false;
        // Enemy Stuff
        this.turrets.push(this.turretsFactory.add({ name: 'gun-turret', x: 8, y: 6, turretDirection: 16, team: 'nod' }));
        this.turrets.push(this.turretsFactory.add({ name: 'gun-turret', x: 9, y: 3, turretDirection: 16, team: 'nod' }));
        this.turrets.push(this.turretsFactory.add({ name: 'gun-turret', x: 7, y: 5, turretDirection: 16, team: 'nod' }));
        this.turrets.push(this.turretsFactory.add({ name: 'gun-turret', x: 8, y: 2, turretDirection: 16, team: 'nod' }));

        this.turrets.push(this.turretsFactory.add({ name: 'gun-turret', x: 16, y: 25, turretDirection: 24, team: 'nod' }));
        this.turrets.push(this.turretsFactory.add({ name: 'gun-turret', x: 13, y: 26, turretDirection: 24, team: 'nod' }));

        this.turrets.push(this.turretsFactory.add({ name: 'gun-turret', x: 11, y: 23, turretDirection: 18, team: 'nod' }));
        this.turrets.push(this.turretsFactory.add({ name: 'gun-turret', x: 10, y: 24, turretDirection: 20, team: 'nod' }));
        this.turrets.push(this.turretsFactory.add({ name: 'gun-turret', x: 9, y: 25, turretDirection: 24, team: 'nod' }));
        //this.turrets.push(this.turretsFactory.add({name:'gun-turret',x:9,y:26,turretDirection:26,team:'nod'}));

        this.buildings.push(this.buildingsFactory.add({ name: 'refinery', team: 'nod', x: 26, y: 8, status: 'build', health: 200 }));
        //this.units.push(this.vehicles.add({name:'harvester',team:'nod',x:24,y:18,moveDirection:0}));
            
            
        //this.units.push(this.vehicles.add({name:'harvester',x:25,y:18,moveDirection:0}));
            
        this.buildings.push(this.buildingsFactory.add({ name: 'construction-yard', x: 1, y: 14, team: 'nod' }));
        this.buildings.push(this.buildingsFactory.add({ name: 'power-plant', x: 5, y: 14, team: 'nod' }));

        this.buildings.push(this.buildingsFactory.add({ name: 'hand-of-nod', x: 5, y: 19, team: 'nod' }));
            
        //this.buildings.push(this.buildingsFactory.add({name:'barracks',x:4,y:14,team:'nod'}));             
        //this.buildings.push(this.buildingsFactory.add({name:'power-plant',x:18,y:10,health:200,team:'nod'})); 
        this.units.push(this.vehicles.add({ name: 'light-tank', x: 7, y: 6, team: 'nod', orders: { type: 'patrol', from: { x: 9, y: 24 }, to: { x: 12, y: 8 } } }));
        this.units.push(this.vehicles.add({ name: 'light-tank', x: 2, y: 20, team: 'nod', orders: { type: 'patrol', from: { x: 2, y: 5 }, to: { x: 6, y: 20 } } }));
        this.units.push(this.vehicles.add({ name: 'light-tank', x: 5, y: 10, team: 'nod', orders: { type: 'patrol', from: { x: 17, y: 12 }, to: { x: 22, y: 2 } } }));
    	    
        //this.units.push(this.vehicles.add({name:'light-tank',x:2,y:2,team:'nod',orders:{type:'patrol',from:{x:25,y:5},to:{x:17,y:25}}}));
        this.units.push(this.vehicles.add({ name: 'light-tank', x: 4, y: 23, team: 'nod', orders: { type: 'patrol', from: { x: 4, y: 23 }, to: { x: 22, y: 25 } } }));
        this.units.push(this.vehicles.add({ name: 'light-tank', x: 2, y: 10, team: 'nod', orders: { type: 'protect', target: this.units[0] } }));

        this.units.push(this.vehicles.add({ name: 'mcv', x: 23.5, y: 23.5, moveDirection: 0, orders: { type: 'move', to: { x: 23, y: 21 } } }));
        this.units.push(this.vehicles.add({ name: 'light-tank', x: 23, y: 27, moveDirection: 0, orders: { type: 'move', to: { x: 22, y: 23 } } }));
        this.units.push(this.vehicles.add({ name: 'light-tank', x: 24, y: 27, moveDirection: 0, orders: { type: 'move', to: { x: 24, y: 23 } } }));
    	    
    	    
        //this.buildings.push(this.buildingsFactory.add({name:'weapons-factory',x:18,y:6}));
    	    
    	    
        //this.buildings.push(this.buildingsFactory.add({name:'weapons-factory',x:24,y:18}));

    	    
        //this.units.push(this.vehicles.add({name:'mcv',x:7,y:4,moveDirection:8}));
        //this.units.push(this.infantry.add({name:'minigunner',x:27,y:12,team:'nod'}));
        //this.units.push(this.infantry.add({name:'minigunner',x:6,y:22,team:'nod'}));
        //this.units.push(this.infantry.add({name:'minigunner',x:5,y:22,team:'nod'}));
        //this.units.push(this.infantry.add({name:'minigunner',x:28,y:12,team:'nod'}));
    	    
    	    
    	    
        //this.units.push(this.vehicles.add({name:'light-tank',x:23,y:25,moveDirection:0}));
    	    
        //sounds.play('reinforcements_have_arrived');
        //this.units.push(this.infantry.add({name:'minigunner',x:8,y:13}));
        //this.units.push(this.vehicles.add({name:'light-tank',x:5,y:13,orders:{type:'patrol',from:{x:5,y:13},to:{x:4,y:4}},team:'nod'})); 
        //this.units.push(this.vehicles.add({name:'light-tank',x:16,y:8,orders:{type:'protect',target:this.units[3]}}));
    	    
        /*
        this.units.push(this.infantry.add({name:'minigunner',x:7,y:13,team:'nod'}));
        this.units.push(this.vehicles.add({name:'light-tank',x:5,y:13,orders:{type:'patrol',from:{x:5,y:13},to:{x:4,y:4}},team:'nod'})); 
        this.units.push(this.vehicles.add({name:'light-tank',x:16,y:8,orders:{type:'protect',target:this.units[3]}}));
        this.units.push(this.vehicles.add({name:'light-tank',x:10,y:10,orders:{type:'protect',target:this.units[0]},team:'nod'}));
        
        this.units.push(this.turrets.add({name:'gun-turret',x:12,y:13,moveDirection:9,team:'nod'}));
        
        */
        //this.buildings.push(this.buildingsFactory.add({name:'power-plant',x:12,y:8,health:100,primaryBuilding:true})); 
        //this.buildings.push(this.buildingsFactory.add({name:'construction-yard',x:9,y:4,primaryBuilding:true})); 
        //this.buildings.push(this.buildingsFactory.add({name:'barracks',x:12,y:4,status:'build'}));
        //this.buildings.push(this.buildingsFactory.add({name:'weapons-factory',x:15,y:12})); 
        /*this.buildings.push(this.buildingsFactory.add({name:'construction-yard',x:3,y:9,status:'build',team:'nod'}));  
        
        
        this.buildings.push(this.buildingsFactory.add({name:'barracks',x:12,y:4}));
        this.buildings.push(this.buildingsFactory.add({name:'barracks',x:14,y:4,team:'nod'})); 
        
        this.buildings.push(this.buildingsFactory.add({name:'power-plant',x:12,y:8,status:'build',health:100,primaryBuilding:true})); 
        
        this.buildings.push(this.buildingsFactory.add({name:'power-plant',x:18,y:10,status:'build',health:200,team:'nod'})); 
        
        this.buildings.push(this.buildingsFactory.add({name:'weapons-factory',x:15,y:12,status:'construct',health:200})); 
        
        
        this.buildings.push(this.buildingsFactory.add({name:'weapons-factory',x:13,y:16,status:'build',health:200,team:'nod'}));
        
        */
        this.animationLoop = setInterval(() => this.animate(), this.animationTimeout);

        this.tiberiumLoop = setInterval(function () {
            for (var i = 0; i < this.overlay.length; i++) {
                var overlay = this.overlay[i];
                if (overlay.name == 'tiberium' && overlay.stage < 11) {
                    overlay.stage++;
                }
            };


        }, this.animationTimeout * 40 * 600);

        this.statusLoop = setInterval(this.missionStatus, 3000);

    }

    end() {
        //clearInterval(this.animationLoop);
        clearInterval(this.statusLoop);
        clearInterval(this.tiberiumLoop);
        this.sidebar.visible = false;
        this.displayMessage('Thank you for trying this demo.'
            + 'This is still a work in progress. \nAny comments, feedback (including bugs), and advice is appreciated.\n\nIf you liked this demo, please share this page with all your friends. ');

    }

    private listenEvents(): void {
        this.canvas.addEventListener('mousemove', ev => {
            var offset = $(this.canvas).offset();
            this.mouse.x = ev.pageX - offset.left;
            this.mouse.y = ev.pageY - offset.top;


            this.mouse.gridX = Math.floor((this.mouse.gameX) / this.gridSize);
            this.mouse.gridY = Math.floor((this.mouse.gameY) / this.gridSize);
            this.mouse.isOverFog = this.fog.isOver(this.mouse.gameX, this.mouse.gameY, this.currentLevel.mapImage);
            //this.panDirection = this.handlePanning();
            //this.showAppropriateCursor();
            if (this.mouse.buttonPressed) {
                if (Math.abs(this.mouse.dragX - this.mouse.gameX) > 5 ||
                    Math.abs(this.mouse.dragY - this.mouse.gameY) > 5) {
                    this.mouse.dragSelect = true
                }
            } else {
                this.mouse.dragSelect = false;
            }
        });

        this.canvas.addEventListener('click', ev => {
            //Handle click hotspots
            this.mouse.click(ev, false, this.sidebar, this.screen, (e, r) => this.click(e, r));
            this.mouse.dragSelect = false;
            return false;
        });

        this.canvas.addEventListener('mousedown', ev => {
            if (ev.which == 1) {
                this.mouse.buttonPressed = true;
                this.mouse.dragX = this.mouse.gameX;
                this.mouse.dragY = this.mouse.gameY;
                ev.preventDefault();
            }
            return false;
        });

        this.canvas.addEventListener('contextmenu', ev => {
            this.mouse.click(ev, true, this.sidebar, this.screen, (e, r) => this.click(e, r));
            return false;
        });

        this.canvas.addEventListener('mouseup', ev => {
            if (ev.which == 1) {
                if (this.mouse.dragSelect) {
                    if (!ev.shiftKey) {
                        this.clearSelection();
                    }
                    var x1 = Math.min(this.mouse.gameX, this.mouse.dragX);
                    var y1 = Math.min(this.mouse.gameY, this.mouse.dragY);
                    var x2 = Math.max(this.mouse.gameX, this.mouse.dragX);
                    var y2 = Math.max(this.mouse.gameY, this.mouse.dragY);
                    for (var i = this.units.length - 1; i >= 0; i--) {
                        var unit = this.units[i];
                        if (!unit.selected && unit.team == this.currentLevel.team && x1 <= unit.x * this.gridSize && x2 >= unit.x * this.gridSize
                            && y1 <= unit.y * this.gridSize && y2 >= unit.y * this.gridSize) {
                            this.selectItem(unit, ev.shiftKey);
                        }
                    };
                    //this.dragSelect = false;
                }
                this.mouse.buttonPressed = false;
            }
            return false;
        });

        this.canvas.addEventListener('mouseleave', ev => {
            this.mouse.insideCanvas = false;
        });

        this.canvas.addEventListener('mouseenter', ev => {
            this.mouse.buttonPressed = false;
            this.mouse.insideCanvas = true;
        });


        this.canvas.addEventListener('keypress', ev => {
            this.keyPressed(ev);
        });
    }

}

export = Game;