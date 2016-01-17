# rpi-office-toys
Control Arduino functions through REST/MQTT for doing some office fun (siren, sensors, twitter gauge, RGB leds...)

This is a Docker Container that runs on a Raspberry PI that is connected to a Arduino for low level electronics interaction while Raspberry is used for Wifi/Ethernet communication and high level control. 

The sensor readings and actuator commands are sent using a MQTT server or through a REST API. The idea is that programmers (even Web Only Programmers) on the office can interact with the hardware with minimum/no knowledge of electronics and create fun on the walls.

Printables
==========
Lookout on "printables" dir for things that can be printed on laser cutters (mdf).
Notes: The best adjustment for mdf cutter is to use 20% of associated error on cut. So, if a 5mm piece is gonna to be linked to another, cut the other part with 6mm, so they can be easily mounted, still being firm.

Fork at will!
