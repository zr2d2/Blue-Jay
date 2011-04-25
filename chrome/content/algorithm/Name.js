
/**
 *  Name object
 */

//TODO: operator< and operator== ?
 
function Name(passedVal) {
	//public function prototypes
	this.getName = getName;
	this.appendChar = appendChar;
	this.clear = clear;
	
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
};