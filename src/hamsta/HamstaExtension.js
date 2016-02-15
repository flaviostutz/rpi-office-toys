'use strict'

var StutzButlerExtension = require("../lib/StutzButlerExtension");
var util = require("util");

//CONSTRUCTOR
function HamstaExtension(mqttServerUrl, mqttBaseTopic, restApiPort) {
  //call super
  StutzButlerExtension.call(this, "Hamsta Extension", mqttServerUrl, mqttBaseTopic, restApiPort);

  var five = this.getJohnnyFive();
  var board = this.getBoard();
  this.on("initialized", function() {
    board.pinMode(10, five.Pin.INPUT);
    console.info("Hamsta was initialized. Run, Hamsta, run!");
  });
}

//MODULE EXPORTS
util.inherits(HamstaExtension, StutzButlerExtension);
module.exports = HamstaExtension;
var _proto = HamstaExtension.prototype;

//METHODS
_proto.processMessage = function(registerName, registerValue) {
  if(registerName == "stop") {
    if(registerValue.value == true) {
      this.stop();
    }

  } else if(registerName == "start") {
    if(registerValue.value == true) {
      this.start(registerValue.maxFrequency);
    }
  }
}

_proto.step = function(callback, board, five) {
  var _this = this;
  board.digitalRead(10, function(value) {
    console.info("Read " + value + " on port 10");
    _this.setRegisterValue("port10", value, true);
    callback();
  });
}

_proto.checkConnectedDevice = function(board) {
  console.info("Returning true without really checking device");
  return true;
}
