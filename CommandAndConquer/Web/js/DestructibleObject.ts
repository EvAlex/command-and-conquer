
import GameObject = require('./GameObject');
import GameScreen = require('./GameScreen');
import Sidebar = require('./Sidebar');

abstract class DestructibleObject extends GameObject implements IDestructibleObject {

    constructor(type: string) {
        super(type);
    }

    getLife(): void {
        var life = this.health / this.hitPoints;
        if (life > 0.7) {
            this.life = "healthy";
        } else if (life > 0.4) {
            this.life = "damaged";
        } else {
            this.life = "ultra-damaged";
        }
    }

    drawSelection(context: CanvasRenderingContext2D, gridSize: number, screen: IGameScreen, sidebar: ISidebar) {
        super.drawSelection(context, gridSize, screen, sidebar);

        if (this.selected) {
            // Now draw the health bar
            this.getLife();

            var bounds = this.getSelectionBounds(gridSize, screen),
                healthBarHeight = 5;

            context.beginPath();
            context.rect(bounds.left, bounds.top - healthBarHeight - 2, this.pixelWidth * this.health / this.hitPoints, healthBarHeight);
            if (this.life == 'healthy') {
                context.fillStyle = 'lightgreen';
            } else if (this.life == 'damaged') {
                context.fillStyle = 'yellow';
            } else {
                context.fillStyle = 'red';
            }
            context.fill();
            context.beginPath();
            context.strokeStyle = 'black';
            context.rect(bounds.left, bounds.top - healthBarHeight - 2, this.pixelWidth, healthBarHeight);
            context.stroke();
        }
    }

    health: number;
    hitPoints: number;
    life: string;

    protected findEnemiesInRange(hero, increment, units: IUnit[], buildings: IBuilding[], turrets: ITurret[]): IUnit[] {
        if (!increment)
            increment = 0;
        if (!hero) {
            hero = this;
        }
        var enemies = [],
            test;

        for (var i = units.length - 1; i >= 0; i--) {
            test = units[i];
            if (test.team != hero.team && Math.pow(test.x - hero.x, 2) + Math.pow(test.y - hero.y, 2) <= Math.pow(hero.sight + increment, 2)) {
                enemies.push(test);
                //alert(hero.name + ':' +hero.x + ',' + hero.y+ ' too close to ' + test.name + ':' +test.x + ',' + test.y)      
            }
        };
        for (var i = buildings.length - 1; i >= 0; i--) {
            test = buildings[i];
            if (test.team != hero.team && Math.pow(test.x + test.gridWidth / 2 - hero.x, 2) + Math.pow(test.y + test.gridHeight / 2 - hero.y, 2) <= Math.pow(hero.sight + increment, 2)) {
                enemies.push(test);
            }
        };
        for (var i = turrets.length - 1; i >= 0; i--) {
            test = turrets[i];

            if (test.team != hero.team && Math.pow(test.x + test.gridWidth / 2 - hero.x, 2) + Math.pow(test.y + test.gridHeight / 2 - hero.y, 2) <= Math.pow(hero.sight + increment, 2)) {
                enemies.push(test);
            }
        };
        return enemies;
    }
}

export = DestructibleObject;