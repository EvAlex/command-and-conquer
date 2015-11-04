
import VisualObject = require('./VisualObject');
import Building = require('./Building');
import TiberiumRefinery = require('./TiberiumRefinery');

class Buildings extends VisualObject implements IBuildingsFactory {

    loaded = false;
    types: Building[] = [];

    buildingDetails = {
        'construction-yard': <IBuildingDefaults>{
            name: 'construction-yard',
            label: 'Construction Yard',
            type: 'building',
            powerIn: 15,
            powerOut: 30,
            cost: 5000,
            sight: 3,
            maxHitPoints: 400,
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
        'refinery': <IBuildingDefaults>{
            name: 'refinery',
            label: 'Tiberium Refinery',
            type: 'building',
            powerIn: 40,
            powerOut: 10,
            cost: 2000,
            tiberiumStorage: 1000,
            sight: 4,
            maxHitPoints: 450,
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
        'barracks': <IBuildingDefaults>{
            name: 'barracks',
            label: 'Barracks',
            type: 'building',
            powerIn: 20,
            cost: 300,
            sight: 3,
            maxHitPoints: 400,
            imagesToLoad: [
                { name: 'build', count: 20 },
                { name: "damaged", count: 10 },
                { name: "healthy", count: 10 },
                { name: "ultra-damaged", count: 1 }],
            gridShape: [[1, 1],
                [1, 1]]

        },
        'power-plant': <IBuildingDefaults>{
            name: 'power-plant',
            label: 'Power Plant',
            type: 'building',
            powerOut: 100,
            cost: 300,
            sight: 2,
            maxHitPoints: 200,
            imagesToLoad: [
                { name: 'build', count: 20 },
                { name: "damaged", count: 4 },
                { name: "healthy", count: 4 },
                { name: "ultra-damaged", count: 1 }],
            gridShape: [[1, 0],
                [1, 1]]
        },
        'advanced-power-plant': <IBuildingDefaults>{
            name: 'advanced-power-plant',
            label: 'Advanced Power Plant',
            type: 'building',
            powerOut: 200,
            cost: 700,
            sight: 2,
            maxHitPoints: 300,
            imagesToLoad: [
                { name: 'build', count: 20 },
                { name: "damaged", count: 4 },
                { name: "healthy", count: 4 },
                { name: "ultra-damaged", count: 1 }],
            gridShape: [[1, 0],
                [1, 1]]
        },
        'tiberium-silo': <IBuildingDefaults>{
            name: 'tiberium-silo',
            label: 'Tiberium Silo',
            type: 'building',
            powerIn: 10,
            cost: 150,
            sight: 2,
            maxHitPoints: 150,
            imagesToLoad: [
                { name: 'build', count: 20 },
                { name: "damaged", count: 5 },
                { name: "healthy", count: 5 },
                { name: "ultra-damaged", count: 1 }],
            gridShape: [[1, 1]]
        },
        'hand-of-nod': <IBuildingDefaults>{
            name: 'hand-of-nod',
            label: 'Hand of Nod',
            type: 'building',
            powerIn: 20,
            cost: 300,
            sight: 3,
            maxHitPoints: 400,
            imagesToLoad: [
                { name: 'build', count: 20 },
                { name: "damaged", count: 1 },
                { name: "healthy", count: 1 },
                { name: "ultra-damaged", count: 1 }],
            gridShape: [[0, 0],
                [1, 1],
                [1, 1]]
        },
        'weapons-factory': <IBuildingDefaults>{
            name: 'weapons-factory',
            label: 'Weapons Factory',
            type: 'building',
            powerIn: 30,
            cost: 2000,
            sight: 3,
            maxHitPoints: 200,
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

    load(name, gridSize: number) {
        var details = <IBuildingDefaults>this.buildingDetails[name];
        var building = name == this.buildingDetails.refinery.name
            ? new TiberiumRefinery()
            : new Building();
        building.hitPoints = details.hitPoints;
        building.gridHeight = details.gridShape.length;
        building.gridWidth = details.gridShape[0].length;
        building.pixelHeight = details.gridShape.length * gridSize;
        building.pixelWidth = details.gridShape[0].length * gridSize;
        building.bibImage = this.preloadImage('buildings/bib/bib-' + details.gridShape[0].length + '.gif');
        building.pixelOffsetX = 0;
        building.pixelOffsetY = 0;
        building.pixelTop = 0;
        building.pixelLeft = 0;

        this.loadSpriteSheet(building, details, 'buildings');

        $.extend(building, details);
        this.types[name] = building;
    }

    add(details: IBuildingCreateDetails): Building {
        var newBuilding = details.name == this.buildingDetails.refinery.name
            ? new TiberiumRefinery()
            : new Building();
        newBuilding.team = details.team
        var name = details.name;
        $.extend(newBuilding, <IBuildingDefaults>this.types[name].defaults);
        $.extend(newBuilding, <IBuildingDefaults>this.types[name]);
        $.extend(newBuilding, details);

        if (details.hitPoints)
            newBuilding.hitPoints = details.hitPoints;
        else
            newBuilding.hitPoints = newBuilding.maxHitPoints;

        return newBuilding;
    }
}

interface IBuildingDefaults {
    name: string;
    label: string;
    type: string;
    powerIn?: number;
    powerOut?: number;
    cost: number;
    sight: number;
    hitPoints?: number;
    imagesToLoad: { name: string, count: number }[];
    gridShape: number[][];
}

interface IBuildingCreateDetails {
    name: string;
    x: number;
    y: number;
    team: string;
    status?: string;
    hitPoints?: number;
}

export = Buildings;