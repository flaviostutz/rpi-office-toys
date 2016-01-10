var five = require("johnny-five");
var SerialPort = require("serialport").SerialPort;

// Johnny-Five will try its hardest to detect the port for you,
// however you may also explicitly specify the port by passing
// it as an optional property to the Board constructor:
//var board = new five.Board();
var board = new five.Board({
  port: new SerialPort("/dev/ttyAMA0", {
    baudrate: 57600
  })
});

// The board's pins will not be accessible until
// the board has reported that it is ready
board.on("ready", function() {
  console.info("'ready' detected");
  this.pinMode(13, this.MODES.OUTPUT);

  this.loop(500, function() {
    // Whatever the last value was, write the opposite
    console.info("Toggle led");
    this.digitalWrite(13, this.pins[13].value ? 0 : 1);
  });
});

