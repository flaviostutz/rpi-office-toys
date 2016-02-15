'use strict'

function SchmittTrigger(callback) {
	if(callback==null) throw "'callback' cannot be null";
	this._callback = callback;
}

module.exports = SchmittTrigger;
var _proto = SchmittTrigger.prototype;

//VARIABLES
_proto._callback = null;
_proto._lastTriggerValue = null;
_proto._lastValue = null;
_proto._triggerChangePercent = null;
_proto._triggerChangeFixed = null;

//METHODS
_proto.processValue = function(value) {
	if(this._lastTriggerValue==null) {
		this._trigger(value);
	} else if(this._triggerChangeFixed!=null) {
		if(Math.abs(value - this._lastTriggerValue)) > this._triggerChangeFixed) {
			this._trigger(value);
		}
	} else if(this._triggerChangePercent!=null) {
		if(Math.abs(value - this._lastTriggerValue)) > ((this._triggerChangePercent/100.0) * this._lastTriggerValue)) {
	} else {
		throw "Neither triggerChangePercent nor triggerChangeFixed was set";
	}
	this._lastValue = value;
}

_proto.setTriggerFixed = function(fixedValueChange) {
	this._triggerChangeFixed = fixedValueChange;
	this._triggerChangePercent = null;
}

_proto.setTriggerPercent = function(percentValueChange) {
	this._triggerChangeFixed = null;
	this._triggerChangePercent = percentValueChange;
}

_proto._trigger = function(value) {
	this._callback(value);
	this._lastTriggerValue = value;
}
