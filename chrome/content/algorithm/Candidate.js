/**
 * Candidate object
 */
 
 function Candidate(passedVal) {
 
	//public function
	//newCandidate = new Candidate;
	//newCandidate.initialize();

	this.setName = setName;
	this.getName = getName;
	this.addParentName = addParentName;
	this.addParent = addParent;
	this.addChild = addChild;
	this.getParentNames = getParentNames;
	this.getParents = getParents;
	this.getChildren = getChildren;
	this.giveRating = giveRating;
	this.giveParticipation = giveParticipation;
	this.getNumRatingEstimators = getNumRatingEstimators;
	this.getRatingEstimatorAtIndex = getRatingEstimatorAtIndex;
	this.getNumFrequencyEstimators = getNumFrequencyEstimators;
	this.getFrequencyEstimatorAtIndex = getFrequencyEstimatorAtIndex;
	this.getActualRatingHistory =  getActualRatingHistory;
	this.getCurrentRating = getCurrentRating;
	this.setCurrentRating = setCurrentRating;
	this.getCurrentRefinedRating = getCurrentRefinedRating;
	this.setCurrentRefinedRating = setCurrentRefinedRating;
	this.needToUpdateParentPointers = needToUpdateParentPointers;
	this.setDiscoveryDate = setDiscoveryDate;
	this.getIdleDuration = getIdleDuration;
	this.getAverageRating = getAverageRating;
	
	
	//private functions
	var initialize;
	
	//private variables
	var name = passedVal;
	var parentNames = []; //##### Use simple javascript ARRAY instead of vector #####
	var parents = [];
	var children = [];
	var ratingEstimators = [];
	var frequencyEstimators = [];
	var actualRatingHistory = new RatingMovingAverage();
	var numRatings = false;
	var latestRatingTime = new DateTime();
	var currentRating = new Distribution();
	var currentRefinedRating = new Distribution();
	var parentLinksNeeedUpdating = new Boolean();
	var discoveryDate = new DateTime();
    
	// call the constructor
	initialize();
	
	
	
	
	//public functions
	function setName(newName){
		name = newName;
		initialize();
	}
	
	function getName(){
		return name;
	}
		
	// ##### Problem? how to check the input argument data type??? #####
	function addParentName(newName)
	{	
		parentNames.push(newName);
	}
	
	function addParent(newCandidate){
		
		parents.push(newCandidate);
	}
	
	function addChild(newChild){
	
		children.push(newChild);
	}
	
	function getParentNames(){
	
		return parentNames;
	}
	
	function getParents(){
		
		return parents;
	}
	
	function getChildren(){
	
		return children;
	}
	
	function giveRating(rating)
	{
		var i = 0;
		for (i=0; i<ratingEstimators.length; i++){
			
			ratingEstimators[i].addRating(rating);
		}
		actualRatingHistory.addRating(rating);
	}
	
	function giveParticipation(participation){
	
		var i = 0;
		for (i=0; i<frequencyEstimators.length; i++){
		
			frequencyEstimators[i].addParticipationInterval(participation);
		}
		numRatings++;
		latestRatingTime = participation.getEndTime();
	}
	
	function getNumRatingEstimators(){
		
		return ratingEstimators.length;
	}
	
	function getRatingEstimatorAtIndex(index){
	
		return ratingEstimators[index];
	}
	
	function getNumFrequencyEstimators(){
	
		return frequencyEstimators.length;
	}
	
	function getFrequencyEstimatorAtIndex(index){
	
		return frequencyEstimators[index];
	}
	
	function getActualRatingHistory(){
	
		return actualRatingHistory;
	}
	
	function getCurrentRating(){
	
		return currentRating;
	}
	
	function setCurrentRating(value){
	
		currentRating = value;
	}
	
	function getCurrentRefinedRating(){
	
		return currentRefinedRating;
	}
	
	function setCurrentRefinedRating(value){
		
		return currentRefinedRating = value;
	}
	
	function needToUpdateParentPointers(){
	
		if(parentLinksNeedUpdating == true){
			
			parentLinksNeedUpdating = false; // type in cpp file
			return true;
		}
		return false;
	}
	
	function setDiscoveryDate(when){
	
		discoveryDate = when;
	}
	
	function getIdleDuration(when){
	
		var latestDate = new DateTime();
		var frequencies = getFrequencyEstimatorAtIndex(0);
		if (frequencies.getNumParticipations() > 0){
		
			latestDate = frequencies.getLatestDate();
		} else{
			latestDate = discoveryDate;
		}
		
		return latestDate.timeUntil(when);
	}
	
	function getAverageRating(){
		return actualRatingHistory.getAverageValue();
	}
	
	
	function initialize(){
    	alert("initializing candidate");
		numRatings = 0;
		var numAverages = 1;
		var i = 0;
		ratingEstimators.length = numAverages;
		frequencyEstimators.length = numAverages;
    	//alert("initializing participation averages");
		for (i = 0; i < numAverages; i++){
		    var newAverage = new ParticipationMovingAverage();
			newAverage.setName(new Name(name.getName() + " (participations)"));
			newAverage.setOwnerName(name);
			frequencyEstimators[i] = newAverage;
		}
    	//alert("done initializing participation averages");
		
		for (i = 0; i < numAverages; i++){
    		var newAverage = new RatingMovingAverage();
			newAverage.setName(new Name(name.getName() + " (ratings)"));
			newAverage.setOwnerName(name);
			ratingEstimators[i] = newAverage;		
		}
    	//alert("done initializing rating averages");
		
		actualRatingHistory.setName(new Name(name.getName() + " actual "));
		actualRatingHistory.setOwnerName(name);
		
    	alert("done initializing candidate ");
		
	}
	
};