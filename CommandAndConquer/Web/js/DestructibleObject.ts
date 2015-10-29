
import GameObject = require('./GameObject');
import GameScreen = require('./GameScreen');
import Sidebar = require('./Sidebar');

abstract class DestructibleObject extends GameObject implements IDestructibleObject {
    
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

    drawSelection(context: CanvasRenderingContext2D, gridSize: number, screen: GameScreen, sidebar: Sidebar) {
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
}

export = DestructibleObject;