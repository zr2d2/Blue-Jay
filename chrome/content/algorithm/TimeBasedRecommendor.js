
/**
 * The class that controls all of the recommendations
 */
 
function TimeBasedRecommendor() {

    // initialization
    candidates = {};
    ratings = {};
    participations = {};
    //alert("constructing a recommendor point 2");

/////////////////////////////////////////////////////// Public Methods ///////////////////////////////////////////////////

// the functions parseArguments has been skipped for now
    
    this.readFiles = function() {
        //alert("recommendor reading files");
        this.readFile("bluejay_ratings.txt");
    }
    this.readFile = function(fileName) {
        //alert("recommendor reading file");
        // display a message
        var stringContents = FileIO.readFile(fileName);
    },
    this.addCandidate = function(newCandidate) {
        var name = newCandidate.getName();
        message("adding candidate named");
        printCandidate(newCandidate);
        this.candidates[name] = newCandidate;
    },
    this.addRating = function(newRating) {
        printRating(newRating);
        // need to add the rating here
        // The interface for the Javascript map is not the same as for the C++ set
        // So we probably need to compute a key for the rating
        // and then call this.ratings[key] = newRating
        // Or, we could just make the very reasonable assumption that the ratings are in
        // chronological order in the ratings file already, in which case we can just
        // keep track of the current number of ratings and use it as the key
    },
    this.addParticipation = function(newParticipation) {
        printParticipation(newParticipation);
        // Now we need to actually add the participation.
        // See the comment block in addRating
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