
import VisualObject = require('./VisualObject');
import Vehicle = require('./Vehicle');

class Vehicles extends VisualObject implements IVehiclesFactory {
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
            maxHitPoints: 200,
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
            maxHitPoints: 600,
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
            maxHitPoints: 300,
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
    
    load(name) {
        var details = this.vehicleDetails[name];
        var vehicle = new Vehicle();

        this.loadSpriteSheet(vehicle, details, 'units/vehicles');

        $.extend(vehicle, details);
        this.types[name] = vehicle;
    }
    
    movementSpeed: number = 0;
    
    add(details: IVehicleCreateDetails): Vehicle {
        var newVehicle = new Vehicle();
        newVehicle.team = details.team;
        var name = details.name;
        $.extend(newVehicle, this.types[name].defaults);

        $.extend(newVehicle, this.types[name]);
        $.extend(newVehicle, details);

        if (details.hitPoints)
            newVehicle.hitPoints = details.hitPoints;
        else
            newVehicle.hitPoints = newVehicle.maxHitPoints;

        return newVehicle;
    }

}

interface IVehicleCreateDetails {
    name: string;
    x: number;
    y: number;
    team?: string;
    status?: string;
    hitPoints?: number;
    moveDirection?: number
    turretDirection?: number;
    orders: IMoveOrder | IProtectOrder | IGuardOrder;
}



export = Vehicles;