
import DestructibleObject = require('./DestructibleObject');
import GameScreen = require('./GameScreen');
import Sidebar = require('./Sidebar');

class Vehicle extends DestructibleObject implements IUnit {
    animationIndex: number;
    animationSpeed: number;
    attacking: boolean;
    bulletFiring: boolean;
    selected: boolean;
    colliding: boolean
    collision: (other) => boolean;
    collisionDistance: number;
    collisionRadius: number;
    collisionType: string;
    collisionWith: number;
    cost: number;
    defaults: IUnit;
    label: string;
    move: () => any;
    moveDirection: number;
    moveImageCount: number;
    moveTo: (a, b) => any;
    movementSpeed: number;
    moving: boolean;
    orders: IOrder;
    path: IPoint[];
    pixelLeft: number;
    pixelOffsetX: number
    pixelOffsetY: number;
    pixelTop: number;
    instructions: IInstruction[];
    primaryWeapon: number;
    reloadTime: number;
    turnSpeed: number;
    turretDirection: number;
    sight: number;
    softCollisionRadius: number;
    speed: number;
    status: string;
    team: string;
    turretImageCount: number;

    draw(
        context: CanvasRenderingContext2D,
        curPlayerTeam: string,
        gridSize: number,
        screen: GameScreen,
        sidebar: Sidebar,
        debugMode: boolean) {
	        
        // Finally draw the top part with appropriate animation
        var imageWidth = this.pixelWidth;
        var imageHeight = this.pixelHeight;
        var x = Math.round(this.x * gridSize + this.pixelOffsetX + screen.viewportAdjust.x);
        var y = Math.round(this.y * gridSize + this.pixelOffsetY + screen.viewportAdjust.y);
        var teamYOffset = 0;
        if (this.team != curPlayerTeam) {
            teamYOffset = this.pixelHeight;
        }



        if (this.status == "") {
            var imageList = this.spriteArray["move"];
            var imageIndex = Math.floor(this.moveDirection);
            context.drawImage(this.spriteCanvas, (imageList.offset + imageIndex) * imageWidth, teamYOffset, imageWidth, imageHeight, x, y, imageWidth, imageHeight);
        } else {
            if (!this.animationIndex) {
                this.animationIndex = 0;
            }
            var imageList = this.spriteArray[this.status];
            if (imageList.count >= Math.floor(this.animationIndex / this.animationSpeed)) {
                var imageIndex = Math.floor(this.animationIndex / this.animationSpeed);
                context.drawImage(this.spriteCanvas, (imageList.offset + imageIndex) * imageWidth, teamYOffset, imageWidth, imageHeight, x, y, imageWidth, imageHeight);
            }
            this.animationIndex++;            
        }

        if (this.turretDirection >= 0) {
            var turretList = this.spriteArray['turret'];
            if (turretList) {
                var imageIndex = Math.floor(this.turretDirection);
                context.drawImage(this.spriteCanvas, (turretList.offset + imageIndex) * imageWidth, teamYOffset, imageWidth, imageHeight, x, y, imageWidth, imageHeight);
            }
        }




        this.drawSelection(context, gridSize, screen, sidebar);

        if (debugMode) {

            context.fillStyle = 'white';
            context.fillText(this.orders.type, x, y);
            context.fillText(Math.floor(this.x) + ',' + Math.floor(this.y), x, y + 10);
            (<IMoveOrder>this.orders).to && context.fillText((<IMoveOrder>this.orders).to.x + ',' + (<IMoveOrder>this.orders).to.y, x, y + 20);
        }

        if (debugMode) {
            context.fillStyle = 'rgba(100,200,100,0.4)';
            context.beginPath();
            context.arc(this.x * gridSize + screen.viewportAdjust.x, this.y * gridSize + screen.viewportAdjust.y, this.softCollisionRadius, 0, Math.PI * 2);
            context.fill();


            context.fillStyle = 'rgba(200,0,0,0.4)';
            context.beginPath();
            context.arc(this.x * gridSize + screen.viewportAdjust.x, this.y * gridSize + screen.viewportAdjust.y, this.collisionRadius, 0, Math.PI * 2);
            context.fill();
        }
    }

    processOrders(gridSize: number) {
        this.colliding = false;
        this.collisionType = '';
        this.collisionDistance = this.softCollisionRadius + 1;
        this.collisionWith = null;
        this.movementSpeed = 0;
        this.instructions = [];

        if (!this.orders) {
            this.orders = { type: 'guard' };
        }

        if (this.orders.type == 'make-way') {
            //alert('Make way for '+this.orders.for)
	            
            //this.orders = {type:'move',to:{x:Math.round(this.orders.for.x+2),y:Math.round(this.orders.for.y+1)}};
	            
            //var collDirection=findAngle(this.orders.for,this,32);
            //var dTurn = angleDiff(this.moveDirection,collDirection,32);

            debugger;
            console.error('What is collDirection here?');
            var collDirection = undefined;
            if (Math.abs(collDirection) > 16) {
                this.instructions.push({ type: 'move', distance: 0.25 });
            } else {
                this.instructions.push({ type: 'move', distance: -0.25 });
            }

            this.movementSpeed = this.speed;
            this.orders = { type: 'guard' };
        }
        else if (this.orders.type == 'move') {
            //alert(this.processOrders)
                
            this.moveTo(this.orders.to);
            //alert(this.collisionRadius/game.gridSize)
                
            var distance = Math.pow(Math.pow(this.orders.to.y + 0.5 - this.y, 2) + Math.pow(this.orders.to.x + 0.5 - this.x, 2), 0.5);
            //console.log(distance + ' '+1.5*2*this.softCollisionRadius/game.gridSize)
            var reachedThreshold = this.softCollisionRadius / game.gridSize < 0.5 ? 0.5 + this.softCollisionRadius / game.gridSize : this.softCollisionRadius / game.gridSize;
            if ((distance <= reachedThreshold) 
            //(this.path.length <= 1) 
                || (this.colliding && this.collisionType == 'soft' && distance <= reachedThreshold + this.collisionRadius / game.gridSize)
                || (this.colliding && this.collisionType == 'soft-hard' && distance <= reachedThreshold + 2 * this.collisionRadius / game.gridSize)
                || (this.colliding && this.collisionType == 'hard' && distance <= reachedThreshold + 3 * this.collisionRadius / game.gridSize)) {
                this.orders = { type: 'guard' };
                //alert(this.collisionType + ' '+distance)
                /*if (this.name == 'harvester'){
                    if (this.tiberium && this.tiberium >= 10) {
                        this.orders = {type:'harvest-return'};
                    } else {
                        this.orders = {type:'harvest'};  
                    }
                    
                }*/
            }


        }
        else if (this.orders.type == 'patrol') {
            // if i see enemy while patrolling, go jump to the first enemy :)
            var enemiesInRange = findEnemiesInRange(this, 2);
            if (enemiesInRange.length > 0) {
                var enemy = enemiesInRange[0];
                this.orders = { type: 'attack', target: enemy, lastOrders: this.orders };
                return;
            }

            this.moveTo(this.orders.to);
            var distance = Math.pow(Math.pow(this.orders.to.y - this.y, 2) + Math.pow(this.orders.to.x - this.x, 2), 0.5);
            if (distance < 4 * this.softCollisionRadius / game.gridSize) {
                this.orders = { type: 'patrol', to: this.orders.from, from: this.orders.to };
            }
        }
        else if (this.orders.type == 'protect' || this.orders.type == 'attack') {

            if (this.orders.target.status == 'destroy') {
                var enemiesInRange = findEnemiesInRange(this, 2);
                if (enemiesInRange.length > 0) {
                    var enemy = enemiesInRange[0];
                    this.orders = { type: 'attack', target: enemy, lastOrders: this.orders };
                    return;
                } else {
                    if (this.orders.lastOrders) {
                        this.orders = this.orders.lastOrders
                    } else {
                        this.orders = { type: 'guard' };
                    }

                    return;
                }

            }

            if (this.orders.type == 'protect') {
                var enemiesInRange = findEnemiesInRange(this, 2);
                if (enemiesInRange.length > 0) {
                    var enemy = enemiesInRange[0];
                    this.orders = { type: 'attack', target: enemy, lastOrders: this.orders };
                    return;
                }
            }
            //var start = [Math.floor(this.x),Math.floor(this.y)];
            //adjust to center of target for buildings
                
                
                
            var targetX = this.orders.target.x;
            var targetY = this.orders.target.y;
            var targetCGX = this.orders.target.x;
            var targetCGY = this.orders.target.y;

            if (this.orders.target.type == 'turret') {
                targetX += this.orders.target.pixelWidth / (2 * game.gridSize);
                targetY += this.orders.target.pixelHeight / (2 * game.gridSize);
                targetCGX = targetX;
                targetCGY = targetY;

            }

            if (this.orders.target.type == 'building') {
                targetX += this.orders.target.gridWidth / 2
                targetY += this.orders.target.gridHeight;
                targetCGX = targetX;
                targetCGY += this.orders.target.gridHeight / 2;

            }





            if (Math.pow(targetX - this.x, 2) + Math.pow(targetY - this.y, 2) > Math.pow(this.sight - 1, 2)) {
                this.moveTo({ x: Math.floor(targetX), y: Math.floor(targetY) }, true);
            }

            if (Math.pow(targetX - this.x, 2) + Math.pow(targetY - this.y, 2) <= Math.pow(this.sight, 2)) {
                if (this.orders.type == 'attack') {
                    var turretAngle = findAngle({ x: targetCGX, y: targetCGY }, this, 32);
                    if (this.turretDirection == turretAngle) {
                        // aiming turret at him and within range... FIRE!!!!!
                        this.instructions.push({ type: 'fire' });
                        //this.instructions=[{type:'fire'}];
                    } else {
                        this.instructions.push({ type: 'aim', toDirection: turretAngle });
                        //console.log('turret '+this.turretDirection +'  -> '+turretAngle)
                    }
                }
                // do nothing... wait...
            }
        }
        else if (this.orders.type == 'build') {
            if (this.moveDirection != 15) {
                this.instructions.push({ type: 'turn', toDirection: 15 });
            } else {
                this.status = 'destroy';
                sounds.play('construction');
                game.buildings.push(buildings.add({ name: 'construction-yard', x: Math.floor(this.x) - 1, y: Math.floor(this.y) - 1, status: 'build' }));
            }
        }
        else if (this.orders.type == 'guard') {
            // first see if an evil unit is in sight and track it :)
            var enemiesInRange = findEnemiesInRange(this, 2);
            if (this.primaryWeapon && enemiesInRange.length > 0) {
                var enemy = enemiesInRange[0];
                this.orders = { type: 'attack', target: enemy };
            }
        }
    }
}

export = Vehicle;