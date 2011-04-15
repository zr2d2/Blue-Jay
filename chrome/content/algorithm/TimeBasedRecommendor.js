
/**
 * The class that controls all of the recommendations
 */
 
function TimeBasedRecommendor() {

    // initialization
    //candidates = {};
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