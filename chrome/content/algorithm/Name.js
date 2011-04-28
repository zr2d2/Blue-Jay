/* Copyright (c) 2011 Bluejay <https://github.com/zr2d2/Blue-Jay>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the XXX License as published by the Free 
 * Sofeware Foundation.
 *
 * You should have received a copy of the XXX License along with this 
 * program. If not, please visit <http://www....>
 */
 
/* Name: Name
 * Description: the Name class serves essentially the same purpose as string
 */

 
function Name(passedVal) {
	//public function prototypes
	this.getName = getName;
	this.appendChar = appendChar;
	this.clear = clear;
	this.equalTo = equalTo;
	this.lessThan = lessThan;
	this.makeCopy = makeCopy;
	
	//private variables
	//value is passedVal if exists, else nil
	var value = passedVal;
	
	//public functions
	function getName() {
		return value;
	}
	
	function appendChar(newChar) {
		value = value+newChar;
	}
	
	function clear() {
		value = "";
	}
	
	function equalTo(other) {
	    if (this.getName() == other.getName()) {
	        return true;
	    }
	    return false;
	}
	
	function lessThan(other) {
	    if (this.getName() < other.getName()) {
	        return true;
	    }
	    return false;
	}
	function makeCopy() {
	    return new Name(this.getName());
	}
};