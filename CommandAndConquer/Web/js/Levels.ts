
import VisualObject = require('./VisualObject');
import Buildings = require('./Buildings');
import Turrets = require('./Turrets');
import InfantryFactory = require('./InfantryFactory');
import Vehicles = require('./Vehicles');
import Overlay = require('./OverlayFactory');
import Sidebar = require('./Sidebar');

class Levels extends VisualObject {
    levelDetails = {
        "gdi1": {
            mapUrl: 'maps/gdi/map01.jpeg', // The background map to load
            startingCash: 3000,
            startingEnemyCash: 3000,
            terrain: [
                { x1: 0, y1: 27, x2: 30, y2: 30, type: 'water' },
                { x1: 0, y1: 26, x2: 6, y2: 26, type: 'water' },
                { x1: 0, y1: 25, x2: 5, y2: 25, type: 'water' },
                { x1: 0, y1: 24, x2: 4, y2: 24, type: 'water' },
                //{x1:11,y1:26,x2:11,y2:26,type:'water'},
	                
                { x1: 29, y1: 17, x2: 30, y2: 22, type: 'mountain' },
                { x1: 7, y1: 6, x2: 8, y2: 9, type: 'mountain' },
                { x1: 8, y1: 10, x2: 9, y2: 11, type: 'mountain' },
                { x1: 9, y1: 11, x2: 10, y2: 15, type: 'mountain' },
                { x1: 10, y1: 15, x2: 11, y2: 19, type: 'mountain' },
                { x1: 11, y1: 19, x2: 12, y2: 21, type: 'mountain' },
                { x1: 12, y1: 21, x2: 14, y2: 23, type: 'mountain' },
                { x1: 12, y1: 24, x2: 13, y2: 24, type: 'mountain' },
                { x1: 14, y1: 21, x2: 17, y2: 22, type: 'mountain' },
                { x1: 16, y1: 23, x2: 16, y2: 23, type: 'mountain' }

            ], // full size grid, defines water and mountains
            overlay: [
                { x: 10, y: 10, name: 'tree' },
                { x: 16, y: 3, name: 'tree' },
                { x: 14, y: 2, name: 'trees' },
                { x: 9, y: 2, name: 'trees' },
                { x: 19, y: 12, name: 'trees' },
                { x: 15, y: 13, name: 'trees' },
                { x: 0, y: 1, name: 'trees' },
                { x: 2, y: 1, name: 'trees' },
                { x: 4, y: 1, name: 'trees' },
                { x: 8, y: 1, name: 'tree' },
                { x: 6, y: 0, name: 'tree' },
                { x: 7, y: 0, name: 'tree' },
	                
                //{x:12,y:15,name:'tiberium',stage:11},
                //{x:13,y:15,name:'tiberium',stage:8},
	                
                { x: 28, y: 11, name: 'tiberium', stage: 9 },
                { x: 29, y: 11, name: 'tiberium', stage: 7 },
                { x: 28, y: 12, name: 'tiberium', stage: 9 },
                { x: 29, y: 12, name: 'tiberium', stage: 5 },
                { x: 28, y: 13, name: 'tiberium', stage: 10 },
                { x: 29, y: 13, name: 'tiberium', stage: 4 },
                { x: 28, y: 14, name: 'tiberium', stage: 8 },
                { x: 29, y: 14, name: 'tiberium', stage: 6 },
                { x: 28, y: 15, name: 'tiberium', stage: 3 },
                { x: 27, y: 15, name: 'tiberium', stage: 11 },
                { x: 27, y: 14, name: 'tiberium', stage: 1 },
                { x: 27, y: 13, name: 'tiberium', stage: 5 },


                { x: 13, y: 16, name: 'tiberium', stage: 1 },
                { x: 14, y: 16, name: 'tiberium', stage: 5 },
                { x: 15, y: 17, name: 'tiberium', stage: 8 },
                { x: 14, y: 17, name: 'tiberium', stage: 3 },
                { x: 16, y: 17, name: 'tiberium', stage: 6 }
	                
                // {x1:8,y1:8,x2:10,y2:10,type:'tree-1'},
                //{x1:8,y1:8,x2:10,y2:10,type:'tiberium-1'}
            ], //the trees and tiberium .. can terrain and overlay be in the same?
            gridWidth: 31,
            gridHeight: 31,
            team: 'gdi',
            enemyTeam: 'nod',
            briefing: 'This is a warning \n for all of you \n Kill enemy troops and have some fun',
            items: {
                infantry: [],// ['minigunner'],
                buildings: ['construction-yard', 'power-plant', 'refinery', 'weapons-factory', 'advanced-power-plant', 'tiberium-silo', 'hand-of-nod'],
                vehicles: ['mcv', 'light-tank', 'harvester'],
                ships: ['bigboat'],
                turrets: ['gun-turret']
            },
            scriptedEvents: [
                {
                    id: 'trigger1', description: 'Initial four reinforcement troops land on beach',
                    actions: [
                        { action: 'wait', tigger: 'time', time: 100 },//time in milliseconds
                        { action: "sound", sound: 'reinforcements_have_arrived' },
                        {
                            action: 'addUnit',
                            unit: {
                                name: 'hovercraft', type: 'vehicle', unselectable: true, id: 'hovercraft1',
                                x: 30, y: 30, direction: 'up', carrying: [{ name: 'gunner' }]
                            }
                        },
                        { action: 'move', id: 'hovercraft1', x: 30, y: 27 },
                        { action: 'unload', id: 'hovercraft1', x: 30, y: 28 },
                        { action: 'move', id: 'hovercraft1', x: 30, y: 30 },
                        { action: 'removeUnit', id: 'hovercraft1' }
                    ]
                },
                {
                    id: 'trigger2', description: 'Blow up enemy powerplant when the time comes',
                    actions: [
                        { action: 'wait', trigger: 'condition', condition: function () { return true; } },
                        { action: 'sound', sound: 'low_power' },
                        { action: 'destroyBuilding', id: 'powerplant1' }
                    ]
                },
                {
                    id: 'wintrigger',
                    actions: [
                        { action: 'wait', trigger: 'condition', condition: function () { debugger; return console.error('Not implemented'); /*return (units.enemyUnitCount() == 0 && buildings.enemyBuildingsCount == 0);*/ } },
                        { action: 'endLevel', type: 'success' }
                    ]
                }

            ]


        }
    };

    loaded = true;
    preloadCount = 0;
    loadedCount = 0;

    load(id, buildings: Buildings, turrets: Turrets, vehicles: Vehicles, infantry: InfantryFactory, overlay: Overlay, gridSize: number): IGameLevel {
        var level: IGameLevel;

        //level.mapImage = new Image();
        var details = this.levelDetails[id];
        for (var item in details.items) {
            if (item == "vehicles") {
                for (var i = details.items[item].length - 1; i >= 0; i--) {
                    vehicles.load(this.levelDetails[id].items[item][i]);
                };
            }
            if (item == "buildings") {
                for (var i = details.items[item].length - 1; i >= 0; i--) {
                    buildings.load(details.items[item][i], gridSize);
                };
            }

            if (item == "infantry") {
                for (var i = details.items[item].length - 1; i >= 0; i--) {
                    infantry.load(details.items[item][i]);
                };
            }

            if (item == "turrets") {
                for (var i = details.items[item].length - 1; i >= 0; i--) {
                    turrets.load(details.items[item][i]);
                };
            }
        }

        var obstructionGrid = new Array();
        var mapGrid = new Array();
        for (var y = 0; y < details.gridHeight; y++) {
            obstructionGrid[y] = new Array();
            mapGrid[y] = new Array();
            for (var x = 0; x < details.gridWidth; x++) {
                obstructionGrid[y][x] = 0;
            };
        };
        for (var i = details.terrain.length - 1; i >= 0; i--) {
            var terrain = details.terrain[i];
            for (var x: number = terrain.x1; x <= terrain.x2; x++) {
                for (var y: number = terrain.y1; y <= terrain.y2; y++) {
                    obstructionGrid[y][x] = 1;
                    mapGrid[y][x] = terrain.type;
                }
            }
        };

        var overlayArray = [];
        for (var i = details.overlay.length - 1; i >= 0; i--) {
            overlayArray.push(overlay.add(details.overlay[i]))
        };

        level = {
            id: id,
            mapImage: this.preloadImage(this.levelDetails[id].mapUrl),
            mapGrid: mapGrid,
            obstructionGrid: obstructionGrid,
            overlay: overlayArray,
            team: details.team,
            enemyTeam: details.enemyTeam,
            startingCash: details.startingCash,
            startingEnemyCash: details.startingEnemyCash,
        };

        return level;
    }

}

export = Levels;