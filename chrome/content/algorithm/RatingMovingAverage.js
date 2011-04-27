/**
 * RatingMovingAverage Object
 */
 
 function RatingMovingAverage(){
    this.prototype = new MovingAverage(); 
//////////////////////////////////////////////// Superclass Function Prototypes ///////////////////////////////////////////////////
    // these functions are defined in the superclass and used in the subclass
	this.getCorrelationsFor = this.prototype.getCorrelationsFor;
	this.setName = this.prototype.setName;
	this.getName = this.prototype.setName;
	// the name of the Candidate that this MovingAverage describes
	this.setOwnerName = this.prototype.setOwnerName;
	this.getOwnerName = this.prototype.getOwnerName;
	this.stringVersion = this.prototype.stringVersion;

	this.superFunction = this.prototype.superFunction;
	this.prototype.subFunction = subFunction;

    // these functions are defined in the subclass
    this.addRating = addRating;
	this.getValueAt = getValueAt;  // if strictlyEarlier is true, then it will only use data from strictly before 'when'
	this.getRatings = getRatings;
	this.getNameRatings = getNumRatings;
	this.getAverageValue = getAverageValue;
	this.getLatestDate = getLatestDate;
	this.subFunction = subFunction;


	//public functions
	this.addRating = addRating;
	this.getValueAt = getValueAt;
	this.getRatings = getRatings;
	this.getNumRatings = getNumRatings;
	this.getAverageValue = getAverageValue;
	this.getLatestDate = getLatestDate;
	
	//private functions
	var getIndexForDate;
	//private variables
	var ratings = [];
	var sumRatings = [];
	var sumSquaredRatings = [];
	
	//public functions
	function addRating(rating){

		var totalScore = 0.0; 
		var totalWeight = 0.0;
		var totalSquaredScore = 0.0;
		
		if(sumRatings.length > 0){
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
			
	function getValueAt(when, strictlyEarlier){
		
		if (sumRatings.length == 0){
			return [Distribution(0, 0, 0), -1];
		}
		
		var firstRating = sumRatings[0];
		if(!strictlyChronologicallyOrdered(firstRating(firstRating.getDate(), when))) {
			return [Distribution(0, 0, 0), -1];
		}
		
		var lastestRatingIndex = getIndexForDate(when, strictlyEarlier);
		var latestRatingDate = sumRatings[latestRatingIndex].getDate();
		var duration = latestRatingDate.timeUntil(when);
		var oldestRatingDate = latestRatingDate.datePlusDuration(-duration);
		var earliestRatingIndex = getIndexForDate(oldestRatingDate, true);
		
		var latestSumRating = sumRatings[latestRatingIndex];
		var latestSumSquaredRating = sumSquaredRatings[latestRatingIndex];
		var earliestSumRating = sumRatings[earliestRatingIndex];
		var earliestSumSquaredRating = sumSquaredRatings[earliestRatingIndex];
		
		var sumY = 0.0;
		var sumY2 = 0.0;
		var sumWeight = 0.0;
		
		if(strictlyChronologicallyOrdered(oldestRatingDate, sumRatings[0].getDate())){
			sumY = latestSumRating.getScore();
			sumY2 = latestSumSquaredRating.getScore();
			sumWeight = latestSumRating.getWeight();
		}
		else{
			sumY = latestSumRating.getScore() - earliestSumRating.getScore();
			sumY2 = latestSumSquaredRating.getScore() - earliestSumSquaredRating.getScore();
			sumWeight = latestSumSquaredRating.getWeight() - earliestSumSquaredRating.getWeight();
		}
		
		var average = sumY/sumWeight;
		var stdDev = Math.sqrt((sumY2 - sumY * sumY/sumWeight)/sumWeight);
		var result = Distribution(average, stdDev, sumWeight);
		
		return [result, latestRatingIndex];
	}
	
	function getRatings(){
		return ratings;
	}
	
	function getNumRatings(){
		return sumRatings.length;
	}
	
	function getIndexForDate(when, strictlyEarlier){
		if(sumRatings.length < 1){
			return -1;
		}
		
		if(strictlyChronologicallyOrdered(sumRatings[sumRatings.length -1].getDate(), when)){
			return sumRatings.length - 1;
		}
		
		var lowerIndex = 0;
		var upperIndex = 0;
		var middleIndex = 0;
		
		upperIndex = sumRating.length - 1;
		
		while (upperIndex > lowerIndex + 1)
		{
			middleIndex = (lowerIndex + upperIndex) / 2;
			if (strictlyChronologicallyOrdered(sumRatings[middleIndex].getDate(), when)){
				lowerIndex = middleIndex;
			}
			else{
				upperIndex = middleIndex;
			}
		}
		
		var previousRating = sumRatings[lowerIndex];
		var nextRating = sumRatings[upperIndex];
		
		if (strictlyEarlier){
			return lowerIndex;
		}
		
		else
		{
			if(strictlyChronologicallyOrdered(when, nextRating.getDate())){
				return lowerIndex;
			}
			else{
				return upperIndex;
			}
		}
	}
	
	function getAverageValue(){
		if(sumRatings.length < 1){
			return 0;
		}
		
		return sumRatings[sumRatings.length -1].getScore()/(sumRatings.length);
	}
	
	function getLatestDate()
	{
		if(sumRatings.length < 1){
			return DateTime();
		}
		else{
			return sumRatings[sumRatings.length -1].getDate();
		}
	}
	
	function subFunction() {
	    alert("RatingMovingAverage subfunction. This is good.");
	}
}
		
		
		
		
		
		