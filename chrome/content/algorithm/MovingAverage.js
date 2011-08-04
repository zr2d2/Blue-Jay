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

/**
 * @class the MovingAverage class represents the progression of 
 * values of some attribute of a Candidate over time
 */
function MovingAverage() {
	/** Private Member Variables */
	var name;
	var ownerName;

	/** Public Methods */
      /**
       * returns a distribution of the expected values at this time, and
       * an integer identifying how many data points came before it
       */
	this.getValueAt = getValueAt;
	this.getCurrentValue = getCurrentValue;
	
	/** the vector returned is the relevant datapoints and the double
       * is the additional weight contributed by these datapoints
       */
	this.getCorrelationsFor = getCorrelationsFor;
	this.setName = setName;
	this.getName = getName;
	
	/** the name of the Candidate that this MovingAverage describes */
	this.setOwnerName = setOwnerName;
	this.getOwnerName = getOwnerName;
	
	/**
       * for determining if its type is ParticipationMovingAverage or not
       */
	this.isAParticipationMovingAverage = isAParticipationMovingAverage;		
	this.getLatestDate = getLatestDate;
	this.stringVersion = stringVersion;
    /** function definitions */
    
    /**
     * a MovingAverage doesn't know how to return its value. This
     * function must be overridden
     */
    function getValueAt(when, strictlyEarlier) {
        alert("MovingAverage::getValueAt() was called. This is an error.");
		
        /** setup an invalid distribution */
	    var distribution = new Distribution(0, 0, 0);
		
	  /**
         * return an array with the invalid
         * distribution and invalid index
         */
	    return [distribution, -1];
    }
	
    /** gets the current value of whatever variable we're tracking */
    function getCurrentValue(when, strictlyEarlier) {
        var resultArray = this.getValueAt(when, strictlyEarlier);
        var resultantDistribution = resultArray[0];
        return resultantDistribution;
    }
	
    /**
     * makes a bunch of datapoints that describe how the value of the
     * 'other' distribution changes with this one
     */
    function getCorrelationsFor(other, previousNumRatings) {
        /** message("MovingAverage::getCorrelationsFor pt0"); */
        var i;
        var otherRatings = other.getRatings();

        var results = [];
        /**
         * count how many individual x-values will
         * be used to create the prediction
         */
        var numChanges = 0; 
    
        /** var startingIndex = other.getIndexForDate(startTime, false) + 1; */
        /** message("MovingAverage::getCorrelationsFor pt1"); */
        var startingIndex = previousNumRatings;
        if ((otherRatings.length > 0) && (previousNumRatings < otherRatings.length)) {
            var startTime = otherRatings[previousNumRatings].getDate();
            /** find the starting index. This can
            * be optimized with a binary search! */
            for (i = otherRatings.length - 1; i >= 0; i--) {
                if (strictlyChronologicallyOrdered(otherRatings[i].getDate(), startTime))
                    break;
            }
            message("MovingAverage::getCorrelationsFor pt2");
            var startingIndex = i + 1;
            
            var x, y, weight;
            weight = 1;
            var previousIndex = this.getValueAt(startTime, true)[1];
            
    		
		    
            /**
             * don't count the transition from "undefined"
             * to "defined" as a change
             */
            if ((startingIndex == 0) || (previousIndex < 0))
                numChanges = -1;
    		
	        /**
               * This should be improved eventually.  We should give the
               * deviation of each point to the scatterplot in some
               * meaningful way
               */
              /** message("MovingAverage::getCorrelationsFor pt3"); */
            for (i = startingIndex; i < otherRatings.length; i++) {
                var value = this.getValueAt(otherRatings[i].getDate(), true);
                x = value[0].getMean();
                y = otherRatings[i].getScore();
                var ourIndex = value[1];
                if (ourIndex >= 0) {
                    /**message("MovingAverage::getCorrelationsFor pt4");*/
                    if (ourIndex != previousIndex) {
                        previousIndex = value[1];
                        numChanges++;
                    }
                    results.push(new Datapoint(x, y, weight));
                }
            }
        }
        /**
         * if we had to skip a change but there were
         * none to skip, then make it zero
         */
        if (numChanges < 0)
            numChanges = 0;
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
};