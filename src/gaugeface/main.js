'use strict'

var async = require("async");
var five = require("johnny-five");
var SerialPort = require("serialport").SerialPort;

var config = require('config');
process.env.NODE_CONFIG_DIR = __dirname + "/../";

var mqtt = require('mqtt');
var express = require('express');
var app = express();

var portNumber = process.argv[2];

var mqttClient = null;
var mqttServerUrl = config.get("mqtt-serverUrl");
var mqttBaseTopic = config.get("mqtt-baseTopic");
var defaultMqttOptions = {qos: 1, retain: true};

//SPECIFIC TO GAUGEFACE
var gaugeface = {};
var servo1;
var servo2;


if(portNumber==null || mqttServerUrl==null || mqttBaseTopic==null) {
  throw "Usage: node gaugeface/main.js [port number]\n\nEx.: node gaugeface/main.js 1, having default.json with entries { 'mqtt.serverUrl': 'mqtt://localhost:8883', 'mqtt.baseTopic': '/1/devices/1/', 'port1.serialDev': '/dev/ttyAMA0'; }"
}

var serialPortDev = config.get("port"+ (portNumber) +"-serialDev");
console.info("Initializing Gaugeface on port " + portNumber + " using serial at " + serialPortDev);

var board = new five.Board({
  port: new SerialPort(serialPortDev, {
    baudrate: 57600
  })
});

board.on("ready", function() {

  //SPECIFIC
  servo1 = new five.Servo(10);
  servo2 = new five.Servo(11);

  async.series([

    function(callback) {
      //SPECIFIC
      console.info("Checking if the connected board is a Gaugeface...");
      this.pinMode(17, this.MODES.INPUT);
      this.digitalRead(17, function(value) {
        if(value==0) {
          throw "On gaugeface, pin 17 must be INPUT reading 1";
        } else {
          console.info("OK");
          servo1.to(0);
          servo2.to(0);
          callback();
//        }
//      });
    },

    function(callback) {
      var port = portNumber * 1000;
      console.info("Initializing REST API on port "+ port +"...");
      app.get("/gaugeface/:registerName/:value", function (req, res) {
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
      app.listen(port, function () {
        console.log("REST API usage: http://hostIp:"+ port +"/gaugeface/[servo1|servo2]/[0-180]");
      });
      callback();
    },

    function(callback) {
      console.info("Connecting to MQTT server " + mqttServerUrl + "...");
      //Emitted on successful (re)connection (i.e. connack rc=0).
      mqttClient = mqtt.connect(mqttServerUrl);
      mqttClient.on('connect', function () {
        console.log('[mqttClient#connect]');
        // /[building-id]/devices/[device-hub-id]/[port-number]/[device name]/[register name]
        console.info("Subscribing to " + mqttBaseTopic + "/" + portNumber + "/gaugeface/+");
        mqttClient.subscribe(mqttBaseTopic + "/" + portNumber + "/gaugeface/+");
        callback();
      });
      //Emitted when the client receives a publish packet
      mqttClient.on('message', function (topic, message) {
        console.info('[mqttClient#message %s %s]', topic, message);
        var messageObj = JSON.parse(message);
        var a = 0;
        if(topic.charAt(0)=='/') {
          a = 1;
        }
        var topicParts = topic.split("/");
        var registerName = topicParts[a+6];
        processMessage(registerName, messageObj);
      });
      //Emitted after a disconnection.
      mqttClient.on('close', function () {
        console.log('[mqttClient#close]');
        cleanupAndExit(1);
      });
      //Emitted when the client goes offline
      mqttClient.on('offline', function () {
        console.log('[mqttClient#offline]');
        cleanupAndExit(1);
      });
      //Emitted when there is an error
      mqttClient.on('error', function (err) {
        console.error('[mqttClient#error %s]', err);
        cleanupAndExit(1);
      });
    }
  ], function(err) {
    if(err) throw err;
  });

});



function processMessage(registerName, messageObj) {
  eval("gaugeface." + registerName + " = messageObj;");
  eval("gaugeface." + registerName + ".receivedOn = new Date();");

  console.info("Processing message: " + registerName + " -> " + messageObj.value);
  if(registerName=="servo1") {
    servo1.to(messageObj.value, messageObj.time||0);
  } else if(registerName=="servo2") {
    servo2.to(messageObj.value, messageObj.time||0);
  }
}


function cleanupAndExit(code) {
  console.log("Exiting with code " + code);
  try {
    mqttClient.end();
  } catch (err) {
    console.log(err);
  }
  process.exit(code);
}







/////////////////
//SPECIFIC TO GAUGEFACE
eval("gaugeface." + registerName + " = messageObj;");
eval("gaugeface." + registerName + ".receivedOn = new Date();");

console.info("Processing message: " + registerName + " -> " + messageObj.value);
if(registerName=="servo1") {
  servo1.to(messageObj.value, messageObj.time||0);
} else if(registerName=="servo2") {
  servo2.to(messageObj.value, messageObj.time||0);
}

var gaugeface = {};
var servo1;
var servo2;
servo1 = new five.Servo(10);
servo2 = new five.Servo(11);
servo1.to(0);
servo2.to(0);
