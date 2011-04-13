
/**
 * The class that controls all of the recommendations
 */
TimeBasedRecommendor = {

/////////////////////////////////////////////////////// Public Methods ///////////////////////////////////////////////////

// the functions parseArguments has been skipped for now

    // when starting up, read the ratings file
    
// readFile

    readFiles : function() {
        //alert("recommendor reading files");
        TimeBasedRecommendor.readFile("bluejay_ratings.txt");
    },

    readFile : function(fileName) {
        //alert("recommendor reading file");
        // display a message
        var stringContents = FileIO.readFile(fileName);
    },
    
// recommend function
    recommend : function() {
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