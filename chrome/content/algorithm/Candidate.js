/* Copyright (c) 2011 Bluejay <https://github.com/zr2d2/Blue-Jay>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the XXX License as published by the Free 
 * Sofeware Foundation.
 *
 * You should have received a copy of the XXX License along with this 
 * program. If not, please visit <http://www....>
 */
 
/* Name: Candidate
 * Description: The Candidate class represent item such as a song, artist,
 * genre or other categories. All these items can have a ratings.
 */
 
 function Candidate(passedVal) {

	/* public function*/
	// Name
	this.setName = setName;
	this.getName = getName;
	
	// adding parent links
	this.addParentName = addParentName;
	this.addParent = addParent;
	
	// adding child links
	this.addChild = addChild;
	this.getParentNames = getParentNames;
	this.getParents = getParents;
	this.getChildren = getChildren;
	this.getNumChildren = getNumChildren;
	
	// informing the Candidate when it is rated
	this.giveRating = giveRating;
	
	// informing the Candidate when it is listened to
	this.giveParticipation = giveParticipation;
	
	// how many MovingAverages there are to estimate its rating.
	// Currently it's always 1
	this.getNumRatingEstimators = getNumRatingEstimators;
	
	// get the appropriate MovingAverage
	this.getRatingEstimatorAtIndex = getRatingEstimatorAtIndex;
	
	// how many MovingAverages there are to estimate how often 
	// it has been played recently. Currently it's always 1
	this.getNumFrequencyEstimators = getNumFrequencyEstimators;
	
	// get the appropriate MovingAverage for different index
	this.getFrequencyEstimatorAtIndex = getFrequencyEstimatorAtIndex;
	
	// get the MovingAverage that stores the exact ratings.
	// Currently this is the same as the rating estimator at index 0
	this.getActualRatingHistory =  getActualRatingHistory;
	
	// the current expected rating, based on data from other Candidates
	this.getCurrentRating = getCurrentRating;
	this.setCurrentRating = setCurrentRating;
		
	// whether the parent pointers are up to date
	this.needToUpdateParentPointers = needToUpdateParentPointers;
	
	// the date it was added to your library
	//this.setDiscoveryDate = setDiscoveryDate;
	
	// the duration (in seconds) between the latest listening and the time at 'when'
	this.getIdleDuration = getIdleDuration;
	this.getDurationSinceLastPlayed = getDurationSinceLastPlayed;
	// the average of all given ratings 
	this.getAverageRating = getAverageRating;
	
	
	/* private functions */
	var initialize;
	
	//private variables
	var name = passedVal;
	
	// parentNames is only used at the beginning for storing
	// names before the parents exist
	var parentNames = [];
	
	// 'parents' is faster to use than parentNames but holds the same information
	var parents = [];
	var children = [];
	var ratingEstimators = [];
	var frequencyEstimators = [];
	var actualRatingHistory = new RatingMovingAverage();
	var numRatings = false;
	var latestInteractionDate = new DateTime();
	var lastPlayDate = new DateTime();
	
	// the rating based on PredictionLinks before incorporating information about the parents
	var currentRating = new Distribution();	
	var parentLinksNeedUpdating = false;
	var discoveryDate = new DateTime();
    
	// call the constructor
	if (name) {
    	initialize();
    }
	
	//public functions
	
	// Setting the name of the Candidate must be done before assigning any ratings or participations
	function setName(newName){
		name = newName.makeCopy();
		initialize();
	}
	
	// parent/child connections
	function getName(){
		return name;
	}
	
	// adding new parent with name
	function addParentName(newName) {
		parentNames.push(newName);
		parentLinksNeedUpdating = true;
	}
	
	// adding new parent with candidate
	function addParent(newCandidate){
		
		parents.push(newCandidate);
	}
	
	// adding child
	function addChild(newChild){
	
		children.push(newChild);
	}
	
	// get parent name
	function getParentNames(){
	
		return parentNames;
	}
	
	// get parent
	function getParents(){
		
		return parents;
	}
	
	// get child
	function getChildren(){
	
		return children;
	}
	
	// get number of children
	function getNumChildren() {
	
	    return children.length;
	}
	
	// inform the candidate that the user gave it this rating
	function giveRating(rating)	{

		var i = 0;
		for (i=0; i<ratingEstimators.length; i++){
			
			ratingEstimators[i].addRating(rating);
		}
		actualRatingHistory.addRating(rating);
		latestInteractionDate = rating.getDate();
	}
	
	// inform the Candidate that it was listened to during a certain interval
	function giveParticipation(participation){
	
		var i = 0;
		// update the moving averages of the ratings
		for (i=0; i<frequencyEstimators.length; i++){
		
			frequencyEstimators[i].addParticipationInterval(participation);
		}
		numRatings++;
		lastPlayDate = latestInteractionDate = participation.getEndTime();
	}
	
	// returns the number of MovingAverages that try to estimate the current rating
	function getNumRatingEstimators(){
		
		return ratingEstimators.length;
	}
	
	// returns a particular rating estimator
	function getRatingEstimatorAtIndex(index){
	
		return ratingEstimators[index];
	}
	
	// returns the number of MovingAverages that try to estimate how often this song has been listened to recently
	function getNumFrequencyEstimators(){
	
		return frequencyEstimators.length;
	}
	
	// returns a particular frequency estimator
	function getFrequencyEstimatorAtIndex(index){
	
		return frequencyEstimators[index];
	}
	
	// returns the moving average that records the exact ratings
	function getActualRatingHistory(){
	
		return actualRatingHistory;
	}
	
	// returns current rating
	function getCurrentRating(){
	
		return currentRating;
	}
	
	// set current rating
	function setCurrentRating(value){
	
		currentRating = value;
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
	
	// Tells how long it has been since the song was heard or rated
	function getIdleDuration(when){
		return latestInteractionDate.timeUntil(when);
	}
	function getDurationSinceLastPlayed(when){
		return lastPlayDate.timeUntil(when);
	}
	
	function getAverageRating(){
		return actualRatingHistory.getAverageValue();
	}
	
	// constructor stuff
	function initialize(){
    	//alert("initializing candidate");
		numRatings = 0;
		var numAverages = 1;
		var i = 0;
		ratingEstimators.length = numAverages;
		frequencyEstimators.length = numAverages;
    	//alert("initializing participation averages");
		for (i = 0; i < numAverages; i++){
		    var newAverage = new ParticipationMovingAverage();
			newAverage.setName(new Name(name.getName() + " (participations) " + i));
			newAverage.setOwnerName(name);
			frequencyEstimators[i] = newAverage;
		}
    	//alert("done initializing participation averages");
		
		for (i = 0; i < numAverages; i++){
    		var newAverage = new RatingMovingAverage();
			newAverage.setName(new Name(name.getName() + " (ratings) " + i));
			newAverage.setOwnerName(name);
			ratingEstimators[i] = newAverage;		
		}
    	//alert("done initializing rating averages");
		
		actualRatingHistory.setName(new Name(name.getName() + " actual"));
		actualRatingHistory.setOwnerName(name);
		
    	//alert("done initializing candidate ");
		
	}
	
};