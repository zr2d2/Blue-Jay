/**
 *  DateTime object
 */
 
function DateTime(yyyymmddhhmmss) {
	//public function prototypes
	this.datePlusDuration= datePlusDuration;
	this.stringVersion= stringVersion;
	this.timeUntil = timeUntil;
	
	//private variables 
	var value;
	
	//public functions
	//create a new date equal to this date plus numSeconds
	function datePlusDuration(numSeconds) {
		var result;
		result = value + numSeconds;
		if (timeUntil(result) != numSeconds){
			document.write("date addition error");
		}
		return result;
	}
	
	// returns a printable string that represents this date
	function stringVersion() {
		return value.toString();
	}

	// the number of seconds from this to other
	function timeUntil(other) {
		var result;
		result = other - this.value;
		return result;
	}

	//private functions

	// assign the given datestring to this date
	// An example datestring would be "1970-01-01T01:01:01"
	function setComponents(yyyymmddhhmmss) {
		value = yyyymmddhhmmss | "1970-01-01T01:01:01";

	}

	// returns true if t1 comes before t2, and false if t2 is equal to or after t1
	function strictlyChronologicallyOrdered(t1, t2){
		if (t1.timeUntil(t2)>0){
			return true;
		}
		return false;
	}
	
};
