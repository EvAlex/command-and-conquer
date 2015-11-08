
import VisualObject = require('./VisualObject');
import Buildings = require('./Buildings');
import Turrets = require('./Turrets');
import InfantryFactory = require('./InfantryFactory');
import Vehicles = require('./Vehicles');
import Mouse = require('./Mouse');
import GameScreen = require('./GameScreen');

class Sidebar extends VisualObject implements ISidebar {
    loaded = true;
    preloadCount = 0;
    loadedCount = 0;
    repairImageBig: HTMLImageElement = null;
    repairImageSmall: HTMLImageElement;
    primaryBuildingImage: HTMLImageElement = null;
    tabsImage: HTMLImageElement = null;
    sidebarImage: HTMLImageElement;
    readyImage: HTMLImageElement;
    holdImage: HTMLImageElement;
    placementWhiteImage: HTMLImageElement;
    placementRedImage: HTMLImageElement;
    powerIndicator: HTMLImageElement;
    repairButtonPressed: HTMLImageElement;
    sellButtonPressed: HTMLImageElement;
    width: number = 160;
    left: number = 0;
    top: number = 0;
    visible: boolean = true;
    cash: number = 0;
    insufficientFunds: boolean;
    deployMode: boolean = false;
    mapMode: boolean;
    deployBuilding: string;
    repairMode: boolean = false;
    sellMode: boolean = false;
    messageBox = null;

    finishDeployingBuilding(
        buildings: IBuilding[],
        buildingsFactory: Buildings,
        turrets: ITurret[],
        turretsFactory: Turrets,
        soundsManager: ISoundsManager,
        mouse: Mouse,
        curPlayerTeam: string) {

        for (var i = 0; i < buildings.length; i++) {
            if (buildings[i].name == 'construction-yard' && buildings[i].team == curPlayerTeam) {
                buildings[i].status = 'construct';
                break;
            }
        };
        if (buildingsFactory.types[this.deployBuilding]) {
            buildings.push(buildingsFactory.add({ name: this.deployBuilding, x: mouse.gridX, y: mouse.gridY, status: 'build', team: curPlayerTeam }));
        } else {
            turrets.push(turretsFactory.add({ name: this.deployBuilding, x: mouse.gridX, y: mouse.gridY, team: curPlayerTeam, status: 'build' }));
        }

        soundsManager.play('construction')
        this.deployMode = false;
        for (var i = this.leftButtons.length - 1; i >= 0; i--) {
            this.leftButtons[i].status = '';
        }
        this.deployBuilding = null;
    }

    finishDeployingUnit(
        unitButton,
        buildings: IBuilding[],
        units: IUnit[],
        infantryFactory: InfantryFactory,
        vehiclesFactory: Vehicles,
        curPlayerTeam: string) {

        var constructedAt;
        for (var i = 0; i < buildings.length; i++) {
            if (buildings[i].name == unitButton.dependency[0]) {
                constructedAt = buildings[i];
                //game.buildings[i].status='construct';
                break;
            }
        };

        if (unitButton.type == 'infantry') {
            units.push(infantryFactory.add({
                name: unitButton.name,
                team: curPlayerTeam,
                x: constructedAt.x + constructedAt.gridWidth / 2,
                y: constructedAt.y + constructedAt.gridHeight,
                moveDirection: 4,
                instructions: [<IMoveInstruction>{ type: 'move', distance: 2 }],
            }));
        } else if (unitButton.type == 'vehicle') {
            constructedAt.status = 'construct';
            var vehicle = vehiclesFactory.add({
                name: unitButton.name,
                team: curPlayerTeam,
                x: constructedAt.x + 1,
                y: constructedAt.y + 3,
                moveDirection: 16,
                turretDirection: 16,
                orders: {
                    type: 'move', to: {
                        x: Math.floor(constructedAt.x - 1 + (Math.random() * 4)),
                        //    orders:{type:'move',to:{x:Math.floor(constructedAt.x-1),
                        y: Math.floor(constructedAt.y + 5)
                    }
                }
            });
            units.push(vehicle);   
    	                
            //alert(vehicle.orders.to.x + ' '+vehicle.orders.to.y)
    	        
    	                   
        }
        //game.buildings.push(buildings.add({name:this.deployBuilding,x:mouse.gridX,y:mouse.gridY,status:'build'}));
        //sounds.play('construction')
        //this.deployMode = false;
        for (var i = this.rightButtons.length - 1; i >= 0; i--) {
            if (this.rightButtons[i].dependency[0] == unitButton.dependency[0]) {
                this.rightButtons[i].status = '';
            }
        }
        this.deployBuilding = null;
    }

    hoveredButton(mouse: Mouse) {
        var clickY = mouse.y - this.top;
        var clickX = mouse.x;
        if (clickY >= 165 && clickY <= 455) {
            var buttonPosition = 0;
            for (var i = 0; i < 6; i++) {
                if (clickY >= 165 + i * 48 && clickY <= 165 + i * 48 + 48) {
                    buttonPosition = i;
                    break;
                }
            }
            var buttonSide, buttonPressedIndex, buttons;
            if (clickX >= 500 && clickX <= 564) {
                buttonSide = 'left';
                buttonPressedIndex = this.leftButtonOffset + buttonPosition;
                buttons = this.leftButtons;
            } else if (clickX >= 570 && clickX <= 634) {
                buttonSide = 'right';
                buttonPressedIndex = this.rightButtonOffset + buttonPosition;
                buttons = this.rightButtons;
            }
            if (buttons && buttons.length > buttonPressedIndex) {
                var buttonPressed = buttons[buttonPressedIndex];
                return buttonPressed;
            }
        }

    }

    click(ev, rightClick, mouse: Mouse, soundsManager: ISoundsManager) {
        var clickY = mouse.y - this.top;
        var clickX = mouse.x;
        //alert(2)
        // press a top button
        if (clickY >= 146 && clickY <= 160) {
            if (clickX >= 485 && clickX <= 530) {
                this.repairMode = !this.repairMode;
                this.sellMode = this.mapMode = this.deployMode = false;
                //alert('repair')
            } else if (clickX >= 538 && clickX <= 582) {
                this.sellMode = !this.sellMode;
                this.repairMode = this.mapMode = this.deployMode = false;
                //alert('map')
            } else if (clickX >= 590 && clickX <= 635) {
                this.mapMode = !this.mapMode;
                this.repairMode = this.sellMode = this.deployMode = false;
            }
            // press a scroll button
        } else if (clickY >= 455 && clickY <= 480) {
            if (clickX >= 500 && clickX <= 530) {
                if (this.leftButtonOffset > 0) {
                    this.leftButtonOffset--;
                    soundsManager.play('button');
                }
            } else if (clickX >= 532 && clickX <= 562) {
                if (this.leftButtonOffset + 6 < this.leftButtons.length) {
                    this.leftButtonOffset++;
                    soundsManager.play('button');
                }
            } else if (clickX >= 570 && clickX <= 600) {
                if (this.rightButtonOffset > 0) {
                    this.rightButtonOffset--;
                    soundsManager.play('button');
                }
            } else if (clickX >= 602 && clickX <= 632) {
                if (this.rightButtonOffset + 6 < this.rightButtons.length) {
                    this.rightButtonOffset++;
                    soundsManager.play('button');
                }
            }
            // Press a unit icon
        } else if (clickY >= 165 && clickY <= 455) {
            var buttonPosition = 0;
            for (var i = 0; i < 6; i++) {
                if (clickY >= 165 + i * 48 && clickY <= 165 + i * 48 + 48) {
                    buttonPosition = i;
                    break;
                }
            }
            var buttonSide, buttonPressedIndex, buttons;
            if (clickX >= 500 && clickX <= 564) {
                buttonSide = 'left';
                buttonPressedIndex = this.leftButtonOffset + buttonPosition;
                buttons = this.leftButtons;
            } else if (clickX >= 570 && clickX <= 634) {
                buttonSide = 'right';
                buttonPressedIndex = this.rightButtonOffset + buttonPosition;
                buttons = this.rightButtons;
            }
            if (buttons && buttons.length > buttonPressedIndex) {
                var buttonPressed = buttons[buttonPressedIndex];
                if (buttonPressed.status == '' && !rightClick) {
                    //this.buildList.push ({side:'left',counter:0,name:this.leftButtons[buttonPressed].name,buttonPressed:buttonPressed});        
                    // Disable all other buttons with same dependency
                    // if(buttonPressed.cost <= this.cash) {
                    for (var i = buttons.length - 1; i >= 0; i--) {
                        if (buttons[i].dependency[0] == buttonPressed.dependency[0]) {
                            buttons[i].status = 'disabled';
                        }
                    };
                    buttonPressed.status = 'building';
                    buttonPressed.counter = 0;
                    buttonPressed.spent = buttonPressed.cost;
                    soundsManager.play('building');
                    //} else {
                    //    sounds.play('insufficient_funds');
                    //}
                } else if (buttonPressed.status == 'building' && !rightClick) {
                    soundsManager.play('not_ready');
                } else if (buttonPressed.status == 'building' && rightClick) {
                    buttonPressed.status = 'hold';
                    soundsManager.play('on_hold');
                } else if (buttonPressed.status == 'hold' && !rightClick) {
                    buttonPressed.status = 'building';
                    soundsManager.play('building');
                } else if ((buttonPressed.status == 'hold' || buttonPressed.status == 'ready') && rightClick) {
                    buttonPressed.status = '';
                    soundsManager.play('cancelled');
                    this.cash += buttonPressed.cost - buttonPressed.spent;
                    for (var i = buttons.length - 1; i >= 0; i--) {
                        buttons[i].status = '';
                    };
                } else if (buttonPressed.status == 'ready' && !rightClick) {
                    if (buttonPressed.type == 'building') {
                        this.deployMode = true;
                        //alert('deploy')
                        this.repairMode = this.sellMode = this.mapMode = false;
                        this.deployBuilding = buttonPressed.name;
                    }
                } else if (buttonPressed.status == 'disabled') {
                    soundsManager.play('building_in_progress');
                }

            }
        }
    }

    allButtons = [];
    leftButtons = [];
    rightButtons = [];

    checkDependency(
        buildings: IBuilding[],
        soundsManager: ISoundsManager,
        curPlayerTeam: string) {
        //alert(this.allButtons.length);
        for (var i = 0; i < this.allButtons.length; i++) {
            var button = this.allButtons[i];

            var dependenciesSatisfied = true;
            //alert(button.dependency.length);
            for (var j = button.dependency.length - 1; j >= 0; j--) {
                var found = false;
                var dependency = button.dependency[j];
                for (var k = buildings.length - 1; k >= 0; k--) {
                    var building = buildings[k];
                    if (building.name == dependency
                        && building.status != 'build'
                        && building.life != 'ultra-damaged'
                        && building.team == curPlayerTeam
                    ) {
                        found = true;
                        //alert(building.name)
                        break;
                    }
                };

                if (!found) {
                    dependenciesSatisfied = false;
                    break;
                }
            };


            if (button.type == 'building') {
                //check left side
                var buttonFound = false;
                var foundIndex;

                for (var j = this.leftButtons.length - 1; j >= 0; j--) {
                    if (this.leftButtons[j].name == button.name) {
                        buttonFound = true;

                        foundIndex = j;
                        break;
                    } else {
                        //alert(button.name + ",lb="+this.leftButtons[j].name)
                    }
                };
                //alert(dependenciesSatisfied +" " + buttonFound + '  '+button.name + ' at index' + foundIndex)
                if (dependenciesSatisfied && !buttonFound) {
                    this.leftButtons.push(button);
                    button.status = '';
                    button.counter = 0;
                    //button.cost = buildings.types[button.name].cost;
                    button.speed = this.buildSpeedMultiplier / button.cost;
                    soundsManager.play('new_construction_options');
                    this.visible = true;
                } else if (buttonFound && !dependenciesSatisfied) {
                    if (this.leftButtons[foundIndex].status == 'building'
                        || this.leftButtons[foundIndex].status == 'hold'
                        || this.leftButtons[foundIndex].status == 'ready') {
                        for (var j = this.leftButtons.length - 1; j >= 0; j--) {
                            this.leftButtons[j].status = '';
                        }
                    }
                    this.leftButtons.splice(foundIndex, 1);
                    this.leftButtonOffset = 0;
                }
            } else if (button.type == 'infantry' || button.type == 'vehicle') {
                //check right side buttons
                var buttonFound = false;
                var foundIndex;

                for (var j = this.rightButtons.length - 1; j >= 0; j--) {
                    if (this.rightButtons[j].name == button.name) {
                        buttonFound = true;
                        foundIndex = j;
                        break;
                    }
                };

                if (dependenciesSatisfied && !buttonFound) {
                    this.rightButtons.push(button);
                    button.status = '';
                    button.counter = 0;
                        
                    /*switch (button.type){
                        case 'infantry':
                            button.cost = 100;//infantry.types[button.name].cost;
                            break;
                        default:
                            button.cost = 0;
                            break;
                    }
                    */
                    button.speed = this.buildSpeedMultiplier / button.cost;
                    soundsManager.play('new_construction_options');
                } else if (buttonFound && !dependenciesSatisfied) {
                    if (this.rightButtons[foundIndex].status == 'building'
                        || this.rightButtons[foundIndex].status == 'hold'
                        || this.rightButtons[foundIndex].status == 'ready') {
                        for (var j = this.rightButtons.length - 1; j >= 0; j--) {
                            if (this.rightButtons[j].dependency[0] == this.rightButtons[foundIndex].dependency[0])
                                this.rightButtons[j].status = '';
                        }
                    }
                    this.rightButtons.splice(foundIndex, 1);
                    this.rightButtonOffset = 0;
                }
            }

        };

    }

    load(startingCash: number, screen: GameScreen, canvasWidth: number) {
        this.cash = startingCash;

        this.tabsImage = this.preloadImage('sidebar/tabs.png');
        this.sidebarImage = this.preloadImage('sidebar/sidebar.png');
        this.primaryBuildingImage = this.preloadImage('sidebar/primary.png');
        this.readyImage = this.preloadImage('sidebar/ready.png');
        this.holdImage = this.preloadImage('sidebar/hold.png');
        this.placementWhiteImage = this.preloadImage('sidebar/placement-white.gif');
        this.placementRedImage = this.preloadImage('sidebar/placement-red.gif');
        this.powerIndicator = this.preloadImage('sidebar/power/power_indicator2.png');
        this.messageBox = this.preloadImage('sidebar/message_box.jpg');

        this.repairButtonPressed = this.preloadImage('sidebar/buttons/repair-pressed.png');
        this.sellButtonPressed = this.preloadImage('sidebar/buttons/sell-pressed.png');

        this.repairImageBig = this.preloadImage('sidebar/repair-big.png');
        this.repairImageSmall = this.preloadImage('sidebar/repair-small.png');

        this.top = screen.viewport.top - 2;
        this.left = canvasWidth - this.width;
        var buttonList = [
            { name: 'power-plant', type: 'building', cost: 300, dependency: ['construction-yard'] },
            { name: 'advanced-power-plant', type: 'building', cost: 700, dependency: ['construction-yard', 'power-plant'] },
            //{name:'barracks',type:'building',cost:300,dependency:['construction-yard','power-plant']},
            //{name:'guard-tower',type:'building',cost:500,dependency: ['construction-yard','barracks']},
            { name: 'refinery', type: 'building', cost: 2000, dependency: ['construction-yard', 'power-plant'] },
            { name: 'tiberium-silo', type: 'building', cost: 150, dependency: ['construction-yard', 'refinery'] },
            { name: 'weapons-factory', type: 'building', cost: 2000, dependency: ['construction-yard', 'power-plant', 'refinery'] },
            //{name:'minigunner',type:'infantry',cost:100,dependency:['barracks']},
            { name: 'harvester', type: 'vehicle', cost: 1400, dependency: ['weapons-factory', 'refinery'] },
            //{name:'jeep',type:'vehicle',cost:400,dependency:['weapons-factory']},
            { name: 'light-tank', type: 'vehicle', cost: 600, dependency: ['weapons-factory'] }
        ];
        this.allButtons = [];

        for (var i = 0; i < buttonList.length; i++) {
            var button = buttonList[i];
            this.allButtons.push({
                name: button.name,
                image: this.preloadImage('sidebar/icons/' + button.name + '-icon.png'),
                type: button.type,
                status: '',
                cost: button.cost,
                dependency: button.dependency
            });
        }

    }

    textBrightness: number = 0;
    textBrightnessDelta: number = -0.1;

    drawButtonLabel(labelImage, x: number, y: number, context: CanvasRenderingContext2D) {
        var labelOffsetX = this.iconWidth / 2 - labelImage.width / 2;
        var labelOffsetY = this.iconHeight / 2;
        //context.fillStyle = 'rgba(255,255,255,'+this.textBrightness+')';
        //context.fillText(label,x+ labelOffsetX,y+labelOffsetY);
        //asdf
        context.globalAlpha = this.textBrightness;
        context.drawImage(labelImage, x + labelOffsetX, y + labelOffsetY);
        context.globalAlpha = 1;
    }

    drawButtonCost(cost, x: number, y: number, context: CanvasRenderingContext2D) {
        var costOffsetX = 35;
        var costOffsetY = 10;
        context.fillStyle = 'white';
        context.fillText(" " + cost, x + costOffsetX, y + costOffsetY);
        //alert(cost+","+(x+costOffsetX)+","+(y+costOffsetY));
    }

    iconWidth: number = 64;
    iconHeight: number = 48;
    leftButtonOffset: number = 0;
    rightButtonOffset: number = 0;
    buildSpeedMultiplier: number = 300;

    drawButton(
        side: string,
        index: number,
        context: CanvasRenderingContext2D,
        spriteContext: CanvasRenderingContext2D,
        spriteCanvas: HTMLCanvasElement) { //side is left or right; index is 0 to 5

        var buttons = (side == 'left') ? this.leftButtons : this.rightButtons;
        var offset = (side == 'left') ? this.leftButtonOffset : this.rightButtonOffset;
        var button = buttons[index + offset];
        var xOffset = (side == 'left') ? 500 : 570;
        var yOffset = 165 + this.top + index * this.iconHeight;

        context.drawImage(button.image, xOffset, yOffset);
        if (button.status == 'ready') {
            this.drawButtonLabel(this.readyImage, xOffset, yOffset, context);
        } else if (button.status == 'disabled') {
            context.fillStyle = 'rgba(200,200,200,0.6)';
            context.fillRect(xOffset, yOffset, this.iconWidth, this.iconHeight);
        } else if (button.status == 'building') {
            spriteContext.clearRect(0, 0, this.iconWidth, this.iconHeight);
            spriteContext.fillStyle = 'rgba(200,200,200,0.6)';
            spriteContext.beginPath();
            spriteContext.moveTo(this.iconWidth / 2, this.iconHeight / 2);
            spriteContext.arc(this.iconWidth / 2, this.iconHeight / 2, 40, Math.PI * 2 * button.counter / 100 - Math.PI / 2, -Math.PI / 2);
            spriteContext.moveTo(this.iconWidth / 2, this.iconHeight / 2);
            spriteContext.fill();
            context.drawImage(spriteCanvas, 0, 0, this.iconWidth, this.iconHeight, xOffset, yOffset, this.iconWidth, this.iconHeight);
            //alert(button.speed) 
        } else if (button.status == 'hold') {
            spriteContext.clearRect(0, 0, this.iconWidth, this.iconHeight);
            spriteContext.fillStyle = 'rgba(100,100,100,0.6)';
            spriteContext.beginPath();
            spriteContext.moveTo(this.iconWidth / 2, this.iconHeight / 2);
            spriteContext.arc(this.iconWidth / 2, this.iconHeight / 2, 40, Math.PI * 2 * button.counter / 100 - Math.PI / 2, -Math.PI / 2);
            spriteContext.moveTo(this.iconWidth / 2, this.iconHeight / 2);
            spriteContext.fill();
            context.drawImage(spriteCanvas, 0, 0, this.iconWidth, this.iconHeight, xOffset, yOffset, this.iconWidth, this.iconHeight);

            this.drawButtonLabel(this.holdImage, xOffset, yOffset, context);
        }
    }

    processButton(
        side: string,
        index: number,
        soundsManager: ISoundsManager,
        buildings: IBuilding[],
        units: IUnit[],
        infantryFactory: InfantryFactory,
        vehiclesFactory: Vehicles,
        curPlayerTeam: string) { //side is left or right; index is 0 to 5

        var buttons = (side == 'left') ? this.leftButtons : this.rightButtons;
        var offset = 0;// (side=='left')?this.leftButtonOffset:this.rightButtonOffset;
        var button = buttons[index + offset];
        var xOffset = (side == 'left') ? 500 : 570;
        var yOffset = 165 + this.top + index * this.iconHeight;
        if (button.status == 'building') {
            if (this.cash == 0) {
                if (!this.insufficientFunds) {
                    soundsManager.play('insufficient_funds');
                    this.insufficientFunds = true;
                }
                return;
            }
            this.insufficientFunds = false;

            if (this.cash < Math.round(button.cost * button.speed / 100)) {
                button.counter += button.speed * this.cash / Math.round(button.cost * button.speed / 100);
                button.spent -= this.cash;
                this.cash = 0;
                return;
            }

            button.counter += button.speed;
            button.spent -= Math.round(button.cost * button.speed / 100);
            this.cash -= Math.round(button.cost * button.speed / 100);
            if (button.counter > 99) {
                this.cash -= button.spent;
                button.status = 'ready';
                if (side == 'left') {
                    soundsManager.play('construction_complete');
                } else {
                    if (button.type == 'infantry' || button.type == 'vehicle') {
                        soundsManager.play('unit_ready')
                        this.finishDeployingUnit(button, buildings, units, infantryFactory, vehiclesFactory, curPlayerTeam);
                    }
                }
            }
        }
    }

    powerOut: number = 0;
    powerIn: number = 0;
    lowPowerMode: boolean = false;
    powerScale: number = 4;

    checkPower(
        buildings: IBuilding[],
        context: CanvasRenderingContext2D,
        soundsManager: ISoundsManager,
        curPlayerTeam: string) {

        var offsetX = this.left;
        var offsetY = this.top + 160;
        var barHeight = 320;
        var barWidth = 20;

        this.powerOut = 0;
        this.powerIn = 0;
        for (var k = buildings.length - 1; k >= 0; k--) {
            var building = buildings[k];
            if (building.powerIn && building.team == curPlayerTeam) {
                this.powerIn += building.powerIn;
            }
            if ((<IEnergyProducingBuilding>building).powerOut && building.team == curPlayerTeam) {
                this.powerOut += (<IEnergyProducingBuilding>building).powerOut;
            }
        };
            
        //alert(this.powerGreen);
            
        var red = 'rgba(174,52,28,0.7)';
        //var red = 'rgba(240,75,35,0.6)';
        var orange = 'rgba(250,100,0,0.6)';
        //var green = 'rgba(48,85,44,0.6)';
        var green = 'rgba(84,252,84,0.3)';
            
            
            
        //context.drawImage(this.powerRed,offsetX,offsetY+barHeight-this.powerOut/this.powerScale);
        if (this.powerOut / this.powerIn >= 1.1) {
            context.fillStyle = green;//'rgba(100,200,0,0.3)';
            this.lowPowerMode = false;
        } else if (this.powerOut / this.powerIn >= 1) {
            context.fillStyle = orange;
            this.lowPowerMode = false;
        } else if (this.powerOut < this.powerIn) {
            context.fillStyle = red;
            if (this.lowPowerMode == false) {
                soundsManager.play('low_power')
            }
            this.lowPowerMode = true;

        }
        context.fillRect(offsetX + 8, offsetY + barHeight - this.powerOut / this.powerScale, barWidth - 14, this.powerOut / this.powerScale);
        context.drawImage(this.powerIndicator, offsetX, offsetY + barHeight - this.powerIn / this.powerScale);

    }

    draw(
        units: IUnit[],
        buildings: IBuilding[],
        infantryFactory: InfantryFactory,
        vehiclesFactory: Vehicles,
        context: CanvasRenderingContext2D,
        soundsManager: ISoundsManager,
        spriteContext: CanvasRenderingContext2D,
        spriteCanvas: HTMLCanvasElement,
        screen: GameScreen,
        curPlayerTeam: string) {
        
        context.drawImage(this.tabsImage, 0, this.top - this.tabsImage.height + 2);
        context.fillStyle = 'lightgreen';
        context.font = '12px "Command and Conquer"';
        // convert the cash score to a string and space separate to pirnt it proerly
        var c = (this.cash + '').split('').join(' ');
        context.fillText(c, 400 - c.length * 5 / 2, 31);



        this.checkDependency(buildings, soundsManager, curPlayerTeam);

        this.textBrightness = this.textBrightness + this.textBrightnessDelta;
        if (this.textBrightness < 0) {
            this.textBrightness = 1;
        }

        for (var i = 0; i < this.leftButtons.length; i++) {
            this.processButton('left', i, soundsManager, buildings, units, infantryFactory, vehiclesFactory, curPlayerTeam);
        }
        for (var i = 0; i < this.rightButtons.length; i++) {
            this.processButton('right', i, soundsManager, buildings, units, infantryFactory, vehiclesFactory, curPlayerTeam);
        }

        if (this.visible) {
            context.drawImage(this.sidebarImage, this.left, this.top);

            if (this.repairMode) {
                context.drawImage(this.repairButtonPressed, this.left + 4, this.top + 145);
            }
            if (this.sellMode) {
                context.drawImage(this.sellButtonPressed, this.left + 57, this.top + 145);
            }
            this.checkPower(buildings, context, soundsManager, curPlayerTeam);
            var maxLeft = this.leftButtons.length > 6 ? 6 : this.leftButtons.length;
            for (var i = 0; i < maxLeft; i++) {
                this.drawButton('left', i, context, spriteContext, spriteCanvas);
            }
            var maxRight = this.rightButtons.length > 6 ? 6 : this.rightButtons.length;
            for (var i = 0; i < maxRight; i++) {
                this.drawButton('right', i, context, spriteContext, spriteCanvas);
            }

        }

        context.clearRect(0, screen.viewport.top + screen.viewport.height, context.canvas.width, 30);
    }


}

export = Sidebar;