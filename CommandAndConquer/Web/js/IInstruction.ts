
interface IInstruction {
    type: string;
}

interface IMoveInstruction extends IInstruction {
    distance: number;
}

/**
 * type="turn"
 */
interface ITurnInstruction extends IInstruction {
    toDirection: number;
}

/**
 * type="fire"
 */
interface IFireInstruction extends IInstruction {
}

/**
 * type="aim"
 */
interface IAimInstruction extends IInstruction {
    toDirection: number;
}