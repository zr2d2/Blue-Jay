
/**
 * The class that controls all of the recommendations
 */
 
function TimeBasedRecommendor() {
/////////////////////////////////////////////////// Private Member Variables ///////////////////////////////////////////////////

    // setup some maps so that we can store all the data in memory and then update properly
    // Basically the concern is that can't add a rating to a candidate that doesn't exist yet
    // So we store everything, then create the candidates, then add the ratings
    var candidates = {};        // a map of all candidates (with key equal to its name)
    var ratings = {};           // a vector of all ratings
    var numRatings = 0;         // how many ratings there are
    var participations = {};    // a vector of all partipations
    var numParticipations = 0;  // how many participations there are
    var predictionLinks = {};   // the set of all prediction links
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
    this.message = message;
    // functions for testing that it all works
    this.test = test;

    // function definitions
    // reads all the necessary files and updates the TimeBasedRecommendor accordingly
    function readFiles() {
        alert("recommendor reading files");
        this.readFile("bluejay_ratings.txt");
    }
    // reads one file
    function readFile(fileName) {
        //alert("recommendor reading file");
        // display a message
        var stringContents = FileIO.readFile(fileName);
    }
    // adds a candidate (also known as a song, genre, or category)
    function addCandidate(newCandidate) {
        var name = newCandidate.getName();
        message("adding candidate named");
        printCandidate(newCandidate);
        this.candidates[name] = newCandidate;
        message("done adding candidate");
    }
    // adds a rating to the list of ratings
    function addRating(newRating) {
        printRating(newRating);
        // need to add the rating here
        // The interface for the Javascript map is not the same as for the C++ set
        // So we probably need to compute a key for the rating
        // and then call this.ratings[key] = newRating
        // Or, we could just make the very reasonable assumption that the ratings are in
        // chronological order in the ratings file already, in which case we can just
        // keep track of the current number of ratings and use it as the key

        // For the moment we'll just keep track of the number of ratings
        // This just requires that the ratings are already in chronological order
        this.numRatings++;
        this.ratings[this.numRatings] = newRating;
    }
    // adds a rating to the list of participation
    function addParticipation(newParticipation) {
        printParticipation(newParticipation);
        // Now we need to actually add the participation.
        // See the comment block in addRating

        // For the moment we'll just keep track of the number of participations
        // This just participations that the ratings are already in chronological order
        this.numParticipations++;
        this.participations[this.numParticipations] = newParticipation;
    }
    // adds the participation to the necessary candidate and all its parents
    function addParticipationAndCascade(newParticipation) {
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
		    candidatesToUpdate[i].giveRating(newRating);
	    }
    }
    // create the necessary PredictionLink to predict each candidate from the other
    function linkCandidates(candidateOne, candidateTwo) {
	    var frequencyCountA = candidateOne.getNumFrequencyEstimators();
	    var ratingCountA = candidateOne.getNumRatingEstimators();
	    var frequencyCountB = candidateTwo.getNumFrequencyEstimators();
	    var ratingCountB = candidateTwo.getNumRatingEstimators();
	    var i, j;
	    // using the frequency of A, try to predict the rating for B
	    for (i = 0; i < frequencyCountA; i++) {
		    this.linkAverages(candidateOne.getFrequencyEstimatorAtIndex(i), candidateTwo.getActualRatingHistory());
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
	    var links = this.predictionLinks[predictee];
	    var newLink = new PredictionLink(predictor, predictee);
	    links[predictor] = newLink;
    }
    // inform each candidate of the categories it directly inherits from
    // and the categories that directly inherit from it
    function updateChildPointers() {
	    // iterate over each candidate
	    var candidateIterator = Iterator(this.candidates);
	    var currentCandidate;
	    var parent;
	    var i;
	    for (candidateName in candidateIterator) {
		    currentCandidate = this.candidates[candidateName];
		    if (currentCandidate.needToUpdateParentPointers()) {
			    // if we get here then this candidate was added recently and its parents need their child pointers updated
			    var parentNames = currentCandidate.getParentNames();
			    for (i = 0; parentNames[i]; i++) {
				    parent = getCandidateWithName(parentNames[i])
				    currentCandidate.addParent(parent);
				    parent.addChild(currentCandidate);
			    }
		    }
	    }
    }
    
    // creates a bunch of PredictionLinks to predict the ratings of some Candidates from others
    function addSomeTestLinks() {
    	message("adding some test links\r\n");
	    var iterator1 = Iterator(this.candidates);
	    var iterator2 = Iterator(this.candidates);
	    var candidate1;
	    var candidate2;
	    // currently we add all combinations of links
	    for (candidate1 in iterator1) {
		    for (candidate2 in iterator2) {
		        // to prevent double-counting, make sure candidate1 <= candidate2
		        if (candidate1.getName() <= candidate2.getName()) {
		            linkCandidates(candidate1, candidate2);
		        }
		    }
	    }
    }
    // inform everything of any new data that was added recently that it needs to know about    
    function updatePredictions() {
        message("updating predictions\r\n");
        message("giving ratings to activities\r\n");
        // inform each candidate of the ratings given to it
        var ratingIterator = Iterator(this.ratings);
        var rating;
        var activityName;
        var numRatings = 0;
        for (rating in ratingIterator) {
            numRatings++;
            this.addRatingAndCascade(rating);
        }
        message("num ratings given = ");
	    message(numRatings);
	    message("\r\n");
	    message("giving participations to activities");
	    
	    participationIterator = Iterator(this.participations);
	    var participation;
	    for (participation in participationIterator) {
	        this.addParticipationAndCascade(participation);
	    }
        message("\r\n");


    	message("creating PredictionLinks");
    	// have each PredictionLink update itself with the changes to the appropriate MovingAverage    	
    	var mapIterator = Iterator(this.predictionLinks);
    	var currentMap;
    	var currentKey;
    	var currentPredictionKey;
    	var predictionIterator;
    	var numUpdates = 0;
    	
    	// for each candidate, get the map of predictions links that have it as the predictor
    	for (currentKey in mapIterator) {
    	    currentMap = this.predictionLinks[currentKey];  	// get the map within the map
    	    predictionIterator = Iterator(currentMap);
    	    // iterate over each PredictionLink that shares the predictor
    	    for (currentPredictionKey in predictionIterator) {
    	        currentMap[currentPredictionKey].update();  // update the prediction link within the map
    	        numUpdates++;
    	    }
    	}
    	message("num PredictionLinks updated = ");
	    message(numUpdates);
	    message("\r\n");
    }
    
////////////////////////////////// search functions /////////////////////////////////////
    function findAllSuperCategoriesOf(candidate) {
        message("finding supercategories of " + candidate.getName().getName());
        // setup a set to check for duplicates
        var setToUpdate;
        // setup an array for sequential access
        var vectorToUpdate = [];
        // initialize the one leaf node
        var currentCandidate = candidate;
        setToUpdate[candidate.getName()] = currentCandidate;
        vectorToUpdate.push(currentCandidate);
        // compute the set of all supercategories of this candidate
        var busy = true;
        var currentParent;
        var setIterator;
        var parents;
        var i, j;
        for (i = 0; i < vectorToUpdate.length; i++) {
            currentCandidate = vectorToUpdate[i];
            parents = currentCandidate.getParents();
            for (j = 0; j < parents.length; j++) {
                currentParent = parents[i];
                // check whether this candidate is already in the set
                if (setToUpdate[currentParent.getName()] != {}) {
                    message("adding parent named" + currentParent.getName().getName());
                    // if we get here then we found another candidate to add
                    setToUpdate[currentParent.getName()] = currentParent;
                    vectorToUpdate.push(currentParent);
                }
            }
        }
        return vectorToUpdate;
    }
    // dictionary lookup
    function getCandidateWithName(name) {
        return candidates[name];
    }
    // given two moving averages, returns the PredictionLink that predicts the predictee from the predictor
    function getLinkFromMovingAverages(predictor, predictee) {
        var links = predictionLinks[predictor];
        return links[predictee];    
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
        var links = this.predictionLinks[shortTermAverage];
        var mapIterator = Iterator(links);
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
        var candidateIterator = Iterator(this.candidates);
	    // make sure that there is at least one candidate to choose from
	    if (this.candidates.length < 1) {
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
	    var distributionIterator = Iterator(guesses);
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
    function message(text) {
        alert(text);
    }
    function printCandidate(candidate) {
        var parentNames = candidate.getParentNames();
        message(candidate.getName().getName());
        message("\r\nparent names:\r\n");
        var i;
        for (i = 0; i < parentNames.length; i++) {
            message(parentNames[i].getName() + "\r\n");
        }
        message("\r\n");        
    }
    function printRating(rating) {
        message("song name:" + rating.getActivity().getName() + "\r\n");
        message("date:" + rating.getDate().stringVersion() + "\r\n");
        message("score:" + rating.getScore() + "\r\n");
    }
    function printDistribution(distribution) {
        message("mean:" + distribution.getMean());
        message(" stdDev:" + distribution.getStdDev());
        message(" weight:" + distribution.getWeight() + "\r\n");
    }
    function printParticipation(participation) {
        message("start time = " + participation.getStartTime().stringVersion());
        message("end time = " + participation.getEndTime().stringVersion());
        message("song name = " + participation.getActivityName().getName());
        message("intensity = " + participation.getIntensity() + "\r\n");
    }

    function test() {
        alert("testing");
        var m1 = new MovingAverage();
        m1.superFunction();
        var p1 = new ParticipationMovingAverage();
        p1.superFunction();
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
        // don't bother showing a blank message
        if (text != "\r\n")
            alert(text);
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