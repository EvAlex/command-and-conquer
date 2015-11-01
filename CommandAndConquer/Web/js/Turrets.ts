
import VisualObject = require('./VisualObject');
import Turret = require('./Turret');

class Turrets extends VisualObject {
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

    preloadCount = 0;
    loadedCount = 0;

    load(name) {
        var details = this.turretDetails[name];
        var turret = new Turret(details.hitPoints);


        this.loadSpriteSheet(turret, details, 'turrets')

        $.extend(turret, details);
        this.types[name] = turret;
    } 
    
    add(details: ITurretCreateDetails): ITurret {

        var name = details.name;
        var newTurret = new Turret(this.types[name].defaults.hitPoints);
        newTurret.team = details.team;
        $.extend(newTurret, this.types[name].defaults);

        $.extend(newTurret, this.types[name]);
        $.extend(newTurret, details);

        return newTurret;
    }
}

interface ITurretCreateDetails {
    name: string;
    team: string;
    x: number;
    y: number;
    turretDirection: number;
}

export = Turrets;