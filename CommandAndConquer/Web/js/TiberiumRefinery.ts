
import Building = require('./Building');
import Sidebar = require('./Sidebar');
import Vehicles = require('./Vehicles');
import Player = require('./Player');

class TiberiumRefinery extends Building {

    harvester: IHarvester;
    tiberiumStorage: number;

    protected applyStatusDuringDraw(
        curPlayerTeam: string,
        units: IUnit[],
        vehiclesFactory: Vehicles,
        sidebar: Sidebar,
        enemy: Player): void {

        if (this.status == 'build') {
            units.push(vehiclesFactory.add({
                name: 'harvester', team: this.team, x: this.x + 0.5,
                y: this.y + 2, moveDirection: 14, orders: { type: 'harvest', from: this }
            }));
            this.status = "";
        } else if (this.status == 'unload') {
            if (this.harvester.tiberium) {
                var subtractAmount = this.harvester.tiberium > 4 ? 5 : this.harvester.tiberium;
                if (this.team == curPlayerTeam) {
                    sidebar.cash += subtractAmount * 50;
                } else {
                    enemy.cash += subtractAmount;
                }

                this.harvester.tiberium -= subtractAmount;
            } else {
                units.push(vehiclesFactory.add({
                    name: 'harvester', team: this.team, x: this.x + 0.5,
                    y: this.y + 2, health: this.harvester.health, moveDirection: 14, orders: { type: 'harvest', from: this, to: this.harvester.orders.from }
                }));
                this.harvester = null;
                this.status = "";
            }
        }

        super.applyStatusDuringDraw(curPlayerTeam, units, vehiclesFactory, sidebar, enemy);
    }

}

export = TiberiumRefinery;