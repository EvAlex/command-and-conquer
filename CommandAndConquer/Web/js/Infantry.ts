
import VisualObject = require('./VisualObject');

class Infantry extends VisualObject {
    types = [];
    loaded: boolean = true;
    infantryDetails = {
        'minigunner': {
            name: 'minigunner',
            label: 'Minigunner',
            speed: 8,
            cost: 100,
            sight: 1,
            hitPoints: 50,
            collisionRadius: 5,
            imagesToLoad: [
                { name: 'stand', count: 1, directionCount: 8 },
                { name: "walk", count: 6, directionCount: 8 },
                { name: "fire", count: 8, directionCount: 8 }
            ]
        }
    };
    preloadCount: number = 0;
    loadedCount: number = 0;

    collision(otherUnit) {
        if (this == otherUnit) {
            return false;
        }
        var distanceSquared = Math.pow(this.x - otherUnit.x, 2) + Math.pow(this.y - otherUnit.y, 2);
        var radiusSquared = Math.pow((this.collisionRadius + otherUnit.collisionRadius) / game.gridSize, 2);
        //alert(distanceSquared +' '+ radiusSquared)
        return distanceSquared <= radiusSquared;
    };

    load(name) {
        var details = this.infantryDetails[name];
        var infantryType = {
            defaults: {
                type: 'infantry',
                draw: this.draw,
                drawSelection: drawSelection,
                underPoint: underPoint,
                collision: this.collision,
                move: this.move,
                getLife: getLife,
                status: 'stand',
                animationSpeed: 4,
                health: details.hitPoints,
                pixelOffsetX: -50 / 2,
                pixelOffsetY: -39 / 2,
                pixelWidth: 16,
                pixelHeight: 16,
                pixelTop: 6,
                pixelLeft: 16
            },
            imageArray: []
        };

        //$.extend(infantryType,defaults);
            
        // Load all the images
        infantryType.imageArray = [];
        for (var i = details.imagesToLoad.length - 1; i >= 0; i--) {
            var constructImageCount = details.imagesToLoad[i].count;
            var constructImageDirectionCount = details.imagesToLoad[i].directionCount;
            var constructImageName = details.imagesToLoad[i].name;
            var imgArray = [];
            for (var j = 0; j < constructImageDirectionCount; j++) {
                imgArray[j] = (this.loadImageArray('units/infantry/' + name + '/' + name + '-' + constructImageName + '-' + j, constructImageCount, '.gif'));
            }
            //alert(imgArray)
            infantryType.imageArray[constructImageName] = imgArray;
        }
        // Add all the basic unit details
        $.extend(infantryType, details);
        this.types[name] = infantryType;
    }

    draw() {
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
	        
        var x = this.x * game.gridSize + game.viewportAdjustX + this.pixelOffsetX;
        var y = this.y * game.gridSize + game.viewportAdjustY + this.pixelOffsetY;

        debugger;
        console.error('drawSprite() not implemented here'); 
        //drawSprite(moveImage, x, y, this.team, this.type);
        ////context.fillRect(this.x*game.gridSize+game.viewportAdjustX+this.pixelWidth/2,this.y*game.gridSize+game.viewportAdjustY+this.pixelHeight/2,10,10);
        this.drawSelection();
    }

    add(details) {
        var newInfantry = {
            moveDirection: 0,
            animationIndex: 0,
            team: game.currentLevel.team
        };
        var name = details.name;

        $.extend(newInfantry, this.types[name].defaults);
        $.extend(newInfantry, this.types[name]);
        $.extend(newInfantry, details);

        return newInfantry;
    }

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

}

export = Infantry;