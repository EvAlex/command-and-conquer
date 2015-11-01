
class Sounds implements ISoundsManager {
    sound_list = [];
    loaded = true;

    load(name, path) {
        var sound = new Audio('audio/' + path + '/' + name + '.ogg');
        sound.load();
        //alert(sound.src);
        return sound;
    }

    play(name) {
        var options = this.sound_list[name];
        //alert(name)
        if (options.length == 1) {
            options[0].play();
        } else {
            var i = Math.floor(options.length * Math.random());
            //alert(i +" " +options.length);
                
            options[i].play();

        }
    } 

    loadAll() {
        this.sound_list['building_in_progress'] = [this.load('building_in_progress', 'voice')];
        this.sound_list['insufficient_funds'] = [this.load('insufficient_funds', 'voice')];
        this.sound_list['building'] = [this.load('building', 'voice')];
        this.sound_list['on_hold'] = [this.load('on_hold', 'voice')];
        this.sound_list['cancelled'] = [this.load('cancelled', 'voice')];
        this.sound_list['cannot_deploy_here'] = [this.load('cannot_deploy_here', 'voice')];
        this.sound_list['new_construction_options'] = [this.load('new_construction_options', 'voice')];
        this.sound_list['construction_complete'] = [this.load('construction_complete', 'voice')];
        this.sound_list['not_ready'] = [this.load('not_ready', 'voice')];
        //this.sound_list['reinforcements_have_arrived'] = [this.load('reinforcements_have_arrived','voice')];
        this.sound_list['low_power'] = [this.load('low_power', 'voice')];
        this.sound_list['unit_ready'] = [this.load('unit_ready', 'voice')];

        this.sound_list['mission_accomplished'] = [this.load('mission_accomplished', 'voice')];
        this.sound_list['mission_failure'] = [this.load('mission_failure', 'voice')];

        this.sound_list['construction'] = [this.load('construction', 'sounds')];
        this.sound_list['crumble'] = [this.load('crumble', 'sounds')];
        this.sound_list['sell'] = [this.load('sell', 'sounds')];
        this.sound_list['button'] = [this.load('button', 'sounds')];
        //this.sound_list['clock'] = [this.load('clock','sounds')];
            
        this.sound_list['machine_gun'] = [this.load('machine_gun-0', 'sounds'), this.load('machine_gun-1', 'sounds')];
        this.sound_list['tank_fire'] = [this.load('tank-fire-0', 'sounds'), this.load('tank-fire-1', 'sounds'), this.load('tank-fire-2', 'sounds'), this.load('tank-fire-3', 'sounds')];
        //this.sound_list['tank_fire'] = [this.load('tank-fire-0','sounds')];
        this.sound_list['vehicle_select'] = [this.load('ready_and_waiting', 'talk'), this.load('vehicle_reporting', 'talk'), this.load('awaiting_orders', 'talk')];
        this.sound_list['vehicle_move'] = [this.load('affirmative', 'talk'), this.load('moving_out', 'talk'), this.load('acknowledged', 'talk'), this.load('over_and_out', 'talk')];

        this.sound_list['infantry_select'] = [this.load('reporting', 'talk'), this.load('unit_reporting', 'talk'), this.load('awaiting_orders', 'talk')];
        this.sound_list['infantry_move'] = [this.load('affirmative', 'talk'), this.load('yes_sir', 'talk'), this.load('acknowledged', 'talk'), this.load('right_away', 'talk')];
    }
}

export = Sounds;