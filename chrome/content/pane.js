
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


  	var gMM = Components.classes["@songbirdnest.com/Songbird/Mediacore/Manager;1"]  
                    .getService(Components.interfaces.sbIMediacoreManager); 
	var mediaItem = gMM.sequencer.view.getItemByIndex(gMM.sequencer.viewPosition);  
	
	var myListener = {
		onMediacoreEvent:function(ev){
			if(ev.type==Ci.sbIMediacoreEvent.TRACK_CHANGE){
				var mediaItem = ev.data;
				alert("Track changed to \"" + mediaItem.getProperty(SBProperties.trackName) + "\" by " + mediaItem.getProperty(SBProperties.artistName));
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
    // now read the file
    this.engine.readFiles();
    //this.engine.makeRecommendation();
  },
  
  test : function() {
    this.engine.readFiles();
    this.engine.makeRecommendation(new DateTime("2011-4-27T22:34:00"));
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