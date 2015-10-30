
import Vehicle = require('./Vehicle');
import GameScreen = require('./GameScreen');
import Sidebar = require('./Sidebar');
import Fog = require('./Fog');

class Harvester extends Vehicle implements IHarvester {
    tiberium: number;
    orders: IHarvestOrder | IHarvestReturnOrder;

    draw(
        context: CanvasRenderingContext2D,
        curPlayerTeam: string,
        gridSize: number,
        screen: GameScreen,
        sidebar: Sidebar,
        debugMode: boolean) {

        super.draw(context, curPlayerTeam, gridSize, screen, sidebar, debugMode);

        if (this.status != '') {
            var imageList = this.spriteArray[this.status];
            if (this.animationIndex / this.animationSpeed >= imageList.count) {
                //alert(this.animationIndex + ' / '+ this.animationSpeed)
                this.animationIndex = 0;
                if (this.status.indexOf('harvest') > -1) {
                    if (!this.tiberium) {
                        this.tiberium = 0;
                    }
                    this.tiberium++;
                    if (this.tiberium % 5 == 0) {
                        (<IHarvestOrder>this.orders).to.stage--;
                    }

                }
                this.status = "";

            }
        }

    }

    processOrders(gridSize: number) {
        super.processOrders(gridSize);

        if (this.orders.type == 'harvest') {
            this.orders = this.processHarvestOrder(<IHarvestOrder>this.orders, gridSize);
        } else if (this.orders.type == 'harvest-return') {
            this.orders = this.processHarvestReturnOrder(<IHarvestReturnOrder>this.orders, gridSize);
        }
    }

    private processHarvestOrder(order: IHarvestOrder, gridSize: number): IHarvestOrder | IHarvestReturnOrder {
        if (!order.to) {
            order.to = findTiberiumInRange(this);
        }
        if (!order.to) {
            if (this.tiberium) {
                this.orders = <IHarvestReturnOrder>{ type: 'harvest-return' };
            }
            return;
        }
        var distance = Math.pow(Math.pow(order.to.y + 0.5 - this.y, 2) + Math.pow(order.to.x + 0.5 - this.x, 2), 0.5);

        if (distance > 1.5 * this.softCollisionRadius / gridSize) {
            this.moveTo(this.orders.to);
        } else {
            if (this.tiberium && this.tiberium >= 14) {
                this.orders = { type: 'harvest-return', to: order.from, from: order.to };
                return;
            }

            if (order.to.stage < 1) {
                order.to = findTiberiumInRange(this);
            } else {
                if (!this.tiberium || this.tiberium < 14) {
                    if (this.status == "") {
                        this.status = "harvest-" + ((Math.floor(this.moveDirection / 4) * 4) < 10 ? '0' : '') + (Math.floor(this.moveDirection / 4) * 4);
                    }
                }

            }
        }

        return order;
    }

    private processHarvestReturnOrder(orders: IHarvestReturnOrder, gridSize: number): IHarvestOrder | IHarvestReturnOrder {

        if (!orders.to) {
            orders.to = findRefineryInRange(this);
            if (!orders.to) {
                return orders;
            }
        }

        var destination = { x: orders.to.x, y: orders.to.y + 2 };
        var distance = Math.pow(Math.pow(destination.y - this.y, 2) + Math.pow(destination.x - this.x, 2), 0.5);
        //alert(distance)
        if (distance > 3 * this.softCollisionRadius / gridSize) {
            this.moveTo(destination);
            //this.moveTo({x:10,y:10})
        } else if (orders.to.life != "ultra-damaged") {
            if (this.tiberium == 0) {
                return <IHarvestOrder>{ type: 'harvest', to: orders.from, from: orders.to };
            }

            if (this.moveDirection != 14) {
                this.instructions.push(<ITurnInstruction>{ type: 'turn', toDirection: 14 });
                return;
            }

            if (orders.to.status == "") {
                this.status = 'destroy';   
                //alert(orders.to.name)
                //alert (this.name)
                //alert(orders.from)
                orders.to.harvester = this;
                orders.to.status = 'unload';
                orders.to.animationIndex = 0;

            }
        }

        return orders;
    }

    private findTiberiumInRange(hero, allOverlays: IOverlay[], gridSize: number, fog: Fog, mapImage: HTMLImageElement): ITiberium {
        if (!hero) {
            hero = this;
        }
        var currentDistance;
        var currentOverlay;
        for (var i = 0; i < allOverlays.length; i++) {
            var overlay = allOverlays[i];
            if (overlay.name == 'tiberium' && (<ITiberium>overlay).stage > 0 && !fog.isOver(overlay.x * gridSize, overlay.y * gridSize, mapImage)) {
                var distance = Math.pow(overlay.x - hero.x, 2) + Math.pow(overlay.y - hero.y, 2);
                if (!currentDistance || (currentDistance > distance)) {
                    currentOverlay = overlay;
                    currentDistance = distance;
                }
            }
        };
        return currentOverlay;
    }
}