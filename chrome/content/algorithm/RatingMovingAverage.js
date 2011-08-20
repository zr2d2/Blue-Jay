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

/* Name: Rating
 * Description: the RatingMovingAverage represents the progression of 
 * Ratings for a Candidate over time
 */

 function RatingMovingAverage() {
    this.prototype = new MovingAverage(); 

	/* Superclass Function Prototypes */
    // these functions are defined in the superclass and used in the subclass
	this.getCorrelationsFor = this.prototype.getCorrelationsFor;
	this.setName = this.prototype.setName;
	this.getName = this.prototype.getName;
	
	// the name of the Candidate that this MovingAverage describes
	this.setOwnerName = this.prototype.setOwnerName;
	this.getOwnerName = this.prototype.getOwnerName;
	this.stringVersion = this.prototype.stringVersion;
	this.superFunction = this.prototype.superFunction;
	this.getCurrentValue = this.prototype.getCurrentValue;
	
	// functions that we are overriding
	this.getValueAt = getValueAt;
	this.prototype.getValueAt = getValueAt;
	this.prototype.subFunction = subFunction;
	this.prototype.isAParticipationMovingAverage = isAParticipationMovingAverage;
	this.isAParticipationMovingAverage = isAParticipationMovingAverage;

    // these functions are defined in the subclass
    this.addRating = addRating;
	this.getRatings = getRatings;
	this.getNumRatings = getNumRatings;
	this.getNameRatings = getNumRatings;
	this.getAverageValue = getAverageValue;
	this.getLatestDate = getLatestDate;
	this.subFunction = subFunction;
	this.getIndexForDate = getIndexForDate;

	
	//private functions
	
	//private variables
	var ratings = [];
	var sumRatings = [];
	var sumSquaredRatings = [];
	
	//public functions
	function addRating(rating) {
		var totalScore = 0.0; 
		var totalWeight = 0.0;
		var totalSquaredScore = 0.0;
		
		if(sumRatings.length > 0) {
			var lastRating = sumRatings[sumRatings.length - 1];
			totalScore = lastRating.getScore();
			totalWeight = lastRating.getWeight();
			var sumSquaredRating = sumSquaredRatings[sumSquaredRatings.length - 1];
			totalSquaredScore = sumSquaredRating.getScore();
		} else {
			totalScore = totalWeigh = totalSquaredScore = 0;
		}
		
        //alert("rating moving average adding rating pt2\r\n");	
		// compute new running total
		var newTotalScore = totalScore + rating.getScore() * rating.getWeight();
		var newTotalWeight = totalWeight + rating.getWeight();
		var newRating = new Rating();
		newRating.setScore(newTotalScore);
		newRating.setWeight(newTotalWeight);
		newRating.setDate(rating.getDate());
		
		// save the new running total
		sumRatings.push(newRating);
        //alert("rating moving average adding rating pt3\r\n");	
		
		// compute new running squared total
		var newTotalSquaredScore = totalSquaredScore + rating.getScore() * rating.getScore() * rating.getWeight();
		var newSquaredRating = new Rating();
		newSquaredRating.setScore(newTotalSquaredScore);
		newSquaredRating.setWeight(newTotalWeight);
		newSquaredRating.setDate(rating.getDate());
		sumSquaredRatings.push(newSquaredRating);
		
		ratings.push(rating);
        //alert("rating moving average adding rating pt4\r\n");	
	}
			
    // if strictlyEarlier is true, then it will only use data from strictly before 'when'
	function getValueAt(when, strictlyEarlier) {
		//message("number of ratings = " + ratings.length + "\r\n");
		if (sumRatings.length == 0) {
		    message("ratingMovingAverage value = {empty distribution} at time = " + when.stringVersion());
			return [new Distribution(0, 0, 0), -1];
		}
		
		//message("when = " + when.stringVersion() + "\r\n");
		var firstRating = sumRatings[0];
		if(!strictlyChronologicallyOrdered(firstRating.getDate(), when)) {
			return [new Distribution(0, 0, 0), -1];
		    message("ratingMovingAverage value = {empty distribution} at time = " + when.stringVersion());
		}
		
		var latestRatingIndex = getIndexForDate(when, strictlyEarlier);
		//message("latest index = " + latestRatingIndex);
		var latestRatingDate = sumRatings[latestRatingIndex].getDate();
		var duration = latestRatingDate.timeUntil(when);
		//message("latestRatingDate = " + latestRatingDate.stringVersion() + "\r\n");
		var oldestRatingDate = latestRatingDate.datePlusDuration(-duration);
		//message("earliest relevant date = " + oldestRatingDate.stringVersion() + "\r\n");
		var earliestRatingIndex = getIndexForDate(oldestRatingDate, true);
		//message("earliest relevant index = " + earliestRatingIndex);
		var latestSumRating = sumRatings[latestRatingIndex];
		var latestSumSquaredRating = sumSquaredRatings[latestRatingIndex];
		var earliestSumRating = sumRatings[earliestRatingIndex];
		var earliestSumSquaredRating = sumSquaredRatings[earliestRatingIndex];
		
		var sumY = 0.0;
		var sumY2 = 0.0;
		var sumWeight = 0.0;
		//message("in the middle of RatingMovingAverage::pt e\r\n");
		
		if(strictlyChronologicallyOrdered(oldestRatingDate, sumRatings[0].getDate())) {
		    //message("oldestRatingDate comes before sumRatings[0]\r\n");
			sumY = latestSumRating.getScore();
			sumY2 = latestSumSquaredRating.getScore();
			sumWeight = latestSumRating.getWeight();
		}
		else{
		    //message("oldestRatingDate is at or after sumRatings[0]\r\n");
			sumY = latestSumRating.getScore() - earliestSumRating.getScore();
			sumY2 = latestSumSquaredRating.getScore() - earliestSumSquaredRating.getScore();
			sumWeight = latestSumSquaredRating.getWeight() - earliestSumSquaredRating.getWeight();
		}
		
		var average = sumY / sumWeight;
		//message("average = " + average + " ");
		var variance = (sumY2 - sumY * sumY / sumWeight) / sumWeight;
		//message("variance = " + variance + " ");
		if (variance < 0) {
		    variance = 0;
		}
		var stdDev = Math.sqrt(variance);
		//message("stdDev = " + stdDev + " ");
		//message("weight = " + sumWeight + " ");
		var result = new Distribution(average, stdDev, sumWeight);
		
		//message("done with RatingMovingAverage::getValueAt\r\n");
		message("ratingMovingAverage value: avg = " + result.getMean() + " stdDev = " + result.getStdDev() + " weight = " + result.getWeight() + " at date = " + when.stringVersion() + "\r\n");
		return [result, latestRatingIndex];
	}
	
	function getRatings() {
		return ratings;
	}
	function getNumRatings() {
	    return ratings.length;
	}
	
	function getNumRatings() {
		return sumRatings.length;
	}
    
    // returns the index of the latest rating before the given date ("when")	
	function getIndexForDate(when, strictlyEarlier) {
		if(sumRatings.length < 1) {
			return -1;
		}
		
		// check whether the target date is before the earliest date for which we have data
		var firstDate = sumRatings[0].getDate();
		if (strictlyEarlier) {
		    if (!strictlyChronologicallyOrdered(firstDate, when)) {
		        return -1;
		    }
        } else {
		    if (strictlyChronologicallyOrdered(when, firstDate)) {
		        return -1;
		    }
        }
		

		// check whether the target date is after the most recent date
        //alert("RatingMovingAverage::getIndexForDate nonzero");
		var finalDate = sumRatings[sumRatings.length - 1].getDate();
        //alert("RatingMovingAverage::getIndexForDate comparing last");
		if(strictlyChronologicallyOrdered(finalDate, when)) {
            //alert("RatingMovingAverage::getIndexForDate was last");
			return sumRatings.length - 1;
		}

        //alert("RatingMovingAverage::getIndexForDate not last");
		
		var lowerIndex = 0;
		var upperIndex = sumRatings.length - 1;
		var middleIndex = 0;
		
		while (upperIndex > lowerIndex + 1) {
			middleIndex = Math.floor((lowerIndex + upperIndex) / 2);
			//alert("middleIndex = " + middleIndex);
			if (strictlyChronologicallyOrdered(sumRatings[middleIndex].getDate(), when)) {
				lowerIndex = middleIndex;
			}
			else{
				upperIndex = middleIndex;
			}
		}
		
		var previousRating = sumRatings[lowerIndex];
		var nextRating = sumRatings[upperIndex];
		
		if (strictlyEarlier) {
			return lowerIndex;
		}
		else {
			if(strictlyChronologicallyOrdered(when, nextRating.getDate())) {
				return lowerIndex;
			}
			else{
				return upperIndex;
			}
		}
	}
	
	function getAverageValue() {
		if(sumRatings.length < 1) {
			return 0;
		}
		return sumRatings[sumRatings.length -1].getScore()/(sumRatings.length);
	}
	
	function getLatestDate() {
		if(sumRatings.length < 1) {
			return DateTime();
		}
		else{
			return sumRatings[sumRatings.length -1].getDate();
		}
	}
	
	function subFunction() {
	    alert("RatingMovingAverage subfunction. This is good.");
	}
	
	function isAParticipationMovingAverage() {
	    return false;
	}
}
		
		
		
		
		
		
