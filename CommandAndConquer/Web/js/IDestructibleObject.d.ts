
interface IDestructibleObject extends IGameObject {
    getLife: () => any;
    life: string;
    hitPoints: number;
    maxHitPoints: number;
}