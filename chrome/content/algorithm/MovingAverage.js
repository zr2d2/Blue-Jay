
/**
 * The class that represents the value of a variable over time
 */
 
function MovingAverage() {
/////////////////////////////////////////////////// Private Member Variables ///////////////////////////////////////////////////
	var name;
	var ownerName;

/////////////////////////////////////////////////////// Public Methods ///////////////////////////////////////////////////
    // returns a distribution of the expected values at this time, and an integer identifying how many data points came before it
	this.getValueAt = getValueAt;
	this.getCurrentValue = getCurrentValue;
	// the vector returned is the relevant datapoints and the double is the additional weight contributed by these datapoints
	this.getCorrelationsFor = getCorrelationsFor;
	this.setName = setName;
	this.getName = getName;
	// the name of the Candidate that this MovingAverage describes
	this.setOwnerName = setOwnerName;
	this.getOwnerName = getOwnerName;
	this.isAParticipationMovingAverage = isAParticipationMovingAverage;		// for determining if its type is ParticipationMovingAverage or not
	this.getLatestDate = getLatestDate;
	this.stringVersion = stringVersion;
	this.superFunction = superFunction;
	this.subFunction = subFunction;
    // function definitions
    
    // a MovingAverage doesn't know how to return its value. This function must be overriden    
    function getValueAt(when, strictlyEarlier) {
        alert("MovingAverage::getValueAt() was called. This is an error.");
        // setup an invalid distribution
	    var distribution = new Distribution(0, 0, 0);
	    // return an array with the invalid distribution and invalid index
	    return [distribution, -1];
    }
    // gets the current value of whatever variable we're tracking
    function getCurrentValue(when, strictlyEarlier)
    {
        var resultArray = this.getValueAt(when, strictlyEarlier);
        var resultantDistribution = resultArray[0];
        return resultantDistribution;
    }
    // makes a bunch of datapoints that describe how the value of the 'other' distribution changes with this one
    function getCorrelationsFor(other, startTime) {
        var i;
        var otherRatings = other.getRatings();
        // find the starting index. This can be optimized with a binary search!
        for (i = otherRatings.length - 1; i >= 0; i--) {
            if (strictlyChronologicallyOrdered(otherRatings[i].getDate(), startTime))
			    break;
        }
        var startingIndex = i + 1;
        var results = [];
        var x, y, weight;
        weight = 1;
        var previousIndex = this.getValueAt(startTime, true)[1];
        var numChanges = 0; // count how many individual x-values will be used to create the prediction
	    // This should be improved eventually.
	    // We should give the deviation of each point to the scatterplot in some meaningful way
        for (i = startingIndex; i < otherRatings.length; i++) {
            var value = this.getValueAt(otherRatings[i].getDate(), True);
            x = value[0].getMean();
            y = otherRatings[i].getWeight();
            if (value.second != previousIndex) {
                previousIndex = value[1];
                numChanges++;
            }
            results.push(new Datapoint(x, y, weight));
        }
        return [results, numChanges];	
    }
    function setName(newName) {
        name = newName;
    }
    function getName() {
        return name;
    }
    function setOwnerName(newName) {
        this.ownerName = newName;
    }
    function getOwnerName() {
        return this.ownerName;
    }
    function isAParticipationMovingAverage() {
        alert("MovingAverage::isAParticipationMovingAverage() was called. This is an error.");
        return false;
    }
    function getLatestDate() {
        alert("MovingAverage::getLatestDate() was called. This is an error.");
        return new DateTime();
    }
    function stringVersion() {
        return "I am a MovingAverage";
    }
    function superFunction() {
        alert("super function");
        this.subFunction();
    }
    function subFunction() {
        alert("super version of sub function. This is bad");
    }
};