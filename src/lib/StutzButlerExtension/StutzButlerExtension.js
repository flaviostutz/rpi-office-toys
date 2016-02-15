'use strict'

var util = require("util");
var events = require("events");
var EventEmitter = require("events").EventEmitter;

//CONSTRUCTOR
function StutzButlerExtension(extensionName, mqttServerUrl, mqttBaseTopic, restApiPort, serialPortDev) {
  EventEmitter.call(this);//initialize EventEmitter on this instance
  if(mqttServerUrl==null || mqttBaseTopic==null || restApiPort==null || extensionName==null) {
    throw "None of these params can be null: mqttServerUrl, mqttBaseTopic, restApiPort, extensionName"
  }
  if(!mqttBaseTopic.endsWith("/")) {
    throw "[mqttBaseTopic] must end with '/'";
  }
  this._serialPortDev = serialPortDev;
  this._mqttServerUrl = mqttServerUrl;
  this._mqttBaseTopic = mqttBaseTopic;
  this._restApiPort = restApiPort;
  this._extensionName = extensionName;


  if(serialPortDev!=null) {
    console.info("Initializing " + this._extensionName + " on serial port " + this._serialPortDev);
    this._board = new this._five.Board({
      port: new SerialPort(this._serialPortDev, {baudrate: 57600})
    });
  } else {
    console.info("serialPortDev is null. Trying to initialize " + this._extensionName + " with rasp-io.");
    this._board = new this._five.Board({
      io: new Raspi()
    });
  }

  var _this = this;
  this._board.on("ready", function(){_this._init.call(_this)});
}

//MODULE EXPORT
util.inherits(StutzButlerExtension, EventEmitter);
module.exports = StutzButlerExtension;
var _proto = StutzButlerExtension.prototype;

//IMPORT
_proto._five = require("johnny-five");
var util = require('util');
var EventEmitter = require('events');
var async = require("async");
var SerialPort = require("serialport").SerialPort;
var mqtt = require('mqtt');
var express = require('express');
var Raspi = require("raspi-io");

//PRIVATE VARIABLES
_proto._board = null;
_proto._serialPortDev = null;
_proto._mqttServerUrl = null;
_proto._mqttBaseTopic = null;
_proto._restApiPort = null;
_proto._extensionName = null;
_proto._mqttClient = null;
_proto._started = false;
_proto._lastStepStartTime = 0;
_proto._lastStepElapsedTime = 0;
_proto._lastTimeoutHandler = null;
_proto._sensorRegisters = {};
_proto._actuatorRegisters = {};
_proto._defaultMqttOptions = {qos: 1, retain: true};


//PRIVATE METHODS
/**
 * Method called as soon as the board is ready for performing device initialization
 */
_proto._init = function() {
  var _this = this;
  console.info(">>> INITIALIZING BOARD "+ _this._extensionName +"...");

  async.series([

    function(callback) {
      console.info(">>> Checking if the connected board is "+ _this._extensionName +"...");
      var result = false;
      try {
        result = _this.checkConnectedDevice(_this._board);
      } catch (err) {
        console.info("Error while checking device: " + err);
      }
      if(result) {
        console.info("OK");
        callback();
      } else {
        throw "NOT OK: Connected board doesn't seen to be "+ _this._extensionName;
      }
    },

    function(callback) {
      console.info(">>> Starting REST API on port "+ _this._restApiPort +"...");
      var app = express();
      app.get("/api/:registerName/:value", function (req, res) {
        if(req.params.value>=0) {
          var msg = {
            value: req.params.value,
            valid: true
          }
          processMessage(req.params.registerName, msg);
          res.status(200).json({message:"OK"});
        } else {
          res.status(400).json({message:"NOT OK"});
        }
      });
      app.listen(_this._restApiPort, function () {
        console.info("REST API started. http://[hostname]:"+ _this._restApiPort +"/api/[registerName]/[value]");
        callback();
      });
    },

    function(callback) {
      console.info(">>> Connecting to MQTT server " + _this._mqttServerUrl + " (" + _this._mqttBaseTopic + ")...");
      //Emitted on successful (re)connection (i.e. connack rc=0).
      _this._mqttClient = mqtt.connect(_this._mqttServerUrl);
      _this._mqttClient.on('connect', function (connack) {
        console.log('[mqttClient#connect]');

        _this._mqttClient.publish(_this._mqttBaseTopic,
                JSON.stringify({
                    extensionName: _this._extensionName,
                    lastConnectionTime: new Date()
                }),
                _this._defaultMqttOptions);

        // /[building-id]/devices/[device-hub-id]/[port-number]/[extension name]/actuators|sensors/[register name]
        var topicFilter = _this._mqttBaseTopic + "actuators/+";
        console.info("Subscribing to '" + topicFilter);
        _this._mqttClient.subscribe(topicFilter, {qos:0}, function() {
          console.info("OK");
          callback();
        });
      });

      //Emitted when the client receives a published packet
      _this._mqttClient.on('message', function (topic, message, packet) {
        //ignore self messages
        if(packet.clientId==_this._mqttClient.clientId) {
          console.info("Ignoring self message. This should not happen");
          return;
        }
        console.info('[mqttClient#message %s %s]', topic, message);
        var messageObj = JSON.parse(message);
        var a = 0;
        if(topic.charAt(0)=='/') {
          a = 1;
        }
        var topicParts = topic.split("/");
//        var registerType = topicParts[a+6];
        var registerName = topicParts[a+7];
        _this._actuatorRegisters[registerName] = messageObj;
        _this.processActuatorMessage(registerName, messageObj);
      });
      //Emitted after a disconnection.
      _this._mqttClient.on('close', function () {
        console.log('[mqttClient#close]');
        _this._cleanupAndExit(1);
      });
      //Emitted when the client goes offline
      _this._mqttClient.on('offline', function () {
        console.log('[mqttClient#offline]');
        _this._cleanupAndExit(1);
      });
      //Emitted when there is an error
      _this._mqttClient.on('error', function (err) {
        console.error('[mqttClient#error %s]', err);
        _this._cleanupAndExit(1);
      });
    },

    function(callback) {
      _this.emit("initialized");
      callback();
    }

  ], function(err) {
    if(err!=null) {
      console.info("Error during initialization. err=" + err);
      throw err;
    } else {
      console.info("Initialization done");
    }
  });
};

/**
 * Close resources and exit process
 */
_proto._cleanupAndExit = function(code) {
  console.info("Exiting "+ this.extensionName +" with code " + code);
  try {
    this._mqttClient.end();
  } catch (err) {
    console.log(err);
  } finally {
    process.exit(code);
  }
}


//PUBLIC METHODS
/**
 * Returns the johnny-five's Board object that represents this connected Extension
 */
_proto.getBoard = function() {
  return this._board;
}
/**
 * Returns the johnny-five library used for connecting to the board
 */
_proto.getJohnnyFive = function() {
  return this._five;
}
/**
 * Returns the connected mqtt client
 */
_proto.getMqttClient = function() {
  return this._mqttClient;
}
/**
 * Sets a register value and optionally publishes to the MQTT server
 * registerValue must be a JSON
 */
_proto.setSensorRegisterValue = function(registerName, registerValue, publishToMqtt) {
  this._sensorRegisters[registerName] = registerValue;
  if(publishToMqtt) {
    this._mqttClient.publish(this._mqttBaseTopic + "sensors/" + registerName,
                            JSON.stringify(registerValue),
                            this._defaultMqttOptions);
  }
}
_proto.getSensorRegisterValue = function(registerName) {
  return this._sensorRegisters[registerName];
}
_proto.getActuatorRegisterValue = function(registerName) {
  return this._actuatorRegisters[registerName];
}

/**
 * Start calling step() in a loop until stop() is called.
 * If needed, a delay between the call to step() will be added to assure max frequency.
 * @param {long} The max real frequency that step() can be called. If the step() method is too slow, the frequency may not reach max frequency.
 */
_proto.start = function(maxFrequency) {
  this._started = true;
  var minTimeBetweenSteps = (1.0/maxFrequency) * 1000;

  var _this = this;
  var callSteps = function() {
    if(_this._started) {
      async.series([
        function(callback) {
          _this._lastStepStartTime = new Date().getTime();
          _this.step(callback, _this._board, _this._five);
        },
        function(callback) {
          _this._lastStepElapsedTime = (new Date().getTime() - _this._lastStepStartTime);
          _this.emit("step");//TODO: check if this impacts performance at high frequencies
          if(_this._lastStepElapsedTime < minTimeBetweenSteps) {
            _this._lastTimeoutHandler = setTimeout(callback, (minTimeBetweenSteps - _this._lastStepElapsedTime));
          } else {
            callback();
          }
        },
        function(callback) {
          callback();
          setImmediate(callSteps);
        }
      ], function(err) {
        if(err) throw err;
      });
    }
  }

  setImmediate(callSteps);
}

/**
 * Stop calling step() in a loop
 */
_proto.stop = function() {
  this._started = false;
  if(this._lastTimeoutHandler!=null) {
    clearTimeout(this._lastTimeoutHandler);
  }
}

/**
 * Get the last execution time of step()
 */
_proto.getLastStepElapsedTime = function() {
  return this._lastStepElapsedTime;
}

//ABSTRACT METHODS
/**
 * Perform specific verification to check if the connected board is really the board this module is waiting for
 * @return {boolean} true if device is OK
 */
_proto.checkConnectedDevice = function(board) {
  throw "Abstract method. Implement it.";
}

/**
 * Process a message received both from the REST API or from MQTT Topic regarding to actuator messages
 * @param {string} registerName - Actuator register name. Ex.: door, emergency-light, ir-emitter
 * @param {string} registerValue - The message object. Ex.: {value:close, unit:custom}, {value:67, unit:percent}, {value: ABBABAFFSFS, unit:ir-code}
 */
_proto.processActuatorMessage = function(registerName, registerValue) {
  throw "Abstract method. Implement it.";
}

/**
 * After instantiating and configuring this device object, call start() in order to perform the main loop which will call step() in a loop.
 * param {callback} Call callback() after finishing step execution in order to indicated that this method has finished execution (as in "async" module)
 */
_proto.step = function(callback, board, five) {
  throw "Abstract method. Implement it.";}