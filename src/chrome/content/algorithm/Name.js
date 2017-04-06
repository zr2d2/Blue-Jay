/*
    Copyright (C) 2012 Bluejay

    This file is part of Bluejay.

    Bluejay is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Bluejay is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Bluejay.  If not, see <http://www.gnu.org/licenses/>.
*/

/* Name: Name
 * Description: the Name class serves essentially the same purpose as string
 */

function Name(passedVal) {
	//public function prototypes
	this.getName = getName;
	this.getText = getName;
	this.appendChar = appendChar;
	this.clear = clear;
	this.equalTo = equalTo;
	this.lessThan = lessThan;
	this.makeCopy = makeCopy;
	this.isNull = isNull;
	
	//private variables
	//value is passedVal if exists, else nil
	var value = passedVal;
	
	//public functions
	// this function will start to be replaced by the function getText() for more readibility
	function getName() {
		return value;
	}
	function getText() {
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
	function isNull() {
	    if (this.getName())
	        return false;
	    return true;
	}
};
