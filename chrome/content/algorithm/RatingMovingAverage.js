/**
 * RatingMovingAverage Object
 */
 
 function RatingMovingAverage(){
	//public functions
	this.addRating = addRating;
	this.getValueAt = getValueAt;
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
			var lastRating = sumRatings[sumRatings.length];
			totalScore = lastRating.getScore();
			totalWeight = lastRating.getWeight();
			var sumSquaredRating = sumSquaredRatings[sumSquaredRatings];
			totalSquaredScore = sumSquaredRating.getScore();
		}
		else
		{
			totalScore = totalWeigh = totalSquaredScore = 0;
		}
		
		// compute new running total
		var newTotalScore = totalScore + rating.getScore() * rating.getWeight();
		var newTotalWeight = totalWeight + rating.getWeight();
		var newRating;
		newRating.setScore(newTotalScore);
		newRating.setWeight(newTotalWeight);
		newRating.setDate(rating.getDate());
		
		// save the new running total
		sumRatings.push(newRating);
		
		// compute new running squared total
		var newTotalSquaredScore = totalSquaredScore + rating.getScore() * rating.getScore() * rating.getWeight();
		var newSquaredRating;
		newSquaredRating.setScore(newTotalSquaredScore);
		newSquaredRating.setWeight(newTotalWeight);
		newSquaredRating.setDate(rating.getDate());
		sumSquaredRatings.push_back(newSquaredRating);
		
		ratings.push(rating);
	}
			
	
	