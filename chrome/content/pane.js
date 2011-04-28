
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

//////////////////////////////////////////////////////////
/*var list = LibraryUtils.mainLibrary;
var mystring = "";
for (i = 0; i<list.length; i++){
	mystring = mystring + list.getItemByIndex(i).getProperty(SBProperties.trackName) + '_' 
	+ list.getItemByIndex(i).getProperty(SBProperties.artistName) + '_' 
	+ list.getItemByIndex(i).getProperty(SBProperties.genre) + '_'
	+ list.getItemByIndex(i).getProperty(SBProperties.rating)
	+'\r\n';
}

alert(mystring);
*/
//message("this is Tian's test data");
/////////////////////////////////////////////////////////////

//var paneChooseSong = Bluejay.Controller.doHelloWorld();

// test class
function A()
{
    this.x = 1;
	alert(x);
};

//function TimeBasedRecommendor();
/**
 * Controller for pane.xul
 */
Bluejay.PaneController = {

  // this function scans the user's library and send that data to the engine
  scanLibrary : function() {
    var list = LibraryUtils.mainLibrary;
    var mystring = "";
    // iterate over each thing in the library
    alert("push [ok] to start scanning library");
    for (i = 0; i<list.length; i++){
        var songName = new Name(list.getItemByIndex(i).getProperty(SBProperties.trackName));
        if (!songName.isNull()) {
            var artistName = new Name(list.getItemByIndex(i).getProperty(SBProperties.artistName));
            var genre = new Name(list.getItemByIndex(i).getProperty(SBProperties.genre));
            var music = new Name("Song");
            var songCandidate = new Candidate();
            songCandidate.setName(songName);
            // check for all kinds of invalid types
            if (!artistName.isNull()) {
                // create a Candidate representing the artist
                var artistCandidate = new Candidate();
                artistCandidate.setName(artistName);
                artistCandidate.addParentName(music);
                // give this candidate to the engine
                this.engine.addCandidate(artistCandidate);
                // add the artist as a parent of the song
                songCandidate.addParentName(artistName);
            }
            if (!genre.isNull()) {
                // create a Candidate representing the artist
                var genreCandidate = new Candidate();
                genreCandidate.setName(genre);
                genreCandidate.addParentName(music);
                // give this candidate to the engine
                this.engine.addCandidate(genreCandidate);
                // add the artist as a parent of the song
                songCandidate.addParentName(genre);
            }
            // if the artist name and genre name are unknown, then the song is a direct child of the category "Song"
            if (artistName.isNull() && genre.isNull()) {
                songCandidate.addParentName(music);
            }
            // give the song to the engine
            this.engine.addCandidate(songCandidate);
        }
    }    
    flushMessage();
    alert("done scanning library");
  },
  



  /**
   * Called when the pane is instantiated
   */
  onLoad: function() {

    this._initialized = true;
    
    // Make a local variable for this controller so that
    // it is easy to access from closures.
	var controller = this;
	//alert("initializing");
    //TimeBasedRecommendor.constructor();
	//this.engine = RecommendorFactory.recommendor();
	this.engine = new TimeBasedRecommendor();
	//alert("engine is " + this.engine);
	//alert("constructed successfully");
    //var engine = new A();

    this.scanLibrary();

  	var gMM = Components.classes["@songbirdnest.com/Songbird/Mediacore/Manager;1"]  
                    .getService(Components.interfaces.sbIMediacoreManager); 
	var mediaItem = gMM.sequencer.view.getItemByIndex(gMM.sequencer.viewPosition);  
	
	var myListener = {
		onMediacoreEvent:function(ev){
			if(ev.type==Ci.sbIMediacoreEvent.TRACK_CHANGE){
				var mediaItem = ev.data;
				alert("Track changed to \"" + mediaItem.getProperty(SBProperties.trackName) + "\" by " + mediaItem.getProperty(SBProperties.artistName));
				var dura=mediaItem.getProperty(SBProperties.duration);
				alert("You have skipped this item " + mediaItem.getProperty(SBProperties.skipCount) + " times and its duration is " + dura + " nanoseconds");
			}
			else if(ev.type==Ci.sbIMediacoreEvent.STREAM_END){
					alert("End of Playlist");
			}
		}
	}
	gMM.addListener(myListener);

    
    // Hook up the action button
    this._mixbutton = document.getElementById("action-button");
    this._mixbutton.addEventListener("command", 
         function() { controller.test(); }, false);
	
			 
  },
  /**
   * Called when the pane is about to close
   */
  onUnLoad: function() {
    this._initialized = false;
  },
  
  //Give me a siiiiiiign
  sayHello: function() {
    var greeting = "Hi there!";
	alert(greeting);
	//Bluejay.Controller.doHelloWorld();
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
  
  test : function() {
    this.engine.readFiles();
    //this.engine.makeRecommendation(new DateTime("2011-4-27T22:34:00"));
    this.engine.makeRecommendation();
    //this.engine.
    //this.engine.test();
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