
/**
 * The class that represents the value of a variable over time
 */
 
function ParticipationMovingAverage() {
    this.prototype = new MovingAverage();
//////////////////////////////////////////////// Superclass Function Prototypes ///////////////////////////////////////////////////
    // these functions are defined in the superclass and used in the subclass
	// returns a distribution of the expected values at this time, and an integer identifying how many data points came before it
	// the vector returned is the relevant datapoints and the double is the additional weight contributed by these datapoints
	this.getCorrelationsFor = this.prototype.getCorrelationsFor;
	this.setName = this.prototype.setName;
	this.getName = this.prototype.setName;
	// the name of the Candidate that this MovingAverage describes
	this.setOwnerName = this.prototype.setOwnerName;
	this.getOwnerName = this.prototype.getOwnerName;
	this.stringVersion = this.prototype.stringVersion;

	this.superFunction = this.prototype.superFunction;
	this.prototype.subFunction = subFunction;
    
//////////////////////////////////////////////// Function Prototypes ///////////////////////////////////////////////////
    // these functions are defined in the subclass
	this.addParticipationInterval = addParticipationInterval;
	this.getValueAt = getValueAt;  // if strictlyEarlier is true, then it will only use data from strictly before 'when'
	this.getCurrentValue = getCurrentValue;  // if strictlyEarlier is true, then it will only use data from strictly before 'when'
	this.isAParticipationMovingAverage = isAParticipationMovingAverage;		// for determining if its type is ParticipationMovingAverage or not
	this.getLatestDate = getLatestDate;
	this.getNumParticipations = getNumParticipations;
	this.subFunction = subFunction;
	this.getIndexForDate = getIndexForDate;
	this.getTotalIntensityThroughDate = getTotalIntensityThroughDate;



/////////////////////////////////////////////////// Private Member Variables ///////////////////////////////////////////////////
	var totalIntensities = []

/////////////////////////////////////////////////// Function Prototypes ///////////////////////////////////////////////////
	
/////////////////////////////////////////////////// Function Definitions ///////////////////////////////////////////////////
    // inform this ParticipationMovingAverage that the Candidate that it cares about was listened to in the given interval
	function addParticipationInterval(interval) {
	    // compute the total of previously observed intensities
	    var startTime = interval.getStartTime();
	    var endtime = interval.getEndTime();
	    var preTotalIntensity = 0;
	    if (this.totalIntensities.length > 0) {
	        preTotalIntensity = this.totalIntensities[totalIntensities.length - 1].getIntensity;
	    }
	    // compute the total intensity and add it to the total
	    var duration = startTime.timeUntil(endTime);
	    var postTotalIntensity = preTotalIntensity + duration * interval.getIntensity();
	    // replace the intensity per unit time with a total intensity
	    interval.setIntensity(postTotalIntensity);
	    // save the interval
	    this.totalIntensities.push(interval);	    
	}
    // find the most recent participation that was started before "when"
	function getIndexForDate(when, strictlyEarlier) {
	    if (this.totalIntensities.length < 1) {
    	    return -1;
    	}
    	if (strictlyChronologicallyOrdered(when, this.totalIntensities[0].getStartTime())) {
    	    return -1;
    	}
    	if (strictlyChronologicallyOrdered(this.totalIntensities[totalIntensities.length - 1].getStartTime(), when)) {
		    return this.totalIntensities.size() - 1;
		}
	    // If there are participations then we binary search for the most recent one
	    var lowerIndex, upperIndex, middleIndex;
	    lowerIndex = 0;
	    upperIndex = this.totalIntensities.size() - 1;
	    // find the most recent participation that was started strictly before "when"
	    while (upperIndex > lowerIndex + 1) {
		    middleIndex = (lowerIndex + upperIndex) / 2;
		    if (strictlyChronologicallyOrdered(this.totalIntensities[middleIndex].getStartTime(), when)) {
			    lowerIndex = middleIndex;
		    } else {
			    upperIndex = middleIndex;
		    }
	    }
	    if (strictlyEarlier) {
		    return lowerIndex;
	    } else {
		    if (strictlyChronologicallyOrdered(when, totalIntensities[upperIndex].getStartTime()))
			    return lowerIndex;
		    else
			    return upperIndex;
	    }
	}
    // adds up the total amount of listening through the date 'when'. It's optimized so it's faster than actually counting them all every time
	function getTotalIntensityThroughDate(when) {
		var index = this.getIndexForDate(when, true);
	    if (index < 0)
		    return 0;
	    var mostRecentParticipation = this.totalIntensities[index];
	    // if it is after the end of the interval, then the total is still the total at the end of the interval
	    if (strictlyChronologicallyOrdered(mostRecentParticipation.getEndTime(), when))
		    return mostRecentParticipation.getIntensity();
	    // if it's in the middle of the interval, we linearly interpolate
	    var previousTotal;
	    // compute the previous total
	    if (index == 0) {
		    previousTotal = 0;
	    } else {
		    previousTotal = this.totalIntensities[index - 1].getIntensity();
	    }
	    var currentDuration = mostRecentParticipation.getStartTime().timeUntil(when);
	    var totalDuration = mostRecentParticipation.getStartTime().timeUntil(mostRecentParticipation.getEndTime());
	    var currentComponent;
	    if (totalDuration == 0) {
		    currentComponent = 0;
	    } else {
		    currentComponent = (mostRecentParticipation.getIntensity() - previousTotal) * currentDuration / totalDuration;
	    }
	    var result = previousTotal + currentComponent;
	    return result;
	}
	// returns a pair with the distribution of expected values and an index telling which participation mattered the most in its calculation
    // if strictlyEarlier is true, then it will only use data from strictly before 'when'
	function getValueAt(when, strictlyEarlier) {
		// stictlyEarlier is ignored in this function at the moment
	    // If there are no ratings then we default to 0
	    if (this.totalIntensities.size() < 1)
		    return [new Distribution(0, 0, 0), -1];
	    // If the time is before the first one then we default to 0
	    var firstParticipation = this.totalIntensities[0];
	    if (!strictlyChronologicallyOrdered(firstParticipation.getStartTime(), when))
		    return [Distribution(0, 0, 0), -1];

	    var mostRecentIndex = this.getIndexForDate(when, true);
	    var averageIntensity;
	    if (mostRecentIndex > 0) {
		    var previousIndex = mostRecentIndex - 1;
		    var previousParticipation = totalIntensities[previousIndex];
		    var previousDuration = previousParticipation.getEndTime().timeUntil(when);
		    if (previousDuration < 1)
			    previousDuration = 1;
		    averageIntensity = 2 / previousDuration;
	    } else {
		    var mostRecentParticipation = totalIntensities[mostRecentIndex];
		    var mostRecentDuration = mostRecentParticipation.getEndTime().timeUntil(when);
		    if (mostRecentDuration < 1)
			    mostRecentDuration = 1;
		    averageIntensity = 1 / mostRecentDuration;
	    }
	    var result = new Distribution(averageIntensity, 0, 1);
	    return [result, mostRecentIndex];
	}
	
	// compute the current value, including the most recent participation
    // This is different from the function getValueAt because it only uses the most recent participation, not any earlier ones
    // if strictlyEarlier is true, then it will only use data from strictly before 'when'
	function getCurrentValue(when, strictlyEarlier) {
		// default when there's no data
	    if (this.totalIntensities.size() < 1)
		    return new Distribution(0, 0, 0);
	    // If the time is before the first one then we default to 0
	    var firstParticipation = this.totalIntensities.front();
	    if (!strictlyChronologicallyOrdered(firstParticipation.getStartTime(), when))
		    return new Distribution(0, 0, 0);
	    // find the most recent participation
	    var mostRecentIndex = this.getIndexForDate(when, true);
	    var averageIntensity;
	    var mostRecentParticipation = totalIntensities[mostRecentIndex];
	    var mostRecentDuration = mostRecentParticipation.getEndTime().timeUntil(when);
	    // compute the date twice as far in the past
	    var startDate = mostRecentParticipation.getStartTime().datePlusDuration(-mostRecentDuration);
	    // count the average number of times per second that this song is heard (it will be a pretty small number)
	    var totalDuration = startDate.timeUntil(when);
	    if (totalDuration < 0)
		    totalDuration = 1;
	    var startIndex = this.getIndexForDate(startDate, true);
	    averageIntensity = (mostRecentIndex - startIndex) / totalDuration;
	    var result = new Distribution(averageIntensity, 0, 1);
	    return result;
	}
	function isAParticipationMovingAverage() {
	    return true;
	}
	function getLatestDate() {
		if (this.totalIntensities.size() < 1)
		    return DateTime();
	    else
		    return this.totalIntensities.back().getEndTime();
	}
	function getNumParticipations() {
	    return this.totalIntensities.size();
	}	
	function subFunction() {
	    alert("ParticipationMovingAverage subfunction. This is good.");
	}
};