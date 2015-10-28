
import GameObject = require('./GameObject');

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

    health: number;
    hitPoints: number;
    life: string;
}

export = DestructibleObject;