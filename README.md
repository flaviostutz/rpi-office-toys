# rpi-office-toys
Control Arduino functions through REST/MQTT for doing some office fun (siren, sensors, twitter gauge, RGB leds...)

This is a Docker Container that runs on a Raspberry PI that is connected to a Arduino for low level electronics interaction while Raspberry is used for Wifi/Ethernet communication and high level control. 

The sensor readings and actuator commands are sent using a MQTT server or through a REST API. The idea is that programmers (even Web Only Programmers) on the office can interact with the hardware with no knowledge of electronics and create fun on the walls. Be careful!

