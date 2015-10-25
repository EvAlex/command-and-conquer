
import VisualObject = require('./VisualObject');

class Overlay extends VisualObject {
    types = [];
    overlayDetails = {
        'tiberium': {
            name: 'tiberium',
            count: 2,
            pixelWidth: 24,
            pixelHeight: 24,
            stageCount: 12,
            gridOffsetX: 0,
            gridOffsetY: 0,
            imagesToLoad: [
                { name: '0', count: 12 },
                { name: '1', count: 12 }
            ]
        },
        'tree': {
            name: 'tree',
            count: 1,
            stageCount: 10,
            pixelWidth: 48,
            pixelHeight: 48,
            gridOffsetX: 0,
            gridOffsetY: -1,
            imagesToLoad: [
                { name: '0', count: 10 },
                { name: '1', count: 10 },
                { name: '2', count: 10 }
            ]
        },
        'trees': {
            name: 'trees',
            count: 1,
            stageCount: 10,
            gridOffsetX: 0,
            gridOffsetY: -1,
            pixelWidth: 72,
            pixelHeight: 48,
            imagesToLoad: [
                { name: '0', count: 10 }
            ]
        }
    };

    load(name) {
        var overlayType = {
            name: name,
            draw: this.draw
        }
        var details = this.overlayDetails[name];

        this.loadSpriteSheet(overlayType, details, 'tiles/temperate')
        /*
        var imageArray = [];
        for(i=0;i<details.count;i++){
            imageArray[i] = this.loadImageArray('tiles/temperate/'+name+'/'+name+'-'+i,details.stageCount,'.gif');
        }
        overlayType.imageArray = imageArray;
        */
        $.extend(overlayType, details)
        this.types[name] = overlayType;
    }

    draw() {
	        
        // Finally draw the top part with appropriate animation
        var imageWidth = this.pixelWidth;
        var imageHeight = this.pixelHeight;

        var x = Math.round((this.x + this.gridOffsetX) * game.gridSize + game.viewportAdjustX);
        var y = Math.round((this.y + this.gridOffsetY) * game.gridSize + game.viewportAdjustY);

        var imageList = this.spriteArray[this.type];
        var imageIndex = this.stage;
        context.drawImage(this.spriteCanvas, (imageList.offset + imageIndex) * imageWidth, 0, imageWidth, imageHeight, x, y, imageWidth, imageHeight);

        return;
    }

    loadAll() {
        this.load('tiberium');
        this.load('tree');
        this.load('trees');
    }

    add(details) {
        var newOverlay = {
            type: 0,
            stage: 0
        };
        var name = details.name;

        $.extend(newOverlay, this.types[name]);
        $.extend(newOverlay, details);
        return newOverlay;
    }

    loaded: true;
    preloadCount = 0;
    loadedCount = 0;

}

export = Overlay;