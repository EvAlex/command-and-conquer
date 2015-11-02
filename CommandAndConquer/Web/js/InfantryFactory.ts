
import VisualObject = require('./VisualObject');
import Infantry = require('./Infantry')

class InfantryFactory extends VisualObject {

    types = [];
    loaded: boolean = true;
    infantryDetails = {
        'minigunner': {
            name: 'minigunner',
            label: 'Minigunner',
            speed: 8,
            cost: 100,
            sight: 1,
            maxHitPoints: 50,
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



    load(name) {
        var details = this.infantryDetails[name];
        var infantry = new Infantry(details.hitPoints);

        //$.extend(infantryType,defaults);
            
        // Load all the images
        infantry.imageArray = [];
        for (var i = details.imagesToLoad.length - 1; i >= 0; i--) {
            var constructImageCount = details.imagesToLoad[i].count;
            var constructImageDirectionCount = details.imagesToLoad[i].directionCount;
            var constructImageName = details.imagesToLoad[i].name;
            var imgArray = [];
            for (var j = 0; j < constructImageDirectionCount; j++) {
                imgArray[j] = (this.loadImageArray('units/infantry/' + name + '/' + name + '-' + constructImageName + '-' + j, constructImageCount, '.gif'));
            }
            //alert(imgArray)
            infantry.imageArray[constructImageName] = imgArray;
        }
        // Add all the basic unit details
        $.extend(infantry, details);
        this.types[name] = infantry;
    }



    add(details: ICreateInfantryDetails): IUnit {
        var newInfantry = new Infantry(0);
        newInfantry.team = details.team;
        var name = details.name;

        $.extend(newInfantry, this.types[name].defaults);
        $.extend(newInfantry, this.types[name]);
        $.extend(newInfantry, details);

        return newInfantry;
    }
}

interface ICreateInfantryDetails {
    name: string;
    team?: string;
    moveDirection?: number;
    animationIndex?: number;
    x: number;
    y: number;
    instructions?: IInstruction[];
}

export = InfantryFactory;