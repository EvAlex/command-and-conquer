
class Player implements IPlayer {

    constructor(team: string, startingCash: number) {
        this.team = team;
        this.cash = startingCash;
    }

    team: string;
    cash: number;
}

export = Player