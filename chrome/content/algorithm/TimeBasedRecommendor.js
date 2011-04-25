
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
    this.readFiles = readFiles;
    this.readFile = readFile;
    this.addCandidate = addCandidate;
    this.addRating = addRating;
    this.addParticipation = addParticipation;
    this.addParticipationAndCascade = addParticipationAndCascade;
    this.addRatingAndCascade = addRatingAndCascade;
    this.linkCandidates = linkCandidates;
    this.linkAverages = linkAverages;
    this.updatePredictions = updatePredictions;
    this.updateChildPointers = updateChildPointers;
    this.findAllSuperCategoriesOf = findAllSuperCategoriesOf;
    this.addSomeTestLinks = addSomeTestLinks;
    this.test = test;
    this.message = message;
    this.recommend = recommend;
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
    	
    	var mapIterator = Iterator(this.predictionLinks);
    	var currentMap;
    	var currentKey;
    	var currentPredictionKey;
    	var predictionIterator;
    	var numUpdates = 0;
    	
    	// for each candidate, get the map of predictions links that have it as the predictor
    	for (currentKey in mapIterator) {
    	    currentMap = this.predictionLinks[currentKey];
    	    predictionIterator = Iterator(currentMap);
    	    // iterate over each PredictionLink that shares the predictor
    	    for (currentPredictionKey in predictionIterator)
    	    {
    	        currentMap[currentPredictionKey].update();
    	        numUpdates++;
    	    }
    	}
    	message("num PredictionLinks updated = ");
	    message(numUpdates);
	    message("\r\n");
    }
    
////////////////////////////////// search functions /////////////////////////////////////
    function findAllSuperCategoriesOf (candidate) {
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
        for (i = 0; i < vectorToUpdate.length; i++)
        {
            currentCandidate = vectorToUpdate[i];
            parents = currentCandidate.getParents();
            for (j = 0; j < parents.length; j++)
            {
                currentParent = parents[i];
                // check whether this candidate is already in the set
                if (setToUpdate[currentParent.getName()] != {})
                {
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
        return this.candidates[name];
    }
    // given two moving averages, returns the PredictionLink that predicts the predictee from the predictor
    function getLinkFromMovingAverages(predictor, predictee) {
        var links = this.predictionLinks[predictor];
        return links[predictee];    
    }
    // calculate a rating for the given candidate
    function rateCandidate(candidate) {
        message("rating candidate with name: " + candidate.getName().getName());
        var parents = this.findAllSuperCategoriesOf(candidate);
        
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
    
    function test() {
        alert("testing");
        //var candidate1 = new Candidate(new Name("Sell Me Candy"));
        var candidate1 = new Candidate;
        alert("adding candidate");
        addCandidate(candidate1);
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