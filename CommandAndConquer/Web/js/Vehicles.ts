
import VisualObject = require('./VisualObject');
import Vehicle = require('./Vehicle');

class Vehicles extends VisualObject {
    loaded: boolean = false;
    types = [];
    vehicleDetails = {
        'mcv': {
            name: 'mcv',
            label: 'Mobile Construction Vehicle',
            type: 'vehicle',
            turnSpeed: 5,
            speed: 12,
            cost: 5000,
            hitPoints: 200,
            sight: 2,
            moveImageCount: 32,
            pixelWidth: 48,
            pixelHeight: 48,
            pixelOffsetX: -24,
            pixelOffsetY: -24,
            collisionRadius: 12, //20
            softCollisionRadius: 16,
            imagesToLoad: [
                { name: 'move', count: 32 }
            ],

        },
        'harvester': {
            name: 'harvester',
            label: 'Harvester',
            type: 'vehicle',
            turnSpeed: 5,
            speed: 12,
            cost: 1400,
            hitPoints: 600,
            sight: 2,
            tiberium: 0,
            moveImageCount: 32,
            imagesToLoad: [
                { name: 'move', count: 32 },
                { name: 'harvest-00', count: 4 },
                { name: 'harvest-04', count: 4 },
                { name: 'harvest-08', count: 4 },
                { name: 'harvest-12', count: 4 },
                { name: 'harvest-16', count: 4 },
                { name: 'harvest-20', count: 4 },
                { name: 'harvest-24', count: 4 },
                { name: 'harvest-28', count: 4 },
            ],
            pixelWidth: 48,
            pixelHeight: 48,
            pixelOffsetX: -24,
            pixelOffsetY: -24,
            collisionRadius: 6, //20
            softCollisionRadius: 12
        },
        'light-tank': {
            name: 'light-tank',
            label: 'Light Tank',
            type: 'vehicle',
            turnSpeed: 5,
            speed: 18,
            cost: 600,
            sight: 3,
            hitPoints: 300,
            primaryWeapon: 9,
            reloadTime: 2000,
            moveImageCount: 32,
            turretImageCount: 32,
            imagesToLoad: [
                { name: 'move', count: 32 },
                { name: 'turret', count: 32 }
            ],

            pixelWidth: 24,
            pixelHeight: 24,
            pixelOffsetX: -12,
            pixelOffsetY: -12,
            collisionRadius: 5,
            softCollisionRadius: 9 //10
        }
    };

    preloadCount: number = 0;
    loadedCount: number = 0;

    collision(otherUnit) {
        if (this == otherUnit) {
            return null;
        }
	        
        //alert(otherUnit.x + ' ' + otherUnit.y)
        var distanceSquared = Math.pow(this.x - otherUnit.x, 2) + Math.pow(this.y - otherUnit.y, 2);
        var radiusSquared = Math.pow((this.collisionRadius + otherUnit.collisionRadius) / game.gridSize, 2);
        var softHardRadiusSquared = Math.pow((this.softCollisionRadius + otherUnit.collisionRadius) / game.gridSize, 2);
        var softRadiusSquared = Math.pow((this.softCollisionRadius + otherUnit.softCollisionRadius) / game.gridSize, 2);


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

    load(name) {
        var details = this.vehicleDetails[name];
        var vehicleType = {
            defaults: {
                type: 'vehicle',
                draw: this.draw,
                drawSelection: drawSelection,
                underPoint: underPoint,
                processOrders: this.processOrders,
                moveTo: this.moveTo,
                move: this.move,
                collision: this.collision,
                getLife: getLife,
                animationSpeed: 4,
                health: details.hitPoints,
                pixelLeft: 0,
                pixelTop: 0,
                pixelOffsetX: 0,
                pixelOffsetY: 0,
                moveDirection: 0,
                turretDirection: 0,
                status: ''
            }
        };

        this.loadSpriteSheet(vehicleType, details, 'units/vehicles');

        $.extend(vehicleType, details);
        this.types[name] = (vehicleType);
    }

    draw() {
	        
        // Finally draw the top part with appropriate animation
        var imageWidth = this.pixelWidth;
        var imageHeight = this.pixelHeight;
        var x = Math.round(this.x * game.gridSize + this.pixelOffsetX + game.viewportAdjustX);
        var y = Math.round(this.y * game.gridSize + this.pixelOffsetY + game.viewportAdjustY);
        var teamYOffset = 0;
        if (this.team != game.currentLevel.team) {
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
            if (this.animationIndex / this.animationSpeed >= imageList.count) {
                //alert(this.animationIndex + ' / '+ this.animationSpeed)
                this.animationIndex = 0;
                if (this.status.indexOf('harvest') > -1) {
                    if (!this.tiberium) {
                        this.tiberium = 0;
                    }
                    this.tiberium++;
                    if (this.tiberium % 5 == 0) {
                        this.orders.to.stage--;
                    }

                }
                this.status = "";

            }
        }

        if (this.turretDirection >= 0) {
            var turretList = this.spriteArray['turret'];
            if (turretList) {
                var imageIndex = Math.floor(this.turretDirection);
                context.drawImage(this.spriteCanvas, (turretList.offset + imageIndex) * imageWidth, teamYOffset, imageWidth, imageHeight, x, y, imageWidth, imageHeight);
            }
        }




        this.drawSelection();
        if (game.debugMode) {

            context.fillStyle = 'white';
            context.fillText(this.orders.type, x, y);
            context.fillText(Math.floor(this.x) + ',' + Math.floor(this.y), x, y + 10);
            this.orders.to && context.fillText(this.orders.to.x + ',' + this.orders.to.y, x, y + 20);
        }

        if (game.debugMode) {
            context.fillStyle = 'rgba(100,200,100,0.4)';
            context.beginPath();
            context.arc(this.x * game.gridSize + game.viewportAdjustX, this.y * game.gridSize + game.viewportAdjustY, this.softCollisionRadius, 0, Math.PI * 2);
            context.fill();


            context.fillStyle = 'rgba(200,0,0,0.4)';
            context.beginPath();
            context.arc(this.x * game.gridSize + game.viewportAdjustX, this.y * game.gridSize + game.viewportAdjustY, this.collisionRadius, 0, Math.PI * 2);
            context.fill();


        }

    }

    movementSpeed: number = 0;

    moveTo(destination, turretAtTarget) {
        var start = [Math.floor(this.x), Math.floor(this.y)];
        var end = [destination.x, destination.y];
        this.path = findPath(start, end, this.team == game.currentLevel.team);
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
            var newAngle = findAngle(this.path[1], this.path[0], 32);
            var movement = this.movementSpeed * game.speedAdjustmentFactor / game.gridSize;

            var angleRadians = (this.moveDirection / 32) * 2 * Math.PI;
            this.x = (this.x - movement * Math.sin(angleRadians));
            this.y = (this.y - movement * Math.cos(angleRadians));
            this.colliding = false;

            var collision;
            for (var k = game.units.length - 1; k >= 0; k--) {

                if (collision = this.collision(game.units[k])) {
                    if (collision.distance < this.collisionDistance) {
                        this.collisionType = collision.type;
                        this.collisionDistance = collision.distance;
                        this.collisionWith = game.units[k];
                        this.colliding = true;
                        //alert('colliding' + this.collisionType)
                    }
                }
            };

            for (var k = 0; k < game.obstructionGrid.length; k++) {
                for (var l = 0; l < game.obstructionGrid[k].length; l++) {
                    if (game.obstructionGrid[k][l] > 0) {
                        //alert((k+0.5)*game.gridSize +' '+(l+0.5)*game.gridSize + ' game.gridSize*0.5')
                        var tile = {
                            x: (l + 0.5), y: (k + 0.5),
                            collisionRadius: game.gridSize * 0.5, softCollisionRadius: game.gridSize * 0.7
                        };
                        if (collision = this.collision(tile)) {
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
                var collDirection = findAngle(this.collisionWith, this, 32);
                var dTurn = angleDiff(this.moveDirection, collDirection, 32);
                var dTurnDestination = angleDiff(newAngle, collDirection, 32);
                   
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
                                newAngle = addAngle(this.moveDirection, -1 * dTurnDestination / Math.abs(dTurnDestination), 32);
                            } else {
                                newAngle = addAngle(this.moveDirection, -1, 32);
                            }
                                
                                
                            ////console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                            this.moveDirection = newAngle;

                        } else if (Math.abs(dTurn) <= 2) { // Bumping into something ahead
    
                            //if (Math.abs(dTurn)<Math.abs(dTurnDestination)){
                            newAngle = addAngle(this.moveDirection, -1 * dTurn / Math.abs(dTurn), 32);
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
                            newAngle = addAngle(this.moveDirection, -1 * dTurn / Math.abs(dTurn), 32);
                            //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                            //}
                            this.moveDirection = newAngle;

                        } else if (Math.abs(dTurn) < 9) {
                            newAngle = addAngle(this.moveDirection, -dTurn / Math.abs(dTurn), 32);
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
                                newAngle = addAngle(this.moveDirection, -1 * dTurnDestination / Math.abs(dTurnDestination), 32);
                            } else {
                                newAngle = addAngle(this.moveDirection, -1, 32);
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
                            newAngle = addAngle(this.moveDirection, -1 * dTurn / Math.abs(dTurn), 32);
                            //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                            this.moveDirection = newAngle;
                        } else if (Math.abs(dTurn) < 4) {
                            this.movementSpeed = 0;                                
                            //if (Math.abs(dTurn)<Math.abs(dTurnDestination)){
                            newAngle = addAngle(this.moveDirection, -1 * dTurn / Math.abs(dTurn), 32);
                            //}
                            //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                                
                            this.moveDirection = newAngle;
                        } else if (Math.abs(dTurn) < 9) {
                            //this.movementSpeed = this.speed*(this.collisionDistance-this.collisionRadius)/(this.softCollisionRadius - this.collisionRadius);
                            //if (this.movementSpeed<0) {
                            this.movementSpeed = 0;
                            //}
                            //this.movementSpeed =this.speed/2;//-= this.speed/3;
                            newAngle = addAngle(this.moveDirection, -1 * dTurn / Math.abs(dTurn), 32);
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
                                newAngle = addAngle(this.moveDirection, -1 * dTurnDestination / Math.abs(dTurnDestination), 32);
                            } else {
                                newAngle = addAngle(this.moveDirection, -1, 32);
                            }
                            //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                            //this.moveDirection = newAngle;
                            //this.moveDirection = newAngle;
                        } else if (Math.abs(dTurn) <= 2) { // Bumping into something ahead
                            this.movementSpeed = this.speed * (this.collisionDistance - this.collisionRadius) / (this.softCollisionRadius - this.collisionRadius);
                            if (this.movementSpeed < 0) {
                                this.movementSpeed = 0;
                            }

                            newAngle = addAngle(this.moveDirection, -dTurn * 1, 32);
                            //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                            //this.moveDirection = newAngle;
                        } else if (Math.abs(dTurn) < 4) {
                            this.movementSpeed = this.speed * (this.collisionDistance - this.collisionRadius) / (this.softCollisionRadius - this.collisionRadius);
                            if (this.movementSpeed < 0) {
                                this.movementSpeed = 0;
                            }

                            newAngle = addAngle(this.moveDirection, -dTurn * 1, 32);
                            //console.log('moving:' + this.moveDirection +' coll: '+this.collisionType+' '+collDirection + ' dTurn:' +dTurn + ' RESULT: newAngle:' +newAngle +' speed:'+this.movementSpeed);
                            //this.moveDirection = newAngle;
                        } else if (Math.abs(dTurn) < 9) {
                            this.movementSpeed = this.speed;

                            newAngle = addAngle(this.moveDirection, -dTurn * 1, 32);
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
                this.instructions.push({ type: 'turn', toDirection: newAngle });
            }
            var magTurn = Math.abs(angleDiff(this.moveDirection, newAngle, 32));
            //if (magTurn<2 || this.colliding){
                    
            var collision2;
            for (var k = 0; k < game.obstructionGrid.length; k++) {
                for (var l = 0; l < game.obstructionGrid[k].length; l++) {
                    if (game.obstructionGrid[k][l] > 0) {
                        //alert((k+0.5)*game.gridSize +' '+(l+0.5)*game.gridSize + ' game.gridSize*0.5')
                        var tile = {
                            x: (l + 0.5), y: (k + 0.5),
                            collisionRadius: game.gridSize * 0.5, softCollisionRadius: game.gridSize * 0.7
                        };
                        if (collision2 = this.collision(tile)) {
                            break;
                        }
                    }
                }
            };

            if (magTurn < 3 || this.colliding) {
                this.instructions.push({ type: 'move', distance: 1 });
            }

            var turretAngle;
            if (turretAtTarget) {
                turretAngle = findAngle(destination, this, 32);
            } else {
                //turretAngle = this.moveDirection;
                //if (this.path.length>0)
                turretAngle = findAngle(this.path[1], this.path[0], 32); 
                // turretAngle = findAngle({x:targetX,y:targetY},this,32);
                //this.turretDirection = newAngle;
            }
            if (this.turretDirection != turretAngle) {
                this.instructions.push({ type: 'aim', toDirection: turretAngle });
            }


        }
    }

    processOrders() {
        this.colliding = false;
        this.collisionType = '';
        this.collisionDistance = this.softCollisionRadius + 1;
        this.collisionWith = null;
        this.movementSpeed = 0;
        this.instructions = [];

        if (!this.orders) {
            this.orders = { type: 'guard' };
        }

        if (this.orders.type == 'harvest') {



            if (!this.orders.to) {
                this.orders.to = findTiberiumInRange(this);
            }
            if (!this.orders.to) {
                if (this.tiberium) {
                    this.orders = { type: 'harvest-return' };
                }
                return;
            }
            var distance = Math.pow(Math.pow(this.orders.to.y + 0.5 - this.y, 2) + Math.pow(this.orders.to.x + 0.5 - this.x, 2), 0.5);

            if (distance > 1.5 * this.softCollisionRadius / game.gridSize) {
                this.moveTo(this.orders.to);
            } else {
                if (this.tiberium && this.tiberium >= 14) {
                    this.orders = { type: 'harvest-return', to: this.orders.from, from: this.orders.to };
                    return;
                }

                if (this.orders.to.stage < 1) {
                    this.orders.to = findTiberiumInRange(this);
                } else {
                    if (!this.tiberium || this.tiberium < 14) {
                        if (this.status == "") {
                            this.status = "harvest-" + ((Math.floor(this.moveDirection / 4) * 4) < 10 ? '0' : '') + (Math.floor(this.moveDirection / 4) * 4);
                        }
                    }

                }
            }

        } else if (this.orders.type == 'harvest-return') {

            if (!this.orders.to) {
                this.orders.to = findRefineryInRange(this);
                if (!this.orders.to) {
                    return;
                }
            }

            var destination = { x: this.orders.to.x, y: this.orders.to.y + 2 };
            var distance = Math.pow(Math.pow(destination.y - this.y, 2) + Math.pow(destination.x - this.x, 2), 0.5);
            //alert(distance)
            if (distance > 3 * this.softCollisionRadius / game.gridSize) {
                this.moveTo(destination);
                //this.moveTo({x:10,y:10})
            } else if (this.orders.to.life != "ultra-damaged") {
                if (this.tiberium == 0) {
                    this.orders = { type: 'harvest', to: this.orders.from, from: this.orders.to };
                    return;
                }

                if (this.moveDirection != 14) {
                    this.instructions.push({ type: 'turn', toDirection: 14 });
                    return;
                }

                if (this.orders.to.status == "") {
                    this.status = 'destroy';   
                    //alert(this.orders.to.name)
                    //alert (this.name)
                    //alert(this.orders.from)
                    this.orders.to.harvester = this;
                    this.orders.to.status = 'unload';
                    this.orders.to.animationIndex = 0;

                }
            }
            return;
        } else if (this.orders.type == 'make-way') {
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

    move() {
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
                if (instr.toDirection == this.moveDirection) {
                    // instruction complete...
                    instr.type = 'done';
                    //return;
                }
                if ((instr.toDirection > this.moveDirection && (instr.toDirection - this.moveDirection) < 16)
                    || (instr.toDirection < this.moveDirection && (this.moveDirection - instr.toDirection) > 16)) {
                    //alert(this.turnSpeed*0.05)
                    this.moveDirection = this.moveDirection + this.turnSpeed * 0.1;
                    if ((this.moveDirection - instr.toDirection) * (this.moveDirection + this.turnSpeed * 0.1 - instr.toDirection) <= 0) {
                        this.moveDirection = instr.toDirection;
                    }
                } else {
                    this.moveDirection = this.moveDirection - this.turnSpeed * 0.1;
                    if ((this.moveDirection - instr.toDirection) * (this.moveDirection - this.turnSpeed * 0.1 - instr.toDirection) <= 0) {
                        this.moveDirection = instr.toDirection;
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
      	            
                if (instr.distance <= 0) {
                    //this.instructions.splice(0,1);
                    //return;
                    instr.type = 'done';
                    return;
                }
                this.moving = true;
                //alert(this.movementSpeed)
                var movement = this.movementSpeed * game.speedAdjustmentFactor / game.gridSize;
                instr.distance -= movement;
                var angle = (this.moveDirection / 32) * 2 * Math.PI;

                this.x = (this.x - movement * Math.sin(angle));
                this.y = (this.y - movement * Math.cos(angle));

            }
            if (instr.type == 'aim') {
	            
                //alert('aiming: ' + instr.toDirection + ' and turret is at '+this.turretDirection)
                if (instr.toDirection == this.turretDirection) {
                    // instruction complete...
                    instr.type = 'done';
                    //return;
                } else {

                    var delta = angleDiff(Math.floor(this.turretDirection), Math.floor(instr.toDirection), 32);
                    if (Math.abs(delta) < 1) {
                        //this.turretDirection = instr.toDirection
                        this.turretDirection = instr.toDirection;
                        instr.type = 'done';
                    } else {
                        this.turretDirection = addAngle(this.turretDirection, delta / Math.abs(delta), 32)
                    }
                }
            }

            if (instr.type == 'fire') {
                // alert(this.fireCounter)
                if (!this.bulletFiring) {
                    sounds.play('tank_fire');
                    this.bulletFiring = true;
                    var angle = (this.turretDirection / 32) * 2 * Math.PI;
                    game.fireBullet({ x: this.x, y: this.y, angle: angle, range: this.sight, source: this });
                }


            }
        };
    }

    add(details: IVehicleCreateDetails): Vehicle {
        var newVehicle = new Vehicle();
        newVehicle.team = details.team;
        var name = details.name;
        $.extend(newVehicle, this.types[name].defaults);

        $.extend(newVehicle, this.types[name]);
        $.extend(newVehicle, details);

        return newVehicle;
    }

}

interface IVehicleCreateDetails {
    name: string;
    x: number;
    y: number;
    team?: string;
    status?: string;
    health?: number;
    moveDirection?: number
    orders: IMoveOrder | IProtectOrder | IGuardOrder;
}



export = Vehicles;