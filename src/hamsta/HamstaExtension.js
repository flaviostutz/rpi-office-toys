'use strict'

var signalUtils = require("signal-control-utils");
var StutzButlerExtension = signalUtils.StutzButlerExtension;
var util = require("util");
var async = require("async");

//CONSTRUCTOR
function HamstaExtension(mqttServerUrl, mqttBaseTopic, restApiPort, wheelRadiusMeters) {
	//call super
	StutzButlerExtension.call(this, "Hamsta Extension", mqttServerUrl, mqttBaseTopic, restApiPort);
	this._wheelPerimeter = (2 * 3.14 * wheelRadiusMeters);//2PIr

	var five = this.getJohnnyFive();
	var board = this.getBoard();
	var _this = this;

	this._speedMeter = new signalUtils.SpeedMeter();
	this._speedMeterAverager = new signalUtils.MovingAverage(5);
	this._rotationMeter = new signalUtils.SpeedMeter();
	this._rotationMeterAverager = new signalUtils.MovingAverage(5);

	//prepare triggers so that they only call calculateMovement if something changes 
	_this.port1SchmittTrigger = new signalUtils.SchmittTrigger(
			function(value) {
				if(value!=_this.port2SchmittTrigger.getLastTriggerValue()) {
					_this._updateDirection(1);
				} else {
					_this._updateDirection(-1);
				}
			});
	_this.port1SchmittTrigger.setTriggerFixed(1);
	
	_this.port2SchmittTrigger = new signalUtils.SchmittTrigger(
			function(value) {
				if(value!=_this.port1SchmittTrigger.getLastTriggerValue()) {
					_this._updateDirection(-1);
				} else {
					_this._updateDirection(1);
				}
			});
	_this.port2SchmittTrigger.setTriggerFixed(1);

  
	this.on("initialized", function() {
		//start receiving pin states
		board.pinMode(7, five.Pin.INPUT);//port1
		board.pinMode(0, five.Pin.INPUT);//port2
		board.digitalRead(7, function(value) {
//			console.info("port1,port2: " + (_this.port2SchmittTrigger.getLastValue()==0?"ON":"OFF") + " " + (value==0?"ON":"OFF") + " " + (_this._direction==1?"CCW":"CW"));
			_this.port1SchmittTrigger.updateValue(value);
		});
		board.digitalRead(0, function(value) {
			_this.port2SchmittTrigger.updateValue(value);
		});
	});
}

//MODULE EXPORTS
util.inherits(HamstaExtension, StutzButlerExtension);
module.exports = HamstaExtension;
var _proto = HamstaExtension.prototype;

//VARIABLES
//_proto._cycleType = 1;//"1 leads 2" or "2 leads 1" for CW
_proto._direction = 0;
_proto._wheelPerimeter = 0;
_proto._totalPath = 0;
_proto._totalRotations = 0;
_proto.port1SchmittTrigger = null;
_proto.port2SchmittTrigger = null;
_proto._speedMeter = null;
_proto._rotationMeter = null;

//METHODS
_proto._updateDirection = function(direction) {
	//direction changed. consider half a rotation path
	if(this._direction!=direction) {
		this._totalPath += (this._wheelPerimeter * 0.0625);
		this._totalRotations += (0.0625 * direction);
		console.info("\n\n\n\###################### Changed direction!\n\n\n\n");
	//direction has not changed consider full rotation path
	} else {
		this._totalPath += (this._wheelPerimeter * 0.125);
		this._totalRotations += (0.125 * direction);
	}
	this._direction = direction;
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
	this._speedMeter.updateValue(this._totalPath);
	this._speedMeterAverager.addSample(this._speedMeter.getCurrentSpeed());
	
	this._rotationMeter.updateValue(this._totalRotations);
	this._rotationMeterAverager.addSample(this._rotationMeter.getCurrentSpeed());
	
	console.info("_rotationMeter " + this._rotationMeterAverager.getAverage() + " total " + this._totalRotations);
	console.info("_speedMeter " + this._speedMeterAverager.getAverage() + " total " + this._totalPath);
	console.info("_direction " + this._direction);
	
	console.info("RPM: " + this._rotationMeterAverager.getAverage()*60);
	console.info("Speed: " + this._speedMeterAverager.getAverage());
	this.setSensorRegisterValue("rpm", {value:this._rotationMeterAverager.getAverage()*60, unit: "rpm", date: new Date()}, true);
	this.setSensorRegisterValue("total-rotations", {value:this._totalRotations, unit: "rotations", date: new Date()}, true);
	this.setSensorRegisterValue("speed", {value:this._speedMeterAverager.getAverage(), unit: "m/s", date: new Date()}, true);
	this.setSensorRegisterValue("total-path", {value:this._totalPath, unit: "m", date: new Date()}, true);
	callback();
}

_proto.checkConnectedDevice = function(board) {
  console.info("Returning true without really checking device");
  return true;
}
