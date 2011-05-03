/* Copyright (c) 2011 Bluejay <https://github.com/zr2d2/Blue-Jay>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the XXX License as published by the Free 
 * Sofeware Foundation.
 *
 * You should have received a copy of the XXX License along with this 
 * program. If not, please visit <http://www....>
 */
 
/* Name: TimeBasedRecommendor
 * Description: the TimeBasedRecommendor is the engine that computes 
 * recommendations from the data
 */
 
function TimeBasedRecommendor() {

	/* Private Member Variables */

    // setup some maps so that we can store all the data in memory and then update properly
    // Basically the concern is that can't add a rating to a candidate that doesn't exist yet
    // So we store everything, then create the candidates, then add the ratings
	
    var candidates = {};        // a map of all candidates (with key equal to its name)
    var leafVector = [];    // a vector of all candidates with no children
    var ratings = [];           // a vector of all ratings
    var participations = [];    // a vector of all partipations
    var predictionLinks = {};   // the set of all prediction links
    var latestDate = new DateTime();
    
    var ratingsFilename = "bluejay_ratings.txt";
    var inheritancesFilename = "bluejay_inheritances.txt";
    //alert("constructing a recommendor point 2");

	/* Public Methods */

	// the functions parseArguments has been skipped for now
    
    /* function prototypes */
	
    // functions to add data
    this.updateLinks = updateLinks;
    this.readFiles = readFiles;
    this.readFile = readFile;
    this.addCandidate = addCandidate;
    // give the previously unseen rating to the engine
    this.addRating = addRating;
    // restore the previously seen rating and don't write it to a file
    this.putRatingInMemory = putRatingInMemory;
    // save this rating to a text file
    this.writeRating = writeRating;
    // give the previously unseen participation to the engine and write it to a file
    this.addParticipation = addParticipation;
    // restore the previously seen participation and don't write it to a file
    this.putParticipationInMemory = putParticipationInMemory;
    // save this participation to a text file
    this.writeParticipation = writeParticipation;
    // give this rating to all the Candidates that need it    
    this.cascadeRating = cascadeRating;
    // give this participation to all the Candidates that need it
    this.cascadeParticipation = cascadeParticipation;
    this.linkCandidates = linkCandidates;
    this.linkAverages = linkAverages;
    this.updateChildPointers = updateChildPointers;
    this.addSomeTestLinks = addSomeTestLinks;
    this.updatePredictions = updatePredictions;
    this.createFiles = createFiles;
    this.writeParticipation = writeParticipation;
	
    // search functions
    this.findAllSuperCategoriesOf = findAllSuperCategoriesOf;
    this.getCandidateWithName = getCandidateWithName;
    this.getLinkFromMovingAverages = getLinkFromMovingAverages;
    this.rateCandidate = rateCandidate;
    this.makeRecommendation = makeRecommendation;
    this.addDistributions = addDistributions;
    this.averageDistributions = averageDistributions;
    
    // print functions
    this.printCandidate = printCandidate;
    this.printRating = printRating;
    this.printDistribution = printDistribution;
    this.printParticipation = printParticipation;
    this.message = message;
    // functions for testing that it all works
    this.test = test;

    function updateLinks() {
        alert("recommendor updating child pointers");
        this.updateChildPointers();
        alert("recommendor adding test links");
		this.addSomeTestLinks();
        //alert("recommendor updating predictiongs");
		//this.updatePredictions();
    }
    // function definitions
    // reads all the necessary files and updates the TimeBasedRecommendor accordingly
    function readFiles() {
        alert("recommendor reading files");
        //this.readFile(inheritancesFilename);
        this.createFiles();
        this.readFile(ratingsFilename);
		this.updateLinks();
		this.updatePredictions();
		message("recommendor done reading files\r\n");
		alert("recommendor done reading files");
    }
    // reads one file
    function readFile(fileName) {
        //alert("recommendor reading file");
        
        
        message("opening file " + fileName + "\r\n");

        // display a message
        var fileContents = FileIO.readFile(fileName);
        
        //message("initializing temporary variables");

	    var currentChar;
	    var startTag = new Name();
	    var endTag = new Name();
	    var stackCount = 0;
	    var readingStartTag = false;
	    var readingValue = false;
	    var readingEndTag = false;
        //message("initializing local candidate");
	    var candidate = new Candidate();
        //message("initializing local name");
	    var value = new Name();
	    var objectName = new Name();
        //message("initializing local rating");
	    var rating = new Rating();
	    var activityType = new Name();
        //message("initializing local participation");
	    var participation = new Participation();
    	
	    // setup some strings to search for in the file
	    var candidateIndicator = new Name("Candidate");
	    var nameIndicator = new Name("Name");
	    var parentIndicator = new Name("Parent");
	    var discoveryDateIndicator = new Name("DiscoveryDate");

        //message("done initializing some temporary variables");
        
	    var ratingIndicator = new Name("Rating");
	    var ratingActivityIndicator = new Name("Activity");
	    var ratingDateIndicator = new Name("Date");
	    var ratingValueIndicator = new Name("Score");

	    var participationIndicator = new Name("Participation");
	    var participationActivityIndicator = new Name("Activity");
	    var participationStartDateIndicator = new Name("StartDate");
	    var participationEndDateIndicator = new Name("EndDate");

	    var currentDate = new DateTime();
	    var characterIndex;
	    alert("starting to parse file text");
	    // read until the file is finished
	    for (characterIndex = -1; characterIndex < fileContents.length; ) {
		    // Check if this is a new starttag or endtag
		    characterIndex++;
		    currentChar = fileContents[characterIndex];
		    
		    //message(currentChar);
		    // Check if this is the end of a tag
		    if (currentChar == '>') {
		        //message(value.getName());
			    //message(">\r\n");
			    characterIndex++;
			    currentChar = fileContents[characterIndex];
			    if (readingStartTag) {
				    if (stackCount == 1) {
					    // If we get here, then we just read the type of the object that is about to follow
					    objectName = startTag.makeCopy();
				    }
				    //message("start tag = ");
				    //message(startTag.getName() + ">");
				    value.clear();
				    readingValue = true;
			    }
			    if (readingEndTag) {
				    //message("end tag = ");
				    //message(endTag.getName() + ">\r\n");
				    if (stackCount == 2) {
					    // If we get here, then we just read an attribute of the object

					    // If any of these trigger, then we just read an attribute of a candidate (which is a song, artist, genre or whatever)
					    if (endTag.equalTo(nameIndicator))
						    candidate.setName(value);
					    if (endTag.equalTo(parentIndicator))
						    candidate.addParentName(value.makeCopy());
					    //if (endTag.equalTo(discoveryDateIndicator))
						//    candidate.setDiscoveryDate(new DateTime(value.getName()));


					    // If any of these trigger, then we just read an attribute of a rating
					    // Tags associated with ratings
					    if (endTag.equalTo(ratingActivityIndicator))
						    rating.setActivity(value);
					    if (endTag.equalTo(ratingDateIndicator)) {
						    // keep track of the latest date ever encountered
						    //message("assigning date to rating\r\n");
						    currentDate = new DateTime(value.getName());
						    if (strictlyChronologicallyOrdered(latestDate, currentDate))
							    latestDate = currentDate;
						    rating.setDate(currentDate);
						    //message("done assigning date to rating\r\n");
					    }
					
					    if (endTag.equalTo(ratingValueIndicator)) {
						    rating.setScore(parseFloat(value.getName()));
					    }
					 

					    // If any of these trigger, then we just read an attribute of a participation (an instance of listening)
					    if (endTag.equalTo(participationStartDateIndicator)) {
						    // keep track of the latest date ever encountered
						    currentDate = new DateTime(value.getName());
						    if (strictlyChronologicallyOrdered(latestDate, currentDate))
							    latestDate = currentDate;
						    participation.setStartTime(currentDate);
					    }
					    if (endTag.equalTo(participationEndDateIndicator)) {
						    // keep track of the latest date ever encountered
						    currentDate = new DateTime(value.getName());
						    if (strictlyChronologicallyOrdered(latestDate, currentDate))
							    latestDate = currentDate;
						    participation.setEndTime(currentDate);
					    }
					    if (endTag.equalTo(participationActivityIndicator))
						    participation.setActivityName(value.makeCopy());
				    }
				    if (stackCount == 1) {
                        //alert("probably read a candidate");
                        //message("object name = " + objectName.getName());
					    // If we get here then we just finished reading an object
					    if (objectName.equalTo(candidateIndicator)) {
						    // If we get here then we just finished reading a candidate (which is a song, artist, genre or whatever)
						    // add the candidate to the inheritance hierarchy
						    //alert("adding candidate");
						    this.addCandidate(candidate);
						    candidate = new Candidate();
					    }
					    if (objectName.equalTo(ratingIndicator)) {
						    // If we get here then we just finished reading a rating
						    // add the rating to the rating set
						    this.putRatingInMemory(rating);
						
						    rating = new Rating();
					    }
					    if (objectName.equalTo(participationIndicator)) {
						    // If we get here then we just finished reading a rating
						    this.putParticipationInMemory(participation);
						    participation = new Participation();
					    }
				    }
				    stackCount--;
			    }
			    readingStartTag = false;
			    readingEndTag = false;
		    }
		    if (currentChar == '<') {
			    readingValue = false;
			    characterIndex++;
			    currentChar = fileContents[characterIndex];
			    if (currentChar != '/') {
			        //message("<");
				    // If we get here, then it's a start tag
				    startTag.clear();
				    stackCount++;
				    //message("stackCount = " + stackCount);
				    readingStartTag = true;
			    } else {
			        //message(value.getName() + "</");
				    // If we get here, then it's an end tag
				    endTag.clear();
				    readingEndTag = true;
			        characterIndex++;
			        currentChar = fileContents[characterIndex];
			    }
		    }
		    //message("start tag = ");
		    //message(startTag.getName());
		    // update names accordingly
		    if (readingStartTag) {
			    startTag.appendChar(currentChar);
		    }
		    if (readingValue) {
			    value.appendChar(currentChar);
		    }
		    if (readingEndTag) {
			    endTag.appendChar(currentChar);
		    }
	    }
	    alert("done reading file " + fileName + "\r\n");
    }
    // adds a candidate (also known as a song, genre, or category)
    function addCandidate(newCandidate) {
        var name = newCandidate.getName().getName();
        message("adding candidate named ");
        printCandidate(newCandidate);
        //message("done printing candidate");
        candidates[name] = newCandidate;
        //message("done adding candidate\r\n");
    }
    // adds a rating to the list of ratings
    function addRating(newRating) {
        writeRating(newRating);
        putRatingInMemory(newRating);
    }
    // saves the rating to the text file
    function writeRating(newRating) {
        var text = newRating.stringVersion();
        message("saving rating " + text);
        FileIO.writeFile(ratingsFilename, text + "\r\n", 1);
    }
    function putRatingInMemory(newRating) {
        message("adding rating ");
        printRating(newRating);
        message("\r\n");
        ratings.length += 1;
        ratings[ratings.length - 1] = newRating;
    }
    // adds a rating to the list of participation
    function addParticipation(newParticipation) {
        writeParticipation(newParticipation);
        putParticipationInMemory(newParticipation);
    }
    // saves the rating to the text file
    function writeParticipation(newParticipation) {
        var text = newParticipation.stringVersion();
        message("saving participation " + text);
        FileIO.writeFile(ratingsFilename, text + "\r\n", 1);
    }
    function putParticipationInMemory(newParticipation) {
        message("adding participation");
        printParticipation(newParticipation);
        participations.length += 1;
        participations[participations.length - 1] = newParticipation;
    }
    // adds the participation to the necessary candidate and all its parents
    function cascadeParticipation(newParticipation) {
	    message("cascading participation " + newParticipation.getActivityName().getName() + "\r\n");
	    var candidate = getCandidateWithName(newParticipation.getActivityName());
	    if (candidate) {
	        var candidatesToUpdate = findAllSuperCategoriesOf(candidate);
	        var i;
	        for (i = 0; candidatesToUpdate[i]; i++) {
		        candidatesToUpdate[i].giveParticipation(newParticipation);
	        }
        }
    }
    // adds the rating to the necessary candidate and all its parents
    function cascadeRating(newRating) {
	    var candidate = getCandidateWithName(newRating.getActivity());
	    if (candidate) {
	        var candidatesToUpdate = findAllSuperCategoriesOf(candidate);
	        var i, j;
	        for (i = 0; candidatesToUpdate[i]; i++) {
	            var currentCandidate = candidatesToUpdate[i];
	            message("giving rating to candidate " + currentCandidate.getName().getName() + "\r\n");
		        currentCandidate.giveRating(newRating);
	        }
        }
    }
    // create the necessary PredictionLink to predict each candidate from the other
    function linkCandidates(predictor, predictee) {
        message("linking candidates " + predictor.getName().getName() + " and " + predictee.getName().getName() + "\r\n");
	    var frequencyCountA = predictor.getNumFrequencyEstimators();
	    var ratingCountA = predictor.getNumRatingEstimators();
	    var frequencyCountB = predictee.getNumFrequencyEstimators();
	    var ratingCountB = predictee.getNumRatingEstimators();
	    var i, j;
	    // using the frequency of A, try to predict the rating for B
	    for (i = 0; i < frequencyCountA; i++) {
    	    message("getting frequency estimator\r\n");
	        var predictorAverage = predictor.getFrequencyEstimatorAtIndex(i);
    	    message("getting actual rating history\r\n");
	        var predicteeAverage = predictee.getActualRatingHistory();
            message("linking averages\r\n");
		    this.linkAverages(predictorAverage, predicteeAverage);
	    }
	    // using the frequency of B, try to predict the rating for A
	    /*for (j = 0; j < frequencyCountB; j++) {
		    this.linkAverages(predictee.getFrequencyEstimatorAtIndex(j), predictor.getActualRatingHistory());
	    }*/
	    // using the rating for A, try to predict the rating for B
	    for (i = 0; i < ratingCountA; i++) {
		    this.linkAverages(predictor.getRatingEstimatorAtIndex(i), predictee.getActualRatingHistory());
	    }
	    // using the rating for B, try to predict the rating for A
	    /*for (j = 0; j < ratingCountB; j++) {
		    this.linkAverages(predictee.getRatingEstimatorAtIndex(j), predictor.getActualRatingHistory());
	    }*/
    }
    // create the necessary PredictionLink to predict the predictee from the predictor
    function linkAverages(predictor, predictee) {
        message("linking averages ");
        message(predictor.getName().getName());
        message(" and ");
        message(predictee.getName().getName() + "\r\n");
        var predicteeName = predictee.getName().getName();
        //message("doing dictionary lookup\r\n");
        var links = predictionLinks[predicteeName];
        //message("checking for undefined value\r\n");
        if (links == undefined) {
            //message("links was undefined\r\n");
	        links = {};
        }
        //message("making new link");
	    var newLink = new PredictionLink(predictor, predictee);
        //message("putting new link in map");
	    links[predictor.getName().getName()] = newLink;
        predictionLinks[predicteeName] = links;
    }
    // inform each candidate of the categories it directly inherits from
    // and the categories that directly inherit from it
    function updateChildPointers() {
        message("updating child pointers");
	    // iterate over each candidate
	    var candidateIterator = Iterator(candidates, true);
	    var currentCandidate;
	    var parent;
	    var i;
	    for (candidateName in candidateIterator) {
	        message("candidateName = " + candidateName);
		    currentCandidate = candidates[candidateName];
		    message("current candidate = ");
		    //message(currentCandidate);
		    message("current candidate is named" + currentCandidate.getName().getName());
		    //message("checking if update is needed\r\n");
		    if (currentCandidate.needToUpdateParentPointers()) {
    		    message("update is required\r\n");
			    // if we get here then this candidate was added recently and its parents need their child pointers updated
			    var parentNames = currentCandidate.getParentNames();
			    for (i = 0; parentNames[i]; i++) {
		            message("parent name = " + parentNames[i].getName() + "\r\n");
				    parent = getCandidateWithName(parentNames[i]);
				    message("parent is named " + parent.getName().getName() + "\r\n");
				    message("adding parent\r\n");
				    currentCandidate.addParent(parent);
				    message("adding child\r\n");
				    parent.addChild(currentCandidate);
				    message("done adding child\r\n");
			    }
		    } else {
		        message("update was not required\r\n");
		    }
	    }
	    // keep track of all candidates that have no children
	    leafVector.length = 0;
	    candidateIterator = Iterator(candidates);
	    for ([candidateName, currentCandidate] in candidateIterator) {
	        if (currentCandidate.getChildren().length == 0) {
	            leafVector.push(currentCandidate);
	        }
	    }
    }
    
    // creates a bunch of PredictionLinks to predict the ratings of some Candidates from others
    function addSomeTestLinks() {
    	message("adding some test links\r\n");
	    var iterator1 = Iterator(candidates);
	    var name1;
	    var name2;
	    var candidate1;
	    var candidate2;
	    // currently we add all combinations of links
	    /*for ([name1, candidate1] in iterator1) {
    	    var iterator2 = Iterator(candidates);
		    for ([name2, candidate2] in iterator2) {
		        message("name1 = " + name1 + " name2 = " + name2 + "\r\n");
		        // to prevent double-counting, make sure candidate1 <= candidate2
		        if (!candidate1.getName().lessThan(candidate2.getName())) {
		            message("linking candidates\r\n");
		            this.linkCandidates(candidate1, candidate2);
		        }
		    }
	    }*/
	    // to make the algorithm run quickly, we currently only predict a song based on itself and supercategories
	    var parents;
	    var i;
	    var currentParent;
	    for ([name1, candidate1] in iterator1) {
	        // for speed, only compare against oneself and one's immediate parents
            this.linkCandidates(candidate1, candidate1);
	        parents = candidate1.getParents();
	        //parents = this.findAllSuperCategoriesOf(candidate1);
	        for (i = 0; i < parents.length; i++) {
	            // try to predict the rating of the parent from data about the child
	            // this.linkCandidates(candidate1, parents[i]);
	            // try to predict the rating of this candidate from data about the parents
	            this.linkCandidates(parents[i], candidate1);
	        }
	    }
    }
    // inform everything of any new data that was added recently that it needs to know about    
    function updatePredictions() {
        //alert("Updating predictions. Please wait.\r\n");
        message("giving ratings to activities\r\n");
        // inform each candidate of the ratings given to it
        var ratingIterator = Iterator(ratings, true);
        var rating;
        var activityName;
        var i;
        for (i = 0; i < ratings.length; i++) {
            this.cascadeRating(ratings[i]);
        }
        ratings.length = 0;
        
	    message("giving participations to activities\r\n");
        for (i = 0; i < participations.length; i++) {
            this.cascadeParticipation(participations[i]);
        }
        participations.length = 0;
        


    	message("updating PredictionLinks");
    	// have each PredictionLink update itself with the changes to the appropriate MovingAverage    	
    	var mapIterator = Iterator(predictionLinks);
    	var currentMap;
    	var currentKey;
    	var currentPredictionKey;
    	var currentLink;
    	var predictionIterator;
    	var numUpdates = 0;
    	
    	// for each candidate, get the map of predictions links that have it as the predictor
    	for ([currentKey, currentMap] in mapIterator) {
    	    message("making iterator out of map " + currentKey + "\r\n");
    	    predictionIterator = Iterator(currentMap);
    	    // iterate over each PredictionLink that shares the predictor
    	    for ([currentPredictionKey, currentLink] in predictionIterator) {
    	        message("updating a PredictionLink " + currentPredictionKey + "\r\n");
    	        currentLink.update();  // update the prediction link within the map
    	        numUpdates++;
    	    }
    	}
    	message("num PredictionLinks updated = " + numUpdates + "\r\n");
    }
    function createFiles() {
        FileIO.writeFile(ratingsFilename, "", 1);    
        //FileIO.writeFile(inheritancesFilename, "", 0);    
    }
    
////////////////////////////////// search functions /////////////////////////////////////
    function findAllSuperCategoriesOf(candidate) {
        message("finding supercategories of " + candidate.getName().getName() + "\r\n");
        // setup a set to check for duplicates
        var setToUpdate = {};
        // setup an array for sequential access
        var vectorToUpdate = [];
        // initialize the one leaf node
        var currentCandidate = candidate;
        //message("putting first entry into set\r\n");
        setToUpdate[candidate.getName().getName()] = currentCandidate;
        //message("putting first entry into vector\r\n");
        vectorToUpdate.push(currentCandidate);
        // compute the set of all supercategories of this candidate
        var busy = true;
        var currentParent;
        var setIterator;
        var parents;
        var i, j;
        //message("starting loop\r\n");
        for (i = 0; i < vectorToUpdate.length; i++) {
            currentCandidate = vectorToUpdate[i];
            parents = currentCandidate.getParents();
            for (j = 0; j < parents.length; j++) {
                currentParent = parents[j];
                // check whether this candidate is already in the set
                if (!setToUpdate[currentParent.getName().getName()]) {
                    message("adding parent named " + currentParent.getName().getName() + "\r\n");
                    // if we get here then we found another candidate to add
                    setToUpdate[currentParent.getName().getName()] = currentParent;
                    vectorToUpdate.push(currentParent);
                }
            }
        }
        //message("done find supercategories\r\n");
        return vectorToUpdate;
    }
    // dictionary lookup
    function getCandidateWithName(name) {
        return candidates[name.getName()];
    }
    // given two moving averages, returns the PredictionLink that predicts the predictee from the predictor
    function getLinkFromMovingAverages(predictor, predictee) {
        var links = predictionLinks[predictee.getName().getName()];
        return links[predictor.getName().getName()];    
    }
    
////////////////////////////////// Prediction functions ///////////////////////////////////////
    // calculate a rating for the given candidate
    function rateCandidate(candidate, when) {
    
        message("rating candidate with name: " + candidate.getName().getName());
        printCandidate(candidate);
        var parents = candidate.getParents();
        var guesses = [];
        var currentDistribution;
        var i;
        var currentParent;
        // make sure that all of the parents are rated first
        for (i = parents.length - 1; i >= 0; i--) {
            currentParent = parents[i];
            // figure out if the parent was rated recently enough
            if (strictlyChronologicallyOrdered(currentParent.getLatestRatingDate(), when)) {
                // if we get here then the parent rating needs updating
                this.rateCandidate(currentParent, when);
            }
        }
        // Now get the prediction from each relevant link
        var shortTermAverageName = candidate.getActualRatingHistory().getName().getName();
        var links = predictionLinks[shortTermAverageName];
        var mapIterator = Iterator(links);
	    var predictorName;
	    var currentLink;
	    var currentGuess;
	    var predicteeName = candidate.getName().getName();
	    // iterate over all relevant prediction links
	    var childWeight = 0;
        for ([predictorName, currentLink] in mapIterator) {
            currentLink.update();
            message("Predicting " + predicteeName + " from " + predictorName, 0);
            currentGuess = currentLink.guess(when);
            message(" score: " + currentGuess.getMean() + "\r\n", 0);
            //printDistribution(currentGuess);
            guesses.push(currentGuess);
            childWeight += currentGuess.getWeight();
        }
        var parentScale;
        if (childWeight < 1)
            parentScale = 1;
        else
            parentScale = 1 / childWeight;
        for (i = 0; i < parents.length; i++) {
            currentGuess = parents[i].getCurrentRating();
            guesses.push(new Distribution(currentGuess.getMean(), currentGuess.getStdDev(), currentGuess.getWeight() * parentScale));
        }
        
        
        // In addition to all of the above factors that may use lots of data to predict the rating
        // of the song, we should also use some other factors.
        // We want to:
        // Never forget a song completely
        // Avoid playing a song twice in a row without explicit reason to do so
        // Believe the user's recent ratings
        
        
        // We don't want to ever completely forget about a song. So, move it slowly closer to perfection
        // Whenever they give it a rating or listen to it, this resets
        var remembererDuration = candidate.getIdleDuration(when);
        if (remembererDuration < 1)
		    remembererDuration = 1;
		    
		// The goal is to make d = sqrt(t) where d is the duration between listenings and t = num seconds
	    // Then n = sqrt(t) where n is the number of ratings
	    // If the user reliably rates a song down, then for calculated distributions, stddev = 1 / n = 1 / sqrt(t) and weight = n = sqrt(t)
	    // Then it is about ideal for the rememberer to have stddev = 1 / n and weight = d
	    // If the user only usually rates a song down, then for calculated distributions, stddev = k and weight = n
	    // Then it is about ideal for the rememberer to have stddev = k and weight = d
	    // This is mostly equivalent to stddev = d^(-1/3), weight = d^(2/3)
	    // So we could even make the rememberer stronger than the current stddev = d^(-1/3), weight = d^(1/3)
	    //double squareRoot = sqrt(remembererDuration);
	    var cubeRoot = Math.pow(remembererDuration, 1.0/3.0);
	    //message("building rememberer");
	    var rememberer = new Distribution(1, 1.0 / cubeRoot, cubeRoot);
	    guesses.push(rememberer);
	    
	    // We should also suspect that they don't want to hear the song twice in a row
	    var spacerDuration = candidate.getDurationSinceLastPlayed(when);
	    // if they just heard it then they we're pretty sure they don't want to hear it again
	    // If it's been 10 hours then it's probably okay to play it again
	    // The spacer has a max weight so it can be overpowered by learned data
	    var spacerWeight = 20 * (1 - spacerDuration / 36000);
	    if (spacerWeight > 0) {
	        guesses.push(new Distribution(0, .05, spacerWeight));
	    }

        // finally, combine all the distributions and return
        //message("averaging distributions");
        var childRating = this.averageDistributions(guesses);
        candidate.setCurrentRating(childRating, when);
        message("name: " + candidate.getName().getName() + " score: " + childRating.getMean() + "\r\n", 1);
        return childRating;
    }
    
    // calculate a rating for the candidate with the given name
    function rateCandidateWithName(name, when) {
        return this.rateCandidate(getCandidateWithName(name), when);
    }
        
    // determines which candidate has the best expected score at the given time
    function makeRecommendation(when) {
        // default to the current date
        if (!when) {
            // get the current date
            when = new DateTime();
            when.setNow();
        }
        message("\r\nmaking recommendation for date:" + when.stringVersion() + "\r\n", 1);
        var candidateIterator = Iterator(candidates);
	    // make sure that there is at least one candidate to choose from
	    // setup a map to sort by expected rating
	    var guesses = [];
	    var scoreValid = false;
	    var candidateKey;
	    var currentCandidate;
	    var bestScore = -1;
	    var currentScore = -1;
	    var bestName = new Name("[no data]");
	    //for ([candidateKey, currentCandidate] in candidateIterator) {
	    var i, index;
	    for (i = 0; i < 8; i++) {
	        // choose a random candidate
	        index = Math.floor(Math.random() * leafVector.length);
	        currentCandidate = leafVector[index];
	        message("considering candidate" + currentCandidate.getName().getName());
	        // only bother to rate the candidates that are not categories
	        if (currentCandidate.getNumChildren() == 0) {
	            this.rateCandidate(currentCandidate, when);
	            currentScore = currentCandidate.getCurrentRating().getMean();
	            message("candidate name = " + currentCandidate.getName().getName());
	            message("expected rating = " + currentScore + "\r\n");
	            guesses.push(currentCandidate);
	            if ((currentScore > bestScore) || !scoreValid) {
	                bestScore = currentScore;
	                bestName = currentCandidate.getName();
    	            scoreValid = true;
    	        }
	        }
	    }
	    var i;
	    for (i = 0; i < guesses.length; i++) {
	        currentCandidate = guesses[i];
	        message("candidate name = " + currentCandidate.getName().getName());
	        message(" expected rating = " + currentCandidate.getCurrentRating().getMean() + "\r\n");
	    }
	    /* // print the distributions in order
	    var distributionIterator = Iterator(guesses, true);
	    var currentScore;
	    var currentName;
	    for ([currentScore, currentName] in distributionIterator) {
	        message("in the home stretch\r\n");
	        //currentName = distributionIterator[currentScore];
	        message("candidate name = " + currentName.getName());
	        message(" expected rating = " + currentScore);
	    }
	    */
	    message("best candidate name = " + bestName.getName() + " expected rating = " + bestScore + "\r\n", 1);
	    flushMessage();
	    //alert("done making recommendation. Best song name = " + bestName.getName());
	    return bestName;
    }
    // compute the distribution that is formed by combining the given distributions
    function addDistributions(distributions, average) {
        return this.averageDistributions(distributions);
    }
    // compute the distribution that is formed by combining the given distributions
    function averageDistributions(distributions) {
        // initialization
        var sumY = 0.0;
        var sumY2 = 0.0;
        var sumWeight = 0.0;  // the sum of the weights that we calculate, which we use to normalize
    	var stdDevIsZero = false;
        var sumVariance = 0.0;	// variance is another name for standard deviation squared
	    var outputWeight = 0.0;// the sum of the given weights, which we use to assign a weight to our guess
	    var count = 0.0;	// the number of distributions being used
	    var weight;
	    var y;
	    var stdDev;
	    message("averaging distributions \r\n");	    
	    var i;
	    var currentDistribution;
    	// iterate over each distribution and weight them according to their given weights and standard deviations
	    for (i = 0; i < distributions.length; i++) {
	        currentDistribution = distributions[i];
	        message("mean = " + currentDistribution.getMean() + " stdDev = " + currentDistribution.getStdDev() + " weight = " + currentDistribution.getWeight() + "\r\n");
	        stdDev = currentDistribution.getStdDev();
	        // only consider nonempty distributions
	        if (currentDistribution.getWeight() > 0) {
    			// If the standard deviation of any distribution is zero, then compute the average of only distributions with zero standard deviation
    			if (stdDev == 0) {
    			    if (!stdDevIsZero) {
    			        stdDevIsZero = true;
    			        sumVariance = 0.0;
    			        sumY = sumY2 = 0.0;
    			        outputWeight = count = sumWeight = 0.0;
    			    }
    			}
    			// Figure out whether we care about this distribution or not
			    if ((stdDev == 0) || (!stdDevIsZero)) {
				    // get the values from the distribution
				    y = currentDistribution.getMean();
				    if (stdDev == 0.0) {
					    // If stddev is zero, then just use the given weight
					    weight = currentDistribution.getWeight();
				    } else {
					    // If stddev is nonzero then weight based on both the stddev and the given weight
					    weight = currentDistribution.getWeight() / stdDev;
				    }
				    // add to the running totals
				    sumY += y * weight;
				    sumY2 += y * y * weight;
				    sumWeight += weight;
				    sumVariance += stdDev * stdDev * weight;
				    outputWeight += currentDistribution.getWeight();
				    count += 1.0;
			    }
	        }
	    }
	    var result;
	    if (sumWeight == 0) {
	        result = new Distribution(0, 0, 0);
	    }
	    else{
		    // If we did have a distribution to predict from then we can calculate the average and standard deviations
		    var newAverage = sumY / sumWeight;
		    var variance1 = (sumY2 - sumY * sumY / sumWeight) / sumWeight;
		    message("variance1 = ");
		    message(variance1);
		    message("\r\n");
		    var variance2 = sumVariance / sumWeight;
		    message("variance2 = ");
		    message(variance2);
		    message("\r\n");
		    //stdDev = Math.sqrt(variance1 + variance2);
		    stdDev = Math.sqrt(variance2);
		    result = new Distribution(newAverage, stdDev, outputWeight);
	    }
	    
	    message("resultant distribution = ");
	    printDistribution(result);
	    message("\r\n average of all distributions:" + (sumY / sumWeight) + "\r\n");
    	return result;
    }
    // print functions
    function printCandidate(candidate) {
        //message("printing candidate named " + candidate.getName().getName());
        message(candidate.getName().getName() + "\r\n");
        var parentNames = candidate.getParentNames();
        message("numParents = " + candidate.getParents().length + "\r\n");
        message("parent names:\r\n");
        var i;
        for (i = 0; i < parentNames.length; i++) {
            message(parentNames[i].getName() + "\r\n");
        }
        message("\r\n");        
    }
    function printRating(rating) {
        message("name:" + rating.getActivity().getName() + "\r\n");
        message("date:" + rating.getDate().stringVersion() + "\r\n");
        message("score:" + rating.getScore() + "\r\n");
        var now = new DateTime();
        now.setNow();
        var duration = rating.getDate().timeUntil(now);
        message("time since now = " + duration);
    }
    function printDistribution(distribution) {
        message("mean:" + distribution.getMean());
        message(" stdDev:" + distribution.getStdDev());
        message(" weight:" + distribution.getWeight() + "\r\n");
    }
    function printParticipation(participation) {
        message("song name = " + participation.getActivityName().getName() + "\r\n");
        message("start time = " + participation.getStartTime().stringVersion() + "\r\n");
        message("end time = " + participation.getEndTime().stringVersion() + "\r\n");
        message("intensity = " + participation.getIntensity() + "\r\n");
    }

    function test() {
        //alert("testing");
        //this.readFiles();
        //message("hi\r\n");
        //FileIO.writeFile("appendedFile.txt", "appended data", 1);
        /*
        var r1 = new Rating();
        r1.setActivity("Holding on for a hero");
        alert(r1.getActivity());
        var dt = new DateTime();
        alert("setting date");
        r1.setDate(dt);
        alert("setting score");
        r1.setScore(0);
        this.addRating(r1);
        */
        /*
        var c1 = new Candidate(new Name("name1"));
        alert("adding candidate");
        this.addCandidate(c1);
        */

        /*var m1 = new MovingAverage();
        //m1.superFunction();
        alert("creating ParticipationMovingAverage");
        var p1 = new ParticipationMovingAverage();
        alert("p1.superFunction();");
        p1.superFunction();
        alert("creating RatingMovingAverage");
        var r1 = new RatingMovingAverage();
        alert("r1.superFunction();");
        r1.superFunction();
        */
        /*
        if (m1.isAParticipationMovingAverage()) {
            alert("m1 stores participations");
        } else {
            alert("m1 does not store participations");
        }
        message("done creating p1");
        
        if (p1.isAParticipationMovingAverage()) {
            alert("p1 stores participations");
        } else {
            alert("p1 does not store participations");
        }
        alert("m1 name = " + m1.stringVersion());
        alert("p1 name = " + p1.stringVersion());
        */
            
        //var candidate1 = new Candidate(new Name("Sell Me Candy"));
        //var candidate1 = new Candidate;
        //alert("adding candidate");
        //addCandidate(candidate1);
        //candidate1.setName("name1");
        //message(candidate1.getName().getName());
    }

    /*function message(text) {
        // append the text to the end of the output file
        FileIO.writeFile("output.txt", text, 1);
    
        // don't bother showing a blank message
        //if (text != "\r\n")
        //    alert(text);
    }*/
// recommend function
    function recommend() {
        var songName = "Come on Eileen";
        alert("selecting song named " + songName);
        const properties = Cc["@songbirdnest.com/Songbird/Properties/MutablePropertyArray;1"].createInstance(Ci.sbIMutablePropertyArray);
        //properties.appendProperty(SBProperties.artistName, "Dexys Midnight Runners");
        properties.appendProperty(SBProperties.trackName, songName);
        var tracks = LibraryUtils.mainLibrary.getItemsByProperties(properties);
        //var tracks = LibraryUtils.mainLibrary.getItemsByProperty(SBProperties.artistName, "Dexys Midnight Runners");
        var gMM = Components.classes["@songbirdnest.com/Songbird/Mediacore/Manager;1"].getService(Components.interfaces.sbIMediacoreManager);
        gMM.sequencer.playView(gMM.sequencer.view,gMM.sequencer.view.getIndexForItem(tracks.enumerate().getNext())); 
        alert("done selecting song");
    }  

	/* Private Methods */


};