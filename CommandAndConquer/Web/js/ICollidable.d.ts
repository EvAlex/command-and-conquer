
interface ICollidable extends IPoint {
    collisionRadius: number;
    softCollisionRadius: number;
}

interface ICollidingObject extends ICollidable {
    collision(other: IUnit, gridSize: number): ICollisionType;
    colliding: boolean
    collisionDistance: number;
    collisionType: string;
    collisionWith: ICollisionPoint;
}