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

    // the latest date for which a rating was assigned	
	this.getLatestRatingDate = getLatestRatingDate;
		
	// whether the parent pointers are up to date
	this.needToUpdateParentPointers = needToUpdateParentPointers;
	
	// the date it was added to your library
	this.setDiscoveryDate = setDiscoveryDate;
	this.getDiscoveryDate = getDiscoveryDate;
	this.suspectDiscoveryDate = suspectDiscoveryDate;
	
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
	// the latest date at which there was an interaction
	var latestInteractionDate = new DateTime();
	var lastPlayDate = new DateTime();
	
	// the rating based on PredictionLinks before incorporating information about the parents
	var currentRating = new Distribution();	
	var latestRatingDate = new DateTime();	
	var parentLinksNeedUpdating = false;
	var discoveryDate;
    
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
	    // record the rating
		var i = 0;
		for (i = 0; i < ratingEstimators.length; i++){
			ratingEstimators[i].addRating(rating);
		}
		actualRatingHistory.addRating(rating);

		// update the latest interaction date
		latestInteractionDate = rating.getDate();
		
		// If we don't know when we were discovered, then assume we were discovered along with the first rating
		// If we think we were discovered after this rating, then it is actually more reasonable to say we were discovered when this rating was created 
		if ((!discoveryDate) || (strictlyChronologicallyOrdered(rating.getDate(), discoveryDate))) {
		    discoveryDate = rating.getDate();
		}
	}
	
	// inform the Candidate that it was listened to during a certain interval
	function giveParticipation(participation){
		var i = 0;
		// update the moving averages of the ratings
		for (i = 0; i < frequencyEstimators.length; i++){
			frequencyEstimators[i].addParticipationInterval(participation);
		}
		lastPlayDate = latestInteractionDate = participation.getEndTime();

		// If we don't know when we were discovered, then assume we were discovered along with the first participation
		// If we think we were discovered after this rating, then it is actually more reasonable to say we were discovered when this rating was created 
		if ((!discoveryDate) || (strictlyChronologicallyOrdered(participation.getStartTime(), discoveryDate))) {
		    discoveryDate = participation.getStartTime();
		}
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
	function setCurrentRating(value, when){
	
		currentRating = value;
		latestRatingDate = when;
	}

    // get the latest date for which a rating was assigned	
	function getLatestRatingDate() {
	    return latestRatingDate;
	}
			
	function needToUpdateParentPointers(){
	
		if(parentLinksNeedUpdating == true){
			
			parentLinksNeedUpdating = false; // type in cpp file
			return true;
		}
		return false;
	}
	
	// set the estimate for the date at which this Candidate was discovered
	// Returns true if the estimate is believable, false if the estimate is not believable
	function suspectDiscoveryDate(when) {
	    // Internally we estimate the discovery date based on the first time this song was played or rated.
	    // So, we only use outside suspicion of the discovery date if it does not move the discovery date later
	    if ((!discoveryDate) || (strictlyChronologicallyOrdered(when, discoveryDate))) {
	        this.setDiscoveryDate(when);
	        return true;
        }
        return false;
	}
	// declares that this Candidate was discovered that the given date
	function setDiscoveryDate(when) {
        // update the latest date at which there was an interaction
        if (strictlyChronologicallyOrdered(latestInteractionDate, when)) {
            latestInteractionDate = when;
        }
        discoveryDate = when;
	}
	// get the estimate for the date at which this Candidate was discovered
	function getDiscoveryDate(when) {
	    // if discoveryDate is valid...
	    if (discoveryDate) {
	        // ...then return it
    	    return discoveryDate;
        }
        else {
            // If we get here, then we don't have any data suggesting a discovery date.
            // So, assume it was discovered an extremely long time agon
            return new DateTime();
        }
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
		var numAverages = 1;
		var i = 0;
		ratingEstimators.length = numAverages;
		frequencyEstimators.length = numAverages;
		for (i = 0; i < numAverages; i++){
		    var newAverage = new ParticipationMovingAverage();
			newAverage.setName(new Name(name.getName() + " (participations) " + i));
			newAverage.setOwnerName(name);
			frequencyEstimators[i] = newAverage;
		}
		
		for (i = 0; i < numAverages; i++){
    		var newAverage = new RatingMovingAverage();
			newAverage.setName(new Name(name.getName() + " (ratings) " + i));
			newAverage.setOwnerName(name);
			ratingEstimators[i] = newAverage;		
		}
		
		actualRatingHistory.setName(new Name(name.getName() + " actual"));
		actualRatingHistory.setOwnerName(name);
		
		
	}
	
};