
/**
 * The class that controls all of the recommendations
 */
 
function TimeBasedRecommendor() {
/////////////////////////////////////////////////// Private Member Variables ///////////////////////////////////////////////////

    // setup some maps so that we can store all the data in memory and then update properly
    // Basically the concern is that can't add a rating to a candidate that doesn't exist yet
    // So we store everything, then create the candidates, then add the ratings
    var candidates = {};        // a map of all candidates (with key equal to its name)
    var ratings = [];           // a vector of all ratings
    var participations = [];    // a vector of all partipations
    var predictionLinks = {};   // the set of all prediction links
    var latestDate = new DateTime();
    //alert("constructing a recommendor point 2");

/////////////////////////////////////////////////////// Public Methods ///////////////////////////////////////////////////

// the functions parseArguments has been skipped for now
    
    // function prototypes
    // functions to add data
    this.readFiles = readFiles;
    this.readFile = readFile;
    this.addCandidate = addCandidate;
    this.addRating = addRating;
    this.addParticipation = addParticipation;
    this.addParticipationAndCascade = addParticipationAndCascade;
    this.addRatingAndCascade = addRatingAndCascade;
    this.linkCandidates = linkCandidates;
    this.linkAverages = linkAverages;
    this.updateChildPointers = updateChildPointers;
    this.addSomeTestLinks = addSomeTestLinks;
    this.updatePredictions = updatePredictions;
    // search functions
    this.findAllSuperCategoriesOf = findAllSuperCategoriesOf;
    this.getCandidateWithName = getCandidateWithName;
    this.getLinkFromMovingAverages = getLinkFromMovingAverages;
    this.rateCandidate = rateCandidate;
    this.rateCandidateByCorrelation = rateCandidateByCorrelation;
    this.updateCandidateRatingFromParents = updateCandidateRatingFromParents;
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

    // function definitions
    // reads all the necessary files and updates the TimeBasedRecommendor accordingly
    function readFiles() {
        alert("recommendor reading files");
        this.readFile("bluejay_inheritances.txt");
        this.readFile("bluejay_ratings.txt");
		this.updateChildPointers();
		this.addSomeTestLinks();
		this.updatePredictions();
		alert("recommendor done reading files");
    }
    // reads one file
    function readFile(fileName) {
        alert("recommendor reading file");
        
        
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
						    candidate.addParentName(value);
					    if (endTag.equalTo(discoveryDateIndicator))
						    candidate.setDiscoveryDate(new DateTime(value.getName()));


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
						    this.addRating(rating);
						
						    rating = new Rating();
					    }
					    if (objectName.equalTo(participationIndicator)) {
						    // If we get here then we just finished reading a rating
						    this.addParticipation(participation);
						    participation = new Participation();
					    }
				    }
				    stackCount--;
			    }
			    readingStartTag = false;
			    readingEndTag = false;
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
        message("adding rating ");
        printRating(newRating);
        ratings.length += 1;
        ratings[ratings.length - 1] = newRating;
        message("\r\n");
    }
    // adds a rating to the list of participation
    function addParticipation(newParticipation) {
        message("adding participation");
        printParticipation(newParticipation);
        // Now we need to actually add the participation.
        participations.length += 1;
        participations[participations.length - 1] = newParticipation;
    }
    // adds the participation to the necessary candidate and all its parents
    function addParticipationAndCascade(newParticipation) {
	    message("cascading participation " + newParticipation.getActivityName().getName() + "\r\n");
	    var candidate = getCandidateWithName(newParticipation.getActivityName());
	    var candidatesToUpdate = findAllSuperCategoriesOf(candidate);
	    var i;
	    for (i = 0; candidatesToUpdate[i]; i++) {
		    candidatesToUpdate[i].giveParticipation(newParticipation);
	    }
    }
    // adds the rating to the necessary candidate and all its parents
    function addRatingAndCascade(newRating) {
	    var candidate = getCandidateWithName(newRating.getActivity());
	    var candidatesToUpdate = findAllSuperCategoriesOf(candidate);
	    var i, j;
	    for (i = 0; candidatesToUpdate[i]; i++) {
	        var currentCandidate = candidatesToUpdate[i];
	        message("giving rating to candidate " + currentCandidate.getName().getName() + "\r\n");
		    currentCandidate.giveRating(newRating);
	    }
    }
    // create the necessary PredictionLink to predict each candidate from the other
    function linkCandidates(candidateOne, candidateTwo) {
        message("linking candidates " + candidateOne.getName().getName() + " and " + candidateTwo.getName().getName() + "\r\n");
	    var frequencyCountA = candidateOne.getNumFrequencyEstimators();
	    var ratingCountA = candidateOne.getNumRatingEstimators();
	    var frequencyCountB = candidateTwo.getNumFrequencyEstimators();
	    var ratingCountB = candidateTwo.getNumRatingEstimators();
	    var i, j;
	    // using the frequency of A, try to predict the rating for B
	    for (i = 0; i < frequencyCountA; i++) {
    	    message("getting frequency estimator\r\n");
	        var predictor = candidateOne.getFrequencyEstimatorAtIndex(i);
    	    message("getting actual rating history\r\n");
	        var predictee = candidateTwo.getActualRatingHistory();
            message("linking averages\r\n");
		    this.linkAverages(predictor, predictee);
	    }
	    // using the frequency of B, try to predict the rating for A
	    for (j = 0; j < frequencyCountB; j++) {
		    this.linkAverages(candidateTwo.getFrequencyEstimatorAtIndex(j), candidateOne.getActualRatingHistory());
	    }
	    // using the rating for A, try to predict the rating for B
	    for (i = 0; i < ratingCountA; i++) {
		    this.linkAverages(candidateOne.getRatingEstimatorAtIndex(i), candidateTwo.getActualRatingHistory());
	    }
	    // using the rating for B, try to predict the rating for A
	    for (j = 0; j < ratingCountB; j++) {
		    this.linkAverages(candidateTwo.getRatingEstimatorAtIndex(j), candidateOne.getActualRatingHistory());
	    }
    }
    // create the necessary PredictionLink to predict the predictee from the predictor
    function linkAverages(predictor, predictee) {
        //message("inside the linkAverages function\r\n");
        var name = predictee.getOwnerName().getName();
        //message("doing dictionary lookup\r\n");
        var links = predictionLinks[name];
        //message("checking for undefined value\r\n");
        if (links == undefined) {
            message("links was undefined\r\n");
	        links = {};
        }
        //message("making new link");
	    var newLink = new PredictionLink(predictor, predictee);
        message("putting new link in map");
	    links[predictor.getOwnerName().getName()] = newLink;
        predictionLinks[predictee.getOwnerName().getName()] = links;
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
	        //message("candidateName = " + candidateName);
		    currentCandidate = candidates[candidateName];
		    //message("current candidate = ");
		    //message(currentCandidate);
		    //message("current candidate is named" + currentCandidate.getName().getName());
		    //message("checking if update is needed\r\n");
		    if (currentCandidate.needToUpdateParentPointers()) {
    		    //message("update is required\r\n");
			    // if we get here then this candidate was added recently and its parents need their child pointers updated
			    var parentNames = currentCandidate.getParentNames();
			    for (i = 0; parentNames[i]; i++) {
		            //message("parent name = " + parentNames[i].getName() + "\r\n");
				    parent = getCandidateWithName(parentNames[i]);
				    //message("parent is named " + parent.getName().getName() + "\r\n");
				    //message("adding parent\r\n");
				    currentCandidate.addParent(parent);
				    //message("adding child\r\n");
				    parent.addChild(currentCandidate);
				    //message("done adding child\r\n");
			    }
		    } else {
		        //message("update was not required\r\n");
		    }
	    }
    }
    
    // creates a bunch of PredictionLinks to predict the ratings of some Candidates from others
    function addSomeTestLinks() {
    	message("adding some test links\r\n");
	    var iterator1 = Iterator(candidates);
	    var iterator2 = Iterator(candidates);
	    var name1;
	    var name2;
	    var candidate1;
	    var candidate2;
	    // currently we add all combinations of links
	    for ([name1, candidate1] in iterator1) {
		    for ([name2, candidate2] in iterator2) {
		        // to prevent double-counting, make sure candidate1 <= candidate2
		        if (candidate1.getName().lessThan(candidate2.getName())) {
		            message("linking candidates\r\n");
		            this.linkCandidates(candidate1, candidate2);
		        }
		    }
	    }
    }
    // inform everything of any new data that was added recently that it needs to know about    
    function updatePredictions() {
        message("updating predictions\r\n");
        message("giving ratings to activities\r\n");
        // inform each candidate of the ratings given to it
        var ratingIterator = Iterator(ratings, true);
        var rating;
        var activityName;
        var i;
        for (i = 0; i < ratings.length; i++) {
            this.addRatingAndCascade(ratings[i]);
        }
        
	    message("giving participations to activities\r\n");
        for (i = 0; i < participations.length; i++) {
            this.addParticipationAndCascade(participations[i]);
        }


    	message("updating PredictionLinks");
    	// have each PredictionLink update itself with the changes to the appropriate MovingAverage    	
    	var mapIterator = Iterator(predictionLinks, true);
    	var currentMap;
    	var currentKey;
    	var currentPredictionKey;
    	var currentLink;
    	var predictionIterator;
    	var numUpdates = 0;
    	
    	// for each candidate, get the map of predictions links that have it as the predictor
    	for ([currentKey, currentMap] in mapIterator) {
    	    predictionIterator = Iterator(currentMap);
    	    // iterate over each PredictionLink that shares the predictor
    	    for ([currentPredictionKey, currentLink] in predictionIterator) {
    	        currentLink.update();  // update the prediction link within the map
    	        numUpdates++;
    	    }
    	}
    	message("num PredictionLinks updated = ");
	    message(numUpdates);
	    message("\r\n");
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
                currentParent = parents[i];
                // check whether this candidate is already in the set
                if (setToUpdate[currentParent.getName().getName()]) {
                    //message("adding parent named" + currentParent.getName().getName());
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
        var links = predictionLinks[predictor.getName().getName()];
        return links[predictee.getName().getName()];    
    }
    
////////////////////////////////// Prediction functions ///////////////////////////////////////
    // calculate a rating for the given candidate
    function rateCandidate(candidate, when) {
        message("rating candidate with name: " + candidate.getName().getName());
        var parents = this.findAllSuperCategoriesOf(candidate);
        var i;
        var currentCandidate;
        for (i = parents.length - 1; i >= 0; i--)
        {
            currentCandidate = parents[i];
            message("rating candidate " + currentCandidate.getName().getName());
		    // Calculate a rating based on PredictionLinks. If there isn't much data it won't be very good
            currentCandidate.setCurrentRating(rateCandidateByCorrleation(currentCandidate, when));
            message("rating = ");
            printDistribution(currentCandidate.getCurrentRating());
		    // Update the rating using parental information. This is to improve guesses for items that have little data but whose parents have data
            updateCandidateRatingFromParents(currentCandidate);            
        }
        message("done rating candidate with name " + candidate.getName().getName() + "\r\n");
        message("rating = ");
        printDistribution(candidate.getCurrentRefinedRating());
        for (i = 0; i < parents.length; i++)
        {
            currentCandidate = parents[i];
            message("name = " + currentCandidate.getName().getName());
            message(" rating = " + currentCandidate.getCurrentRefinedRating().getMean() + "\r\n");
        }
        return candidate.getCurrentRefinedRating();
    }
    
    // calculate a rating for the candidate with the given name
    function rateCandidateWithName(name, when) {
        return rateCandidate(getCandidateWithName(name), when);
    }
    
    // compute the rating for the candidate using all of the relevant prediction links (predicting based on other moving averages)
    function rateCandidateByCorrelation(candidate, when) {
	    // get some pointers to the relevant data and initialize
        var shortTermAverage = candidate.getActualRatingHistory();
        var links = predictionLinks[shortTermAverage];
        var mapIterator = Iterator(links, true);
        var currentLink;
        var predictor;
        var predictorName;
        var predicteeName = candidate.getName();
        var guesses = [];
        var currentGuess;
	    // iterate over all relevant prediction links
        for (predictor in links) {
            currentLink = links[predictor];
            predictorName = predictor.getName();
            message("Predicting " + predicteeName.getName() + " from " + predictorName().getName() + "\r\n");
            currentGuess = currentLing.guess(when);
            printDistribution(currentGuess);
            guesses.push(currentGuess);
        }
        // We don't want to ever completely forget about a song. So, move it slowly closer to perfection
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
	    var rememberer = Distribution(1, 1 / cubeRoot, cubeRoot);
	    guesses.push(rememberer);
	    // combine all of the distributions into one final guess
	    var guess = this.averageDistributions(guesses);
	    // assign the calculated rating to the candidate
	    candidate.setCurrentRating(guess);
	    return guess;
    }
    
    // Using the current estimated rating for the candidate and the estimates for parents, compute an updated rating for the candidate
    // It assumes that all parents are already correct
    function updateCandidateRatingFromParents(candidate) {
    	// get the candidate's rating without parental information
    	var currentChildDistribution = candidate.getCurrentRating();
    	// now get the ratings for each parent
    	var parents = candidate.getParents();
    	var i;
    	var currentParent;
    	var distributions = [];
    	var parentDistribution;
    	var currentDistribution;
    	var scale;
    	// figure out by what factor to decrease the importance of the parent distributions
	    // The child distribution is a better predictor than the parent distribution, so weight the child distribution by another factor of sqrt(n)
	    // THIS ISN'T THE BEST APPROXIMATION BUT IT WILL DO FOR NOW. IT WOULD BE PREFERABLE TO COMPUTE THE STDDEV BETWEEN CHILDREN AND WITHIN CHILDREN AND WEIGHT ACCORDINGLY
	    if (currentChildDistribution.getWeight() == 0)
		    scale = 1;
	    else
		    scale = 1 / Math.sqrt(currentChildDistribution.getWeight());
		    
		for (i = 0; i < parents.length; i++)
        {
	        currentParent = parents[i];
	        parentDistribution = currentParent.getCurrentRefinedRating();
	        currentDistribution = new Distribution(parentDistribution.getMean(), parentDistribution.getStdDev(), parentDistribution.getWeight() * scale);
	        distributions.push(currentDistribution);
        }
        distributions.push(currentChildDistribution);
        var average = candidate.getAverageRating();
    	// Now combine the ratings of each parent with the child's
    	var result = averageDistributions(distributions);
    	candidate.setCurrentRefinedRating(result);
    	return result;
    }
    // determines which candidate has the best expected score at the given time
    function makeRecommendation(when) {
        message("make recommendation for date:" + when.stringVersion() + "\r\n");
        var candidateIterator = Iterator(candidates, true);
	    // make sure that there is at least one candidate to choose from
	    if (candidates.length < 1) {
	        return new Name("[no data]");
	    }
	    // setup a map to sort by expected rating
	    var guesses = {};
	    var scoreValid = False;
	    var currentCandidate;
	    var bestScore = -1;
	    var currentScore = -1;
	    var bestName;
	    for (currentCandidate in candidateIterator) {
	        // only bother to rate the candidates that are not categories
	        if (currentCandidate.getChildren().length == 0) {
	            rateCandidate(currentCandidate, when);
	            currentScore = currentCandidate.getCurrentRefinedRating().getMean();
	            message("candidate name = " + currentCandidate.getName().getName());
	            message("expected rating = " + currentScore + "\r\n");
	            guesses[currentScore] = currentCandidate.getName();
	            if ((currentScore > bestScore) || !scoreValid) {
	                bestScore = currentScore;
	                bestName = currentCandidate.getName();
    	            scoreValid = True;
    	        }    	            
	        }	        
	    }
	    // print the distributions in order
	    var distributionIterator = Iterator(guesses, true);
	    var currentScore;
	    var currentName;
	    for (currentScore in distributionIterator) {
	        currentName = distributionIterator[currentScore];
	        message("candidate name = " + currentName.getName());
	        message(" expected rating = " + currentScore);
	    }
	    message("best candidate name = " + bestName.getName());
	    message(" expected rating = " + bestScore + "\r\n");
	    return bestName;
    }
    // compute the distribution that is formed by combining the given distributions
    function addDistributions(distributions, average) {
        return this.averageDistributions(distributions);
    }
    // compute the distribution that is formed by combining the given distributions
    function averageDistributions(distributions) {
        // initialization
        var sumY = 0;
        var sumY2 = 0;
        var sumWeight = 0;  // the sum of the weights that we calculate, which we use to normalize
    	var stdDevIsZero = new Boolean(false);
        var sumVariance = 0;	// variance is another name for standard deviation squared
	    var outputWeight = 0;// the sum of the given weights, which we use to assign a weight to our guess
	    var count = 0;	// the number of distributions being used
	    var weight;
	    var y;
	    var stdDev;
	    message("averaging distributions \r\n");	    
	    var i;
	    var currentDistribution;
    	// iterate over each distribution and weight them according to their given weights and standard deviations
	    for (i = 0; i < distributions.length; i++) {
	        message("mean = " + currentDistribution.getMean() + " stdDev = " + currentDistribution.getStdDev() + " weight = " + currentDistribution.getWeight() + "\r\n");
	        stdDev = currentDistribution.getStdDev();
	        // only consider nonempty distributions
	        if (currentDistribution.getWeight() > 0) {
    			// If the standard deviation of any distribution is zero, then compute the average of only distributions with zero standard deviation
    			if (stdDev == 0) {
    			    if (!stdDevIsZero) {
    			        stdDevIsZero = True;
    			        sumVariance = 0;
    			        sumY = sumY2 = 0;
    			        outputWeight = count = sumWeight = 0;
    			    }
    			}
    			// Figure out whether we care about this distribution or not
			    if ((stdDev == 0) || (!stdDevIsZero))
			    {
				    // get the values from the distribution
				    y = currentDistribution.getMean();
				    if (stdDev == 0)
				    {
					    // If stddev is zero, then just use the given weight
					    weight = currentDistribution.getWeight();
				    }
				    else
				    {
					    // If stddev is nonzero then weight based on both the stddev and the given weight
					    weight = currentDistribution.getWeight() / stdDev;
				    }
				    // add to the running totals
				    sumY += y * weight;
				    sumY2 += y * y * weight;
				    sumWeight += weight;
				    sumVariance += stdDev * stdDev * weight;
				    outputWeight += currentDistribution.getWeight();
				    count += 1;
			    }
	        }
	    }
	    var result;
	    if (sumWeight == 0) {
	        result = Distribution(0, 0, 0);
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
		    stdDev = sqrt(variance1 + variance2);
		    result = Distribution(newAverage, stdDev, outputWeight);
	    }
	    
	    message("resultant distribution = ");
	    printDistribution(result);
	    message("\r\n average of all distributions:" + (sumY / sumWeight) + "\r\n");
    	return result;
    }
    // print functions
    function printCandidate(candidate) {
        //message("printing candidate named " + candidate.getName().getName());
        message(candidate.getName().getName());
        var parentNames = candidate.getParentNames();
        message("\r\nparent names:\r\n");
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

    function message(text) {
        // append the text to the end of the output file
        FileIO.writeFile("output.txt", text, 1);
    
        // don't bother showing a blank message
        //if (text != "\r\n")
        //    alert(text);
    }
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

/////////////////////////////////////////////////////// Private Methods ///////////////////////////////////////////////////


};