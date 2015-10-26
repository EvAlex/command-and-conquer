
import VisualObject = require('./VisualObject');

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

    handlePanning() {
        var panDirection = "";
        if (this.insideCanvas) {
            if (this.y <= this.game.viewportTop + this.panningThreshold && this.y >= this.game.viewportTop) {
                this.game.viewportDeltaY = -this.panningVelocity;
                panDirection += "_top";
            } else if (this.y >= this.game.viewportTop + this.game.viewportHeight - this.panningThreshold && this.y <= this.game.viewportTop + this.game.viewportHeight) {
                this.game.viewportDeltaY = this.panningVelocity;
                panDirection += "_bottom";
            } else {
                this.game.viewportDeltaY = 0;
                panDirection += "";
            }

            if (this.x < this.panningThreshold && this.y >= this.game.viewportTop && this.y <= this.game.viewportTop + this.game.viewportHeight) {
                this.game.viewportDeltaX = -this.panningVelocity;
                panDirection += "_left";
            } else if (this.x > this.game.screenWidth - this.panningThreshold && this.y >= this.game.viewportTop && this.y <= this.game.viewportTop + this.game.viewportHeight) {
                this.game.viewportDeltaX = this.panningVelocity;
                panDirection += "_right";
            } else {
                this.game.viewportDeltaX = 0;
                panDirection += "";
            }
        }

        if ((this.game.viewportX + this.game.viewportDeltaX < 0)
            || (this.game.viewportX + this.game.viewportDeltaX + this.game.screenWidth + (this.sidebar.visible ? -this.sidebar.width : 0) > this.game.currentLevel.mapImage.width)) {
            this.game.viewportDeltaX = 0;
            //console.log (this.game.viewportX+this.game.viewportDeltaX +this.game.screenWidth+(this.sidebar.visible?-this.sidebar.width:0));
            //console.log (this.game.currentLevel.mapImage.width);
        }

        if (!this.sidebar.visible && (this.game.viewportX + this.game.screenWidth > this.game.currentLevel.mapImage.width)) {
            this.game.viewportX = this.game.currentLevel.mapImage.width - this.game.screenWidth;
            this.game.viewportDeltaX = 0;
        }

        if ((this.game.viewportY + this.game.viewportDeltaY < 0)
            || (this.game.viewportY + this.game.viewportDeltaY + this.game.viewportHeight > this.game.currentLevel.mapImage.height)) {
            this.game.viewportDeltaY = 0;
        }

        if (panDirection != "") {
            if (this.game.viewportDeltaX == 0 && this.game.viewportDeltaY == 0) {
                panDirection = "no_pan" + panDirection;
            } else {
                panDirection = "pan" + panDirection;
            }
        }
        this.panDirection = panDirection;
        this.game.viewportX += this.game.viewportDeltaX;
        this.game.viewportY += this.game.viewportDeltaY;
        this.gameX = this.x + this.game.viewportX - this.game.viewportLeft;
        this.gameY = this.y + this.game.viewportY - this.game.viewportTop;

        this.game.viewportAdjustX = this.game.viewportLeft - this.game.viewportX;
        this.game.viewportAdjustY = this.game.viewportTop - this.game.viewportY;

    }

    drawCursor() {
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
            context.strokeRect(x + this.game.viewportAdjustX, y + this.game.viewportAdjustY, width, height);
        }
    	    
        //var image = this.cursor.images[Math.floor(this.cursorLoop/this.cursor.cursorSpeed)];
        var imageNumber = this.cursor.spriteOffset + Math.floor(this.cursorLoop / this.cursor.cursorSpeed);
        context.drawImage(this.spriteImage, 30 * (imageNumber), 0, 30, 24, this.x - this.cursor.x, this.y - this.cursor.y, 30, 24);
    }

    checkOverObject() {
        this.overObject = null;
        for (var i = this.game.overlay.length - 1; i >= 0; i--) {
            var overlay = this.game.overlay[i];

            if (overlay.name == 'tiberium' && this.gridX == overlay.x && this.gridY == overlay.y) {
                //
                //console.log(overlay.name + ' ' +overlay.x + ' ' +overlay.y + ' '+this.gridX + ' '+this.gridY )
                this.overObject = overlay;
                //alert('overlay')
            }
        };
        for (var i = this.game.buildings.length - 1; i >= 0; i--) {
            if (this.game.buildings[i].underPoint(this.gameX, this.gameY)) {
                this.overObject = this.game.buildings[i];
                break;
            }
        };

        for (var i = this.game.turrets.length - 1; i >= 0; i--) {
            if (this.game.turrets[i].underPoint(this.gameX, this.gameY)) {
                this.overObject = this.game.turrets[i];
                break;
            }
        };

        for (var i = this.game.units.length - 1; i >= 0; i--) {
            if (this.game.units[i].underPoint && this.game.units[i].underPoint(this.gameX, this.gameY)) {
                this.overObject = this.game.units[i];
                break;
            }
        };


        return this.overObject;
    }

    draw() {
        this.cursor = this.cursors['default'];
        var selectedObject = this.checkOverObject();

        if (this.y < this.game.viewportTop || this.y > this.game.viewportTop + this.game.viewportHeight) {
            // default cursor if too much to the top
        } else if (this.sidebar.deployMode) {
            var buildingType = buildings.types[this.sidebar.deployBuilding] || turrets.types[this.sidebar.deployBuilding];
            var grid = $.extend([], buildingType.gridShape);
            grid.push(grid[grid.length - 1]);
            //grid.push(grid[1]);
            for (var y = 0; y < grid.length; y++) {
                for (var x = 0; x < grid[y].length; x++) {
                    if (grid[y][x] == 1) {
                        if (this.gridY + y < 0 || this.gridY + y >= this.game.buildingObstructionGrid.length || this.gridX + x < 0 || this.gridX + x >= this.game.buildingObstructionGrid[this.gridY + y].length || this.game.buildingObstructionGrid[this.gridY + y][this.gridX + x] == 1) {
                            //if (this.game.buildingObstructionGrid[this.gridY+y][this.gridX+x] == 1){
                            this.game.highlightGrid(this.gridX + x, this.gridY + y, 1, 1, this.sidebar.placementRedImage);
                        } else {
                            this.game.highlightGrid(this.gridX + x, this.gridY + y, 1, 1, this.sidebar.placementWhiteImage);
                        }
                    }
                }
            }
        } else if (this.sidebar.repairMode) {
            if (selectedObject && selectedObject.team == this.game.currentLevel.team
                && (selectedObject.type == 'building' || selectedObject.type == 'turret') && (selectedObject.health < selectedObject.hitPoints)) {
                this.cursor = this.cursors['repair'];
            } else {
                this.cursor = this.cursors['no_repair'];
            }
        } else if (this.sidebar.sellMode) {
            if (selectedObject && selectedObject.team == this.game.currentLevel.team
                && (selectedObject.type == 'building' || selectedObject.type == 'turret')) {
                this.cursor = this.cursors['sell'];
            } else {
                this.cursor = this.cursors['no_sell'];
            }
        } else if (this.sidebar.visible && this.x > this.sidebar.left) {
            //over a button
            var hovButton = this.sidebar.hoveredButton();
            if (hovButton) {
                var tooltipName = hovButton.type;
                switch (hovButton.type) {
                    case 'infantry': tooltipName = infantry.types[hovButton.name].label; break;
                    case 'building': tooltipName = buildings.types[hovButton.name].label; break;
                    case 'turret': tooltipName = turrets.types[hovButton.name].label; break;
                    case 'vehicle': tooltipName = vehicles.types[hovButton.name].label; break;

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
            if (selectedObject.team && selectedObject.team != this.game.currentLevel.team && this.game.selectedAttackers.length > 0) {
                this.cursor = this.cursors['attack'];
            } else if (this.game.selectedUnits.length == 1 && this.game.selectedUnits[0].name == 'harvester'
                && this.game.selectedUnits[0].team == this.game.currentLevel.team
                && (selectedObject.name == 'tiberium' || selectedObject.name == 'refinery')) {
                //My team's harvester is selected alone
                if (selectedObject.name == 'tiberium') {
                    this.cursor = this.cursors['attack']; // Harvester attacks tiberium 
                }
                if (selectedObject.name == 'refinery' && selectedObject.team == this.game.currentLevel.team) {
                    this.cursor = this.cursors['load_vehicle']; // Harvester enters my refinery
                }
            } else if (this.game.selectedUnits.length == 1 && selectedObject.selected && selectedObject.team == this.game.currentLevel.team) {
                if (selectedObject.name == 'mcv') {
                    this.cursor = this.cursors['build_command'];
                }
            } else if (!selectedObject.selected && selectedObject.name != 'tiberium') {
                this.cursor = this.cursors['select'];
            } else if (selectedObject.name == 'tiberium') {
                if (this.game.obstructionGrid[this.gridY] && this.game.obstructionGrid[this.gridY][this.gridX] == 1) {
                    this.cursor = this.cursors['no_move'];
                } else {
                    this.cursor = this.cursors['move'];
                }

            }
        } else if (this.panDirection && this.panDirection != "") {
            this.cursor = this.cursors[this.panDirection];
        }
        else if (this.game.selectedUnits.length > 0) {
            if (this.game.obstructionGrid[this.gridY] && this.game.obstructionGrid[this.gridY][this.gridX] == 1 && !this.isOverFog) {
                this.cursor = this.cursors['no_move'];
            } else {
                this.cursor = this.cursors['move'];
            }

        }



        if (this.insideCanvas) {
            this.drawCursor();
        }


    }

    click(ev, rightClick) {
        if (this.y <= this.game.viewportTop && this.y > this.game.viewportTop - 15) {
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
                this.sidebar.visible = !this.sidebar.visible;
            }
        } else if (this.y >= this.game.viewportTop && this.y <= this.game.viewportTop + this.game.viewportHeight) {
            //Game Area Clicked
            if (this.sidebar.visible && this.x > this.sidebar.left) {
                //alert ('sidebar clicked');
                this.sidebar.click(ev, rightClick);
            } else {
                this.game.click(ev, rightClick);
                //alert('game area clicked');
            }

        }
    }

    listenEvents() {
        $('#canvas').mousemove(function (ev) {
            var offset = $('#canvas').offset();
            this.x = ev.pageX - offset.left;
            this.y = ev.pageY - offset.top;


            this.gridX = Math.floor((this.gameX) / this.game.gridSize);
            this.gridY = Math.floor((this.gameY) / this.game.gridSize);
            this.isOverFog = fog.isOver(this.gameX, this.gameY);
            //this.panDirection = this.handlePanning();
            //this.showAppropriateCursor();
            if (this.buttonPressed) {
                if (Math.abs(this.dragX - this.gameX) > 5 ||
                    Math.abs(this.dragY - this.gameY) > 5) {
                    this.dragSelect = true
                }
            } else {
                this.dragSelect = false;
            }
        });

        $('#canvas').click(function (ev) {
            //Handle click hotspots
            this.click(ev, false);
            this.dragSelect = false;
            return false;
        });

        $('#canvas').mousedown(function (ev) {
            if (ev.which == 1) {
                this.buttonPressed = true;
                this.dragX = this.gameX;
                this.dragY = this.gameY;
                ev.preventDefault();
            }
            return false;
        });

        $('#canvas').bind('contextmenu', function (ev) {
            this.click(ev, true);
            return false;
        });

        $('#canvas').mouseup(function (ev) {
            if (ev.which == 1) {
                if (this.dragSelect) {
                    if (!ev.shiftKey) {
                        this.game.clearSelection();
                    }
                    var x1 = Math.min(this.gameX, this.dragX);
                    var y1 = Math.min(this.gameY, this.dragY);
                    var x2 = Math.max(this.gameX, this.dragX);
                    var y2 = Math.max(this.gameY, this.dragY);
                    for (var i = this.game.units.length - 1; i >= 0; i--) {
                        var unit = this.game.units[i];
                        if (!unit.selected && unit.team == this.game.currentLevel.team && x1 <= unit.x * this.game.gridSize && x2 >= unit.x * this.game.gridSize
                            && y1 <= unit.y * this.game.gridSize && y2 >= unit.y * this.game.gridSize) {
                            this.game.selectItem(unit, ev.shiftKey);
                        }
                    };
                    //this.dragSelect = false;
                }
                this.buttonPressed = false;
            }
            return false;
        });

        $('#canvas').mouseleave(function (ev) {
            this.insideCanvas = false;
        });

        $('#canvas').mouseenter(function (ev) {
            this.buttonPressed = false;
            this.insideCanvas = true;
        });


        $(document).keypress(function (ev) {
            this.game.keyPressed(ev);
        });

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