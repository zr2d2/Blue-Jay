
/**
 * The class that controls all of the recommendations
 */
 
function TimeBasedRecommendor() {

    // initialization
    // setup some maps so that we can store all the data in memory and then update properly
    // Basically the concern is that can't add a rating to a candidate that doesn't exist yet
    // So we store everything, then create the candidates, then add the ratings
    candidates = {};        // a map of all candidates (with key equal to its name)
    ratings = {};           // a vector of all ratings
    numRatings = 0;         // how many ratings there are
    participations = {};    // a vector of all partipations
    numParticipations = 0;  // how many participations there are
    predictionLinks = {};   // the set of all prediction links
    //alert("constructing a recommendor point 2");

/////////////////////////////////////////////////////// Public Methods ///////////////////////////////////////////////////

// the functions parseArguments has been skipped for now
    // reads all the necessary files and updates the TimeBasedRecommendor accordingly
    this.readFiles = function() {
        //alert("recommendor reading files");
        this.readFile("bluejay_ratings.txt");
    },
    // reads one file
    this.readFile = function(fileName) {
        //alert("recommendor reading file");
        // display a message
        var stringContents = FileIO.readFile(fileName);
    },
    // adds a candidate (also known as a song, genre, or category)
    this.addCandidate = function(newCandidate) {
        var name = newCandidate.getName();
        message("adding candidate named");
        printCandidate(newCandidate);
        this.candidates[name] = newCandidate;
    },
    // adds a rating to the list of ratings
    this.addRating = function(newRating) {
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
    },
    // adds a rating to the list of participation
    this.addParticipation = function(newParticipation) {
        printParticipation(newParticipation);
        // Now we need to actually add the participation.
        // See the comment block in addRating

        // For the moment we'll just keep track of the number of participations
        // This just participations that the ratings are already in chronological order
        this.numParticipations++;
        this.participations[this.numParticipations] = newParticipation;
    },
    // adds the participation to the necessary candidate and all its parents
    this.addParticipationAndCascade = function(newParticipation) {
	    var candidate = getCandidateWithName(newParticipation.getActivityName());
	    var candidatesToUpdate = findAllSuperCategoriesOf(candidate);
	    var i;
	    for (i = 0; candidatesToUpdate[i]; i++)
	    {
		    candidatesToUpdate[i].giveParticipation(newParticipation);
	    }
    },
    // adds the rating to the necessary candidate and all its parents
    this.addRatingAndCascade = function(newRating)
    {
	    var candidate = getCandidateWithName(newRating.getActivity());
	    var candidatesToUpdate = findAllSuperCategoriesOf(candidate);
	    var i, j;
	    for (i = 0; candidatesToUpdate[i]; i++)
	    {
		    candidatesToUpdate[i].giveRating(newRating);
	    }
    },
    // create the necessary PredictionLink to predict each candidate from the other
    this.linkCandidates = function(candidateOne, candidateTwo)
    {
	    var frequencyCountA = candidateOne.getNumFrequencyEstimators();
	    var ratingCountA = candidateOne.getNumRatingEstimators();
	    var frequencyCountB = candidateTwo.getNumFrequencyEstimators();
	    var ratingCountB = candidateTwo.getNumRatingEstimators();
	    var i, j;
	    // using the frequency of A, try to predict the rating for B
	    for (i = 0; i < frequencyCountA; i++)
	    {
		    this.linkAverages(candidateOne.getFrequencyEstimatorAtIndex(i), candidateTwo.getActualRatingHistory());
	    }
	    // using the frequency of B, try to predict the rating for A
	    for (j = 0; j < frequencyCountB; j++)
	    {
		    this.linkAverages(candidateTwo.getFrequencyEstimatorAtIndex(j), candidateOne.getActualRatingHistory());
	    }
	    // using the rating for A, try to predict the rating for B
	    for (i = 0; i < ratingCountA; i++)
	    {
		    this.linkAverages(candidateOne.getRatingEstimatorAtIndex(i), candidateTwo.getActualRatingHistory());
	    }
	    // using the rating for B, try to predict the rating for A
	    for (j = 0; j < ratingCountB; j++)
	    {
		    this.linkAverages(candidateTwo.getRatingEstimatorAtIndex(j), candidateOne.getActualRatingHistory());
	    }
    },
    // create the necessary PredictionLink to predict the predictee from the predictor
    this.linkAverages = function(predictor, predictee)
    {
	    var links = this.predictionLinks[predictee];
	    var newLink = new PredictionLink(predictor, predictee);
	    links[predictor] = newLink;
    },
    this.updateChildPointers = function()
    {
	    // iterate over each candidate
	    var candidateIterator = Iterator(this.candidates);
	    var currentCandidate;
	    var parent;
	    var i;
	    for (candidateName in candidateIterator)
	    {
		    currentCandidate = this.candidates[candidateName];
		    if (currentCandidate.needToUpdateParentPointers())
		    {
			    // if we get here then this candidate was added recently and its parents need their child pointers updated
			    var parentNames = currentCandidate.getParentNames();
			    for (i = 0; parentNames[i]; i++)
			    {
				    parent = getCandidateWithName(parentNames[i])
				    currentCandidate.addParent(parent);
				    parent.addChild(currentCandidate);
			    }
		    }
	    }
    },

// recommend function
    this.recommend = function() {
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

/////////////////////////////////////////////////////// Member Variables ///////////////////////////////////////////////////

};