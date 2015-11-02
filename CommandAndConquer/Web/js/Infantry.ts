
import DestructibleObject = require('./DestructibleObject');

class Infantry extends DestructibleObject implements IUnit {

    constructor(health: number) {
        super('infantry');
        this.health = health;
        this.status = 'stand';
        this.animationSpeed = 4;
        this.pixelOffsetX = -50 / 2;
        this.pixelOffsetY = -39 / 2;
        this.pixelWidth = 16;
        this.pixelHeight = 16;
        this.pixelTop = 6;
        this.pixelLeft = 16
    }

    animationSpeed: number;
    attacking: boolean;
    bulletFiring: boolean;
    moveDirection: number;
    moveImageCount: number;
    movementSpeed: number;
    moving: boolean;
    orders: IOrder;
    path: IPoint[];
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

    cost: number;
    defaults: IUnit;
    label: string;

    collisionRadius: number;
    softCollisionRadius: number;
    colliding: boolean
    collisionDistance: number;
    collisionType: string;
    collisionWith: ICollisionPoint;

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

    speedCounter: number;

    move() {
        if (!this.speedCounter) {
            this.speedCounter = 0;
        }
        this.speedCounter++;
        var angle = (this.moveDirection / 8) * 2 * Math.PI; //Math.round( (90+(unit.direction/32)*360)%360);
        ///alert(angle);
        if (this.status == 'walk') {
            this.x = this.x - 0.005 * this.speed * Math.sin(angle);
            this.y = this.y - 0.005 * this.speed * Math.cos(angle);
        }
        if (this.speedCounter >= 7) {
            this.speedCounter = 0;

            this.moveDirection = Math.floor(this.moveDirection + (Math.round((Math.random() - 0.5) * 10) * 1 / 10));
            if (this.moveDirection > 7) {
                this.moveDirection = 0;
            } else if (this.moveDirection < 0) {
                this.moveDirection = 7;
            }
            this.status = Math.random() > 0.7 ? 'fire' : Math.random() > 0.7 ? 'stand' : 'walk';
            /*if (this.status == 'fire'){
                sounds.play('machine_gun');
            }*/
        }
    }

    animationIndex: number;
    imageArray: number[][];

    draw(context: CanvasRenderingContext2D, gridSize: number, screen: IGameScreen, sidebar: ISidebar) {
        //alert(this.status);
        //alert(this.imageArray[this.status][this.moveDirection])
        var imageList = this.imageArray[this.status][this.moveDirection];
        //alert(imageList.length)
	        
        this.animationIndex++;

        if (this.animationIndex / this.animationSpeed >= imageList.length) {
            //alert(this.animationIndex + ' / '+ this.animationSpeed)
            this.animationIndex = 0;

        }
        var moveImage = imageList[Math.floor(this.animationIndex / this.animationSpeed)];
            
        //alert(this.moveOffsetX)
	        
        var x = this.x * gridSize + screen.viewportAdjust.x + this.pixelOffsetX;
        var y = this.y * gridSize + screen.viewportAdjust.y + this.pixelOffsetY;

        debugger;
        console.error('drawSprite() not implemented here'); 
        //drawSprite(moveImage, x, y, this.team, this.type);
        ////context.fillRect(this.x*game.gridSize+game.viewportAdjustX+this.pixelWidth/2,this.y*game.gridSize+game.viewportAdjustY+this.pixelHeight/2,10,10);
        this.drawSelection(context, gridSize, screen, sidebar);
    }
}

export = Infantry;