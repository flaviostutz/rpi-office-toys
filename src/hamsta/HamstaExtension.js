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
    board.pinMode(7, five.Pin.INPUT);
    board.pinMode(0, five.Pin.INPUT);
    board.digitalRead(7, function(value) {
      _this.port1Value = value;
	  console.info("port1: " + value);
	  _this.counter++;
    });
    board.digitalRead(0, function(value) {
      _this.port2Value = value;
	  console.info("port2: " + value);
	  _this.calculateMoviment(_this.port1Value,_this.port2Value);
    });
  });
}

//MODULE EXPORTS
util.inherits(HamstaExtension, StutzButlerExtension);
module.exports = HamstaExtension;
var _proto = HamstaExtension.prototype;

//VARIABLES
_proto.port1Value = null;
_proto.port2Value = null;
_proto.counter = 0;

//METHODS
_proto.calculateMoviment(port1Value, port2Value) {
	
}

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
  this.setSensorRegisterValue("port1", {value:this.port1Value, date: new Date()}, true);
  this.setSensorRegisterValue("port2", {value:this.port2Value, date: new Date()}, true);
  console.info("counter: " + this.counter);
  this.counter = 0;
  callback();
}

_proto.checkConnectedDevice = function(board) {
  console.info("Returning true without really checking device");
  return true;
}
