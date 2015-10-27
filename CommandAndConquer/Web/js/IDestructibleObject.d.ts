
interface IDestructibleObject extends IGameObject {
    getLife: () => any;
    life: string;
    health: number;
    hitPoints: number;
}