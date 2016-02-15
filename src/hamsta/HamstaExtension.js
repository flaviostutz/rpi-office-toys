'use strict'

var StutzButlerExtension = require("../lib/StutzButlerExtension");
var util = require("util");
var async = require("async");

//CONSTRUCTOR
function HamstaExtension(mqttServerUrl, mqttBaseTopic, restApiPort) {
  //call super
  StutzButlerExtension.call(this, "Hamsta Extension", mqttServerUrl, mqttBaseTopic, restApiPort);

  var five = this.getJohnnyFive();
  var board = this.getBoard();
  var _this = this;
  this.on("initialized", function() {
    board.pinMode(10, five.Pin.INPUT);
    board.pinMode(11, five.Pin.INPUT);
    board.digitalRead(10, function(value) {
      _this.port10Value = value;
    });
    board.digitalRead(11, function(value) {
      _this.port11Value = value;
    });
  });
}

//MODULE EXPORTS
util.inherits(HamstaExtension, StutzButlerExtension);
module.exports = HamstaExtension;
var _proto = HamstaExtension.prototype;

//VARIABLES
_proto.port10Value = null;
_proto.port11Value = null;

//METHODS
_proto.processActuatorMessage = function(registerName, registerValue) {
  if(registerName == "stop") {
    if(registerValue.value == true) {
      this.stop();
    }

  } else if(registerName == "start") {
    if(registerValue.value == true && this._started==false) {
      this.start(registerValue.maxFrequency || 20);
    }
  }
}

_proto.step = function(callback, board, five) {
  this.setSensorRegisterValue("port10", {value:this.port10Value, date: new Date()}, true);
  this.setSensorRegisterValue("port11", {value:this.port11Value, date: new Date()}, true);
  callback();
}

_proto.checkConnectedDevice = function(board) {
  console.info("Returning true without really checking device");
  return true;
}
