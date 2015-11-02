
import Game = require('./Game');

window.addEventListener('load', () => {

    var canvas = <HTMLCanvasElement>document.getElementById('canvas'),
        game = new Game(canvas);

    // begin the game
    game.start();
    $('#debugger').toggle();

    $('#debug_mode').bind('change', function () {
        game.debugMode = !game.debugMode;
        $('#debugger').toggle();
    });
});