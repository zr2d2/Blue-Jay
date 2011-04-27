
/**
 *  Name object
 */

//TODO: operator< and operator== ?
 
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