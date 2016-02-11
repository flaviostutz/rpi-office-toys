'use strict'

var HamstaExtension = require("./HamstaExtension.js");

var hamstaExtension = new HamstaExtension("mqtt://test.mosquitto.org:1883", "/1/devices/1/", 1000);

hamstaExtension.on("step", function() {
  console.log("Stepped in " + hamstaExtension.getLastStepElapsedTime());
});

hamstaExtension.start(500);
