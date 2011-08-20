/*
    Copyright (C) 2011 Bluejay

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

/* Name: ParticipationMovingAverage
 * Description: The ParticipationMovingAverage class represents the value
 * of a variable over time
 */

function ParticipationMovingAverage() {
    this.prototype = new MovingAverage();
    /* Superclass Function Prototypes */
	
    // These functions are defined in the superclass and used in the subclass
	// returns a distribution of the expected values at this time, and an integer identifying how many data points came before it
	// the vector returned is the relevant datapoints and the double is the additional weight contributed by these datapoints
	this.getCorrelationsFor = this.prototype.getCorrelationsFor;
	this.setName = this.prototype.setName;
	this.getName = this.prototype.getName;
	
	// the name of the Candidate that this MovingAverage describes
	this.setOwnerName = this.prototype.setOwnerName;
	this.getOwnerName = this.prototype.getOwnerName;
	this.stringVersion = this.prototype.stringVersion;
	
	// functions that we are overriding
	this.getValueAt = getValueAt;
	this.prototype.getValueAt = getValueAt;
	
	// if strictlyEarlier is true, then it will only use data from strictly before 'when'
	this.getCurrentValue = getCurrentValue;  
	this.prototype.getCurrentValue = getCurrentValue;
    
    /* Function Prototypes */
	
    // these functions are defined in this subclass
	this.addParticipationInterval = addParticipationInterval;
	
	// for determining if its type is ParticipationMovingAverage or not
	this.isAParticipationMovingAverage = isAParticipationMovingAverage;
	this.getLatestDate = getLatestDate;
	this.getNumParticipations = getNumParticipations;
	this.getIndexForDate = getIndexForDate;
	this.getTotalIntensityThroughDate = getTotalIntensityThroughDate;


    /* Private Member Variables */
	var totalIntensities = []

    /* Function Prototypes */
	
    // inform this ParticipationMovingAverage that the Candidate that it cares about was listened to in the given interval
	function addParticipationInterval(interval) {
	
	    // compute the total of previously observed intensities
	    var startTime = interval.getStartTime();
	    var endTime = interval.getEndTime();
	    var preTotalIntensity = 0;
	    if (totalIntensities.length > 0) {
	        preTotalIntensity = totalIntensities[totalIntensities.length - 1].getIntensity();
	    }
	    //alert("::addparticipation p3\r\n");
	    //alert("startTime = " + startTime.stringVersion() + "\r\n");
	    //alert("endTime = " + endTime.stringVersion() + "\r\n");
		
	    // compute the total intensity and add it to the total
	    var duration = startTime.timeUntil(endTime);
	    //alert("::addparticipation p4\r\n");
	    var postTotalIntensity = preTotalIntensity + duration * interval.getIntensity();
		
	    // replace the intensity per unit time with a total intensity
	    //alert("::addparticipation p5\r\n");
	    interval.setIntensity(postTotalIntensity);
		
	    // save the interval
	    //alert("::addparticipation p6\r\n");
	    totalIntensities.push(interval);	    
	    //alert("::addparticipation p7\r\n");
	}
	
    // find the index of the most recent participation that was started before "when"
	function getIndexForDate(when, strictlyEarlier) {
		//message("ParticipationMovingAverage::getIndexForDate\r\n");
	    if (totalIntensities.length < 1) {
    	    return -1;
    	}
    	if (strictlyChronologicallyOrdered(when, totalIntensities[0].getStartTime())) {
    	    return -1;
    	}
    	if (strictlyChronologicallyOrdered(totalIntensities[totalIntensities.length - 1].getStartTime(), when)) {
		    return totalIntensities.length - 1;
		}
		
	    // If there are participations then we binary search for the most recent one
	    var lowerIndex, upperIndex, middleIndex;
	    lowerIndex = 0;
	    upperIndex = totalIntensities.length - 1;
		
	    // find the most recent participation that was started strictly before "when"
	    while (upperIndex > lowerIndex + 1) {
		    middleIndex = Math.floor((lowerIndex + upperIndex) / 2);
		    if (strictlyChronologicallyOrdered(totalIntensities[middleIndex].getStartTime(), when)) {
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
	    var mostRecentParticipation = totalIntensities[index];
		
	    // if it is after the end of the interval, then the total is still the total at the end of the interval
	    if (strictlyChronologicallyOrdered(mostRecentParticipation.getEndTime(), when))
		    return mostRecentParticipation.getIntensity();
			
	    // if it's in the middle of the interval, we linearly interpolate
	    var previousTotal;
		
	    // compute the previous total
	    if (index == 0) {
		    previousTotal = 0;
	    } else {
		    previousTotal = totalIntensities[index - 1].getIntensity();
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
		//message("ParticipationMovingAverage::getValueAt\r\n");
		// stictlyEarlier is ignored in this function at the moment
	    // If there are no ratings then we default to 0
	    if (totalIntensities.length < 1) {
		
	        //message("no participations\r\n");
		    return [new Distribution(0, 0, 0), -1];
        }
		
	    // If the time is before the first one then we default to 0
	    var firstParticipation = totalIntensities[0];
	    if (!strictlyChronologicallyOrdered(firstParticipation.getStartTime(), when)) {
		    return [new Distribution(0, 0, 0), -1];
        }

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
	    message("participationMovingAverage value = " + averageIntensity + " for date = " + when.stringVersion() + "\r\n");
	    return [result, mostRecentIndex];
	}
	
	// compute the current value, including the most recent participation
    // This is different from the function getValueAt because it only uses the most recent participation, not any earlier ones
    // if strictlyEarlier is true, then it will only use data from strictly before 'when'
	function getCurrentValue(when, strictlyEarlier) {
		// default when there's no data
	    if (totalIntensities.length < 1)
		    return new Distribution(0, 0, 0);
	    // If the time is before the first one then we default to 0
	    var firstParticipation = totalIntensities[0];
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
	    message("participationMovingAverage current value = " + averageIntensity + ", or once in every " + 1 / 86400 / averageIntensity + " days \r\n");
	    return result;
	}
	function isAParticipationMovingAverage() {
	    return true;
	}
	function getLatestDate() {
		if (totalIntensities.length < 1)
		    return new DateTime();
	    else
		    return totalIntensities[totalIntensities.length - 1].getEndTime();
	}
	function getNumParticipations() {
	    return totalIntensities.length;
	}	
};
