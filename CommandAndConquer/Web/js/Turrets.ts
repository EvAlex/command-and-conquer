
import VisualObject = require('./VisualObject');

class Turrents extends VisualObject {
    types = [];
    turretDetails = {
        'gun-turret': {
            name: 'gun-turret',
            label: 'Gun Turret',
            type: 'turret',
            powerIn: 20,
            primaryWeapon: 12,
            cost: 600,
            hitPoints: 200,
            sight: 5,
            turnSpeed: 5,
            reloadTime: 1500,
            pixelWidth: 24,
            pixelHeight: 24,
            imagesToLoad: [
                { name: 'build', count: 20 },
                { name: 'damaged', count: 32 },
                { name: "healthy", count: 32 }
            ],
            pixelOffsetX: -12,
            pixelOffsetY: -12,
            pixelTop: 12,
            pixelLeft: 12,
            gridWidth: 1,
            gridHeight: 1,
            gridShape: [[1]]
        },
        'guard-tower': {
            name: 'guard-tower',
            label: 'Guard Tower',
            type: 'turret',
            powerIn: 10,
            primaryWeapon: 1,
            cost: 500,
            hitPoints: 200,
            sight: 5,
            reloadTime: 1000,
            pixelWidth: 24,
            pixelHeight: 24,
            pixelOffsetX: -12,
            pixelOffsetY: -12,
            pixelTop: 12,
            pixelLeft: 12,
            imagesToLoad: [
                { name: 'build', count: 20 },
                { name: 'damaged', count: 1 },
                { name: "healthy", count: 1 }
            ],
            gridWidth: 1,
            gridHeight: 1,
            gridShape: [[1, 1]]
        },

    };

    preloadCount = 0,
    loadedCount = 0,

    load(name) {
        var details = this.turretDetails[name];
        var turretType = {
            defaults: {
                type: 'turret',
                status: '',

                draw: this.draw,
                drawSelection: drawSelection,
                processOrders: this.processOrders,
                underPoint: underPoint,
                move: this.move,
                getLife: getLife,
                animationSpeed: 4,
                health: details.hitPoints,
                pixelLeft: 0,
                pixelTop: 0,
                pixelOffsetX: 0,
                pixelOffsetY: 0,
                turretDirection: 0
            }
        };


        this.loadSpriteSheet(turretType, details, 'turrets')

        $.extend(turretType, details);
        this.types[name] = (turretType);
    }

    draw() {
        var life = this.getLife();
        var teamYOffset = 0;
        if (this.team != game.currentLevel.team) {
            teamYOffset = this.pixelHeight;
            //alert(teamYOffset)
        }

        var imageCategory: string;
        if (this.status == "build" || this.status == "sell") {
            imageCategory = 'build';
        } else if (this.status == "") {
            imageCategory = this.life;
            if (this.life == 'ultra-damaged') { // turrets don't have ultra damaged. :)
                imageCategory = 'damaged';
            }
        }


        var imageList = this.spriteArray[imageCategory];
        var imageWidth = this.gridShape[0].length * game.gridSize;
        var imageHeight = this.spriteImage.height;



        var x = this.x * game.gridSize + game.viewportAdjustX;
        var y = this.y * game.gridSize + game.viewportAdjustY;
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
        this.drawSelection();

    }

    processOrders() {

        if (!this.orders) {
            this.orders = { type: 'guard' };
        }
        //this.orders = {type:'move',to:{x:11,y:12}}; //{type:patrol,from:{x:9,y:5},to:{x:11,y:5}} // {type:guard} // {type:move,to:{x:11,y:5}} // {type:attack} // {type:protect}


        if (this.orders.type == 'attack') {
            this.instructions = [];
            if (this.orders.target.status == 'destroy') {
                this.orders = { type: 'guard' };
                return;
            }

            var start = [Math.floor(this.x), Math.floor(this.y)];
            //adjust to center of target for buildings
            var targetX = this.orders.target.x;
            var targetY = this.orders.target.y;
            if (this.orders.target.type == 'turret') {
                targetX += this.orders.target.pixelWidth / (2 * game.gridSize);
                targetY += this.orders.target.pixelHeight / (2 * game.gridSize);
            }

            if (this.orders.target.type == 'building') {
                targetX += this.orders.target.gridWidth / 2
                targetY += this.orders.target.gridHeight / 2;
            }

            if (Math.pow(targetX - this.x, 2) + Math.pow(targetY - this.y, 2) >= Math.pow(this.sight, 2)) { 
                //alert('not attacking '+this.orders.target.name)
                this.orders = { type: 'guard' };// out of range go back to guard mode.
                    
            } else {
                if (this.orders.type == 'attack') {
                    var turretAngle = findAngle({ x: targetX, y: targetY }, this, 32);
                    if (this.turretDirection != turretAngle) {
                        this.instructions.push({ type: 'aim', toDirection: turretAngle });
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
            var enemiesInRange = findEnemiesInRange(this, 0);
            if (enemiesInRange.length > 0) {
                var enemy = enemiesInRange[0];

                this.orders = { type: 'attack', target: enemy };

            }
        }
    }

    move() {
        if (!this.instructions) {
            this.instructions = [];
        }
        if (this.instructions.length == 0) {
            return;
        }

        for (var i = 0; i < this.instructions.length; i++) {
            var instr = this.instructions[i];
            if (instr.type == 'aim') {
	            
                //alert('aiming: ' + instr.toDirection + ' and turret is at '+this.turretDirection)
                if (instr.toDirection == this.turretDirection) {
                    // instruction complete...
                    instr.type = 'done';
                    //return;
                }
                if ((instr.toDirection > this.turretDirection && (instr.toDirection - this.turretDirection) < 16)
                    || (instr.toDirection < this.turretDirection && (this.turretDirection - instr.toDirection) > 16)) {
                    //alert(this.turnSpeed*0.05)
                    this.turretDirection = this.turretDirection + this.turnSpeed * 0.1;
                    if ((this.turretDirection - instr.toDirection) * (this.turretDirection + this.turnSpeed * 0.1 - instr.toDirection) <= 0) {
                        this.turretDirection = instr.toDirection;
                    }
                } else {
                    this.turretDirection = this.turretDirection - this.turnSpeed * 0.1;
                    if ((this.turretDirection - instr.toDirection) * (this.turretDirection - this.turnSpeed * 0.1 - instr.toDirection) <= 0) {
                        this.turretDirection = instr.toDirection;
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
                    game.fireBullet({ x: this.x + 0.5, y: this.y + 0.5, angle: angle, range: this.sight, source: this, damage: 10 });
                }
            }
        };
    }

    add(details) {
        var newTurret = {
            team: game.currentLevel.team
        };
        var name = details.name;
        $.extend(newTurret, this.types[name].defaults);

        $.extend(newTurret, this.types[name]);
        $.extend(newTurret, details);

        return newTurret;
    }


}

export = Turrents;