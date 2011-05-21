
if (typeof(Cc) == 'undefined')
	var Cc = Components.classes;
if (typeof(Ci) == 'undefined')
	var Ci = Components.interfaces;
if (typeof(Cu) == 'undefined')
	var Cu = Components.utils;
if (typeof(Cr) == 'undefined')
	var Cr = Components.results;
	

// Make a namespace.
if (typeof Bluejay == 'undefined') {
  var Bluejay = {};
}

Cu.import("resource://app/jsmodules/sbProperties.jsm");
Cu.import("resource://app/jsmodules/sbLibraryUtils.jsm");

//function TimeBasedRecommendor();
/**
 * Controller for pane.xul
 */
Bluejay.PaneController = {
/**
   * Called when the pane is instantiated
   */
  onLoad: function() {

    this._initialized = true;
    this.currentSongName = null;
    this.currentSongDuration = null;
    this.songStartDate = null;
    this.songEndDate = null;
    this.isLibraryScanned = false;
    this.desiredTrackName = null;
	this.state = "on";

    // Make a local variable for this controller so that
    // it is easy to access from closures.
	var controller = this;
	//alert("initializing");
    //TimeBasedRecommendor.constructor();
	//this.engine = RecommendorFactory.recommendor();
	this.engine = new TimeBasedRecommendor();
	//alert("engine is " + this.engine);
	//alert("constructed successfully");


    // Hook up the ScanLibrary button
	this._scanbutton = document.getElementById("scan-button");
    this._scanbutton.addEventListener("command", 
         function() { controller.scanLibrary(); }, false);
	

    // Hook up the Mix button
    this._mixbutton = document.getElementById("action-button");
    this._mixbutton.addEventListener("command", 
        function() { controller.makePlaylist(); }, false);
		
	//Hook up the On/Off button
	this._offbutton = document.getElementById("off");
    this._offbutton.addEventListener("command", 
        function() { controller.turnOff(); }, false);
	
	// Hook up the ratings menu (five entries)
	this._1star = document.getElementById("1star");
	this._1star.addEventListener("command",
		function() { controller.giveRating(0.0); }, false);
	this._2star = document.getElementById("2star");
	this._2star.addEventListener("command",
		function() { controller.giveRating(0.25); }, false);
	this._3star = document.getElementById("3star");
	this._3star.addEventListener("command",
		function() { controller.giveRating(0.5); }, false);
	this._4star = document.getElementById("4star");
	this._4star.addEventListener("command",
		function() { controller.giveRating(0.75); }, false);
	this._5star = document.getElementById("5star");
	this._5star.addEventListener("command",
		function() { controller.giveRating(1.0); }, false);
		
	//alert("creating listener");
	var gMM = Components.classes["@songbirdnest.com/Songbird/Mediacore/Manager;1"]  
                    .getService(Components.interfaces.sbIMediacoreManager); 
	//alert("creating listener pt0");
	//var mediaItem = gMM.sequencer.view.getItemByIndex(gMM.sequencer.viewPosition);  
	
	//alert("creating listener pt1");
	
	//Listener for a skipped track. Currently fires for skipped AND ended tracks. 
	var myListener = {
		onMediacoreEvent:function(ev) {
			if(ev.type==Ci.sbIMediacoreEvent.TRACK_CHANGE) {
			    //alert("the song has changed");
			    controller.songChanged(ev);
			}
			else if(ev.type==Ci.sbIMediacoreEvent.STREAM_END) {
			    controller.songChanged(ev);
		        //alert("End of Playlist");
			}
		}
	}
	//alert("creating listener pt2");
	gMM.addListener(myListener);
	//alert("created listener");
 	 
  },
  
	giveRating : function(score) {
	    // make sure we know which song to assign the rating to
    	if (this.currentSongName) {
	        var newRating = new Rating();
            newRating.setActivityName(new Name(this.currentSongName));
            var newDate = new DateTime();
            newDate.setNow();
            newRating.setDate(newDate);
            newRating.setScore(score);
            //alert("adding rating");
            this.engine.addRating(newRating);
            flushMessage();
        }
    }, 
	// disable the recommendation engine until it is re-enabled
	turnOff : function() {
		this.state="off";
	},
  // this function scans the user's library and send that data to the engine
  scanLibrary : function() {
    var list = LibraryUtils.mainLibrary;
    var mystring = "";
    // iterate over each thing in the library
    alert("push [ok] to start scanning library");
    var length = list.length;
    // limit the number of songs (for testing)
    // if (length > 65) {
    //    length = 65;
    // }
    var i;
    var music = new Name("Song");
    for (i = 0; i < length; i++) {
        var item = list.getItemByIndex(i);
        // get the song name
        var songName = new Name(item.getProperty(SBProperties.trackName));
        // make sure the song name is something sensible
        if (!songName.isNull()) {
            // make a new candidate to represent the song
            var songCandidate = new Candidate();
            songCandidate.setName(songName);
            // get the date it was added to the library
            var timeString = item.getProperty(SBProperties.created);
            var deltaTime = parseInt(item.getProperty(SBProperties.created));
            var discoveryDate = new DateTime();
            discoveryDate.setDurationSinceReference(deltaTime / 1000);
            songCandidate.setDiscoveryDate(discoveryDate);
            message("getting rating");
            // get the song's rating if it has been rated yet
            var starCount = item.getProperty(SBProperties.rating);
            message(starCount + "\r\n");
            if (starCount > 0) {
                // create the rating and add it
                var songRating = new Rating();
                songRating.setActivityName(songName);
                songRating.setScore((starCount - 1) / 4);
                // setting an invalid date means we want it to be the earliest possible date
                songRating.setDate(null);
                this.engine.putRatingInMemory(songRating);
            }


            // get the artist name
            var artistName = new Name(item.getProperty(SBProperties.artistName));
            // if the artist name is unknown, group it with other songs with unknown genre
            if (artistName.isNull()) {
                artistName = new Name("Unspecified Artist");
            }
            // create a Candidate representing the artist
            var artistCandidate = new Candidate();
            artistCandidate.setName(artistName);
            artistCandidate.addParentName(music);
            // give the artist candidate to the engine
            this.engine.addCandidate(artistCandidate);
            // add the artist as a parent of the song
            songCandidate.addParentName(artistName);


            // get the genre
            var genre = new Name(item.getProperty(SBProperties.genre));
            // if the genre is unknown, group it with other songs with unknown genre
            if (genre.isNull()) {
                genre = new Name("Unspecified Genre");
            }
            // create a Candidate representing the genre
            var genreCandidate = new Candidate();
            genreCandidate.setName(genre);
            genreCandidate.addParentName(music);
            // give the genre candidate to the engine
            this.engine.addCandidate(genreCandidate);
            // add the artist as a parent of the song
            songCandidate.addParentName(genre);
            
            /* // if the artist name and genre name are unknown, then the song is a direct child of the category "Song"
            if (artistName.isNull() && genre.isNull()) {
                songCandidate.addParentName(music);
            }*/ 
            
            // give the song to the engine
            this.engine.addCandidate(songCandidate);
        }
    }
    var musicCategory = new Candidate();
    musicCategory.setName(music);
    this.engine.addCandidate(musicCategory);    
    // tell the engine to update its internal data structure
    //this.engine.updateLinkConnections();
    this.isLibraryScanned = true;
    //this.engine.readFiles();
    alert("done scanning library");
    // read any data from the text files that gives information about the library
    this.engine.readFiles();
    flushMessage();
  },
  
  // this function gets called whenever the song changes
  songChanged: function(ev) {
		if(this.state=="on") {
			//alert("song changed");
			// get the data for the new track
			var mediaItem = ev.data;
			var songName = mediaItem.getProperty(SBProperties.trackName)
			//alert("Selected track: \"" + songName + "\" by " + mediaItem.getProperty(SBProperties.artistName));
			var songLength=mediaItem.getProperty(SBProperties.duration)/1000000;
			// get the current date
			this.songEndDate = new DateTime();
			this.songEndDate.setNow();
			//alert("song changed pt2");
			// check if we were previously playing a song
			if (this.currentSongName && (this.currentSongName != this.ignoredSongname)) {
				//alert("song changed pt2a");
				// if we get here then we were previously playing a song
				// compute the duration it actually played
				var playedDuration = this.songStartDate.timeUntil(this.songEndDate);
				//alert("played duration = " + playedDuration + " song length = " + this.currentSongDuration);
				// decide whether it was skipped based on the duration
				if (playedDuration >= this.currentSongDuration * 0.75) {
					// if we get here then it was not skipped
					//alert("song named " + this.currentSongName + " finished");
					var newParticipation = new Participation();
					newParticipation.setStartTime(this.songStartDate);
					newParticipation.setEndTime(this.songEndDate);
					newParticipation.setIntensity(1);
					newParticipation.setActivityName(new Name(this.currentSongName));
					this.engine.addParticipation(newParticipation);
				} else {
					// if we get here then the song was skipped
					//alert("song named " + this.currentSongName + " got skipped");
					var newRating = new Rating();
					newRating.setActivityName(new Name(this.currentSongName));
					newRating.setDate(this.songEndDate);
					newRating.setScore(0);
					this.engine.addRating(newRating);
				}
				//alert("played duration = " + playedDuration + " song length = " + this.currentSongDuration);
			}
			//alert("song changed pt3");
			// update the current song
			this.currentSongName = songName;
			this.songStartDate = this.songEndDate;
			this.currentSongDuration = songLength;
			//alert("You have skipped this item " + mediaItem.getProperty(SBProperties.skipCount) + " times and its duration is " + songLength + " seconds");
			//alert("writing participation to file");
			//alert("song changed pt4");
			if (songName != this.desiredTrackName) {
				// if a song was chosen randomly, and we then skip it automatically, that's not a downvote
				this.ignoredSongname = songName;
				this.makePlaylist();
			}
		}
  },


  /**
   * Called when the pane is about to close
   */
  onUnLoad: function() {
    this._initialized = false;
  },
  
  readFiles : function() {
    alert("pane reading files");
    //TimeBasedRecommendor.constructor();
    // for testing, write to the file first
    //FileIO.writeFile("bluejay_ratings.txt", "Jeff's successful file IO test", 0);
    //this.engine.createFiles();
    // now read the file
    this.engine.readFiles();
    //this.engine.makeRecommendation();
  },
  
  makePlaylist : function() {
    if (!this.isLibraryScanned) {
        this.scanLibrary();
    }
	this.state="on";
    //this.engine.updateLinkValues();
    this.desiredTrackName = this.engine.makeRecommendation().getName();
    this.changeSong(this.desiredTrackName);    
    flushMessage();
  },
  // changes the currently playing song to the song named songName
  changeSong: function(songName) {
        //alert("selecting song named " + songName);
        const properties = Cc["@songbirdnest.com/Songbird/Properties/MutablePropertyArray;1"].createInstance(Ci.sbIMutablePropertyArray);
        //properties.appendProperty(SBProperties.artistName, "Dexys Midnight Runners");
        properties.appendProperty(SBProperties.trackName, songName);
        var tracks = LibraryUtils.mainLibrary.getItemsByProperties(properties);
        //var tracks = LibraryUtils.mainLibrary.getItemsByProperty(SBProperties.artistName, "Dexys Midnight Runners");
        var gMM = Components.classes["@songbirdnest.com/Songbird/Mediacore/Manager;1"].getService(Components.interfaces.sbIMediacoreManager);
        gMM.sequencer.playView(gMM.sequencer.view,gMM.sequencer.view.getIndexForItem(tracks.enumerate().getNext())); 
        //alert("done selecting song");
    },
  /**
   * Load the Display Pane documentation in the main browser pane
   */
  loadHelpPage: function() {
    // Ask the window containing this pane (likely the main player window)
    // to load the display pane documentation
    top.loadURI("http://wiki.songbirdnest.com/Developer/Articles/Getting_Started/Display_Panes");
  }
  
};

window.addEventListener("load", function(e) { Bluejay.PaneController.onLoad(e); }, false);
window.addEventListener("unload", function(e) { Bluejay.PaneController.onUnLoad(e); }, false);