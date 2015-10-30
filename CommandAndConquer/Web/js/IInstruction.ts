
interface IInstruction {
    type: string;
    distance: number;
}

/**
 * type="turn"
 */
interface ITurnInstruction extends IInstruction {
    type: string;
    toDirection: number;
}