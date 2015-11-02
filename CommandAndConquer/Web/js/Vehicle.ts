
import DestructibleObject = require('./DestructibleObject');
import GameScreen = require('./GameScreen');
import Sidebar = require('./Sidebar');
import Buildings = require('./Buildings');
import Building = require('./Building');
import Sounds = require('./Sounds');
import AStar = require('./AStar');
import Fog = require('./Fog');

class Vehicle extends DestructibleObject implements IUnit {

    constructor() {
        super('vehicle');
        this.animationSpeed = 4;
        this.pixelLeft = 0;
        this.pixelTop = 0;
        this.pixelOffsetX = 0;
        this.pixelOffsetY = 0;
        this.moveDirection = 0;
        this.turretDirection = 0;
        this.status = '';
    }

    animationIndex: number;
    animationSpeed: number;
    attacking: boolean;
    bulletFiring: boolean;
    selected: boolean;
    colliding: boolean
    collisionDistance: number;
    collisionRadius: number;
    softCollisionRadius: number;
    collisionType: string;
    collisionWith: ICollisionPoint;
    cost: number;
    defaults: IUnit;
    label: string;
    moveDirection: number;
    moveImageCount: number;
    movementSpeed: number;
    moving: boolean;
    orders: IOrder;
    path: IPoint[];
    pixelLeft: number;
    pixelTop: number;
    pixelOffsetX: number
    pixelOffsetY: number;
    gridHeight: number;
    gridWidth: number;
    instructions: IInstruction[];
    primaryWeapon: number;
    reloadTime: number;
    turnSpeed: number;
    turretDirection: number;
    sight: number;
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

    processOrders(
        speedAdjustmentFactor: number,
        units: IUnit[],
        buildings: Building[],
        turrets: ITurret[],
        allOverlays: IOverlay[],
        buildingsFactory: Buildings,
        fog: Fog,
        sounds: Sounds,
        curPlayerTeam: string,
        obstructionGrid: number[][],
        heroObstructionGrid: number[][],
        debugMode: boolean,
        context: CanvasRenderingContext2D,
        gridSize: number,
        screen: GameScreen) {

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
                this.instructions.push(<IMoveInstruction>{ type: 'move', distance: 0.25 });
            } else {
                this.instructions.push(<IMoveInstruction>{ type: 'move', distance: -0.25 });
            }

            this.movementSpeed = this.speed;
            this.orders = { type: 'guard' };
        }
        else if (this.orders.type == 'move') {
            //alert(this.processOrders)
            var moveOrder = <IMoveOrder>this.orders;
            this.moveTo(moveOrder.to, false, speedAdjustmentFactor, units, curPlayerTeam, obstructionGrid, heroObstructionGrid, debugMode, context, gridSize, screen);
            //alert(this.collisionRadius/game.gridSize)
                
            var distance = Math.pow(Math.pow(moveOrder.to.y + 0.5 - this.y, 2) + Math.pow(moveOrder.to.x + 0.5 - this.x, 2), 0.5);
            //console.log(distance + ' '+1.5*2*this.softCollisionRadius/game.gridSize)
            var reachedThreshold = this.softCollisionRadius / gridSize < 0.5 ? 0.5 + this.softCollisionRadius / gridSize : this.softCollisionRadius / gridSize;
            if ((distance <= reachedThreshold) 
            //(this.path.length <= 1) 
                || (this.colliding && this.collisionType == 'soft' && distance <= reachedThreshold + this.collisionRadius / gridSize)
                || (this.colliding && this.collisionType == 'soft-hard' && distance <= reachedThreshold + 2 * this.collisionRadius / gridSize)
                || (this.colliding && this.collisionType == 'hard' && distance <= reachedThreshold + 3 * this.collisionRadius / gridSize)) {
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

            var patrolOrder = <IPatrolOrder>this.orders;

            var enemiesInRange = this.findEnemiesInRange(this, 2, units, buildings, turrets);
            if (enemiesInRange.length > 0) {
                var enemy = enemiesInRange[0];
                this.orders = <IAttackOrder>{ type: 'attack', target: enemy, lastOrders: this.orders };
                return;
            }

            this.moveTo(patrolOrder.to, false, speedAdjustmentFactor, units, curPlayerTeam, obstructionGrid, heroObstructionGrid, debugMode, context, gridSize, screen);
            var distance = Math.pow(Math.pow(patrolOrder.to.y - this.y, 2) + Math.pow(patrolOrder.to.x - this.x, 2), 0.5);
            if (distance < 4 * this.softCollisionRadius / gridSize) {
                this.orders = <IPatrolOrder>{ type: 'patrol', to: patrolOrder.from, from: patrolOrder.to };
            }
        }
        else if (this.orders.type == 'protect' || this.orders.type == 'attack') {
            var protectOrder = <IProtectOrder>this.orders;

            if (protectOrder.target.status == 'destroy') {
                var enemiesInRange = this.findEnemiesInRange(this, 2, units, buildings, turrets);
                if (enemiesInRange.length > 0) {
                    var enemy = enemiesInRange[0];
                    this.orders = <IAttackOrder>{ type: 'attack', target: enemy, lastOrders: this.orders };
                    return;
                } else {
                    if (this.orders['lastOrders']) {
                        this.orders = this.orders['lastOrders'];
                    } else {
                        this.orders = { type: 'guard' };
                    }

                    return;
                }

            }

            if (this.orders.type == 'protect') {
                var enemiesInRange = this.findEnemiesInRange(this, 2, units, buildings, turrets);
                if (enemiesInRange.length > 0) {
                    var enemy = enemiesInRange[0];
                    this.orders = <IAttackOrder>{ type: 'attack', target: enemy, lastOrders: this.orders };
                    return;
                }
            }
            //var start = [Math.floor(this.x),Math.floor(this.y)];
            //adjust to center of target for buildings
                
                
                
            var targetX = protectOrder.target.x;
            var targetY = protectOrder.target.y;
            var targetCGX = protectOrder.target.x;
            var targetCGY = protectOrder.target.y;

            if (protectOrder.target.type == 'turret') {
                targetX += protectOrder.target.pixelWidth / (2 * gridSize);
                targetY += protectOrder.target.pixelHeight / (2 * gridSize);
                targetCGX = targetX;
                targetCGY = targetY;

            }

            if (protectOrder.target.type == 'building') {
                targetX += protectOrder.target.gridWidth / 2
                targetY += protectOrder.target.gridHeight;
                targetCGX = targetX;
                targetCGY += protectOrder.target.gridHeight / 2;

            }





            if (Math.pow(targetX - this.x, 2) + Math.pow(targetY - this.y, 2) > Math.pow(this.sight - 1, 2)) {
                this.moveTo({ x: Math.floor(targetX), y: Math.floor(targetY) }, true, speedAdjustmentFactor, units, curPlayerTeam, obstructionGrid, heroObstructionGrid, debugMode, context, gridSize, screen);
            }

            if (Math.pow(targetX - this.x, 2) + Math.pow(targetY - this.y, 2) <= Math.pow(this.sight, 2)) {
                if (this.orders.type == 'attack') {
                    var turretAngle = this.findAngle({ x: targetCGX, y: targetCGY }, this, 32);
                    if (this.turretDirection == turretAngle) {
                        // aiming turret at him and within range... FIRE!!!!!
                        this.instructions.push(<IFireInstruction>{ type: 'fire' });
                        //this.instructions=[{type:'fire'}];
                    } else {
                        this.instructions.push(<IAimInstruction>{ type: 'aim', toDirection: turretAngle });
                        //console.log('turret '+this.turretDirection +'  -> '+turretAngle)
                    }
                }
                // do nothing... wait...
            }
        }
        else if (this.orders.type == 'build') {
            if (this.moveDirection != 15) {
                this.instructions.push(<ITurnInstruction>{ type: 'turn', toDirection: 15 });
            } else {
                this.status = 'destroy';
                sounds.play('construction');
                buildings.push(buildingsFactory.add({ name: 'construction-yard', x: Math.floor(this.x) - 1, y: Math.floor(this.y) - 1, status: 'build', team: curPlayerTeam }));
            }
        }
        else if (this.orders.type == 'guard') {
            // first see if an evil unit is in sight and track it :)
            var enemiesInRange = this.findEnemiesInRange(this, 2, units, buildings, turrets);
            if (this.primaryWeapon && enemiesInRange.length > 0) {
                var enemy = enemiesInRange[0];
                this.orders = <IAttackOrder>{ type: 'attack', target: enemy };
            }
        }
    }

    moveTo(
        destination: IPoint,
        turretAtTarget: boolean,
        speedAdjustmentFactor: number,
        units: IUnit[],
        curPlayerTeam: string,
        obstructionGrid: number[][],
        heroObstructionGrid: number[][],
        debugMode: boolean,
        context: CanvasRenderingContext2D,
        gridSize: number,
        screen: GameScreen) {

        var start: [number, number] = [Math.floor(this.x), Math.floor(this.y)];
        var end: [number, number] = [destination.x, destination.y];
        this.path = this.findPath(start, end, this.team == curPlayerTeam, obstructionGrid, heroObstructionGrid, debugMode, context, gridSize, screen);
        //this.path = [];
        //this.path = [{x:start[0],y:start[1]},{x:end[0],y:end[1]}];
        this.instructions = [];
        if (this.path.length <= 1) {
            if (Math.abs(this.x - destination.x) < 1 && Math.abs(this.y - destination.y) < 1) {
                if (this.x == end[0] && this.y == end[1]) {
                    //reached
                } else {
                    this.path = [{ x: start[0], y: start[1] }, { x: end[0], y: end[1] }];
                }
            }
        }
        if (this.path.length > 1) {
            var newAngle = this.findAngle(this.path[1], this.path[0], 32);
            var movement = this.movementSpeed * speedAdjustmentFactor / gridSize;

            var angleRadians = (this.moveDirection / 32) * 2 * Math.PI;
            this.x = (this.x - movement * Math.sin(angleRadians));
            this.y = (this.y - movement * Math.cos(angleRadians));
            this.colliding = false;

            var collision;
            for (var k = units.length - 1; k >= 0; k--) {

                if (collision = this.collision(units[k], gridSize)) {
                    if (collision.distance < this.collisionDistance) {
                        this.collisionType = collision.type;
                        this.collisionDistance = collision.distance;
                        this.collisionWith = units[k];
                        this.colliding = true;
                        //alert('colliding' + this.collisionType)
                    }
                }
            };

            for (var k = 0; k < obstructionGrid.length; k++) {
                for (var l = 0; l < obstructionGrid[k].length; l++) {
                    if (obstructionGrid[k][l] > 0) {
                        //alert((k+0.5)*game.gridSize +' '+(l+0.5)*game.gridSize + ' game.gridSize*0.5')
                        var tile: ICollisionPoint = {
                            x: (l + 0.5), y: (k + 0.5),
                            collisionRadius: gridSize * 0.5, softCollisionRadius: gridSize * 0.7
                        };
                        if (collision = this.collision(tile, gridSize)) {
                            if (collision.distance < this.collisionDistance) {
                                this.collisionType = collision.type;
                                this.collisionDistance = collision.distance;
                                this.collisionWith = tile;
                                this.colliding = true;
                                //alert('colliding' + this.collisionType)
                            }
                        }
                    }
                }
            }

            this.x = (this.x + movement * Math.sin(angleRadians));
            this.y = (this.y + movement * Math.cos(angleRadians));
                    
                
            //this.movementSpeed = this.speed;
            if (this.colliding) {
                //his.movementSpeed = 0;
                var collDirection = this.findAngle(this.collisionWith, this, 32);
                var dTurn = this.angleDiff(this.moveDirection, collDirection, 32);
                var dTurnDestination = this.angleDiff(newAngle, collDirection, 32);
                   
                /*if(this.collisionWith && this.collisionWith.type=='vehicle' && this.collisionType.indexOf('hard')>-1 && Math.abs(dTurn)<9){
                      if(this.collisionWith.instructions.length==0 && this.collisionWith.orders.type == 'guard'){
                          this.collisionWith.orders = {type:'make-way',for:this};

                      }
                 }*/

                switch (this.collisionType) {

                    case 'hard':
 
                        //alert('collDirection'+collDirection + 'moveDirection '+this.moveDirection + ' dTurn ' +dTurn);
                        /**/
                        this.movementSpeed = 0;
                        if (Math.abs(dTurn) == 0) { // Bumping into something ahead
                            if (Math.abs(dTurnDestination) > 0) {
                                newAngle = this.addAngle(this.moveDirection, -1 * dTurnDestination / Math.abs(dTurnDestination), 32);
                            } else {
                                newAngle = this.addAngle(this.moveDirection, -1, 32);
                            }
                                
                                
                            ////console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                            this.moveDirection = newAngle;

                        } else if (Math.abs(dTurn) <= 2) { // Bumping into something ahead
    
                            //if (Math.abs(dTurn)<Math.abs(dTurnDestination)){
                            newAngle = this.addAngle(this.moveDirection, -1 * dTurn / Math.abs(dTurn), 32);
                            ////console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                            this.moveDirection = newAngle;
                            //}
                                
                            //newAngle = this.moveDirection;
                            //addAngle(this.moveDirection,-dTurn*1,32);
                                
                        } else if (Math.abs(dTurn) < 4) {

                            //this.movementSpeed -= this.speed/2;
                            //if (this.movementSpeed < -this.speed){
                            //      this.movementSpeed = -this.speed;
                            //}
                            //if (Math.abs(dTurn)<Math.abs(dTurnDestination)){
                            newAngle = this.addAngle(this.moveDirection, -1 * dTurn / Math.abs(dTurn), 32);
                            //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                            //}
                            this.moveDirection = newAngle;

                        } else if (Math.abs(dTurn) < 9) {
                            newAngle = this.addAngle(this.moveDirection, -dTurn / Math.abs(dTurn), 32);
                            this.moveDirection = newAngle;
                        } else {
                            this.movementSpeed = this.speed;
                        }

                        break;
                    case 'soft-hard':  
                        /*if(this.collisionWith && this.collisionWith.type=='vehicle' && Math.abs(dTurn)<2 ){
                             if(this.collisionWith.instructions.length==0 && this.collisionWith.orders.type == 'guard'){
                                 this.collisionWith.orders = {type:'make-way',for:this};

                             }
                        }*/
                        if (Math.abs(dTurn) == 0) { // Bumping into something ahead
                            this.movementSpeed = 0;

                            if (Math.abs(dTurnDestination) > 0) {
                                newAngle = this.addAngle(this.moveDirection, -1 * dTurnDestination / Math.abs(dTurnDestination), 32);
                            } else {
                                newAngle = this.addAngle(this.moveDirection, -1, 32);
                            }
                            //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                
                            this.moveDirection = newAngle;
                        } else if (Math.abs(dTurn) <= 2) { // Bumping into something ahead
                            this.movementSpeed = 0;
                            /*this.movementSpeed = this.speed*(this.collisionDistance-this.collisionRadius)/(this.softCollisionRadius - this.collisionRadius);
                            if (this.movementSpeed<0) {
                                this.movementSpeed = 0;
                            }*/
                            //this.movementSpeed  =this.speed/3;//-= this.speed*1/3;
                            newAngle = this.addAngle(this.moveDirection, -1 * dTurn / Math.abs(dTurn), 32);
                            //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                            this.moveDirection = newAngle;
                        } else if (Math.abs(dTurn) < 4) {
                            this.movementSpeed = 0;                                
                            //if (Math.abs(dTurn)<Math.abs(dTurnDestination)){
                            newAngle = this.addAngle(this.moveDirection, -1 * dTurn / Math.abs(dTurn), 32);
                            //}
                            //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                
                            this.moveDirection = newAngle;
                        } else if (Math.abs(dTurn) < 9) {
                            //this.movementSpeed = this.speed*(this.collisionDistance-this.collisionRadius)/(this.softCollisionRadius - this.collisionRadius);
                            //if (this.movementSpeed<0) {
                            this.movementSpeed = 0;
                            //}
                            //this.movementSpeed =this.speed/2;//-= this.speed/3;
                            newAngle = this.addAngle(this.moveDirection, -1 * dTurn / Math.abs(dTurn), 32);
                            //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                
                            this.moveDirection = newAngle;
                        } else {
                            this.movementSpeed = this.speed;
                            //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                
                            //newAngle = this.moveDirection;
                        }
                        break;

                    case 'soft':
                        if (Math.abs(dTurn) == 0) { // Bumping into something ahead
                            this.movementSpeed = this.speed * (this.collisionDistance - this.collisionRadius) / (this.softCollisionRadius - this.collisionRadius);
                            if (this.movementSpeed < 0) {
                                this.movementSpeed = 0;
                            }
                            if (Math.abs(dTurnDestination) > 0) {
                                newAngle = this.addAngle(this.moveDirection, -1 * dTurnDestination / Math.abs(dTurnDestination), 32);
                            } else {
                                newAngle = this.addAngle(this.moveDirection, -1, 32);
                            }
                            //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                            //this.moveDirection = newAngle;
                            //this.moveDirection = newAngle;
                        } else if (Math.abs(dTurn) <= 2) { // Bumping into something ahead
                            this.movementSpeed = this.speed * (this.collisionDistance - this.collisionRadius) / (this.softCollisionRadius - this.collisionRadius);
                            if (this.movementSpeed < 0) {
                                this.movementSpeed = 0;
                            }

                            newAngle = this.addAngle(this.moveDirection, -dTurn * 1, 32);
                            //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                            //this.moveDirection = newAngle;
                        } else if (Math.abs(dTurn) < 4) {
                            this.movementSpeed = this.speed * (this.collisionDistance - this.collisionRadius) / (this.softCollisionRadius - this.collisionRadius);
                            if (this.movementSpeed < 0) {
                                this.movementSpeed = 0;
                            }

                            newAngle = this.addAngle(this.moveDirection, -dTurn * 1, 32);
                            //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                            //this.moveDirection = newAngle;
                        } else if (Math.abs(dTurn) < 9) {
                            this.movementSpeed = this.speed;

                            newAngle = this.addAngle(this.moveDirection, -dTurn * 1, 32);
                            //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                            //this.moveDirection = newAngle;
                        } else {
                            this.movementSpeed = this.speed;
                            //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                            //newAngle = this.moveDirection;
                        }
                        break;
                }
            } else {
                this.movementSpeed = this.speed;
            }

            if (this.movementSpeed > this.speed) {
                this.movementSpeed = this.speed;
            } else if (this.movementSpeed < -this.speed) {
                this.movementSpeed = -this.speed;
            }
            if (this.moveDirection != newAngle) {
                this.instructions.push(<ITurnInstruction>{ type: 'turn', toDirection: newAngle });
            }
            var magTurn = Math.abs(this.angleDiff(this.moveDirection, newAngle, 32));
            //if (magTurn<2 || this.colliding){
                    
            var collision2;
            for (var k = 0; k < obstructionGrid.length; k++) {
                for (var l = 0; l < obstructionGrid[k].length; l++) {
                    if (obstructionGrid[k][l] > 0) {
                        //alert((k+0.5)*game.gridSize +' '+(l+0.5)*game.gridSize + ' game.gridSize*0.5')
                        var tile = {
                            x: (l + 0.5),
                            y: (k + 0.5),
                            collisionRadius: gridSize * 0.5,
                            softCollisionRadius: gridSize * 0.7
                        };
                        if (collision2 = this.collision(tile, gridSize)) {
                            break;
                        }
                    }
                }
            };

            if (magTurn < 3 || this.colliding) {
                this.instructions.push(<IMoveInstruction>{ type: 'move', distance: 1 });
            }

            var turretAngle;
            if (turretAtTarget) {
                turretAngle = this.findAngle(destination, this, 32);
            } else {
                //turretAngle = this.moveDirection;
                //if (this.path.length>0)
                turretAngle = this.findAngle(this.path[1], this.path[0], 32); 
                // turretAngle = findAngle({x:targetX,y:targetY},this,32);
                //this.turretDirection = newAngle;
            }
            if (this.turretDirection != turretAngle) {
                this.instructions.push(<ITurnInstruction>{ type: 'aim', toDirection: turretAngle });
            }


        }
    }

    move(speedAdjustmentFactor: number, gridSize: number, sounds: Sounds, bulletDrawer: IBulletDrawer) {
        this.moving = false;
        this.attacking = false;
        if (!this.instructions) {
            this.instructions = [];
        }
        if (this.instructions.length == 0) {

            return;
        }

        for (var i = 0; i < this.instructions.length; i++) {
            var instr = this.instructions[i];
            if (instr.type == 'turn') {
                var turnInstr = <ITurnInstruction>instr;
                if (turnInstr.toDirection == this.moveDirection) {
                    // instruction complete...
                    instr.type = 'done';
                    //return;
                }
                if ((turnInstr.toDirection > this.moveDirection && (turnInstr.toDirection - this.moveDirection) < 16)
                    || (turnInstr.toDirection < this.moveDirection && (this.moveDirection - turnInstr.toDirection) > 16)) {
                    //alert(this.turnSpeed*0.05)
                    this.moveDirection = this.moveDirection + this.turnSpeed * 0.1;
                    if ((this.moveDirection - turnInstr.toDirection) * (this.moveDirection + this.turnSpeed * 0.1 - turnInstr.toDirection) <= 0) {
                        this.moveDirection = turnInstr.toDirection;
                    }
                } else {
                    this.moveDirection = this.moveDirection - this.turnSpeed * 0.1;
                    if ((this.moveDirection - turnInstr.toDirection) * (this.moveDirection - this.turnSpeed * 0.1 - turnInstr.toDirection) <= 0) {
                        this.moveDirection = turnInstr.toDirection;
                    }
                }
                if (this.moveDirection > 31) {
                    this.moveDirection = 0;
                } else if (this.moveDirection < 0) {
                    this.moveDirection = 31;
                }
            }

            if (instr.type == 'move') {
                //alert(1);
                var moveInstr = <IMoveInstruction>instr;
                if (moveInstr.distance <= 0) {
                    //this.instructions.splice(0,1);
                    //return;
                    instr.type = 'done';
                    return;
                }
                this.moving = true;
                //alert(this.movementSpeed)
                var movement = this.movementSpeed * speedAdjustmentFactor / gridSize;
                moveInstr.distance -= movement;
                var angle = (this.moveDirection / 32) * 2 * Math.PI;

                this.x = (this.x - movement * Math.sin(angle));
                this.y = (this.y - movement * Math.cos(angle));

            }
            if (instr.type == 'aim') {
                var aimInstr = <IAimInstruction>instr;
	            
                //alert('aiming: ' + instr.toDirection + ' and turret is at '+this.turretDirection)
                if (aimInstr.toDirection == this.turretDirection) {
                    // instruction complete...
                    instr.type = 'done';
                    //return;
                } else {

                    var delta = this.angleDiff(Math.floor(this.turretDirection), Math.floor(aimInstr.toDirection), 32);
                    if (Math.abs(delta) < 1) {
                        //this.turretDirection = instr.toDirection
                        this.turretDirection = aimInstr.toDirection;
                        instr.type = 'done';
                    } else {
                        this.turretDirection = this.addAngle(this.turretDirection, delta / Math.abs(delta), 32)
                    }
                }
            }

            if (instr.type == 'fire') {
                // alert(this.fireCounter)
                if (!this.bulletFiring) {
                    sounds.play('tank_fire');
                    this.bulletFiring = true;
                    var angle = (this.turretDirection / 32) * 2 * Math.PI;
                    bulletDrawer.fireBullet({ x: this.x, y: this.y, angle: angle, range: this.sight, source: this });
                }


            }
        };
    }

    findPath(
        start: [number, number],
        end: [number, number],
        isHeroTeam: boolean,
        obstructionGrid: number[][],
        heroObstructionGrid: number[][],
        debugMode: boolean,
        context: CanvasRenderingContext2D,
        gridSize: number,
        screen: GameScreen) {
        var g = isHeroTeam ? heroObstructionGrid : obstructionGrid;
        // hack to find path to buildings
        try {
            g[end[1]][end[0]] = 0;
            g[start[1]][start[0]];
            //alert(end.y)
        } catch (err) {
            return [{ x: start[0], y: start[1] }, { x: end[0], y: end[1] }];
        }

        var path = AStar(g, start, end, 'Euclidean');
        this.shortenPath(path, g);
        if (path.length > 1 && debugMode) {
            for (var k = 0; k < path.length; k++) {
                //game.highlightGrid(path[k].x,path[k].y,1,1,'rgba(100,100,100,0.3)');
                context.beginPath();
                context.fillStyle = 'rgba(150,50,100,0.5)';
                context.arc((path[k].x + 0.5) * gridSize + screen.viewportAdjust.x, (path[k].y + 0.5) * gridSize + screen.viewportAdjust.y, 5, 0, 2 * Math.PI);
                context.fill();
            }
        }
        return path;
    }

    private shortenPath(path: IPoint[], grid: number[][]): void {
        //alert(1);
        //return;
        var nextCellVisible = true;
        var start = path[0];
        //alert(0)
        while (nextCellVisible && path.length > 2) {
            //alert(0.5)
            var next = path[2];
            if (Math.abs(next.y - start.y) > Math.abs(next.x - start.x)) {
                //along y

                var slope = (next.x - start.x) / (next.y - start.y);
                var deltaY = 0.4 * (next.y - start.y) / Math.abs((next.y - start.y));
                var y = deltaY;
                var test = { x: start.x + y * slope, y: start.y + y }
                while (nextCellVisible && Math.abs(test.y - next.y) > 0.3) {
                    //alert(test.y)

                    if (grid[Math.floor(test.y)][Math.floor(test.x)] > 0) {
                        nextCellVisible = false;
                    }
                    y += deltaY;
                    test = { x: start.x + y * slope, y: start.y + y };
                }
                //nextCellVisible = false;
            } else {
                //alert(2);
                var slope = (next.y - start.y) / (next.x - start.x);
                var deltaX = 0.4 * (next.x - start.x) / Math.abs(next.x - start.x);
                var x = deltaX;
                var test = { x: start.x + x, y: start.y + slope * x }
                while (nextCellVisible && Math.abs(test.x - next.x) >= 0.3) {
                    if (grid[Math.floor(test.y)][Math.floor(test.x)] > 0) {
                        nextCellVisible = false;
                    }
                    x += deltaX;
                    test = { x: start.x + x, y: start.y + slope * x };
                }
                //along x
                //nextCellVisible = false;
            }
            if (nextCellVisible) {
                path.splice(1, 1);

                //alert(path.length)
            }
        }
    }

    collision(otherUnit: ICollidable, gridSize: number): ICollisionType {
        if (this == otherUnit) {
            return null;
        }
	        
        //alert(otherUnit.x + ' ' + otherUnit.y)
        var distanceSquared = Math.pow(this.x - otherUnit.x, 2) + Math.pow(this.y - otherUnit.y, 2);
        var radiusSquared = Math.pow((this.collisionRadius + otherUnit.collisionRadius) / gridSize, 2);
        var softHardRadiusSquared = Math.pow((this.softCollisionRadius + otherUnit.collisionRadius) / gridSize, 2);
        var softRadiusSquared = Math.pow((this.softCollisionRadius + otherUnit.softCollisionRadius) / gridSize, 2);


        if (distanceSquared <= radiusSquared) {
            return { type: 'hard', distance: Math.pow(distanceSquared, 0.5) };
        } else if (distanceSquared < softHardRadiusSquared) {
            return { type: 'soft-hard', distance: Math.pow(distanceSquared, 0.5) };
        } else if (distanceSquared <= softRadiusSquared) {
            return { type: 'soft', distance: Math.pow(distanceSquared, 0.5) };
        } else {
            return null;
        }
    }
}

export = Vehicle;