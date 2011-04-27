/**
*  DateTime object
*/

function DateTime(yyyymmddhhmmss) {
    //alert("constructing date");
    //public function prototypes
    this.datePlusDuration= datePlusDuration;
    this.stringVersion= stringVersion;
    this.timeUntil = timeUntil;
    this.setComponents = setComponents;

    //private variables 
    var value = new Date();
    setComponents(yyyymmddhhmmss);

    //public functions
    //create a new date equal to this date plus numSeconds
    function datePlusDuration(numSeconds) {
        var duration = new Date(numSeconds*1000);
        var result = new Date(value.getTime() + numSeconds*1000);
        if (timeUntil(result) != numSeconds*1000){
            alert(timeUntil(result).valueOf() + " not equal to " + numSeconds + " " + newTime );
        }
        return result;
    }

    // returns a printable string that represents this date
    function stringVersion() {
        return value.toString();
    }

    // the number of seconds from this to other
    function timeUntil(other) {
        var result = new Date();
        result = other.valueOf() - value.valueOf();
        return result;
    }

    //private functions

    // assign the given datestring to this date
    // An example datestring would be "1970 00 01 01 01 01"
    function setComponents(yyyymmddhhmmss) {
        if(!yyyymmddhhmmss){
            yyyymmddhhmmss = "1970 00 01 00 00 00";
        }
        var newTime = yyyymmddhhmmss.split(" ");
        value.setYear(newTime[0]);
        value.setMonth(newTime[1]);
        value.setDate(newTime[2]);
        value.setHours(newTime[3]);
        value.setMinutes(newTime[4]);
        value.setSeconds(newTime[5]);
    }
    //alert("done constructing date");
};

// returns true if t1 comes before t2, and false if t2 is equal to or after t1
function strictlyChronologicallyOrdered(t1, t2){
    if (t1.timeUntil(t2)>0){
        return true;
    }
    return false;
}

