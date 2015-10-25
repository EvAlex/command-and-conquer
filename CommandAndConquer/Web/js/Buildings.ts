
import VisualObject = require('./VisualObject');

class Buildings extends VisualObject {

    loaded = false;
    types = [];

    buildingDetails = {
        'construction-yard': {
            name: 'construction-yard',
            label: 'Construction Yard',
            type: 'building',
            powerIn: 15,
            powerOut: 30,
            cost: 5000,
            sight: 3,
            hitPoints: 400,
            imagesToLoad: [
                { name: 'build', count: 32 },
                { name: "damaged", count: 4 },
                { name: 'damaged-construct', count: 20 },
                { name: "healthy", count: 4 },
                { name: 'healthy-construct', count: 20 },
                { name: "ultra-damaged", count: 1 }],
            gridShape: [
                [1, 1, 1],
                [1, 1, 1]]
        },
        'refinery': {
            name: 'refinery',
            label: 'Tiberium Refinery',
            type: 'building',
            powerIn: 40,
            powerOut: 10,
            cost: 2000,
            tiberiumStorage: 1000,
            sight: 4,
            hitPoints: 450,
            imagesToLoad: [
                { name: 'build', count: 20 },
                { name: "damaged", count: 12 },
                { name: 'damaged-unload', count: 18 },
                { name: "healthy", count: 12 },
                { name: 'healthy-unload', count: 18 },
                { name: "ultra-damaged", count: 1 }],
            gridShape: [
                [1, 1, 1],
                [1, 1, 1],
                [1, 1, 1]]
        },
        'barracks': {
            name: 'barracks',
            label: 'Barracks',
            type: 'building',
            powerIn: 20,
            cost: 300,
            sight: 3,
            hitPoints: 400,
            imagesToLoad: [
                { name: 'build', count: 20 },
                { name: "damaged", count: 10 },
                { name: "healthy", count: 10 },
                { name: "ultra-damaged", count: 1 }],
            gridShape: [[1, 1],
                [1, 1]]

        },
        'power-plant': {
            name: 'power-plant',
            label: 'Power Plant',
            type: 'building',
            powerOut: 100,
            cost: 300,
            sight: 2,
            hitPoints: 200,
            imagesToLoad: [
                { name: 'build', count: 20 },
                { name: "damaged", count: 4 },
                { name: "healthy", count: 4 },
                { name: "ultra-damaged", count: 1 }],
            gridShape: [[1, 0],
                [1, 1]]
        },
        'advanced-power-plant': {
            name: 'advanced-power-plant',
            label: 'Advanced Power Plant',
            type: 'building',
            powerOut: 200,
            cost: 700,
            sight: 2,
            hitPoints: 300,
            imagesToLoad: [
                { name: 'build', count: 20 },
                { name: "damaged", count: 4 },
                { name: "healthy", count: 4 },
                { name: "ultra-damaged", count: 1 }],
            gridShape: [[1, 0],
                [1, 1]]
        },
        'tiberium-silo': {
            name: 'tiberium-silo',
            label: 'Tiberium Silo',
            type: 'building',
            powerIn: 10,
            cost: 150,
            sight: 2,
            hitPoints: 150,
            imagesToLoad: [
                { name: 'build', count: 20 },
                { name: "damaged", count: 5 },
                { name: "healthy", count: 5 },
                { name: "ultra-damaged", count: 1 }],
            gridShape: [[1, 1]]
        },
        'hand-of-nod': {
            name: 'hand-of-nod',
            label: 'Hand of Nod',
            type: 'building',
            powerIn: 20,
            cost: 300,
            sight: 3,
            hitPoints: 400,
            imagesToLoad: [
                { name: 'build', count: 20 },
                { name: "damaged", count: 1 },
                { name: "healthy", count: 1 },
                { name: "ultra-damaged", count: 1 }],
            gridShape: [[0, 0],
                [1, 1],
                [1, 1]]
        },
        'weapons-factory': {
            name: 'weapons-factory',
            label: 'Weapons Factory',
            type: 'building',
            powerIn: 30,
            cost: 2000,
            sight: 3,
            hitPoints: 200,
            imagesToLoad: [
                { name: 'build', count: 20 },
                { name: "damaged", count: 1 },
                { name: 'damaged-base', count: 1 },
                { name: 'damaged-construct', count: 9 },

                { name: "healthy", count: 1 },
                { name: 'healthy-base', count: 1 },
                { name: 'healthy-construct', count: 9 },
                { name: "ultra-damaged", count: 0 },
                { name: 'ultra-damaged-base', count: 1 }
            ],
            gridShape: [[1, 1, 1],
                [1, 1, 1],
                [1, 1, 1]]
        }
    };

    preloadCount = 0;
    loadedCount = 0;

    draw() {

        var teamYOffset = 0;
        if (this.team != game.currentLevel.team) {
            teamYOffset = this.pixelHeight;
        }
            
        //First draw the bottom grass
        context.drawImage(this.bibImage, this.x * game.gridSize + game.viewportAdjustX, (this.y + this.gridHeight - 1) * game.gridSize + game.viewportAdjustY);




        var life = this.getLife(),
            imageCategory: string;
        if (this.status == "build" || this.status == "sell") {
            imageCategory = 'build';
        } else if (this.status == "" || this.life == "ultra-damaged") {
            imageCategory = this.life;
        } else {
            imageCategory = this.life + "-" + this.status;
        }


        var imageWidth = this.gridShape[0].length * game.gridSize;
        var imageHeight = this.spriteImage.height;
            
        // Then draw the base with baseOffset
        var baseImage = this.spriteArray[this.life + "-base"];
        if (baseImage && this.status != 'build' && this.status != 'sell') {
            context.drawImage(this.spriteCanvas, baseImage.offset * imageWidth, teamYOffset, imageWidth, imageHeight, game.gridSize * (this.x) + game.viewportAdjustX, (this.y) * game.gridSize + game.viewportAdjustY, imageWidth, imageHeight);
        }
	        
	        
        // Finally draw the top part with appropriate animation
	        
        var imageList = this.spriteArray[imageCategory];
        if (!this.animationIndex) {
            this.animationIndex = 0;
        }
        if (imageList.count >= Math.floor(this.animationIndex / this.animationSpeed)) {
            var imageIndex = Math.floor(this.animationIndex / this.animationSpeed);
            if (this.status == 'sell') {
                imageIndex = imageList.count - 1 - Math.floor(this.animationIndex / this.animationSpeed);
            }
            context.drawImage(this.spriteCanvas, (imageList.offset + imageIndex) * imageWidth, teamYOffset, imageWidth, imageHeight, game.gridSize * (this.x) + game.viewportAdjustX, (this.y) * game.gridSize + game.viewportAdjustY, imageWidth, imageHeight);
        }


        this.animationIndex++;
        if (this.animationIndex / this.animationSpeed >= imageList.count) {
            this.animationIndex = 0;
            if (this.name == 'refinery' && (this.status == "build" || this.status == 'unload')) {
                if (this.status == 'build') {
                    game.units.push(vehicles.add({
                        name: 'harvester', team: this.team, x: this.x + 0.5,
                        y: this.y + 2, moveDirection: 14, orders: { type: 'harvest', from: this }
                    }));
                    this.status = "";
                } else {
                    if (this.harvester.tiberium) {
                        var subtractAmount = this.harvester.tiberium > 4 ? 5 : this.harvester.tiberium;
                        if (this.team == game.currentLevel.team) {
                            sidebar.cash += subtractAmount * 50;
                        } else {
                            ai.cash += subtractAmount;
                        }

                        this.harvester.tiberium -= subtractAmount;
                    }
                    if (!this.harvester.tiberium) {
                        game.units.push(vehicles.add({
                            name: 'harvester', team: this.team, x: this.x + 0.5,
                            y: this.y + 2, health: this.harvester.health, moveDirection: 14, orders: { type: 'harvest', from: this, to: this.harvester.orders.from }
                        }));
                        this.harvester = null;
                        this.status = "";
                    }
                }



            } else if (this.status == "build" || this.status == "construct" || this.status == "unload") {
                this.status = "";
            }
            if (this.status == 'sell') {
                this.status = 'destroy';
            }
        }

        this.drawSelection();
        if (this.repairing) {
            //alert('repairing');
            context.globalAlpha = sidebar.textBrightness;
            context.drawImage(sidebar.repairImageBig, (this.x + this.gridShape[0].length / 2 - 1) * game.gridSize + game.viewportAdjustX, (this.y + this.gridShape.length / 2 - 1) * game.gridSize + game.viewportAdjustY);
            context.globalAlpha = 1;

            if (this.health >= this.hitPoints) {
                this.repairing = false;
                this.health = this.hitPoints;
            } else {
                var cashSpent = 1;
                if (sidebar.cash > cashSpent) {
                    sidebar.cash -= cashSpent;
                    this.health += (cashSpent * 2 * this.hitPoints / this.cost);
                    //console.log (this.health + " " +2*cashSpent*this.hitPoints/this.cost)     
                }
            }
        }

    }

    load(name) {
        var details = this.buildingDetails[name];
        var buildingType = {
            defaults: {
                type: 'building',
                draw: buildings.draw,
                underPoint: underPoint,
                drawSelection: drawSelection,
                getLife: getLife,
                animationSpeed: 2,
                status: "",
                health: details.hitPoints,
                gridHeight: details.gridShape.length,
                gridWidth: details.gridShape[0].length,
                pixelHeight: details.gridShape.length * game.gridSize,
                pixelWidth: details.gridShape[0].length * game.gridSize,
                bibImage: this.preloadImage('buildings/bib/bib-' + details.gridShape[0].length + '.gif'),
                pixelOffsetX: 0,
                pixelOffsetY: 0,
                pixelTop: 0,
                pixelLeft: 0

            }
        };

        this.loadSpriteSheet(buildingType, details, 'buildings');

        $.extend(buildingType, details);
        this.types[name] = buildingType;
    }

    add(details) {
        var newBuilding = {
            team: game.currentLevel.team
        };
        //alert(game.currentLevel.team)
        var name = details.name;
        $.extend(newBuilding, this.types[name].defaults);
        $.extend(newBuilding, this.types[name]);
        $.extend(newBuilding, details);

        return newBuilding;
    }



}

export = Buildings;