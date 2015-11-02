
interface IBullet {
    x: number;
    y: number;
    angle: number;
    speed?: number;
    range: number;
    source: IShooter;
    dead?: boolean;
    damage?: number;
}

interface IShooter {
    bulletFiring: boolean;
    reloadTime: number;
    team: string;
}