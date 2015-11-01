
import Building = require('./Building');
import GameScreen = require('./GameScreen');
import Sidebar = require('./Sidebar');
import Vehicles = require('./Vehicles');
import Player = require('./Player');
import Sounds = require('./Sounds');

class Turret extends Building implements ITurret {

    constructor(health: number) {
        super();
        this.type= 'turret';
        this.status = '';        
        this.animationSpeed = 4;
        this.health = health;
        this.pixelLeft = 0;
        this.pixelTop = 0;
        this.pixelOffsetX = 0;
        this.pixelOffsetY = 0;
        this.turretDirection = 0
    }

    turretDirection: number;
    turnSpeed: number;
    bulletFiring: boolean;
    primaryWeapon: number;
    reloadTime: number;
    orders: IOrder;
    instructions: IInstruction[];

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

        var life = this.getLife(),
            imageCategory: string;
        if (this.status == "build" || this.status == "sell") {
            imageCategory = 'build';
        } else if (this.status == "") {
            imageCategory = this.life;
            if (this.life == 'ultra-damaged') { // turrets don't have ultra damaged. :)
                imageCategory = 'damaged';
            }
        }


        var imageList = this.spriteArray[imageCategory];
        var imageWidth = this.gridShape[0].length * gridSize;
        var imageHeight = this.spriteImage.height;



        var x = this.x * gridSize + screen.viewportAdjust.x;
        var y = this.y * gridSize + screen.viewportAdjust.y;
        if (this.status == "") {
            var imageIndex = Math.floor(this.turretDirection);

            context.drawImage(this.spriteCanvas, (imageList.offset + imageIndex) * imageWidth, teamYOffset, imageWidth, imageHeight, x, y, imageWidth, imageHeight);
        } else {
            if (!this.animationIndex) {
                this.animationIndex = 0;
            }
            if (imageList.count >= Math.floor(this.animationIndex / this.animationSpeed)) {
                var imageIndex = Math.floor(this.animationIndex / this.animationSpeed);
                if (this.status == 'sell') {
                    imageIndex = imageList.count - 1 - Math.floor(this.animationIndex / this.animationSpeed);
                }
                context.drawImage(this.spriteCanvas, (imageList.offset + imageIndex) * imageWidth, teamYOffset, imageWidth, imageHeight, x, y, imageWidth, imageHeight);
            }
            this.animationIndex++;
            if (this.animationIndex / this.animationSpeed >= imageList.count) {
                //alert(this.animationIndex + ' / '+ this.animationSpeed)
                this.animationIndex = 0;
                this.status = "";
                if (this.status == 'sell') {
                    this.status = 'destroy';
                }
            }
        }

        if (this.turretDirection >= 0) {
            var turretList = this.spriteArray['turret'];
            if (turretList) {
                var imageIndex = Math.floor(this.turretDirection);
                context.drawImage(this.spriteImage, (turretList.offset + imageIndex) * imageWidth, teamYOffset, imageWidth, imageHeight, x, y, imageWidth, imageHeight);
            }
        }
        this.drawSelection(context, gridSize, screen, sidebar);

    }

    processOrders(
        gridSize: number,
        units: IUnit[],
        buildings: IBuilding[],
        turrets: ITurret[]) {

        if (!this.orders) {
            this.orders = { type: 'guard' };
        }
        //this.orders = {type:'move',to:{x:11,y:12}}; //{type:patrol,from:{x:9,y:5},to:{x:11,y:5}} // {type:guard} // {type:move,to:{x:11,y:5}} // {type:attack} // {type:protect}


        if (this.orders.type == 'attack') {
            var attackOrder = <IAttackOrder>this.orders;

            this.instructions = [];
            if (attackOrder.target.status == 'destroy') {
                this.orders = { type: 'guard' };
                return;
            }

            var start = [Math.floor(this.x), Math.floor(this.y)];
            //adjust to center of target for buildings
            var targetX = attackOrder.target.x;
            var targetY = attackOrder.target.y;
            if (attackOrder.target.type == 'turret') {
                targetX += attackOrder.target.pixelWidth / (2 * gridSize);
                targetY += attackOrder.target.pixelHeight / (2 * gridSize);
            }

            if (attackOrder.target.type == 'building') {
                targetX += attackOrder.target.gridWidth / 2
                targetY += attackOrder.target.gridHeight / 2;
            }

            if (Math.pow(targetX - this.x, 2) + Math.pow(targetY - this.y, 2) >= Math.pow(this.sight, 2)) { 
                //alert('not attacking '+this.orders.target.name)
                this.orders = { type: 'guard' };// out of range go back to guard mode.
                    
            } else {
                if (this.orders.type == 'attack') {
                    var turretAngle = this.findAngle({ x: targetX, y: targetY }, this, 32);
                    if (this.turretDirection != turretAngle) {
                        this.instructions.push(<IAimInstruction>{ type: 'aim', toDirection: turretAngle });
                        //alert('pusing direction ' + turretAngle)
                    } else {
                        // aiming turret at him and within range... FIRE!!!!!
                        //alert(turretAngle)
                        this.instructions.push({ type: 'fire' });
                        // this only processes if the guy has some ammo
                    }

                }
                // do nothing... wait...
            }
        }
        else if (this.orders.type == 'guard') {
            // first see if an evil unit is in sight and track it :)
            var enemiesInRange = this.findEnemiesInRange(this, 0, units, buildings, turrets);
            if (enemiesInRange.length > 0) {
                var enemy = enemiesInRange[0];

                this.orders = <IAttackOrder>{ type: 'attack', target: enemy };

            }
        }
    }

    move(sounds: Sounds) {
        if (!this.instructions) {
            this.instructions = [];
        }
        if (this.instructions.length == 0) {
            return;
        }

        for (var i = 0; i < this.instructions.length; i++) {
            var instr = this.instructions[i];
            if (instr.type == 'aim') {
                var aimInstr = <IAimInstruction>instr;
	            
                //alert('aiming: ' + instr.toDirection + ' and turret is at '+this.turretDirection)
                if (aimInstr.toDirection == this.turretDirection) {
                    // instruction complete...
                    instr.type = 'done';
                    //return;
                }
                if ((aimInstr.toDirection > this.turretDirection && (aimInstr.toDirection - this.turretDirection) < 16)
                    || (aimInstr.toDirection < this.turretDirection && (this.turretDirection - aimInstr.toDirection) > 16)) {
                    //alert(this.turnSpeed*0.05)
                    this.turretDirection = this.turretDirection + this.turnSpeed * 0.1;
                    if ((this.turretDirection - aimInstr.toDirection) * (this.turretDirection + this.turnSpeed * 0.1 - aimInstr.toDirection) <= 0) {
                        this.turretDirection = aimInstr.toDirection;
                    }
                } else {
                    this.turretDirection = this.turretDirection - this.turnSpeed * 0.1;
                    if ((this.turretDirection - aimInstr.toDirection) * (this.turretDirection - this.turnSpeed * 0.1 - aimInstr.toDirection) <= 0) {
                        this.turretDirection = aimInstr.toDirection;
                    }
                }
                if (this.turretDirection > 31) {
                    this.turretDirection = 0;
                } else if (this.turretDirection < 0) {
                    this.turretDirection = 31;
                }     
    	            
                //alert(this.turretDirection)   
            }

            if (instr.type == 'fire') {
                // alert(this.fireCounter)
                if (!this.bulletFiring) {
                    sounds.play('tank_fire');
                    this.bulletFiring = true;
                    var angle = (this.turretDirection / 32) * 2 * Math.PI;
                    game.fireBullet({
                        x: this.x + 0.5,
                        y: this.y + 0.5,
                        angle: angle,
                        range: this.sight,
                        source: this,
                        damage: 10
                    });
                }
            }
        };
    }
}

export = Turret